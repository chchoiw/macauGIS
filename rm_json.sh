#! /bin/bash



workdir="/srv/www/htdocs/gis_exercise"
day_offset="15 days ago"
utc2local="8 hours" 
if [ $# -eq 0 ]
then
  # timestamp within log filename is recorded in UTC
#   remove a day ago log file
  df=(`date +"%Y %m %d %H 00" --date="-3 days" `)
  #df=(`date +"%Y %m %d %H 00" --date= "$df" `)
else
  df=($1 $2 $3 $4 $5)
fi

yyyy=${df[0]}
mm=${df[1]}
dd=${df[2]}
hh=${df[3]}
MM=${df[4]}

sched_time="${yyyy}${mm}${dd}"  




df2=(`date +"%Y %m %d %H 00" --date="-15 days" `)
yyyy2=${df2[0]}
mm2=${df2[1]}
dd2=${df2[2]}
hh2=${df2[3]}
MM2=${df2[4]}
sched_time2="${yyyy2}${mm2}${dd2}" 


echo "rm -f "$workdir"/awsData/contour/*$sched_time*"
rm   $workdir/awsData/contour/*$sched_time2*
rm   $workdir/awsData/stationPoint/*$sched_time2*
rm   $workdir/awsData/stationTimeSeries/*$sched_time2*
rm   $workdir/wlData/contour/*$sched_time2*
rm   $workdir/wlData/stationPoint/*$sched_time2*
rm   $workdir/wlData/stationTimeSeries/*$sched_time2*
