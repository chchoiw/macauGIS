
# coding: utf8
import pandas as pd
import numpy as np
import json
from scipy import signal
import operator
import math
import pykrige.kriging_tools as kt
from pykrige.ok import OrdinaryKriging
import matplotlib.pyplot as plt
import mysql.connector as connection
import pandas as pd
import datetime
import traceback
import os
class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)
workdir="/srv/www/htdocs/gis_exercise/"
# https://www.giserdqy.com/secdev/leaflet/18166/
# https://www.zhihu.com/question/41690082
# https://github.com/sknightq/sknight-gis

longlatData={
    "CC": [113.5786111111111, 22.13722222222222],
    "DC": [113.55111111111111,22.11722222222222],
    "DP": [113.54333333333334,22.21527777777778],
    "EM": [113.56,22.20722222222222],
    "FM": [113.54222222222222,22.197222222222223],
    "JA": [113.5425,22.154999999999998],
    "KV": [113.58027777777778,22.134722222222223],
    "MM": [113.53055555555555,22.185833333333335],
    "PE": [113.55833333333334,22.196666666666665],
    "PG": [113.54166666666667,22.180833333333336],
    "PN": [113.56,22.191666666666666],
    "PS": [113.56,2.1816666666666666],
    "PV": [113.534722222222221,22.175555555555558],
    "TG": [113.56861111111111,22.159444444444443],
    "ZM":[113.58031944444444,22.199275],
    "UM":[113.54694444444445,22.131666666666668],
    "CG":[113.55101111111111,22.197644444444446]
    
}

longlatGridDict={
        "lo1": 113.5090,
        "la1": 22.2235,
        "lo2": 113.5947,
        "la2": 22.1034,
        "nx":22,
        "ny":32,
}
longlatGridDict["dx"]=(longlatGridDict["lo2"]-longlatGridDict["lo1"])/longlatGridDict["nx"]
longlatGridDict["dy"]=(longlatGridDict["la1"]-longlatGridDict["la2"])/longlatGridDict["ny"]
# example.geojson


wlLongLatData={
    "LPM":[ 113.5344444, 22.18944444],
    "LHK":[ 113.5377778, 22.19694444],
    "LMF":[ 113.5466667, 22.21138889],
    "LAO":[ 113.5486111,22.1575],
    'LCH':[ 113.5505556,  22.15777778,],
    'LIL':[ 113.5594444,  22.15583333,],
    'LCS':[ 113.5575000,  22.15472222,],
    'LSP':[ 113.5627778,  22.13166667,],
    "LPI":[ 113.5363889,  22.19805556,],
    'LSI':[ 113.5369444,  22.19972222,],
    
    'LRR':[113.5447222,   22.20250000],
    'LIV':[113.5352778,   22.21222222],
    'LCL':[113.5511111,   22.11722222],
    'LLM':[113.5377778,   22.20333333],
    'LTA':[113.5430556,   22.20194444],
    'LPH':[113.5350000,   22.19333333],
    'LPN':[113.5563889,   22.15444444],
    'LMM':[113.5448000,   22.20530000],
    'LPF':[113.5327230,   22.19049000],
    "LP1":[113.5368280,   22.19905200],
    
    'LPS':[22.190490, 113.532723], 
}
id2Sation={
    "01":"LPM",
    "02":"LHK",
    "03":"LMF",
    "04":"LAO",
    "05":"LCH",
    "06":"LIL",
    "07":"LCS",
    "08":"LSP",
    "09":"LPI",
    "10":"LSI",
    "11":"LRR",
    "12":"LIV",
    "13":"LCL",
    "14":"LLM",
    "15":"LTA",
    "16":"LPH",
    "17":"LPN",
    "18":"LMM",
    "19":"LPF",
    "20":"LP1",
    "99":"LPS",
    
}


nowdt=(datetime.datetime.now()+datetime.timedelta(hours=8,minutes=-1))
nowdtStr=nowdt.strftime("%Y-%m-%d %H:%M:00")
nowdt24hoursAgo=nowdt+datetime.timedelta(hours=-24)
nowdt24hoursAgoStr=nowdt24hoursAgo.strftime("%Y-%m-%d %H:%M:00")
# try:
#     mydb = connection.connect(host="mssv01.smg.net", database = 'AWS',user="", passwd="")
#     query = "SELECT OBS_DATETIME,STATIONCODE,TEMP,HUMI,WSPD,WDIR,WSPD_10, WDIR_10 FROM AWS.min_tab1 where obs_datetime=%s order by obs_datetime desc limit 50;" %nowdt
#     awsData= pd.read_sql(query,mydb)
#     print(awsData)   
#     mydb.close() #close the connection
# except Exception as e:
#     # mydb.close()
#     print(str(e))
# "refTime": "2014-11-30T06:00:00.000Z",



def awsDataHandle(nowdt,stationOutputFlag=True,fileNameWithTime=True):
    # mydb = connection.connect(host="mssv01.smg.net", database = 'AWS',user="", passwd="")
    reftime=nowdt.strftime("%Y-%m-%dT%H:%M:00.000Z")
    nowdtStr=nowdt.strftime("%Y-%m-%d %H:%M:00")
    mydb = connection.connect(host="mssv01.smg.net", database = 'AWS',user="cptmain", passwd="",use_pure=True,charset='utf8')
    query = "SELECT OBS_DATETIME,STATIONCODE,TEMP,HUMI,WSPD,WDIR,WSPD_10, WDIR_10 FROM AWS.min_tab1 where obs_datetime='%s' order by obs_datetime desc limit 50;" %nowdtStr

    # 2023-07-17 10:00
    awsData= pd.read_sql(query,mydb)
    mydb.close()
    awsData=awsData.set_index('STATIONCODE')


    # print(round(math.sin(180*math.pi/180),7),math.cos(180*math.pi/180))
    stationAry=[]

    for i in awsData.index:
        # stat=awsData.loc[i,"STATIONCODE"]
        stat=i
        if stat in longlatData:
            awsData.loc[i,"long"]=longlatData[stat][0]
            awsData.loc[i,"lat"]=longlatData[stat][1]
            md=270-awsData.loc[i,"WDIR_10"]
            rad=md*math.pi/180
            awsData.loc[i,"v"]=awsData.loc[i,"WSPD_10"]*math.sin( rad)
            awsData.loc[i,"u"]=awsData.loc[i,"WSPD_10"]*math.cos( rad) 
            awsData.loc[i,"WSPD_10"]=awsData.loc[i,"WSPD_10"]
            # if i not in stationAry:
            if  np.isnan(awsData.loc[i,"TEMP"]):
                temp=-999
            else:
                temp=awsData.loc[i,"TEMP"]
            if  np.isnan(awsData.loc[i,"HUMI"]):
                humi=-999
            else:
                humi=awsData.loc[i,"HUMI"]
            tmpDict=        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [awsData.loc[i,"long"],awsData.loc[i,"lat"]],
            },
            "properties": {
                "TEMP": temp,
                "WSPD_10": awsData.loc[i,"WSPD_10"],
                "WDIR_10": awsData.loc[i,"WDIR_10"],
                "HUMI":humi,
                "name":i
            }
            }
            stationAry.append(tmpDict)
                                    
    awsData = awsData.dropna(subset=['long', 'lat'])
    awsList=awsData[["long","lat","WSPD_10","WDIR_10"]].values.tolist()
    awsString = json.dumps({0: awsList}, indent=4, cls=NpEncoder)
    
    ############
    # windbarb station data
    ###########
    # filenameDTStr=nowdt.strftime("%Y%m%d%H")
    # if stationOutputFlag:
    #     if fileNameWithTime:
    #         with open(workdir+"awsData/stationPoint/windbarb_"+filenameDTStr+".json", "w") as awsFile:
    #             awsFile.write(awsString)
    #         # print(stationAry)
    #         stationString = json.dumps({0:stationAry}, indent=4, cls=NpEncoder)

    #         with open(workdir+"awsData/stationPoint/station_"+filenameDTStr+".json", "w") as stationFile:
    #             stationFile.write(stationString)
    #         stationFile.close()
    #     else:
    #         with open(workdir+"awsData/stationPoint/windbarb.json", "w") as awsFile:
    #             awsFile.write(awsString)
    #         # print(stationAry)
    #         stationString = json.dumps({0:stationAry}, indent=4, cls=NpEncoder)

    #         with open(workdir+"awsData/stationPoint/station.json", "w") as stationFile:
    #             stationFile.write(stationString)
    #         stationFile.close()
              
    

    
    return awsData





    # stationAryWL
def calDist( lat1,lon1,lat2,lon2):
    R = 6371000; # metres
    phi1 = lat1 * math.pi/180 # phi, lambda in radians
    phi2 = lat2 * math.pi/180
    deltaPhi = (lat2-lat1) * math.pi/180
    deltaLambda = (lon2-lon1) * math.pi/180

    a = math.sin(deltaPhi/2) * math.sin(deltaPhi/2)+ \
        math.cos(phi1) * math.cos(phi2) *\
        math.sin(deltaLambda/2) * math.sin(deltaLambda/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    d = R * c # in metres   
    return d,c 
def calDist2( lat1,lon1,lat2,lon2):
    d=np.sqrt((lat1-lat2)**2+(lon1-lon2)**2)
    return d,d 
####################################
# aws station calculte for contour 
# each loop is a hour,total 24 h
#####################################
from tps import ThinPlateSpline
def awsContourGen(j,minZeroFlag=False):
    
    nowdt=(datetime.datetime.now()+datetime.timedelta(hours=8,minutes=-1))
    if minZeroFlag:
        nowdt=nowdt.replace( minute=0)
    nowdt=nowdt+datetime.timedelta(hours=-j)
    awsData=awsDataHandle(nowdt,stationOutputFlag=True)
    reftime=nowdt.strftime("%Y-%m-%dT%H:%M:00.000Z")
    nowdtStr=nowdt.strftime("%Y-%m-%d %H:00:00")
    # filesTimeStr=nowdt.strftime("%Y%m-%d %H:00:00")
    awsData=awsData.dropna(subset=['long', 'lat'])
    numStat=awsData.shape[0]
    awsDataTmp=awsData.dropna(subset=['long', 'lat',"TEMP","HUMI"])
    tempSorted=awsDataTmp[["OBS_DATETIME","TEMP"]].sort_values("TEMP")
    # 800
    m=longlatGridDict["ny"] 
    # 500
    n=longlatGridDict["nx"]

    # grid=np.array[10][20]
    grid=np.zeros((m,n))
    u=np.zeros((m,n))
    v=np.zeros((m,n))
    speed=np.zeros((m,n))
    temp=np.zeros((m,n))
    humi=np.zeros((m,n))
    latAry=np.zeros((m,n))
    lonAry=np.zeros((m,n))
    wl=np.zeros((m,n))
    distMatric=np.zeros((numStat,m*n))
    
    z=np.zeros(6)
    # distMatric=distMatric*9999
    X_c = np.random.normal(0, 1, (800, 3))
    X_t = np.random.normal(0, 2, (800, 2))
    X = np.random.normal(0, 1, (300, 3))

    # Create the tps object
    tps = ThinPlateSpline(alpha=0.3)  # 0 Regularization
    X_c=np.ones((numStat,3))
    X_c[:,1]=np.array(awsData["long"].values.tolist())
    X_c[:,2]=np.array(awsData["lat"].values.tolist())
    X_t=np.array(awsData["WSPD_10"].values.tolist())
    # Fit the control and target points
    tps.fit(X_c, X_t)
    for i in range(numStat):
        for r in range(m*n):
            # for k in range(n):
            j=r//n
            k=r%n
            statNameI=awsData.index[i]
            lon1=longlatGridDict["lo1"]+k*longlatGridDict["dx"]
            lat1=longlatGridDict["la1"]-j*longlatGridDict["dy"]
            lat2=awsData.loc[statNameI,"lat"]
            lon2=awsData.loc[statNameI,"long"]  
            d,_=calDist2( lat1,lon1,lat2,lon2)                        
            distMatric[i][r]=d
    sortIndexAry = np.argsort(distMatric,axis=0)
    print(sortIndexAry)
    numAround=3
    threeMinDistIndex=sortIndexAry[0:3,:]
    
    print("dist")
    # print(np.take_along_axis(distMatric, threeMinDistIndex, axis=0))
    print("sum-----")  
    
    min3DistAry=np.take_along_axis(distMatric, threeMinDistIndex, axis=0)    
    print("min3DistAry",min3DistAry)  
    # RMatric=
    for r in range(m*n):
        v=r//n
        k=r%n
        lon0=longlatGridDict["lo1"]+k*longlatGridDict["dx"]
        lat0=longlatGridDict["la1"]-v*longlatGridDict["dy"]
        dist=min3DistAry[:,r]
        RMatric=np.zeros((numAround+3,numAround+3))
        for i in range(numAround):
            for j in range(numAround):
                
                t=threeMinDistIndex[i][r]
                s=threeMinDistIndex[j][r]
                statNameI=awsData.index[t]
                statNameJ=awsData.index[s]
                lat4=awsData.loc[statNameI,"lat"]
                lon4=awsData.loc[statNameI,"long"]  
                lat3=awsData.loc[statNameJ,"lat"]
                lon3=awsData.loc[statNameJ,"long"]  

                if i!=j:
                    d2,_=calDist2( lat3,lon3,lat4,lon4)   
                    RMatric[i][j]=(d2**2)*np.log(d2)
                RMatric[i][numAround+2]=lat4
                RMatric[i][numAround+1]=lon4
                RMatric[i][numAround]=1
                RMatric[numAround][j]=1
                RMatric[numAround+1][j]=lon3
                RMatric[numAround+2][j]=lat3     
                z[i]=awsData.loc[statNameI,"WSPD_10"]       
        print("RMatric")
        # print(RMatric)
        # print("z",z.T)
        cofee=np.linalg.inv(RMatric) @z.T
        # print("cofee",cofee)
        tmp=dist.reshape(3)
        
        tmp2=np.multiply(np.square(tmp),np.log(tmp))
        gridCol=np.append(tmp2,np.array([1,lon0,lat0 ]))
        # print("temp",tmp,tmp2)
        result=cofee@gridCol.T
        # print(gridCol)
        print("reuslt",result)
        
    

        # Some data


    # Transform new points
        Y = tps.transform(np.array([1,lon0,lat0 ]).reshape(1,numAround))
        print("y",result,Y)
        
    # np.argmin(distMatric[i][j],axis=1)
    minDistList=[]
    

    # sumDisAry=np.sum(np.take_along_axis(distMatric, threeMinDistIndex, axis=0), axis=0)
    # print(sumDisAry)
    # print(np.sum(distMatric[threeMinDistIndex[:,:]], axis=0))
    # np.sum(threeMinDistIndex[np.where(threeMinDistIndex)],axis=0)
    # norm0.append(np.linalg.norm( B-avgCenter[j,:],axis=1,ord=2))
    # idxAry=np.argmin(np.array(norm0).transpose(),axis=1)
    
    # b=np.mean(B[np.where(idxAry==j)],axis=0)
            # else:
            #     temp[j][i]=round(temp[j][i]+273,2)

    # print(speed.shape,lonAry.shape,latAry.shape)
    gridx = np.arange(longlatGridDict["lo1"], longlatGridDict["lo2"],longlatGridDict["dx"])
    gridy = np.arange(longlatGridDict["la2"], longlatGridDict["la1"], longlatGridDict["dy"])
    meanvalue=awsData["WSPD_10"].mean()
    stdvalue=awsData["WSPD_10"].std()
    # OK = OrdinaryKriging(
    #     awsData.loc[:,"long"], # data[:, 0],
    #     awsData.loc[:,"lat"], #data[:, 1],
    #     (awsData.loc[:,"WSPD_10"]), #data[:, 2],
    #     variogram_model="spherical",
    #     verbose=False,
    #     enable_plotting=False,
    #     nlags=2,
    # )
    
    # print("begin ok")
    # print(awsData[["OBS_DATETIME","long","lat","WSPD_10"]],gridx,gridy)
    # z, ss = OK.execute("grid",gridx , gridy)
    # zz=z
    # plt.imshow(z)
    # # plt.show()
    # print(z)
    # plt.savefig('a.png')
    # n,m = longlatGridDict["nx"],longlatGridDict["ny"]
    # speedAry= {        
    #         "header": {
    #             "refTime": reftime,
    #             "nx": n+1,
    #             "ny": m+1,
    #             "lo1": longlatGridDict["lo1"],
    #             "la1": longlatGridDict["la1"],
    #             "lo2": longlatGridDict["lo2"],
    #             "la2": longlatGridDict["la2"],
    #             "dx": longlatGridDict["dx"],
    #             "dy": longlatGridDict["dy"],
    #             "parameterCategory": 0,
    #             "parameterCategoryName": "Temperature",
    #             "parameterNumber": 0,
    #         }, "z":z.tolist()}     
    # speedAryString = json.dumps(speedAry)
    # with open(workdir+"awsData/contour/speedOK.json", "w") as speedCoutour:
    #     speedCoutour.write(speedAryString)
    # speedCoutour.close()    
    # print("end ok")
        


    # u=np.reshape(u,(n*m))
    # v=np.reshape(v,(n*m))
    # temp=np.reshape(temp,(n*m))
    # print(grid.tolist())
    # 
    # resultJsonAry=[
    #     {
    #         "header": {
    #             "refTime": reftime,
    #             "nx": n+1,
    #             "ny": m+1,
    #             "lo1": longlatGridDict["lo1"],
    #             "la1": longlatGridDict["la1"],
    #             "lo2": longlatGridDict["lo2"],
    #             "la2": longlatGridDict["la2"],
    #             "dx": longlatGridDict["dx"],
    #             "dy": longlatGridDict["dy"],
    #             "parameterCategory":2,
    #             "parameterCategoryName": "Temperature",
    #             "parameterNumber": 2,
    #         },
    #         "data": u.tolist(),

    #     },
    #     {
    #         "header": {
    #             "refTime": reftime,
    #             "nx": n+1,
    #             "ny": m+1,
    #             "lo1": longlatGridDict["lo1"],
    #             "la1": longlatGridDict["la1"],
    #             "lo2": longlatGridDict["lo2"],
    #             "la2": longlatGridDict["la2"],
    #             "dx": longlatGridDict["dx"],
    #             "dy": longlatGridDict["dy"],
    #             "parameterCategory": 2,
    #             "parameterCategoryName": "Temperature",
    #             "parameterNumber": 3,
    #             },
    #         "data": v.tolist(),
            
    #         },
    #     {
    #         "header": {
    #             "refTime": reftime,
    #             "nx": n+1,
    #             "ny": m+1,
    #             "lo1": longlatGridDict["lo1"],
    #             "la1": longlatGridDict["la1"],
    #             "lo2": longlatGridDict["lo2"],
    #             "la2": longlatGridDict["la2"],
    #             "dx": longlatGridDict["dx"],
    #             "dy": longlatGridDict["dy"],
    #             "parameterCategory": 0,
    #             "parameterCategoryName": "Temperature",
    #             "parameterNumber": 0,
    #         },
    #         "data": temp.tolist(),     
    #     }
    # ]

    # # print(resultJsonAry[0]["data"])
    # ############
    # # wind particule
    # #########
    # filenameDTStr=nowdt.strftime("%Y%m%d%H")
    # jsonString = json.dumps(resultJsonAry)
    # # if minZeroFlag:
    # #     with open(workdir+"awsData/contour/wdir_"+filenameDTStr+".json", "w") as outfile:
    # #         outfile.write(jsonString)
    # #     outfile.close()
    # # else:
    # #     with open(workdir+"awsData/contour/wdir.json", "w") as outfile:
    # #         outfile.write(jsonString)
    # #     outfile.close()        

    # speedAry= {        
    #         "header": {
    #             "refTime": reftime,
    #             "nx": n+1,
    #             "ny": m+1,
    #             "lo1": longlatGridDict["lo1"],
    #             "la1": longlatGridDict["la1"],
    #             "lo2": longlatGridDict["lo2"],
    #             "la2": longlatGridDict["la2"],
    #             "dx": longlatGridDict["dx"],
    #             "dy": longlatGridDict["dy"],
    #             "parameterCategory": 0,
    #             "parameterCategoryName": "Temperature",
    #             "parameterNumber": 0,
    #         },"x": lonAry.tolist(), "y":latAry.tolist(), "z":speed.tolist()} 

    # humiAry= {        
    #         "header": {
    #             "refTime": reftime,
    #             "nx": n+1,
    #             "ny": m+1,
    #             "lo1": longlatGridDict["lo1"],
    #             "la1": longlatGridDict["la1"],
    #             "lo2": longlatGridDict["lo2"],
    #             "la2": longlatGridDict["la2"],
    #             "dx": longlatGridDict["dx"],
    #             "dy": longlatGridDict["dy"],
    #             "parameterCategory": 0,
    #             "parameterCategoryName": "Temperature",
    #             "parameterNumber": 0,
    #         },"z":humi.tolist()} 

    # tempAry= {        
    #         "header": {
    #             "refTime": reftime,
    #             "nx": n+1,
    #             "ny": m+1,
    #             "lo1": longlatGridDict["lo1"],
    #             "la1": longlatGridDict["la1"],
    #             "lo2": longlatGridDict["lo2"],
    #             "la2": longlatGridDict["la2"],
    #             "dx": longlatGridDict["dx"],
    #             "dy": longlatGridDict["dy"],
    #             "parameterCategory": 0,
    #             "parameterCategoryName": "Temperature",
    #             "parameterNumber": 0,
    #         },"z":temp.tolist()} 
    # speedAryString = json.dumps(speedAry)
    ############
    # aws latest contour
    #########
    # if minZeroFlag:
    #     with open(workdir+"awsData/contour/speed_"+filenameDTStr+".json", "w") as speedCoutour:
    #         speedCoutour.write(speedAryString)
    #     speedCoutour.close()
            
    #     tempString = json.dumps(tempAry)
    #     with open(workdir+"awsData/contour/temp_"+filenameDTStr+".json", "w") as tempCoutour:
    #         tempCoutour.write(tempString)
    #     tempCoutour.close()
    #     humiString = json.dumps(humiAry)
    #     with open(workdir+"awsData/contour/humi_"+filenameDTStr+".json", "w") as humiCoutour:
    #         humiCoutour.write(humiString)
    # else:
    #     with open(workdir+"awsData/contour/speed.json", "w") as speedCoutour:
    #         speedCoutour.write(speedAryString)
    #     speedCoutour.close()
            
    #     tempString = json.dumps(tempAry)
    #     with open(workdir+"awsData/contour/temp.json", "w") as tempCoutour:
    #         tempCoutour.write(tempString)
    #     tempCoutour.close()
    #     humiString = json.dumps(humiAry)
    #     with open(workdir+"awsData/contour/humi.json", "w") as humiCoutour:
    #         humiCoutour.write(humiString)        
    # humiCoutour.close()
awsContourGen(j=0,minZeroFlag=False)



 