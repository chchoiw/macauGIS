//

function initDemoMap() {
  var cartodbAttribution =
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

  var positron = L.tileLayer(
    "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
    {
      attribution: cartodbAttribution,
      opacity: 0.3,
    }
  );
  var Esri_satImagery = L.tileLayer(
    "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, " +
        "AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      opacity: 0.3,
    }
  );
  var Esri_WorldImagery = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, " +
        "AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      opacity: 1,
    }
  );

  var Esri_DarkGreyCanvas = L.tileLayer(
    "http://{s}.sm.mapstack.stamen.com/" +
      "(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/" +
      "{z}/{x}/{y}.png",
    {
      attribution: "", //'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, ' +
      //'NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
      opacity: 0.9,
    }
  );

  var baseLayers = {
    test: positron,
    Street: Esri_WorldImagery,
    Satellite: Esri_satImagery,
    "Grey Canvas": Esri_DarkGreyCanvas,
  };

  var map = L.map("map", {
    layers: [Esri_DarkGreyCanvas],
    center: [22.160928, 113.562971],
    zoom: setInitialMapZoom(),
    zoomSnap: 0.1,
  });

  var layerControl = L.control.layers(baseLayers);
  layerControl.addTo(map);
  // map.setView([22.160928, 113.552971], 13);
  // map.dragging.disable();
  // map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  return {
    map: map,
    layerControl: layerControl,
  };
}
function setInitialMapZoom() {
  var viewportWidth = window.innerWidth;
  var mapWidth = viewportWidth * 0.9;
  var mapZoom;

  if (mapWidth >= 500) mapZoom = 12.7;
  else {
    // alert(mapWidth)
    // mapZoom=mapWidth/500*1;
    mapZoom = 12.4;
  }

  return mapZoom;
}
// demo map
var mapStuff = initDemoMap();
var map = mapStuff.map;
var layerControl = mapStuff.layerControl;

// L.control.coordinates().addTo(map);
//add configured controls
// L.control.coordinates({
//     position:"bottomleft",
//     decimals:2,
//     decimalSeperator:",",
//     labelTemplateLat:"Latitude: {y}",
//     labelTemplateLng:"Longitude: {x}"
// }).addTo(map);
// L.control.coordinates({
//     position:"topright",
//     useDMS:true,
//     labelTemplateLat:"N {y}",
//     labelTemplateLng:"E {x}",
//     useLatLngOrder:true
// }).addTo(map);

// data={
//     "type": "Feature",
//     "geometry": {
//       "type": "Vector",
//       "coordinates": [113.5586, 22.16]
//     },
//     "properties": {
//       "name": "TG"
//     }
//   }
function getJsonFun(filename, key = "") {
  var tmp = null;
  // $.getJSON("macau.topojson", function(data) {
  $.ajax({
    async: false,
    type: "GET",
    global: false,
    // 'dataType': 'html',
    url: filename,
    data: {},

    success: function (data) {
      // console.log("macau",data);
      tmp = data;
      // tmp = JSON.parse(data);
    },
    error: function (xhr, ajaxOptions, thrownError) {
      console.log(xhr.status);
      console.log(thrownError);
    },
  });
  // console.log(filename,key,tmp[key])

  if (key === "") return tmp;
  else return tmp[key];
}
var stationData = getJsonFun("awsData/stationPoint/station.json", 0);
function addStation() {
  // var stationData = getJsonFun("awsData/stationPoint/station.json", (key = ""));
  function onEachFeature(feature, layer) {
    let popupContent = `<p>I started out as a GeoJSON ${feature.geometry.type}, but now I'm a Leaflet vector!</p>`;

    if (feature.properties) {
      popupContent += feature.properties.popupContent;
    }

    layer.bindPopup(popupContent);
  }
  // L.geoJSON(data, {
  //     style: function (feature) {
  //         return {color: feature.properties.color};
  //     }
  // }).bindPopup(function (layer) {
  //     return layer.feature.properties.description;
  // }).addTo(map);
  const baseballIcon = L.icon({
    iconUrl: "location.png",
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -28],
  });

  var coorsLayer = null;
  if (coorsLayer !== null) map.removeLayer(coorsLayer);

  var coorsLayer = L.geoJSON(stationData, {
    pointToLayer(feature, latlng) {
      // console.log(feature.properties.name)
      if (feature.properties.WSPD_10 != -999) {
        var htmlstr =
          '<span class="my-div-span">' +
          feature.properties.name +
          "</span><br>" +
          "<span class='dataSpan'>" +
          (feature.properties.WSPD_10 * 3.6).toFixed(1) +
          "</span>";
      } else {
        var htmlstr =
          '<span class="my-div-span">' +
          feature.properties.name +
          "</span><br>" +
          "<span class='dataSpan'>NaN</span>";
      }
      var icon = L.marker(latlng, {
        icon: new L.DivIcon({
          className: "waterstation-icon",
          html: htmlstr,
        }),
      });
      // console.log(latlng)
      // return L.marker(latlng, {icon:baseballIcon});
      return icon;
    },

    onEachFeature,
  }).addTo(map);
}

// addStation();
var handleError = function (err) {
  console.log("handleError...");
  console.log(err);
};
function getColorFromColorLevel(value, colorLevel) {
  for (var j = 0; j < colorLevel.length - 1; j++) {
    if (value >= colorLevel[j][0] && value < colorLevel[j + 1][0]) {
      var red = colorLevel[j][1][0];
      var green = colorLevel[j][1][1];
      var blue = colorLevel[j][1][2];
      var opacityColor = colorLevel[j][1][3];
      var color = asColorStyle(red, green, blue, opacityColor);
      break;
      // console.log("z2",z2,color);
    } else color = "rgba(0,0,0,0,0)";
  }
  return color;
}
// $.getJSON("macau2.geojson", function(data) {
//     console.log("bbb",data)
//     var highlight;
//     var clearHighlight = function() {
//         if (highlight) {
//             vectorGrid.resetFeatureStyle(highlight);
//         }
//         highlight = null;
//     };
//     var vectorGrid = L.vectorGrid.slicer( data, {
//         rendererFactory: L.svg.tile,
//         vectorTileLayerStyles: {
//             sliced: function(properties, zoom) {
//                 var p = properties.mapcolor7 % 5;
//                 return {
//                     fillColor: p === 0 ? '#800026' :
//                             p === 1 ? '#E31A1C' :
//                             p === 2 ? '#FEB24C' :
//                             p === 3 ? '#B2FE4C' : 'green',
//                     fillOpacity: 1,
//                      //fillOpacity: 1,
//                     stroke: true,
//                     fill: true,
//                     color: 'red',
//                          //opacity: 0.2,
//                     weight: 3,

//                 }
//             }
//         },
//         interactive: true,
//         getFeatureId: function(f) {
//             return f.properties.wb_a3;
//         }
//     })
//     .on('mouseover', function(e) {
//         var properties = e.layer.properties;
//         L.popup()
//             .setContent(properties.name || properties.type)
//             .setLatLng(e.latlng)
//             .openOn(map);

//         clearHighlight();
//         highlight = properties.wb_a3;

//         var p = properties.mapcolor7 % 5;
//         var style = {
//             fillColor: p === 0 ? '#800026' :
//                     p === 1 ? '#E31A1C' :
//                     p === 2 ? '#FEB24C' :
//                     p === 3 ? '#B2FE4C' : 'green',
//             fillOpacity: 0.5,
//             fillOpacity: 1,
//             stroke: true,
//             fill: true,
//             color: 'red',
//             opacity: 1,
//             weight: 2,
//             zorder:999
//         };

//         vectorGrid.setFeatureStyle(properties.wb_a3, style);
//         // map.setView({ lat: 47.040182144806664, lng: 9.667968750000002 }, 5);
//     })
//     .addTo(map);
//     map.on('click', clearHighlight);
//     // show an array of tile coordinates created so far
//     // console.log(tileIndex.tileCoords);
//     // layerControl.addOverlay(velocityLayer, "Wind - Global");
//   });

//   L.eachLayer(function(memberLayer) {
//     console.log("cccc")
//     if (memberLayer.contains(point.getLatLng())) {
//       console.log(memberLayer.feature.properties);
//     }
//   });
var speedColorScale = [
  [0, [98, 113, 183, 255]],
  [1, [57, 97, 159, 255]],
  [3, [74, 148, 169, 255]],
  [5, [77, 141, 123, 255]],
  [7, [83, 165, 83, 255]],
  [9, [53, 159, 53, 255]],
  [11, [167, 157, 81, 255]],
  [13, [159, 127, 58, 255]],
  [15, [161, 108, 92, 255]],
  [17, [129, 58, 78, 255]],
  [19, [175, 80, 136, 255]],
  [21, [117, 74, 147, 255]],
  [24, [109, 97, 163, 255]],
  [27, [68, 105, 141, 255]],
  [29, [92, 144, 152, 255]],
  [36, [125, 68, 165, 255]],
  [46, [231, 215, 215, 256]],
  [51, [219, 212, 135, 256]],
  [77, [205, 202, 112, 256]],
  [104, [128, 128, 128, 255]],
];
var tempColorScale = [
  [0, [93, 133, 198, 255]],
  [1, [68, 125, 99, 255]],
  [10, [128, 147, 24, 255]],
  [21, [243, 183, 4, 255]],
  [30, [232, 83, 25, 255]],
  [47, [71, 14, 0, 255]],
];
var humiColorScale = [
  [0, [173, 85, 56, 255]],
  [30, [173, 110, 56, 255]],
  [40, [173, 146, 56, 255]],
  [50, [105, 173, 56, 255]],
  [60, [56, 173, 121, 255]],
  [70, [56, 174, 173, 255]],
  [75, [56, 160, 173, 255]],
  [80, [56, 157, 173, 255]],
  [83, [56, 148, 173, 255]],
  [87, [56, 135, 173, 255]],
  [90, [56, 132, 173, 255]],
  [93, [56, 123, 173, 255]],
  [97, [56, 98, 157, 255]],
  [100, [56, 70, 114, 255]],
];
var wlColorScale = [
  [0, [159, 185, 191, 255]],
  [0.5, [48, 157, 185, 255]],
  [1, [48, 98, 141, 255]],
  [1.5, [56, 104, 191, 255]],
  [2, [57, 60, 142, 255]],
  [2.5, [187, 90, 191, 255]],
  [3, [154, 48, 151, 255]],
  [4, [133, 48, 48, 255]],
  [5, [191, 51, 95, 255]],
  [7, [191, 103, 87, 255]],
  [10, [191, 191, 191, 255]],
  [12, [154, 127, 155, 255]],
];
var colorDict = {
  WSPD_10: speedColorScale,
  HUMI: humiColorScale,
  TEMP: tempColorScale,
  wl: wlColorScale,
};
var asColorStyle = function (r, g, b, a) {
  return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
};

function addTotalSation(filename, key, fileTimeFormat = "") {
  var htmlstrAry = [];

  var totalGroup = [];
  var stationData = getJsonFun(filename, key);
  console.log("check stationdata", stationData);
  for (var i = 0; i < stationData.length; i++) {
    var classStr = "dataspan";
    var loopVar = stationData[i];
    var long = loopVar["geometry"]["coordinates"][0];
    var lat = loopVar["geometry"]["coordinates"][1];
    var wspd = (loopVar.properties.WSPD_10 * 3.6).toFixed(1);
    if (wspd == -999) wspd = "NaN";
    var temperature = loopVar.properties.TEMP.toFixed(1);
    if (temperature == -999) classStr = "NaNClass";
    else classStr = "dataSpan";
    var humi = loopVar.properties.HUMI.toFixed(1);
    if (humi == -999) classStr = "NaNClass";
    else classStr = "dataSpan";
    var name = loopVar["properties"]["name"];
    var speedcolor = getColorFromColorLevel(wspd, speedColorScale);
    var humicolor = getColorFromColorLevel(humi, humiColorScale);
    var tempcolor = getColorFromColorLevel(temperature, tempColorScale);
    console.log("humi", humicolor, tempcolor, speedcolor);
    var spanWspdId = name + "Wspd" + "Span";
    var spanTempId = name + "Temp" + "Span";
    var spanHumiId = name + "Humi" + "Span";
    var htmlstr =
      "<div id='" +
      name +
      "_totalValeDiv' class='stationVarsLayerDiv'><div  class='dataSpan totalSpanWspd' id='" +
      spanWspdId +
      "' onclick =\"appendData('" +
      name +
      "','WSPD_10')\" style='background-color:" +
      speedcolor +
      ";'>" +
      wspd +
      "</div>" +
      "<div  class='" +
      classStr +
      " totalSpanTemp' id='" +
      spanTempId +
      "' onclick =\"appendData('" +
      name +
      "','TEMP')\" style='background-color:" +
      tempcolor +
      ";'>" +
      temperature +
      "</div>" +
      "<div id='" +
      spanHumiId +
      "'  class='" +
      classStr +
      " totalSpanHumi' " +
      " onclick =\"appendData('" +
      name +
      "','HUMI')\" style='background-color:" +
      humicolor +
      ";'>" +
      humi +
      "</div>" +
      "</div>" +
      '<span class="my-div-span-total">' +
      name +
      "</span>";
    var stationMarker = L.marker([lat, long], {
      icon: new L.DivIcon({
        className: "waterstation-icon",
        html: htmlstr,
      }),
    });

    // windBarbGroup.push(stationMarker);
    totalGroup.push(stationMarker);
  }
  // function addTotalSation(filename,key,fileTimeFormat="")
  if (fileTimeFormat != "")
    var windbarbMarkerList = windbarbGen(
      "./awsData/stationPoint/windbarb_" + fileTimeFormat + ".json",
      0
    );
  else
    var windbarbMarkerList = windbarbGen(
      "./awsData/stationPoint/windbarb.json",
      0
    );

  totalGroup = totalGroup.concat(windbarbMarkerList);
  console.log("aaaaaa", totalGroup);
  var staionLayer = L.layerGroup(totalGroup);
  return staionLayer;
}
var windbarbMarkerList = windbarbGen("./awsData/stationPoint/windbarb.json", 0);
var staionLayer = addTotalSation("awsData/stationPoint/station.json", 0);

layerControl.addOverlay(staionLayer, "Station");
// var icon=L.marker(latlng, {
//       icon: new L.DivIcon({
//           className: 'waterstation-icon',
//           html: htmlstr
//       })
//     });
//   console.log(latlng)
//   // return L.marker(latlng, {icon:baseballIcon});
//   return icon
// console.log("htmlstr",stationData[0],htmlstr)
function windbarbGen(filename, key) {
  // "aws.json"
  var meteoPoints = getJsonFun(filename, key);
  var windBarbGroup = [];
  console.log("----meteoPoints", meteoPoints);
  meteoPoints.forEach(function (p) {
    var icon = L.WindBarb.icon({
      deg: p[3],
      speed: p[2],
      pointRadius: 3,
      fillColor: "blue",
      circleBorderColor: "rgba(255,255,0,1)",
      strokeWidth: 3,
      strokeLength: 20,
      pathColor: "rgba(255,255,0,1)",
      // barbHeight :20,
    });
    var marker = L.marker([p[1], p[0]], { icon: icon }).bindPopup(
      "<p>Wind Speed: " + p[2] + "</p>" + "<p>Wind Direction: " + p[3] + "</p>"
    );
    windBarbGroup.push(marker);
  });

  return windBarbGroup;
}
//       var wspdSpan = document.getElementById(spanWspdId);

//       wspdSpan.addEventListener("click", function (ev) {
//         appendData(name, "WSPD_10");
//       });
// // windbarb.addTo(map);
// console.log(wspdSpan.length);
// stationMarker.on('mouseover',timeSeries(stationMarker))
// for (var i = 0; i < wspdSpan.length; i++) {
// wspdSpan[i].addEventListener("click", function (ev) {

// stationMarker.on("click", function (ev) {
// $(".waterstation-icon").on('click',function(ev) {
// ev.target.openPopup();
// var stationMarker = ev.target;
// var myCustomPopup = stationMarker.getPopup().getElement()
//   .children[0].children[0].children[0];
// var speedcolor = myCustomPopup.style.backgroundColor;
// var dataKey = myCustomPopup.id;
// stationMarker
//   .getPopup()
//   .getElement().children[0].style.backgroundColor = speedcolor;
// stationMarker
//   .getPopup()
//   .getElement().children[0].style.zIndex = 600;
// });
// }

var wdirdata = getJsonFun("awsData/contour/wdir.json", (key = ""));
// $.getJSON("awsData/contour/demo2.json", function(data) {
var wdirLayer = L.velocityLayer({
  displayValues: true,
  displayOptions: {
    velocityType: "Wind",
    position: "bottomleft",
    emptyString: "No wind data",
    particleMultiplier: 1 / 200,
    speedUnit: "k/h",
    velocityScale: 0.00001,
    topoJsonPath: "macau.topojson",
    stationGeoPath: "awsData/stationPoint/windbarb.json",
    // ['ms', 'k/h', 'mph', 'kt']
  },
  data: wdirdata,
  frameRate: 30,
  lineWidth: 2.5,
  //   maxVelocity: 15
});

var windBarbLayer = L.layerGroup(windbarbMarkerList);
// var wdirLayer2 = L.layerGroup([windBarbLayer, wdirLayer]);
var wdirLayer2 = L.layerGroup([wdirLayer]);
layerControl.addOverlay(wdirLayer2, "WindAnimation");
// velocityLayer.addTo(map);
// });

var speeddata = getJsonFun("awsData/contour/speed.json", (key = ""));
var speedLayerOption = {
  displayValues: true,
  displayOptions: {
    velocityType: "WSPD_10",
    position: "bottomleft",
    emptyString: "",
    particleMultiplier: 1 / 200,
    speedUnit: "k/h",
    dataKey: "WSPD_10",
    topoJsonPath: "macau.topojson",
    stationGeoPath: "awsData/stationPoint/station.json",
  },
  data: speeddata,
  dataKey: "WSPD_10",
  colorScale: speedColorScale,
  //   maxVelocity: 15
};

// $.getJSON("awsData/contour/speed.json", function(data) {
var speedLayer = L.contourLayer(speedLayerOption);
var speedLayer2 = L.layerGroup([wdirLayer2, speedLayer]);
// var speedLayer2 = L.layerGroup([ speedLayer]);
layerControl.addOverlay(speedLayer2, "WSPD");
speedLayer2.addTo(map);
// });

var speeddataok = getJsonFun("awsData/contour/speedOK.json", (key = ""));
var speedOKLayerOption = {
  displayValues: true,
  displayOptions: {
    velocityType: "WSPD_10",
    position: "bottomleft",
    emptyString: "",
    particleMultiplier: 1 / 200,
    speedUnit: "k/h",
    dataKey: "WSPD_10",
    topoJsonPath: "macau.topojson",
    stationGeoPath: "awsData/stationPoint/station.json",
  },
  data: speeddataok,
  dataKey: "WSPD_10",
  colorScale: speedColorScale,
  //   maxVelocity: 15
};
var speedOKLayer = L.contourLayer(speedOKLayerOption);
var speedOKLayer2 = L.layerGroup([wdirLayer2, speedOKLayer]);
// var speedLayer2 = L.layerGroup([ speedLayer]);
// layerControl.addOverlay(speedOKLayer2, "WSPD_OK");
// speedOKLayer2.addTo(map);
var tempdata = getJsonFun("awsData/contour/temp.json", (key = ""));
console.log(tempdata);
var tempLayerOption = {
  displayValues: true,
  displayOptions: {
    velocityType: "TEMP",
    position: "bottomleft",
    emptyString: "",
    particleMultiplier: 1 / 200,
    speedUnit: "C",
    dataKey: "TEMP",
    topoJsonPath: "macau.topojson",
    stationGeoPath: "awsData/stationPoint/station.json",
  },
  data: tempdata,
  dataKey: "TEMP",
  colorScale: tempColorScale,
  //   maxVelocity: 15
};
var tempLayer = L.contourLayer(tempLayerOption);
var tempLayer2 = L.layerGroup([wdirLayer2, tempLayer]);
layerControl.addOverlay(tempLayer2, "TEMP");

// $.getJSON("awsData/contour/temp.json", function(data) {

// });
var humidata = getJsonFun("awsData/contour/humi.json", (key = ""));
var humiLayerOption = {
  displayValues: true,
  displayOptions: {
    velocityType: "HUMI",
    position: "bottomleft",
    emptyString: "",
    speedUnit: "%",
    particleMultiplier: 1 / 200,
    dataKey: "HUMI",
    topoJsonPath: "macau.topojson",
    stationGeoPath: "awsData/stationPoint/station.json",
  },
  data: humidata,
  dataKey: "HUMI",
  colorScale: humiColorScale,
  //   maxVelocity: 15
};
// $.getJSON("awsData/contour/humi.json", function(data) {
var humiLayer = L.contourLayer(humiLayerOption);
var humiLayer2 = L.layerGroup([wdirLayer2, humiLayer]);
layerControl.addOverlay(humiLayer2, "HUMI");
// });

var wldata = getJsonFun("wlData/contour/wl.json", (key = ""));
console.log("wlData", wldata);
var wlLayerOption = {
  displayValues: true,
  displayOptions: {
    velocityType: "wl",
    position: "bottomleft",
    emptyString: "",
    speedUnit: "",
    particleMultiplier: 1 / 200,
    // dataKey:"wl",
    dataKey: "wl",
    topoJsonPath: "waterlevel_topojson.json",
    stationGeoPath: "wlData/stationPoint/stationWL.json",
    // stationGeoPath:"wlData/stationPoint/station.json",
  },
  data: wldata,
  // dataKey:"wl",
  dataKey: "wl",
  colorScale: wlColorScale,
  //   maxVelocity: 15
};
// $.getJSON("wlData/contour/wl.json", function(data) {
// var wlLayer = L.contourLayer(wlLayerOption);
// layerControl.addOverlay(wlLayer, "WaterLevel");
// });
var layerDict = {
  WSPD_10: speedLayer,
  TEMP: tempLayer,
  HUMI: humiLayer,
  // "wl":wlLayer,
  WDIR_10: wdirLayer,
  windbarb: windBarbLayer,
  station: staionLayer,
};
const colors = [
  {
    color: "#00fcff", //RGB color (0, 252, 255)
    point: 0,
  },
  {
    color: "#0090ff",
    point: 0.1,
  },
  {
    color: "#0090ff",
    point: 0.2,
  },
  {
    color: "#0003ff",
    point: 0.3,
  },
  {
    color: "#007500",
    point: 0.4,
  },
  {
    color: "#ffbb00",
    point: 0.5,
  },
  {
    color: "#e82200",
    point: 0.6,
  },
  {
    color: "#ff7e00",
    point: 0.7,
  },
  {
    color: "#590b24",
    point: 0.8,
  },
  {
    color: "#4400c8",
    point: 0.9,
  },
  {
    color: "#320064",
    point: 1,
  },
];
function getColor(value, min, max, colors) {
  function hex(c) {
    var s = "0123456789abcdef";
    var i = parseInt(c, 10);
    if (i === 0 || isNaN(c)) return "00";
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - (i % 16)) / 16) + s.charAt(i % 16);
  }
  function trim(s) {
    return s.charAt(0) === "#" ? s.substring(1, 7) : s;
  }
  function convertToRGB(hex) {
    var color = [];
    color[0] = parseInt(trim(hex).substring(0, 2), 16);
    color[1] = parseInt(trim(hex).substring(2, 4), 16);
    color[2] = parseInt(trim(hex).substring(4, 6), 16);
    return color;
  }
  function convertToHex(rgb) {
    return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
  }

  if (value === null || isNaN(value)) {
    return "#ffffff";
  }
  if (value > max) {
    return colors[colors.length - 1].color;
  }
  if (value < min) {
    return colors[0].color;
  }
  var loc = (value - min) / (max - min);
  if (loc < 0 || loc > 1) {
    return "#fff";
  } else {
    var index = 0;
    for (var i = 0; i < colors.length - 1; i++) {
      if (loc >= colors[i].point && loc <= colors[i + 1].point) {
        index = i;
      }
    }
    var color1 = convertToRGB(colors[index].color);
    var color2 = convertToRGB(colors[index + 1].color);

    var f =
      (loc - colors[index].point) /
      (colors[index + 1].point - colors[index].point);
    var rgb = [
      color1[0] + (color2[0] - color1[0]) * f,
      color1[1] + (color2[1] - color1[1]) * f,
      color1[2] + (color2[2] - color1[2]) * f,
    ];

    return `#${convertToHex(rgb)}`;
  }
}

// console.log("coutour")
// $.getJSON('speed.json', function (data) {
//     m=data["z"].length;
//     n=data["z"][0].length;
//     for (var i=0;i<n;i++)
//     {
//       for (var j=0;j<m;j++)
//       {
//         if (data["z"][j][i]==-999) data["z"][j][i]=null;
//       }
//     }
//     console.log(data)
//     L.contour(data, {
//         thresholds: 5,
//         style: (feature) => {
//             return {
//             color: getColor(feature.geometry.value, 0, 5, colors),
//             opacity: 0.1,
//             fillOpacity: 0.1,
//             };
//         },
//     }).addTo(map);
// })
// .fail(function(jqXHR, textStatus, errorThrown) {
//     console.log("error " + textStatus);
//     console.log("incoming Text " + jqXHR.responseText);
// });
function responsivefy(svg) {
  // container will be the DOM element
  // that the svg is appended to
  // we then measure the container
  // and find its aspect ratio
  const container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style("width"), 10),
    height = parseInt(svg.style("height"), 10),
    aspect = width / height;

  // set viewBox attribute to the initial size
  // control scaling with preserveAspectRatio
  // resize svg on inital page load
  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMid")
    .call(resize);

  // add a listener so the chart will be resized
  // when the window resizes
  // multiple listeners for the same event type
  // requires a namespace, i.e., 'click.foo'
  // api docs: https://goo.gl/F3ZCFr
  d3.select(window).on("resize." + container.attr("id"), resize);

  // this is the code that resizes the chart
  // it will be called on load
  // and in response to window resizes
  // gets the width of the container
  // and resizes the svg to fill it
  // while maintaining a consistent aspect ratio
  function resize() {
    const w = parseInt(container.style("width"));
    svg.attr("width", w);
    console.log("resize check", w);
    svg.attr("height", Math.round(w / aspect));
  }
}

window.mobileAndTabletCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

function appendData(stationcode, varName) {
  if (window.mobileAndTabletCheck()) {
    console.log(window.mobileAndTabletCheck());
    Swal.fire({
      html: '<div id="my_dataviz2" class="chartClass"></div>',
      showCloseButton: true,
      width: "100%",
      height: "100%",
      padding: 0,
      maxWidth: "800",
      showCancelButton: false,
      focusConfirm: false,
      showConfirmButton: false,
      // allowOutsideClick: false,
      position: "bottom",
      //  allowOutsideClick: ()=>
      // {}
    });
    var chartID = "my_dataviz2";
    document.getElementById("my_dataviz").innerHTML = "";
  } else {
    console.log(window.mobileAndTabletCheck());
    var chartID = "my_dataviz";
  }
  document.getElementById(chartID).setAttribute("statName", stationcode);
  const margin = { top: 40, right: 80, bottom: 60, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
  // const x = d3.scaleTime().range([0, width]);
  // const margin = { top: R0, righFt: 0, bottom: 20, left: 20 },
  // width = 550 - margin.left - margin.right,
  // height = 325 - margin.top - margin.bottom;
  if (varName != "wl")
    var filename = "awsData/stationTimeSeries/" + stationcode + ".json";
  else filename = "wlData/stationTimeSeries/" + stationcode + ".json";

  if (varName != "wl")
    var quantilefilename =
      "awsData/stationTimeSeries/quantile_" + varName + ".json";
  else quantilefilename = "wlData/stationTimeSeries/" + stationcode + ".json";
  // const parseDate = d3.timeParse("%m/%d/%Y"),
  var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S"),
    formatDate = d3.timeFormat("%Y-%m-%d"),
    formatMonth = d3.timeFormat("%b"),
    formatTime = d3.timeFormat("%dd%H:%M");
  numberformat = d3.format(".1f");
  formatMin = d3.timeFormat("%M");
  var data = getJsonFun(filename, (key = 0));
  var quantile_data = getJsonFun(quantilefilename, (key = 0));

  var XHour = [];
  var YHour = [];
  var DirHour = [];

  // quantile_data.forEach((dd) => {
  for (var j = 0; j < data.length; j++) {
    var dd = quantile_data[j];

    dd["OBS_DATETIME"] = parseDate(dd["OBS_DATETIME"]);

    if (varName == "WSPD_10") {
      if (dd["quantile"] == dd["quantile"]) {
        data[j]["quantile"] = parseFloat(dd["quantile"]) * 3.6;
        data[j]["thirdQuantile"] = parseFloat(dd["thirdQuantile"]) * 3.6;
        data[j]["min"] = parseFloat(dd["min"]) * 3.6;
        data[j]["max"] = parseFloat(dd["max"]) * 3.6;
        data[j]["mean"] = parseFloat(dd["mean"]) * 3.6;
      } else {
        data[j]["quantile"] = 0;
        data[j]["thirdQuantile"] = 0;
        data[j]["min"] = 0;
        data[j]["max"] = 0;
        data[j]["mean"] = 0;
      }
    } else {
      data[j]["quantile"] = Number(dd["quantile"]);
      data[j]["thirdQuantile"] = Number(dd["thirdQuantile"]);
      data[j]["min"] = Number(dd["min"]);
      data[j]["max"] = Number(dd["max"]);
      data[j]["mean"] = Number(dd["mean"]);
    }
  }
  // });
  console.log("data", data);
  // if (formatMin( d["OBS_DATETIME"])=="00")
  // {
  //   XHour.push(d["OBS_DATETIME"]);
  //   YHour.push(d[varName])
  //   DirHour.push(d["WDIR_10"])
  // }
  // console.log(d,d["OBS_DATETIME"],d[varName])

  data.forEach((d) => {
    const numberformat = d3.format(".1f");
    d["OBS_DATETIME"] = parseDate(d["OBS_DATETIME"]);
    d["quantile"] = d["quantile"];
    d["min"] = d["min"];

    if (varName == "WSPD_10") {
      if (d[varName] == d[varName]) {
        d[varName] = parseFloat(d[varName]) * 3.6;
      } else d[varName] = 0;
    } else d[varName] = Number(d[varName]);
    if (formatMin(d["OBS_DATETIME"]) == "00") {
      XHour.push(d["OBS_DATETIME"]);
      YHour.push(d[varName]);
      DirHour.push(d["WDIR_10"]);
    }
    // console.log(d,d["OBS_DATETIME"],d[varName])
  });
  const x = d3.scaleTime().range([0, width]);
  // speedColorScale
  var maxY = d3.max(data, (d) => {
    return d["max"];
    // return d3.max(d[varName].filter(function(value) {
    //     return typeof value === "number";
    // }));
  });
  // var maxY=d3.max(data, (d) => (d3.max(d[varName], (d) => (d[varName]))))
  var minY = d3.min(data, (d) => {
    return d["min"];
  });

  var minDate = formatDate(
    d3.min(data, (d) => {
      return d["OBS_DATETIME"];
    })
  );
  var maxDate = formatDate(
    d3.max(data, (d) => {
      return d["OBS_DATETIME"];
    })
  );
  var minX = d3.min(data, (d) => {
    return d["OBS_DATETIME"];
  });
  var step = 1;
  var breakY = minY / 2;
  if (varName == "WSPD_10") {
    step = 2;
    // breakY=2;
  } else if (varName == "TEMP") {
    step = 1;
    // breakY=2
  } else if (varName == "HUMI") {
    step = 5;
  } else if (varName == "wl") {
    step = 0.1;
    // breakY=0
  }

  if (minY <= (maxY - minY) / 5) breakAxisY = false;
  else breakAxisY = true;
  console.log("breakAxisY", breakAxisY, breakY, minY, maxY);
  var y;
  if (breakAxisY) {
    y = d3.scaleLinear().range([height, (height * 4) / 5 + 20, margin.bottom]);
  } else {
    y = d3.scaleLinear().range([height, margin.bottom]);
  }
  // var varName="TEMP";
  // console.log(minDate,minX,minY,maxY,breakY,step,breakAxisY)
  var areaAry = [];
  var colorLevel = colorDict[varName];

  for (var j = 0; j < colorLevel.length - 1; j++) {
    var area = d3
      .area()
      .x((d) => {
        return x(d["OBS_DATETIME"]);
      })
      .y0(height)
      .y1((d) => {
        // if (d.value)return y(d[varName]);
        if (
          d[varName] >= colorLevel[j][0] &&
          d[varName] < colorLevel[j + 1][0]
        ) {
          return y(d["min"]);
        }
        // else return y(Number.NaN);
        else return y(0);
      });
    // .curve(d3.curveCardinal);
    areaAry.push(area);
  }

  var quantileArea = d3
    .area()
    .x((d) => {
      return x(d["OBS_DATETIME"]);
    })
    .y0((d) => {
      return y(d["quantile"]);
    })
    .y1((d) => {
      return y(d["thirdQuantile"]);
    });

  var minMaxArea = d3
    .area()
    .x((d) => {
      return x(d["OBS_DATETIME"]);
    })
    .y0((d) => {
      return y(d["min"]);
    })
    .y1((d) => {
      return y(d["max"]);
    });

  const valueline = d3
    .line()
    .x((d) => {
      return x(d["OBS_DATETIME"]);
    })
    .y((d) => {
      return y(d[varName]);
    });

  const minline = d3
    .line()
    .x((d) => {
      return x(d["OBS_DATETIME"]);
    })
    .y((d) => {
      return y(d["min"]);
    });
  const quantileline = d3
    .line()
    .x((d) => {
      return x(d["OBS_DATETIME"]);
    })
    .y((d) => {
      return y(d["quantile"]);
    });
  const meanline = d3
    .line()
    .x((d) => {
      return x(d["OBS_DATETIME"]);
    })
    .y((d) => {
      return y(d["mean"]);
    });
  const thirdQuantileline = d3
    .line()
    .x((d) => {
      return x(d["OBS_DATETIME"]);
    })
    .y((d) => {
      return y(d["thirdQuantile"]);
    });
  const maxline = d3
    .line()
    .x((d) => {
      return x(d["OBS_DATETIME"]);
    })
    .y((d) => {
      return y(d["max"]);
    });
  // .curve(d3.curveCardinal);
  document.getElementById(chartID).innerHTML = "";
  const svg = d3
    .select("#" + chartID)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    // .attr(
    //   "viewBox",
    //   `0 0 ${width + margin.left + margin.right} ${
    //     height + margin.top + margin.bottom
    //   }`
    // )
    .call(responsivefy)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(formatTime));

  svg
    .append("g")
    .attr("class", "y axis")
    // .attr("transform", "translate(0," + 59 + ")")
    .call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(varName);

  svg
    .append("a")
    .attr("xlink:href", (d) => {
      return "https://www.moex.com/ru/index/rtsusdcur.aspx?tid=2552";
    })
    .attr("class", "subtitle")
    .attr("target", "_blank")
    .append("text")
    .attr("x", 0)
    .attr("y", height + 50)
    .text("Source: Moscow Exchange");
  d3.selectAll("path.area").remove();
  d3.selectAll("path.line").remove();
  d3.selectAll(".title").remove();

  // filename = "https://raw.githubusercontent.com/jukuznets/datasets/main/usd-" + year + ".csv";

  // d3.csv(filename).then((data) => {
  // data = data.reverse();
  // console.log(data)

  x.domain(
    d3.extent(data, (d) => {
      return d["OBS_DATETIME"];
    })
  );

  if (breakAxisY) {
    y.domain([0, minY, maxY]);

    var rangeYAry = [0, breakY];
    for (let i = minY; i <= maxY; i += step) {
      rangeYAry.push(i);
    }
  } else {
    y.domain([0, maxY]);
    var rangeYAry = [];
    for (let i = 0; i <= maxY; i += step) {
      rangeYAry.push(i);
    }
  }
  //

  svg
    .select(".x.axis")
    .transition()
    .duration(750)
    .call(d3.axisBottom(x).ticks(25).tickFormat(d3.timeFormat("%H")));
  // if (breakAxisY)
  // {
  //   var x_tick=[0,2,
  //   d3.min(data, (d) => { return d[varName]; }),
  //   d3.max(data, (d) => { return d[varName]; })]
  // }
  // else
  // {
  //   var x_tick=[0,
  //   d3.max(data, (d) => { return d[varName]; })]
  // }

  svg
    .select(".y.axis")
    .transition()
    .duration(750)
    .call(d3.axisLeft(y).scale(y).tickValues(rangeYAry));
  if (breakAxisY) {
    svg
      .append("rect")
      .attr("x", margin.left - 60)
      .attr("y", y((minY - breakY) / 2 + (minY - breakY) / 10))
      .attr("height", 10)
      .attr("width", 20)
      .style("fill", "white");
    svg
      .append("rect")
      .attr("x", margin.left - 60)
      .attr("y", y((minY - breakY) / 2 + (minY - breakY) / 13))
      .attr("height", 7)
      .attr("width", 20)
      .style("fill", "#000");
  }

  for (var j = 0; j < colorLevel.length - 1; j++) {
    var red = colorLevel[j][1][0];
    var green = colorLevel[j][1][1];
    var blue = colorLevel[j][1][2];
    var opacityColor = colorLevel[j][1][3];
    var color = asColorStyle(red, green, blue, opacityColor);
    svg
      .append("path")
      .data([data])
      .attr("class", "area")
      .attr("d", areaAry[j])
      .attr("transform", "translate(0,300)")
      .transition()
      .duration(1000)
      .attr("transform", "translate(0,0)")
      .attr("fill", color);
  }
  svg
    .append("path")
    .data([data])
    .attr("class", "area")
    .attr("d", quantileArea)
    .attr("transform", "translate(0,300)")
    .transition()
    .duration(1000)
    .attr("transform", "translate(0,0)")
    .attr("fill", "rgba(24, 144, 255, 0.4)");

  svg
    .append("path")
    .data([data])
    .attr("class", "area")
    .attr("d", minMaxArea)
    .attr("transform", "translate(0,300)")
    .transition()
    .duration(1000)
    .attr("transform", "translate(0,0)")
    .attr("fill", "rgba(24, 144, 255, 0)");

  const linePath = svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", valueline);

  const pathLength = linePath.node().getTotalLength();
  linePath
    .attr("stroke-dasharray", pathLength)
    .attr("stroke-dashoffset", pathLength)
    .attr("stroke-width", 3)
    .transition()
    .duration(1000)
    .attr("stroke-width", 4)
    .attr("stroke-dashoffset", 0)
    .attr("stroke", "pink");

  const minLinePath = svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", minline);

  const minPathLength = minLinePath.node().getTotalLength();
  minLinePath
    .attr("stroke-dasharray", minPathLength)
    .attr("stroke-dashoffset", minPathLength)
    .attr("stroke-width", 0.5)
    .transition()
    .duration(1000)
    .attr("stroke-width", 0.5)
    .attr("stroke-dashoffset", 0)
    .attr("stroke", "grey");

  const quantileLinePath = svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", quantileline);

  const quantilePathLength = quantileLinePath.node().getTotalLength();
  quantileLinePath
    .attr("stroke-dasharray", quantilePathLength)
    .attr("stroke-dashoffset", quantilePathLength)
    .attr("stroke-width", 0.5)
    .transition()
    .duration(1000)
    .attr("stroke-width", 0.5)
    .attr("stroke-dashoffset", 0)
    .attr("stroke", "grey");

  const meanLinePath = svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", meanline);

  const meanPathLength = meanLinePath.node().getTotalLength();
  meanLinePath
    .attr("stroke-dasharray", meanPathLength)
    .attr("stroke-dashoffset", meanPathLength)
    .attr("stroke-width", 0.5)
    .transition()
    .duration(1000)
    .attr("stroke-width", 3)
    .attr("stroke-dashoffset", 0)
    .attr("stroke", "rgba(182, 227, 250, 1)");

  const thirdQuantileLinePath = svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", thirdQuantileline);

  const thirdQuantilePathLength = thirdQuantileLinePath.node().getTotalLength();
  thirdQuantileLinePath
    .attr("stroke-dasharray", thirdQuantilePathLength)
    .attr("stroke-dashoffset", thirdQuantilePathLength)
    .attr("stroke-width", 0.5)
    .transition()
    .duration(1000)
    .attr("stroke-width", 0.5)
    .attr("stroke-dashoffset", 0)
    .attr("stroke", "grey");

  const maxLinePath = svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", maxline);

  const maxPathLength = maxLinePath.node().getTotalLength();
  maxLinePath
    .attr("stroke-dasharray", maxPathLength)
    .attr("stroke-dashoffset", maxPathLength)
    .attr("stroke-width", 0.5)
    .transition()
    .duration(1000)
    .attr("stroke-width", 0.5)
    .attr("stroke-dashoffset", 0)
    .attr("stroke", "grey");

  svg
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", 30 - margin.top / 2)
    .attr("text-anchor", "middle")
    .text(stationcode + "   " + varName + "    " + maxDate);
  // .text("USD to RUB Exchange Rates, " + year);
  if (varName == "WSPD_10") {
    // console.log(DirHour,YHour)
    for (var i = 0; i < 25; i++) {
      try {
        var yy = 0.539956803 * YHour[i];
        var a = WindBarbArrowHandler.WindArrow(
          yy,
          DirHour[i],
          $("#windBarbArrow"),
          24,
          x(minX) + (width / 25) * i,
          y(0) - 40
        );
        console.log("wind barb", a);
        svg
          .append("path")
          // .data([data])
          .attr("class", a["class"])
          .attr("d", a["d"])
          .attr("x", x(minX) + (width / 25) * i)
          .attr("y", y(breakY))

          .attr("transform", a["transform"])
          .style("fill", "yellow")
          .attr("stroke", "yellow")
          .attr("stroke-width", "0.7");
      } catch (error) {
        console.error(error);
      }
    }
  }
  const focus = svg.append("g").attr("class", "focus").style("display", "none");

  focus
    .append("line")
    .attr("class", "x")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.5)
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke-width", "3");

  focus
    .append("line")
    .attr("class", "y")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.5)
    .attr("x1", width)
    .attr("x2", width)
    .attr("stroke-width", "3");
  focus.append("circle").attr("class", "y").style("fill", "none").attr("r", 4);
  focus
    .append("rect")
    .attr("class", "y1")
    .attr("dx", 8)
    .attr("dy", 40)
    .attr("height", 50)
    .attr("width", 70)
    .style("fill", "#333")
    .style("opacity", "1");
  focus
    .append("rect")
    .attr("class", "y3")
    .attr("dx", 8)
    .attr("dy", 40)
    .attr("height", 55)
    .attr("width", 75)
    .style("fill", "rgba(0,0,0,0)")
    .attr("stroke", "#fff")
    .attr("stroke-width", "3")
    .style("opacity", "0.7");
  focus.append("text").attr("class", "y1").attr("dx", 8).attr("dy", "-.3em");
  focus.append("text").attr("class", "y2").attr("dx", 8).attr("dy", "-.3em");
  focus.append("text").attr("class", "y3").attr("dx", 8).attr("dy", "1em");
  focus.append("text").attr("class", "y4").attr("dx", 8).attr("dy", "1em");

  function mouseMove(event, action = "mousemove") {
    const bisect = d3.bisector((d) => d["OBS_DATETIME"]).left;
    if (window.mobileAndTabletCheck()) {
      var width2 = document
        .getElementById(chartID)
        .firstChild.getAttribute("width");

      // width/860=x0/x1
      // x1 = x.invert(d3.pointer(event, this)[0] );
      var ratio = 960 / width2;
      var left = 50 / ratio;
      var right = 80 / ratio;
      x1 = (d3.pointer(event, this)[0] - (width2 / 0.85) * 0.15) * ratio;
      console.log(
        "      chhec2",
        // width,
        x1,
        d3.pointer(event, this)[0]
      );
      x0 = x.invert(x1);
    } else if (action == "click")
      x0 = x.invert(d3.pointer(event, this)[0] - 500);
    else x0 = x.invert(d3.pointer(event, this)[0] - 500);

    i = bisect(data, x0, 1);
    d0 = data[i - 1];
    d1 = data[i];
    d = x0 - d0.OBS_DATETIME > d1.OBS_DATETIME - x0 ? d1 : d0;
    var ddd = {};
    // Object.assign(ddd, dict);
    ddd["OBS_DATETIME"] = d.OBS_DATETIME;
    console.log(
      "   chhec0",
      d.OBS_DATETIME,
      d3.pointer(event, this)[0],

      this
    );
    focus
      .select("circle.y")
      .attr(
        "transform",
        "translate(" + x(d["OBS_DATETIME"]) + "," + y(d[varName]) + ")"
      );
    // console.log("mousemove",i,d["OBS_DATETIME"],x(d["OBS_DATETIME"]),y(d[varName]),x)
    var aa = d[varName].toFixed(1).toString();
    var bb = d["quantile"].toFixed(1).toString();
    var cc = d["thirdQuantile"].toFixed(1).toString();
    focus
      .select("text.y1")
      .attr(
        "transform",
        "translate(" + x(d["OBS_DATETIME"]) + "," + y(d[varName]) + ")"
      )
      //.text(aa+", q:"+bb+", 3q:"+cc);
      .text(aa);

    // .text(d[varName]);
    // focus
    //     .select("text.y2")
    //     .attr("transform", "translate(" + x(d["OBS_DATETIME"]) + "," + y(d[varName]) + ")")
    //     .text(d[varName]);
    focus
      .select("rect.y3")
      .attr(
        "transform",
        "translate(" +
          (x(d["OBS_DATETIME"]) - 3) +
          "," +
          (y(d[varName]) - 28) +
          ")"
      );

    for (var j = 0; j < colorLevel.length - 1; j++) {
      var red = colorLevel[j][1][0];
      var green = colorLevel[j][1][1];
      var blue = colorLevel[j][1][2];
      var opacityColor = colorLevel[j][1][3];
      var color = asColorStyle(red, green, blue, opacityColor);
      if (d[varName] >= colorLevel[j][0] && d[varName] < colorLevel[j + 1][0]) {
        focus
          .select("rect.y1")
          .attr(
            "transform",
            "translate(" +
              x(d["OBS_DATETIME"]) +
              "," +
              (y(d[varName]) - 25) +
              ")"
          )
          .style("fill", color);
      }
    }
    focus
      .select("text.y3")
      .attr(
        "transform",
        "translate(" + x(d["OBS_DATETIME"]) + "," + y(d[varName]) + ")"
      )
      .text(formatTime(d["OBS_DATETIME"]))
      .style("fill", "#fff");

    // focus
    //     .select("text.y4")
    //     .attr("transform", "translate(" + x(d["OBS_DATETIME"]) + "," + y(d[varName]) + ")")
    //     .text(formatTime(d["OBS_DATETIME"]));

    focus
      .select(".x")
      .attr(
        "transform",
        "translate(" + x(d["OBS_DATETIME"]) + "," + y(d[varName]) + ")"
      )
      .attr("y2", height - y(d[varName]));

    focus
      .select(".y")
      .attr("transform", "translate(" + width * -1 + "," + y(d[varName]) + ")")
      .attr("x2", width + width);
    return ddd;
    // var values=dayjs(d.OBS_DATETIME).valueOf()
    // var remainderMins = values % (60 * 60 * 1000);
    // var values2 = values - remainderMins;
    // if (action=="click")sliderAction(values2);
  }
  function mouseClick(event) {
    var d = mouseMove(event, "click");
    var values = dayjs(d.OBS_DATETIME).valueOf();
    console.log("   chhec ", event.currentTarget, this, d.OBS_DATETIME);
    var remainderMins = values % (60 * 60 * 1000);
    var values2 = values - remainderMins;
    sliderAction(values2);
    dateSlider.noUiSlider.set(values2);
  }
  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", () => {
      focus.style("display", null);
    })
    .on("mouseout", () => {
      focus.style("display", "none");
    })
    // .on("touchmove mousemove", mouseMove)
    // .on("touchmove mousemove", mouseMove)
    .on("touchmove mousemove", (event) => {
      mouseMove(event, "mousemove");
    })
    .on("click", mouseClick);
  // });
  console.log("ddddddddddddddddddd");
  map.eachLayer(function (layer) {
    layer.closePopup();
  });
  return svg;
}

var WindBarbArrowHandler = {
  WindArrow: function (speed, direction, container, arrowWidth, x, y) {
    "use strict";
    var index = 0,
      i;

    this.speed = speed;
    this.direction = direction;
    this.trigDirection = direction + 90;
    this.scale = arrowWidth / 8;

    this.ten = 0;
    this.five = 0;
    this.fifty = 0;

    // Create the canvas
    // $(container).append(
    //   $(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    //   .attr({
    //     height: 2 * arrowWidth,
    //     width: 2 * arrowWidth
    //   })
    // );
    // $("svg", container).append(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));
    // $("defs", container).append($(document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')).attr('id', 'clip'));
    // $("clipPath", container).append($(document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
    //   .attr({
    //     height: 2 * arrowWidth,
    //     width: 2 * arrowWidth
    //   }));

    // // Draw the widget area
    // $("svg", container).append($(document.createElementNS('http://www.w3.org/2000/svg', 'g')).attr('class', 'wind-arrow'));

    this.widget = $("svg", container);

    if (this.speed > 0) {
      // Prepare the path
      this.path = "";
      if (this.speed <= 7) {
        // Draw a single line
        this.longBar();
        index = 1;
      } else {
        this.shortBar();
      }

      // Find the number of lines in function of the speed
      this.five = Math.floor(this.speed / 5);
      if (this.speed % 5 >= 3) {
        this.five += 1;
      }

      // Add triangles (5 * 10)
      this.fifty = Math.floor(this.five / 10);
      this.five -= this.fifty * 10;
      // Add tenLines (5 * 2)
      this.ten = Math.floor(this.five / 2);
      this.five -= this.ten * 2;

      // Draw first the triangles
      for (i = 0; i < this.fifty; i++) {
        this.addFifty(index + 2 * i);
      }
      if (this.fifty > 0) {
        index += 2 * (this.fifty - 0.5);
      }

      // Draw the long segments
      for (i = 0; i < this.ten; i++) {
        this.addTen(index + i);
      }
      index += this.ten;

      // Draw the short segments
      for (i = 0; i < this.five; i++) {
        this.addFive(index + i);
      }

      this.path += "Z";

      // Add to the widget

      // this.widget.append(document.createElementNS('http://www.w3.org/2000/svg', 'g'));

      // $("g", this.widget).append($(document.createElementNS('http://www.w3.org/2000/svg', 'path')).attr(
      //   {
      //   'd': this.path,
      //   'vector-effect': 'non-scaling-stroke',
      //   'transform': 'translate(' + arrowWidth + ', ' + arrowWidth + ') scale(' + this.scale + ') rotate(' + this.trigDirection + ' ' + 0 + ' ' + 0 + ')  translate(-8, -2)',
      //   'class': 'wind-arrow',

      // }
      // ));
      return {
        d: this.path,
        "vector-effect": "non-scaling-stroke",
        transform:
          "translate(" +
          x +
          ", " +
          y +
          ") scale(" +
          this.scale +
          ") rotate(" +
          this.trigDirection +
          " " +
          0 +
          " " +
          0 +
          ")  translate(-8, -2)",
        class: "wind-arrow",
      };
    }
  },

  shortBar: function () {
    // Draw an horizontal short bar.
    "use strict";
    this.path += "M1 2 L8 2 ";
  },

  longBar: function () {
    // Draw an horizontal long bar.
    "use strict";
    this.path += "M0 2 L8 2 ";
  },
  addTen: function (index) {
    // Draw an oblique long segment corresponding to 10 kn.
    "use strict";
    this.path += "M" + index + " 0 L" + (index + 1) + " 2 ";
  },
  addFive: function (index) {
    // Draw an oblique short segment corresponding to 10 kn.
    "use strict";
    this.path += "M" + (index + 0.5) + " 1 L" + (index + 1) + " 2 ";
  },
  addFifty: function (index) {
    // Draw a triangle corresponding to 50 kn.
    "use strict";
    this.path +=
      "M" +
      index +
      " 0 L" +
      (index + 1) +
      " 2 L" +
      index +
      " 2 L" +
      index +
      " 0 ";
  },
};

//     var handlesSlider = document.getElementById('timeSlider');

// noUiSlider.create(handlesSlider, {
//     start: [4000, 8000],
//     range: {
//         'min': [2000],
//         'max': [10000]
//     }
// });
// document.getElementById("showChartBtn").addEventListener("click", );
