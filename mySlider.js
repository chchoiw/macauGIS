var dateSlider = document.getElementById("timeSlider");
var hourLoopMillSeconds = 2 * 1000;
function timestamp(str) {
  return new Date(str).getTime();
}

// noUiSlider.create(dateSlider, {
//     // Create two timestamps to define a range.
//     range: {
//         min: 0,
//         max: 7,
//     },

//     // Steps of one week
//     step: 1,

//     // Two more timestamps indicate the handle starting positions.
//     start: [7],

//     // No decimals
//     // format: wNumb({
//     //     decimals: 0
//     // })
// });
// var now = dayjs().minute(0);
var nowstr = speeddata.header.refTime;
// var nowTidayjs().minute(59)

var now = dayjs(nowstr).subtract(8, "hour");
console.log(" now", nowstr, now);
var labelToTime = {};
var remainderMins = now.valueOf() % (60 * 60 * 1000);
var endTimeStamp = now.valueOf() - remainderMins;
for (var i = 0; i < 24; i++) {
  var timestamp = endTimeStamp - i * 60 * 60 * 1000;
  var labelFormat = "HH";
  var label = dayjs(timestamp).format(labelFormat) + " H";
  labelToTime[label] = timestamp;
}

var remainderMins = now.valueOf() % (60 * 60 * 1000);
var endTimeStamp = now.valueOf() - remainderMins;
// var endTimeStamp = now.valueOf() ;
var startTimeStamp = endTimeStamp - 24 * (60 * 60 * 1000);
var timeFormat = "YYYY-MM-DD HH:mm:ss";
// console.log("now34444444", now1minuteAgo.format(timeFormat))
var dateSlider = document.getElementById("timeSlider");

noUiSlider.create(dateSlider, {
  start: [endTimeStamp],
  // connect: true,
  range: {
    min: startTimeStamp,
    max: endTimeStamp,
  },
  step: 60 * 60 * 1000,
  connect: [true, false],
  behaviour: "drag-smooth-steps-tap",
  tooltips: [true],
  pips: {
    mode: "count",
    values: 9,
    format: {
      // 'to' the formatted value. Receives a number.
      to: function (value) {
        var remainderMins = value % (60 * 60 * 1000);
        var value2 = value - remainderMins;
        var b = dayjs(value2).format("HH");
        if (b == "0") {
          var a = b + " H<br>" + dayjs(value).format("DD");
        } else var a = b + " H";
        return a;
      },
      // 'from' the formatted value.
      // Receives a string, should return a number.
      from: function (value) {
        return Number(value);
      },
      // density:7
    },
  },
  format: {
    // 'to' the formatted value. Receives a number.
    to: function (value) {
      var b = dayjs(value).format("HH");
      if (b == "00") {
        var a = b + " H<br>" + dayjs(value).format("DD");
      } else var a = b + " H";
      return a;
    },
    // 'from' the formatted value.
    // Receives a string, should return a number.
    from: function (value) {
      return Number(value);
    },
  },
});
function showChartTooltips(
  extractValue,
  varName,
  colorLevel,
  timeMillSeconds = 1000
) {
  //##########################
  // show moveover tooltip when run
  //##########################
  var eachStepMillSeconds = hourLoopMillSeconds / 60;
  // var stationcode="TG";
  if (window.mobileAndTabletCheck()) var chartID = "my_dataviz2";
  else var chartID = "my_dataviz";
  var stationcode = document.getElementById(chartID).getAttribute("statName");
  var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
  const margin = { top: 40, right: 80, bottom: 60, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  if (varName != "wl")
    var filename = "awsData/stationTimeSeries/" + stationcode + ".json";
  else filename = "wlData/stationTimeSeries/" + stationcode + ".json";

  if (varName != "wl")
    var quantilefilename =
      "awsData/stationTimeSeries/quantile_" + varName + ".json";
  else quantilefilename = "wlData/stationTimeSeries/" + stationcode + ".json";
  // const parseDate = d3.timeParse("%m/%d/%Y"),

  (formatDate = d3.timeFormat("%Y-%m-%d")),
    (formatMonth = d3.timeFormat("%b")),
    (formatTime = d3.timeFormat("%dd%H:%M"));
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

  const svg = d3.select("#" + chartID);

  const focus = svg.selectAll(".focus").style("display", null);
  console.log("focus", focus);
  // focus;

  const bisect = d3.bisector((d) => d["OBS_DATETIME"]).left;
  var timeString = dayjs(extractValue).format("YYYY-MM-DD HH:mm:ss");
  console.log("extractValue", extractValue);
  // x0 = x.invert(parseDate(timeString));
  x0 = parseDate(timeString);

  bisectIndex = bisect(data, x0, 1);
  d0 = data[bisectIndex - 1];
  d1 = data[bisectIndex];

  // d =
  if (x0 - d0.OBS_DATETIME > d1.OBS_DATETIME - x0) {
    d = d1;
  } else {
    d = d0;
    bisectIndex = bisectIndex - 1;
  }

  var maxY = d3.max(data, (d) => {
    return d["max"];
    // return d3.max(d[varName].filter(function(value) {
    //     return typeof value === "number";
    // }));
  });
  // var maxY=d3.max(data, (d) => (d3.max(d[varName], (d) => (d[varName]))))
  const x = d3.scaleTime().range([0, width]);

  var minY = d3.min(data, (d) => {
    return d["min"];
  });

  var minDate = formatDate(
    d3.min(data, (d) => {
      return d["OBS_DATETIME"];
    })
  );
  var minX = d3.min(data, (d) => {
    return d["OBS_DATETIME"];
  });
  var step = 1;
  var breakY = 2;
  if (varName == "WSPD_10") {
    step = 1;
    breakY = 2;
  } else if (varName == "TEMP") {
    step = 0.5;
    breakY = 2;
  } else if (varName == "HUMI") {
    step = 5;
  } else if (varName == "wl") {
    (step = 0.1), (breakY = 0);
  }

  if (breakY > (maxY - breakY) / 5 || minY < breakY) breakAxisY = false;
  else breakAxisY = true;
  var y;
  if (breakAxisY) {
    y = d3
      .scaleLinear()
      .range([
        height,
        (height * 4) / 5 + 20,
        (height * 4) / 5 - 20,
        margin.bottom,
      ]);
  } else {
    y = d3.scaleLinear().range([height, margin.bottom]);
  }
  x.domain(
    d3.extent(data, (d) => {
      return d["OBS_DATETIME"];
    })
  );

  if (breakAxisY) {
    y.domain([0, breakY, minY, maxY]);

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
  var loopX = x(d["OBS_DATETIME"]);
  var loopY = y(d[varName]);
  // var xgap(d1.OBS_DATETIME-d0.OBS_DATETIME);

  var loopIndex = bisectIndex;
  // var numLoop=0;
  var numLoop = 0;

  // var loopTooltip=setInterval(() => {

  var d = data[loopIndex];
  focus
    .select("circle.y")
    .attr(
      "transform",
      "translate(" + x(d["OBS_DATETIME"]) + "," + y(d[varName]) + ")"
    );
  console.log("event check", x0, i, d, x(d["OBS_DATETIME"]));
  var aa = d[varName].toFixed(1).toString();
  var bb = d["quantile"].toFixed(1).toString();
  var cc = d["thirdQuantile"].toFixed(1).toString();
  focus
    .select("text.y1")
    .attr(
      "transform",
      "translate(" + x(d["OBS_DATETIME"]) + "," + y(d[varName]) + ")"
    )
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
          "translate(" + x(d["OBS_DATETIME"]) + "," + (y(d[varName]) - 25) + ")"
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

  numLoop = numLoop + 1;
  loopIndex = loopIndex + 1;
  if (numLoop > 60) {
    clearInterval(loopTooltip);
    numLoop = 0;
  }
  // }, eachStepMillSeconds);

  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");
}

function removeElementsByClass(className) {
  const elements = document.getElementsByClassName(className);
  // while (elements.length > 0) {
  //     // elements[0].parentNode.removeChild(elements[0]);
  // }
}
// function reDraw(filename)
// {
//     // var filename = "awsData/contour/temp.json"
//     var dataAtTime = function () {
//         var tmp = null;
//         // $.getJSON("macau.topojson", function(data) {
//         $.ajax({
//             'async': false,
//             'type': "GET",
//             'global': false,
//             // 'dataType': 'html',
//             'url': filename,
//             'data': {},

//             'success': function (data) {
//                 // console.log("macau",data);
//                 tmp = data;
//                 // tmp = JSON.parse(data);

//             },
//             error: function (xhr, ajaxOptions, thrownError) {
//                 console.log(xhr.status);
//                 console.log(thrownError);
//             }

//         });

//         return tmp;
//     }();
//     // console.log(dataAtTime);
//     return dataAtTime
// }
// removeElementsByClass("contour-overlay");
//     var velocityLayer = L.contourLayer({
//         displayValues: true,
//         displayOptions: {
//             velocityType: "TEMP",
//             position: "bottomleft",
//             emptyString: "",
//             particleMultiplier: 1 / 200,
//             speedUnit: "k/h",
//             dataKey: "TEMP",
//             topoJsonPath: "macau.topojson",
//             stationGeoPath: "station.json",
//         },
//         data: dataAtTime,
//         dataKey: "TEMP",
//         colorScale: speedColorScale,
//         //   maxVelocity: 15
//     });
//     velocityLayer.addTo(map);
// }
elem2filename = {
  WSPD_10: "speed",
  HUMI: "humi",
  TEMP: "temp",
  wl: "wl",
};
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function changeStation(path, colorLevel, dataKey) {
  var stationData = getJsonFun(path + "?id=" + getRandomInt(100000), 0);
  console.log(
    "--------- start stationData",
    path + "?id=" + getRandomInt(100000),
    stationData
  );
  var htmlstrAry = [];
  var windBarbGroup = [];

  for (var i = 0; i < stationData.length; i++) {
    var classStr = "toopltipClass";
    var loopVar = stationData[i];
    var long = loopVar["geometry"]["coordinates"][0];
    var lat = loopVar["geometry"]["coordinates"][1];
    var speedcolor;
    if (dataKey == "WSPD_10")
      var zScale = (loopVar.properties.WSPD_10 * 3.6).toFixed(1);
    else if (dataKey == "HUMI") var zScale = loopVar.properties[dataKey];
    else var zScale = loopVar.properties[dataKey].toFixed(1);

    if (zScale == -999) {
      classStr = "NaNClass";
      zScale = "NaN";
    } else classStr = "toopltipClass";

    var name = loopVar["properties"]["name"];
    var speedcolor = getColorFromColorLevel(zScale, colorLevel);
    // console.log("speedcolor",speedcolor,zScale,zScale>= colorLevel[j][0]&& zScale< colorLevel[j+1][0])
    var idstr = name + "_" + dataKey;
    var nameMarker = document.getElementById(idstr + "_spanName");
    var valueMarker = document.getElementById(idstr + "_spanValue");
    if (typeof nameMarker != "undefined" && nameMarker != null) {
      valueMarker.innerHTML = zScale;
      valueMarker.style.backgroundColor = speedcolor;
    }
  }
}
function sliderAction(values, showTooltips = false) {
  console.log("test", values[0], values);
  if (Array.isArray(values)) extractValue = values[0];
  else extractValue = values;

  var timestamp = labelToTime[extractValue];
  if (typeof extractValue == "string") extractValue = timestamp;
  // else extractValue=values;
  var fileTimeFormat = "YYYYMMDDHH";
  console.log(
    values,
    extractValue,
    labelToTime,
    timestamp,
    dayjs(Number(timestamp)).format(fileTimeFormat)
  );
  var fileTime = dayjs(Number(extractValue)).format(fileTimeFormat);
  var fileAry = [];
  var varName = document.getElementById("datetime").getAttribute("varName");

  if (varName != "wl")
    var filename =
      "awsData/contour/" + elem2filename[varName] + "_" + fileTime + ".json";
  else
    var filename =
      "wlData/contour/" + elem2filename[varName] + "_" + fileTime + ".json";
  // var filename= "awsData/contour/temp.json"
  //##########################
  // HUMI TEMP contour change
  //##########################
  console.log("filename", filename);
  var dataRedraw = getJsonFun(filename, "");
  console.log("rewdraw", dataRedraw);

  var bounds = map.getBounds();

  var size = map.getSize(); // bounds, width, height, extent
  var layerChange = layerDict[varName];
  if (varName != "wl")
    var filenameStation = "awsData/stationPoint/station_" + fileTime + ".json";
  else
    var filenameStation =
      "awsData/stationPoint/stationWL_" + fileTime + ".json";
  if (map.hasLayer(layerChange)) {
    console.log("check layerchange", layerChange, layerDict);
    layerChange._windy.setData(dataRedraw);
    // var layerChangeOptions=layerChange.options;

    layerChange.options.stationGeoPath = filenameStation;
    console.log(layerChange);

    layerChange._windy.start(
      [
        [0, 0],
        [size.x, size.y],
      ],
      size.x,
      size.y,
      [
        [bounds._southWest.lng, bounds._southWest.lat],
        [bounds._northEast.lng, bounds._northEast.lat],
      ]
    );
  }

  //##########################
  // total station change
  //##########################
  if (map.hasLayer(layerDict["station"])) {
    var filename = "awsData/stationPoint/station_" + fileTime + ".json";

    layerControl.removeLayer(layerDict["station"]);
    map.removeLayer(layerDict["station"]);
    layerDict["station"] = addTotalSation(filename, 0, fileTime);

    layerControl.addOverlay(layerDict["station"], "Station");

    layerDict["station"].addTo(map);
  }
  //##########################
  // WDIR contour change
  //##########################
  var colorLevel = colorDict[varName];
  if (map.hasLayer(layerDict["WDIR_10"])) {
    var fileWdir = "awsData/contour/wdir_" + fileTime + ".json";
    var layerWdirChange = layerDict["WDIR_10"];
    console.log("layerWdirRedraw", layerWdirChange);
    var dataWdirRedraw = getJsonFun(fileWdir, "");
    layerWdirChange._windy.setData(dataWdirRedraw);
    layerWdirChange._windy.start(
      [
        [0, 0],
        [size.x, size.y],
      ],
      size.x,
      size.y,
      [
        [bounds._southWest.lng, bounds._southWest.lat],
        [bounds._northEast.lng, bounds._northEast.lat],
      ]
    );

    //##########################
    // windbarb change
    //##########################

    var filename = "./awsData/stationPoint/windbarb_" + fileTime + ".json";
    // layerWdirChange.options.displayOptions.stationGeoPath = filename;

    // var colorLevel = colorDict[varName];

    var meteoPoints = getJsonFun(filename, 0);
    var windBarbGroup = [];
    meteoPoints.forEach(function (p) {
      console.log("test");
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
      var marker = L.marker([p[1], p[0]], { icon: icon });
      //  .bindPopup("<p>Wind Speed: "+p[2]+"</p>"+"<p>Wind Direction: "+p[3]+"</p>");
      windBarbGroup.push(marker);
    });
    console.log("wind", windBarbGroup);
    //  return L.layerGroup(windBarbGroup);
    map.removeLayer(layerWdirChange._windBarbLayer);
    layerWdirChange._windBarbLayer = L.layerGroup(windBarbGroup);
    // layerWdirChange._windBarbLayer
    layerWdirChange._windBarbLayer.addTo(map);
    changeStation(filenameStation, colorLevel, varName);
  }
  
  if (showTooltips)
    showChartTooltips(
      extractValue,
      varName,
      colorLevel,
      (timeMillSeconds = 1000)
    );

  // removeElementsByClass("contour-overlay");
  //     var option=speedLayer.options=tempLayerOption;
  //     option.data=dataRedraw;
  // var velocityLayer = L.contourLayer(option);
  // velocityLayer.addTo(map);

  // setTimeout(() => {

  //     var b=document.getElementsByClassName("contour-overlay")[1];
  //     console.log(b);
  //     b.style.display='none';
  // }, 50);
  // setTimeout(() => {

  //     var a=document.getElementsByClassName("contour-overlay")[0];
  //     var b=document.getElementsByClassName("contour-overlay")[1];
  //     console.log(a);

  //     a.parentNode.removeChild(a);
  //     b.style.display='inline-block';
  // }, 2000);
}
if (window.mobileAndTabletCheck()) var chartID = "my_dataviz2";
else var chartID = "my_dataviz";
dateSlider.noUiSlider.on(
  "change",
  function (values, handle, unencoded, tap, positions, noUiSlider) {
    clearInterval(playTimeSeries);
    if (window.mobileAndTabletCheck()) var chartID = "my_dataviz2";
    else var chartID = "my_dataviz";
    var timeSeriesElem = document.getElementById(chartID);
    if (timeSeriesElem != null && timeSeriesElem.innerHTML != "")
      sliderAction(values, (showTooltips = true));
    else sliderAction(values, (showTooltips = false));
    console.log("values", values);
    loopVar = labelToTime[values];
  }
);

var playBtn = document.getElementById("play");
var stopBtn = document.getElementById("stop");
var sliderOptions = dateSlider.noUiSlider.options;
var rangeMin = sliderOptions.range.min;
var rangeMax = sliderOptions.range.max;
var loopVar = rangeMin;
var playTimeSeries;
playBtn.addEventListener("click", function (ev) {
  if (loopVar >= rangeMax) loopVar = rangeMin;
  playTimeSeries = setInterval(function () {
    if (loopVar > rangeMax) {
      clearInterval(playTimeSeries);
      // alert('clean');
    }

    if (window.mobileAndTabletCheck()) var chartID = "my_dataviz2";
    else var chartID = "my_dataviz";
    var timeSeriesElem = document.getElementById(chartID);
    // console.log("llllllllll", timeSeriesElem.innerHTML);
    if (timeSeriesElem!=null && timeSeriesElem.innerHTML != "")
      sliderAction(loopVar, (showTooltips = true));
    else sliderAction(loopVar, (showTooltips = false));
    dateSlider.noUiSlider.set(loopVar);
    // sliderAction(loopVar,showTooltips=true);
    // var filename = "awsData/contour/temp.json";
    // reDraw(filename);
    loopVar += 60 * 60 * 1000;
  }, hourLoopMillSeconds);
});
stopBtn.addEventListener("click", function (ev) {
  clearInterval(playTimeSeries);
});
