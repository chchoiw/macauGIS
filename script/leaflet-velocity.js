"use strict";

/*
 Generic  Canvas Layer for leaflet 0.7 and 1.0-rc,
 copyright Stanislav Sumbera,  2016 , sumbera.com , license MIT
 originally created and motivated by L.CanvasOverlay  available here: https://gist.github.com/Sumbera/11114288

 */
// -- L.DomUtil.setTransform from leaflet 1.0.0 to work on 0.0.7
//------------------------------------------------------------------------------
if (!L.DomUtil.setTransform) {
  L.DomUtil.setTransform = function (el, offset, scale) {
    var pos = offset || new L.Point(0, 0);
    el.style[L.DomUtil.TRANSFORM] = (L.Browser.ie3d ? "translate(" + pos.x + "px," + pos.y + "px)" : "translate3d(" + pos.x + "px," + pos.y + "px,0)") + (scale ? " scale(" + scale + ")" : "");
  };
} // -- support for both  0.0.7 and 1.0.0 rc2 leaflet


L.CanvasLayer = (L.Layer ? L.Layer : L.Class).extend({
  // -- initialized is called on prototype
  initialize: function initialize(options) {
    this._map = null;
    this._canvas = null;
    this._frame = null;
    this._delegate = null;
    L.setOptions(this, options);
  },
  delegate: function delegate(del) {
    this._delegate = del;
    return this;
  },
  needRedraw: function needRedraw() {
    if (!this._frame) {
      this._frame = L.Util.requestAnimFrame(this.drawLayer, this);
    }

    return this;
  },
  //-------------------------------------------------------------
  _onLayerDidResize: function _onLayerDidResize(resizeEvent) {
    this._canvas.width = resizeEvent.newSize.x;
    this._canvas.height = resizeEvent.newSize.y;
  },
  //-------------------------------------------------------------
  _onLayerDidMove: function _onLayerDidMove() {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);

    L.DomUtil.setPosition(this._canvas, topLeft);
    this.drawLayer();
  },
  //-------------------------------------------------------------
  getEvents: function getEvents() {
    var events = {
      resize: this._onLayerDidResize,
      moveend: this._onLayerDidMove
    };

    if (this._map.options.zoomAnimation && L.Browser.any3d) {
      events.zoomanim = this._animateZoom;
    }

    return events;
  },
  //-------------------------------------------------------------
  onAdd: function onAdd(map) {
    this._map = map;
    this._canvas = L.DomUtil.create("canvas", "leaflet-layer");
    this.tiles = {};

    var size = this._map.getSize();

    this._canvas.width = size.x;
    this._canvas.height = size.y;
    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(this._canvas, "leaflet-zoom-" + (animated ? "animated" : "hide"));
    this.options.pane.appendChild(this._canvas);
    map.on(this.getEvents(), this);
    var del = this._delegate || this;
    del.onLayerDidMount && del.onLayerDidMount(); // -- callback

    this.needRedraw();
    var self = this;
    setTimeout(function () {
      self._onLayerDidMove();
    }, 0);
  },
  //-------------------------------------------------------------
  onRemove: function onRemove(map) {
    var del = this._delegate || this;
    del.onLayerWillUnmount && del.onLayerWillUnmount(); // -- callback

    this.options.pane.removeChild(this._canvas);
    map.off(this.getEvents(), this);
    this._canvas = null;
  },
  //------------------------------------------------------------
  addTo: function addTo(map) {
    map.addLayer(this);
    return this;
  },
  //------------------------------------------------------------------------------
  drawLayer: function drawLayer() {
    // -- todo make the viewInfo properties  flat objects.
    var size = this._map.getSize();

    var bounds = this._map.getBounds();

    var zoom = this._map.getZoom();

    var center = this._map.options.crs.project(this._map.getCenter());

    var corner = this._map.options.crs.project(this._map.containerPointToLatLng(this._map.getSize()));

    var del = this._delegate || this;
    del.onDrawLayer && del.onDrawLayer({
      layer: this,
      canvas: this._canvas,
      bounds: bounds,
      size: size,
      zoom: zoom,
      center: center,
      corner: corner
    });
    this._frame = null;
  },
  // -- L.DomUtil.setTransform from leaflet 1.0.0 to work on 0.0.7
  //------------------------------------------------------------------------------
  _setTransform: function _setTransform(el, offset, scale) {
    var pos = offset || new L.Point(0, 0);
    el.style[L.DomUtil.TRANSFORM] = (L.Browser.ie3d ? "translate(" + pos.x + "px," + pos.y + "px)" : "translate3d(" + pos.x + "px," + pos.y + "px,0)") + (scale ? " scale(" + scale + ")" : "");
  },
  //------------------------------------------------------------------------------
  _animateZoom: function _animateZoom(e) {
    var scale = this._map.getZoomScale(e.zoom); // -- different calc of offset in leaflet 1.0.0 and 0.0.7 thanks for 1.0.0-rc2 calc @jduggan1


    var offset = L.Layer ? this._map._latLngToNewLayerPoint(this._map.getBounds().getNorthWest(), e.zoom, e.center) : this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());
    L.DomUtil.setTransform(this._canvas, offset, scale);
  }
});

L.canvasLayer = function (pane) {
  return new L.CanvasLayer(pane);
};

L.Control.Velocity = L.Control.extend({
  options: {
    position: "bottomleft",
    emptyString: "Unavailable",
    // Could be any combination of 'bearing' (angle toward which the flow goes) or 'meteo' (angle from which the flow comes)
    // and 'CW' (angle value increases clock-wise) or 'CCW' (angle value increases counter clock-wise)
    angleConvention: "bearingCCW",
    showCardinal: false,
    // Could be 'm/s' for meter per second, 'k/h' for kilometer per hour, 'mph' for miles per hour or 'kt' for knots
    speedUnit: "m/s",
    directionString: "Direction",
    speedString: "Speed",
    onAdd: null,
    onRemove: null,
    canvasContour:null
  },
  onAdd: function onAdd(map) {
    this._container = L.DomUtil.create("div", "leaflet-control-velocity");
    L.DomEvent.disableClickPropagation(this._container);
    map.on("mousemove", this._onMouseMove, this);
    this._container.innerHTML = this.options.emptyString;
    if (this.options.leafletVelocity.options.onAdd) this.options.leafletVelocity.options.onAdd();
    return this._container;
  },
  onRemove: function onRemove(map) {
    map.off("mousemove", this._onMouseMove, this);
    if (this.options.leafletVelocity.options.onRemove) this.options.leafletVelocity.options.onRemove();
  },
  vectorToSpeed: function vectorToSpeed(uMs, vMs, unit) {
    var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2)); // Default is m/s

    if (unit === "k/h") {
      return this.meterSec2kilometerHour(velocityAbs);
    } else if (unit === "kt") {
      return this.meterSec2Knots(velocityAbs);
    } else if (unit === "mph") {
      return this.meterSec2milesHour(velocityAbs);
    } else {
      return velocityAbs;
    }
  },
  vectorToDegrees: function vectorToDegrees(uMs, vMs, angleConvention) {
    // Default angle convention is CW
    if (angleConvention.endsWith("CCW")) {
      // vMs comes out upside-down..
      vMs = vMs > 0 ? vMs = -vMs : Math.abs(vMs);
    }

    var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));
    var velocityDir = Math.atan2(uMs / velocityAbs, vMs / velocityAbs);
    var velocityDirToDegrees = velocityDir * 180 / Math.PI + 180;

    if (angleConvention === "bearingCW" || angleConvention === "meteoCCW") {
      velocityDirToDegrees += 180;
      if (velocityDirToDegrees >= 360) velocityDirToDegrees -= 360;
    }

    return velocityDirToDegrees;
  },
  degreesToCardinalDirection: function degreesToCardinalDirection(deg) {
    var cardinalDirection = '';

    if (deg >= 0 && deg < 11.25 || deg >= 348.75) {
      cardinalDirection = 'N';
    } else if (deg >= 11.25 && deg < 33.75) {
      cardinalDirection = 'NNW';
    } else if (deg >= 33.75 && deg < 56.25) {
      cardinalDirection = 'NW';
    } else if (deg >= 56.25 && deg < 78.75) {
      cardinalDirection = 'WNW';
    } else if (deg >= 78.25 && deg < 101.25) {
      cardinalDirection = 'W';
    } else if (deg >= 101.25 && deg < 123.75) {
      cardinalDirection = 'WSW';
    } else if (deg >= 123.75 && deg < 146.25) {
      cardinalDirection = 'SW';
    } else if (deg >= 146.25 && deg < 168.75) {
      cardinalDirection = 'SSW';
    } else if (deg >= 168.75 && deg < 191.25) {
      cardinalDirection = 'S';
    } else if (deg >= 191.25 && deg < 213.75) {
      cardinalDirection = 'SSE';
    } else if (deg >= 213.75 && deg < 236.25) {
      cardinalDirection = 'SE';
    } else if (deg >= 236.25 && deg < 258.75) {
      cardinalDirection = 'ESE';
    } else if (deg >= 258.75 && deg < 281.25) {
      cardinalDirection = 'E';
    } else if (deg >= 281.25 && deg < 303.75) {
      cardinalDirection = 'ENE';
    } else if (deg >= 303.75 && deg < 326.25) {
      cardinalDirection = 'NE';
    } else if (deg >= 326.25 && deg < 348.75) {
      cardinalDirection = 'NNE';
    }

    return cardinalDirection;
  },
  meterSec2Knots: function meterSec2Knots(meters) {
    return meters / 0.514;
  },
  meterSec2kilometerHour: function meterSec2kilometerHour(meters) {
    return meters * 3.6;
  },
  meterSec2milesHour: function meterSec2milesHour(meters) {
    return meters * 2.23694;
  },
  _onMouseMove: function _onMouseMove(e) {
    var self = this;

    var pos = this.options.leafletVelocity._map.containerPointToLatLng(L.point(e.containerPoint.x, e.containerPoint.y));

    var gridValue = this.options.leafletVelocity._windy.interpolatePoint(pos.lng, pos.lat);

    var htmlOut = "";

    if (gridValue && !isNaN(gridValue[0]) && !isNaN(gridValue[1]) && gridValue[2]) {
      var deg = self.vectorToDegrees(gridValue[0], gridValue[1], this.options.angleConvention);
      var cardinal = this.options.showCardinal ? " (".concat(self.degreesToCardinalDirection(deg), ") ") : '';
      htmlOut = "<strong> ".concat(this.options.velocityType, " ").concat(this.options.directionString, ": </strong> ").concat(deg.toFixed(2), "\xB0").concat(cardinal, ", <strong> ").concat(this.options.velocityType, " ").concat(this.options.speedString, ": </strong> ").concat(self.vectorToSpeed(gridValue[0], gridValue[1], this.options.speedUnit).toFixed(2), " ").concat(this.options.speedUnit);
    } else {
      htmlOut = this.options.emptyString;
    }

    self._container.innerHTML = htmlOut;
  }
});
L.Map.mergeOptions({
  positionControl: false
});
L.Map.addInitHook(function () {
  if (this.options.positionControl) {
    this.positionControl = new L.Control.MousePosition();
    this.addControl(this.positionControl);
  }
});

L.control.velocity = function (options) {
  return new L.Control.Velocity(options);
};

L.VelocityLayer = (L.Layer ? L.Layer : L.Class).extend({
  options: {
    displayValues: true,
    displayOptions: {
      velocityType: "Velocity",
      position: "bottomleft",
      emptyString: "No velocity data"
    },
    maxVelocity: 10,
    // used to align color scale
    colorScale: null,
    data: null
  },
  _map: null,
  _canvasLayer: null,
  _canvasCoutourLayer:null,
  _windy: null,
  _context: null,
  _timer: 0,
  _mouseControl: null,
  initialize: function initialize(options) {
    L.setOptions(this, options);
  },
  addWindBarb:function addWindBarb()
  {
    console.log("]]]]]]]]]]]]]]check goe",this.options.displayOptions.stationGeoPath)
    var filename=this.options.displayOptions.stationGeoPath;
    var meteoPoints = getJsonFun(filename,0);
    var windBarbGroup=[];
    console.log("----meteoPoints",meteoPoints)       
    meteoPoints.forEach(function(p){
     console.log("test")
       var icon = L.WindBarb.icon({
         deg: p[3], 
         speed: p[2],
        pointRadius: 3,
       fillColor:"blue",
       circleBorderColor:"rgba(255,255,0,1)",
       strokeWidth:3,
       strokeLength:20,
       pathColor:"rgba(255,255,0,1)",
       // barbHeight :20,
     });
       var marker = L.marker([p[1],p[0]], {icon: icon
       
       })
      //  .bindPopup("<p>Wind Speed: "+p[2]+"</p>"+"<p>Wind Direction: "+p[3]+"</p>");      
       windBarbGroup.push(marker);      
   });
   console.log("wind",windBarbGroup) 
   return L.layerGroup(windBarbGroup);
  },
  onAdd: function onAdd(map) {
    // determine where to add the layer
    this._paneName = this.options.paneName || "overlayPane"; // fall back to overlayPane for leaflet < 1

    var pane = map._panes.overlayPane;

    if (map.getPane) {
      // attempt to get pane first to preserve parent (createPane voids this)
      pane = map.getPane(this._paneName);

      if (!pane) {
        pane = map.createPane(this._paneName);
      }
    } // create canvas, add to map pane
    if (this._windBarbLayer )map.removeLayer(this._windBarbLayer);
    
    this._windBarbLayer= this.addWindBarb();

    this._windBarbLayer = L.canvasLayer({
      pane: pane
    }).delegate(this);
    this._windBarbLayer.addTo(map);


        
    this._canvasLayer = L.canvasLayer({
      pane: pane
    }).delegate(this);
    this._canvasLayer.addTo(map);
    
    this._canvasContourLayer = L.canvasLayer({
      pane: pane
    }).delegate(this);

    this._canvasContourLayer.addTo(map);
    this._map = map;
  },
  onRemove: function onRemove(map) {
    this._destroyWind();
  },
  setData: function setData(data) {
    this.optiFons.data = data;

    if (this._windy) {
      this._windy.setData(data);

      this._clearAndRestart();
    }

    this.fire("load");
  },
  setOpacity: function setOpacity(opacity) {
    this._canvasLayer.setOpacity(opacity);
  },
  setOptions: function setOptions(options) {
    this.options = Object.assign(this.options, options);

    if (options.hasOwnProperty("displayOptions")) {
      this.options.displayOptions = Object.assign(this.options.displayOptions, options.displayOptions);

      this._initMouseHandler(true);
    }

    if (options.hasOwnProperty("data")) this.options.data = options.data;

    if (this._windy) {
      this._windy.setOptions(options);

      if (options.hasOwnProperty("data")) this._windy.setData(options.data);

      this._clearAndRestart();
    }

    this.fire("load");
  },

  /*------------------------------------ PRIVATE ------------------------------------------*/
  onDrawLayer: function onDrawLayer(overlay, params) {
    var self = this;

    if (!this._windy) {
      this._initWindy(this);

      return;
    }

    if (!this.options.data) {
      return;
    }

    if (this._timer) clearTimeout(self._timer);
    this._timer = setTimeout(function () {
      self._startWindy();
    }, 750); // showing velocity is delayed
  },
  _startWindy: function _startWindy() {
    var bounds = this._map.getBounds();

    var size = this._map.getSize(); // bounds, width, height, extent


    this._windy.start([[0, 0], [size.x, size.y]], size.x, size.y, [[bounds._southWest.lng, bounds._southWest.lat], [bounds._northEast.lng, bounds._northEast.lat]]);
    console.log("check clean and restart windbarblayer")
    if (this._windBarbLayer )map.removeLayer(this._windBarbLayer);
    this._windBarbLayer= this.addWindBarb();

    // this._windBarbLayer = L.canvasLayer({
    //   pane: pane
    // }).delegate(this);
    this._windBarbLayer.addTo(map);
    // this._windBarbLayer=this.addWindBarb();
    // 
  },
  _initWindy: function _initWindy(self) {
    // windy object, copy options
    var options = Object.assign({
      canvas: self._canvasLayer._canvas,
      // canvasContour:self._canvasContourLayer._canvas,
      map: this._map
    }, self.options);
    this._windy = new Windy(options); // prepare context global var, start drawing

    this._context = this._canvasLayer._canvas.getContext("2d");
    // this._contextContour = this._canvasContourLayer._canvas.getContext("2d");

    console.log("init",this._contextContour)
    this._canvasLayer._canvas.classList.add("velocity-overlay");
    // this._canvasContourLayer._canvas.classList.add("velocity-overlay");
    this.onDrawLayer();

    this._map.on("dragstart", self._windy.stop);

    this._map.on("dragend", self._clearAndRestart);

    this._map.on("zoomstart", self._windy.stop);

    this._map.on("zoomend", self._clearAndRestart);

    this._map.on("resize", self._clearWind);

    this._initMouseHandler(false);
  },
  _initMouseHandler: function _initMouseHandler(voidPrevious) {
    if (voidPrevious) {
      this._map.removeControl(this._mouseControl);

      this._mouseControl = false;
    }

    if (!this._mouseControl && this.options.displayValues) {
      var options = this.options.displayOptions || {};
      options["leafletVelocity"] = this;
      this._mouseControl = L.control.velocity(options).addTo(this._map);
    }
  },
  _clearAndRestart: function _clearAndRestart() {
    if (this._context) this._context.clearRect(0, 0, 3000, 3000);
    if (this._contextContour) 
    {
      this._contextContour.clearRect(0, 0, 3000, 3000);
    }
    if (this._windy) this._startWindy();

  },
  _clearWind: function _clearWind() {
    if (this._windy) this._windy.stop();
    if (this._context) this._context.clearRect(0, 0, 3000, 3000);
    if (this._contextContour) this._contextContour.clearRect(0, 0, 3000, 3000);
  },
  _destroyWind: function _destroyWind() {
    if (this._timer) clearTimeout(this._timer);
    if (this._windy) this._windy.stop();
    if (this._context) this._context.clearRect(0, 0, 3000, 3000);
    if (this._contextContour) this._contextContour.clearRect(0, 0, 3000, 3000);
    if (this._mouseControl) this._map.removeControl(this._mouseControl);
    this._mouseControl = null;
    this._windy = null;

    this._map.removeLayer(this._canvasLayer);
    this._map.removeLayer(this._canvasContourLayer);
    this._map.removeLayer(this._windBarbLayer);
  }
});

L.velocityLayer = function (options) {
  return new L.VelocityLayer(options);
};
/*  Global class for simulating the movement of particle through a 1km wind grid

 credit: All the credit for this work goes to: https://github.com/cambecc for creating the repo:
 https://github.com/cambecc/earth. The majority of this code is directly take nfrom there, since its awesome.

 This class takes a canvas element and an array of data (1km GFS from http://www.emc.ncep.noaa.gov/index.php?branch=GFS)
 and then uses a mercator (forward/reverse) projection to correctly map wind vectors in "map space".

 The "start" method takes the bounds of the map at its current extent and starts the whole gridding,
 interpolation and animation process.
 */


var Windy = function Windy(params) {
  var MIN_VELOCITY_INTENSITY = params.minVelocity || 0; // velocity at which particle intensity is minimum (m/s)

  var MAX_VELOCITY_INTENSITY = params.maxVelocity || 10; // velocity at which particle intensity is maximum (m/s)

  var VELOCITY_SCALE = (params.velocityScale || 0.005) * (Math.pow(window.devicePixelRatio, 1 / 3) || 1); // scale for wind velocity (completely arbitrary--this value looks nice)

  var MAX_PARTICLE_AGE = params.particleAge || 90; // max number of frames a particle is drawn before regeneration

  var PARTICLE_LINE_WIDTH = params.lineWidth || 2; // line width of a drawn particle

  var PARTICLE_MULTIPLIER = params.particleMultiplier || 1 / 20; // particle count scalar (completely arbitrary--this values looks nice)

  var PARTICLE_REDUCTION = Math.pow(window.devicePixelRatio, 1 / 3) || 1.6; // multiply particle count for mobiles by this amount

  var FRAME_RATE = params.frameRate || 15;

  var FRAME_TIME = 1000 / FRAME_RATE; // desired frames per second

  var OPACITY = 0.97;


  var PARTICLE_MULTIPLIER=1/300
  // var PARTICLE_LINE_WIDTH=2a
  // var VELOCITY_SCALE=0.0


  var defaulColorScale = ["rgb(36,104, 180)", "rgb(60,157, 194)", "rgb(128,205,193 )", "rgb(151,218,168 )", "rgb(198,231,181)", "rgb(238,247,217)", "rgb(255,238,159)", "rgb(252,217,125)", "rgb(255,182,100)", "rgb(252,150,75)", "rgb(250,112,52)", "rgb(245,64,32)", "rgb(237,45,28)", "rgb(220,24,32)", "rgb(180,0,35)"];

  var defaulColorScale = ["rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)", "rgb(169,169,169,1)"];

  // var defaulColorScale=["rgba(98, 113, 184, 1)","rgba(66, 110, 166, 1)","rgba(68, 133, 160, 1)","rgba(71, 134, 122, 1)","rgba(75, 142, 130, 1)","rgba(87, 150, 56, 1)","rgba(149, 142, 62, 1)","rgba(162, 131, 69, 1)","rgba(147, 84, 89, 1)","rgba(137, 66, 122, 1)","rgba(110, 93, 156, 1)","rgba(93, 117, 159, 1)"]
  var colorScale = params.colorScale || defaulColorScale;
  var NULL_WIND_VECTOR = [NaN, NaN, null]; // singleton for no wind in the form: [u, v, magnitude]

  var builder;
  var grid;
  var gridData = params.data;
  var date;
  var λ0, φ0, Δλ, Δφ, ni, nj;

  var setData = function setData(data) {
    gridData = data;
  };

  var setOptions = function setOptions(options) {
    if (options.hasOwnProperty("minVelocity")) MIN_VELOCITY_INTENSITY = options.minVelocity;
    if (options.hasOwnProperty("maxVelocity")) MAX_VELOCITY_INTENSITY = options.maxVelocity;
    if (options.hasOwnProperty("velocityScale")) VELOCITY_SCALE = (options.velocityScale || 0.005) * (Math.pow(window.devicePixelRatio, 1 / 3) || 1);
    if (options.hasOwnProperty("particleAge")) MAX_PARTICLE_AGE = options.particleAge;
    if (options.hasOwnProperty("lineWidth")) PARTICLE_LINE_WIDTH = options.lineWidth;
    if (options.hasOwnProperty("particleMultiplier")) PARTICLE_MULTIPLIER = options.particleMultiplier;
    if (options.hasOwnProperty("opacity")) OPACITY = +options.opacity;
    if (options.hasOwnProperty("frameRate")) FRAME_RATE = options.frameRate;
    FRAME_TIME = 1000 / FRAME_RATE;
  }; // interpolation for vectors like wind (u,v,m)


  var bilinearInterpolateVector = function bilinearInterpolateVector(x, y, g00, g10, g01, g11) {
    var rx = 1 - x;
    var ry = 1 - y;
    var a = rx * ry,
        b = x * ry,
        c = rx * y,
        d = x * y;
    var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
    var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
    return [u, v, Math.sqrt(u * u + v * v)];
  };

  var createWindBuilder = function createWindBuilder(uComp, vComp) {
    var uData = uComp.data,
        vData = vComp.data;
    return {
      header: uComp.header,
      //recipe: recipeFor("wind-" + uComp.header.surface1Value),
      data: function data(i) {
        return [uData[i], vData[i]];
      },
      interpolate: bilinearInterpolateVector
    };
  };

  var createBuilder = function createBuilder(data) {
    var uComp = null,
        vComp = null,
        scalar = null;
    data.forEach(function (record) {
      switch (record.header.parameterCategory + "," + record.header.parameterNumber) {
        case "1,2":
        case "2,2":
          uComp = record;
          break;

        case "1,3":
        case "2,3":
          vComp = record;
          break;

        default:0
          scalar = record;
      }
    });
    return createWindBuilder(uComp, vComp);
  };

  var buildGrid = function buildGrid(data, callback) {
    var supported = true;
    if (data.length < 2) supported = false;
    if (!supported) console.log("Windy Error: data must have at least two components (u,v)");
    builder = createBuilder(data);
    
    var header = builder.header;
    if (header.hasOwnProperty("gridDefinitionTemplate") && header.gridDefinitionTemplate != 0) supported = false;
    document.getElementById("datetime").innerHTML=(header.refTime);
    if (!supported) {
      console.log("Windy Error: Only data with Latitude_Longitude coordinates is supported");
    }

    supported = true; // reset for futher checks

    λ0 = header.lo1;
    φ0 = header.la1; // the grid's origin (e.g., 0.0E, 90.0N)

    Δλ = header.dx;
    Δφ = header.dy; // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)

    ni = header.nx;
    nj = header.ny; // number of grid points W-E and N-S (e.g., 144 x 73)

    if (header.hasOwnProperty("scanMode")) {
      var scanModeMask = header.scanMode.toString(2);
      scanModeMask = ('0' + scanModeMask).slice(-8);
      var scanModeMaskArray = scanModeMask.split('').map(Number).map(Boolean);
      if (scanModeMaskArray[0]) Δλ = -Δλ;
      if (scanModeMaskArray[1]) Δφ = -Δφ;
      if (scanModeMaskArray[2]) supported = false;
      if (scanModeMaskArray[3]) supported = false;
      if (scanModeMaskArray[4]) supported = false;
      if (scanModeMaskArray[5]) supported = false;
      if (scanModeMaskArray[6]) supported = false;
      if (scanModeMaskArray[7]) supported = false;
      if (!supported) console.log("Windy Error: Data with scanMode: " + header.scanMode + " is not supported.");
    }

    date = new Date(header.refTime);
    date.setHours(date.getHours() + header.forecastTime); // Scan modes 0, 64 allowed.
    // 

    grid = [];
    var p = 0;
    var isContinuous = Math.floor(ni * Δλ) >= 360;

    for (var j = 0; j < nj; j++) {
      var row = [];

      for (var i = 0; i < ni; i++, p++) {
        row[i] = builder.data(p);
      }

      if (isContinuous) {
        // For wrapped grids, duplicate first column as last column to simplify interpolation logic
        row.push(row[0]);
      }

      grid[j] = row;
    }

    callback({
      date: date,
      interpolate: interpolate
    });
  };
  /**
   * Get interpolated grid value from Lon/Lat position
   * @param λ {Float} Longitude
   * @param φ {Float} Latitude
   * @returns {Object}
   */


  var interpolate = function interpolate(λ, φ) {
    if (!grid) return null;
    var i = floorMod(λ - λ0, 360) / Δλ; // calculate longitude index in wrapped range [0, 360)

    var j = (φ0 - φ) / Δφ; // calculate latitude index in direction +90 to -90

    var fi = Math.floor(i),
        ci = fi + 1;
    var fj = Math.floor(j),
        cj = fj + 1;
    var row;

    if (row = grid[fj]) {
      var g00 = row[fi];
      var g10 = row[ci];

      if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
        var g01 = row[fi];
        var g11 = row[ci];

        if (isValue(g01) && isValue(g11)) {
          // All four points found, so interpolate the value.
          return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
        }
      }
    }

    return null;
  };

  var interpolateVar = function interpolateVar(λ, φ,row) {
    // console.log("enter interpol")
    if (!grid) return null;
    var i = floorMod(λ - λ0, 360) / Δλ; // calculate longitude index in wrapped range [0, 360)

    var j = (φ0 - φ) / Δφ; // calculate latitude index in direction +90 to -90

    var fi = Math.floor(i),
        ci = fi + 1;
    var fj = Math.floor(j),
        cj = fj + 1;
    var row;

    // if (row = grid[fj]) {
      if (true){
      var g00 = row[fi];
      var g10 = row[ci];

      // if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
        if (isValue(g00) && isValue(g10) ) {
        var g01 = row[fi];
        var g11 = row[ci];

        if (isValue(g01) && isValue(g11)) {
          // All four points found, so interpolate the value.
          return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
        }
      }
    }

    return null;
  };
  /**
   * @returns {Boolean} true if the specified value is not null and not undefined.
   */


  var isValue = function isValue(x) {
    return x !== null && x !== undefined;
  };
  /**
   * @returns {Number} returns remainder of floored division, i.e., floor(a / n). Useful for consistent modulo
   *          of negative numbers. See http://en.wikipedia.org/wiki/Modulo_operation.
   */


  var floorMod = function floorMod(a, n) {
    return a - n * Math.floor(a / n);
  };
  /**
   * @returns {Number} the value x clamped to the range [low, high].
   */


  var clamp = function clamp(x, range) {
    return Math.max(range[0], Math.min(x, range[1]));
  };
  /**
   * @returns {Boolean} true if agent is probably a mobile device. Don't really care if this is accurate.
   */


  var isMobile = function isMobile() {
    return /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(navigator.userAgent);
  };
  /**
   * Calculate distortion of the wind vector caused by the shape of the projection at point (x, y). The wind
   * vector is modified in place and returned by this function.
   */


  var distort = function distort(projection, λ, φ, x, y, scale, wind) {
    var u = wind[0] * scale;
    var v = wind[1] * scale;
    var d = distortion(projection, λ, φ, x, y); // Scale distortion vectors by u and v, then add.

    wind[0] = d[0] * u + d[2] * v;
    wind[1] = d[1] * u + d[3] * v;
    return wind;
  };

  var distortion = function distortion(projection, λ, φ, x, y) {
    var τ = 2 * Math.PI; //    var H = Math.pow(10, -5.2); // 0.00000630957344480193
    //    var H = 0.0000360;          // 0.0000360°φ ~= 4m  (from https://github.com/cambecc/earth/blob/master/public/libs/earth/1.0.0/micro.js#L13)

    var H = 5; // ToDo:   Why does this work?

    var hλ = λ < 0 ? H : -H;
    var hφ = φ < 0 ? H : -H;
    var pλ = project(φ, λ + hλ);
    var pφ = project(φ + hφ, λ); // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1º λ
    // changes depending on φ. Without this, there is a pinching effect at the poles.

    var k = Math.cos(φ / 360 * τ);
    return [(pλ[0] - x) / hλ / k, 
    (pλ[1] - y) / hλ / k,
     (pφ[0] - x) / hφ,
      (pφ[1] - y) / hφ];
  };

  var createField = function createField(columns, bounds, callback) {
    /**
     * @returns {Array} wind vector [u, v, magnitude] at the point (x, y), or [NaN, NaN, null] if wind
     *          is undefined at that point.
     */
    function field(x, y) {
      var column = columns[Math.round(x)];
      return column && column[Math.round(y)] || NULL_WIND_VECTOR;
    } // Frees the massive "columns" array for GC. Without this, the array is leaked (in Chrome) each time a new
    // field is interpolated because the field closure's context is leaked, for reasons that defy explanation.


    field.release = function () {
      columns = [];
    };

    field.randomize = function (o) {
      // UNDONE: this method is terrible
      var x, y;
      var safetyNet = 0;

      do {
        x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
        y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y);
      } while (field(x, y)[2] === null && safetyNet++ < 30);

      o.x = x;
      o.y = y;
      return o;
    };

    callback(bounds, field);
  };

  var buildBounds = function buildBounds(bounds, width, height) {
    var upperLeft = bounds[0];
    var lowerRight = bounds[1];
    var x = Math.round(upperLeft[0]); //Math.max(Math.floor(upperLeft[0], 0), 0);

    var y = Math.max(Math.floor(upperLeft[1], 0), 0);
    var xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
    var yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);
    return {
      x: x,
      y: y,
      xMax: width,
      yMax: yMax,
      width: width,
      height: height
    };
  };

  var deg2rad = function deg2rad(deg) {
    return deg / 180 * Math.PI;
  };

  var invert = function invert(x, y, windy) {
    var latlon = params.map.containerPointToLatLng(L.point(x, y));
    return [latlon.lng, latlon.lat];
  };

  var project = function project(lat, lon, windy) {
    var xy = params.map.latLngToContainerPoint(L.latLng(lat, lon));
    return [xy.x, xy.y];
  };
  var asColorStyle = function(r, g, b, a) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
  };
  // var imageData;
  var widthCavas=params.canvas.width;
  var g = params.canvas.getContext("2d");
  var width = params.canvas.width;
  function drawBoundary(grid,bounds)
  {

    var macauGeoData = function() {
      var tmp = null;
      // $.getJSON("macau.topojson", function(data) {
        // console.log("pppppp",params.displayOptions.topoJsonPath)
      $.ajax({
          'async': false,
          'type': "GET",
          'global': false,
          // 'dataType': 'html',
          'url': params.displayOptions.topoJsonPath,
          'data': { },

          'success': function(data) {
              // console.log("macau",data);
              tmp=data;
              tmp = JSON.parse(data);
          }
        });

        return tmp;
    }();

    var header=builder.header
    var g3= params.canvas.getContext("2d");
    // clean canvas
    params.canvas.width=params.canvas.width;
    g3.clearRect(0, 0, 5000, 5000);
    var bbox = {
      "type": "Polygon",
      "coordinates": [
          [
              [map.getBounds()._northEast.lng, map.getBounds()._northEast.lat], 
              [map.getBounds()._northEast.lng, map.getBounds()._southWest.lat], 
              [map.getBounds()._southWest.lng, map.getBounds()._southWest.lat], 
              [map.getBounds()._southWest.lng, map.getBounds()._northEast.lat],
              [map.getBounds()._northEast.lng, map.getBounds()._northEast.lat]
          ]
      ]
  }
    var projectionMer = d3.geoMercator()
    .fitSize([params.canvas.width, params.canvas.height], bbox);


    var path = d3.geoPath()
        .projection(projectionMer)
        .context(g3);
      // define the border
      console.log(macauGeoData)
      path(topojson.mesh(macauGeoData));
      // draw a fat border in red
      // 用红色通道填充粒子边距，边距稍微比行政边界大一点，用来更好的渲染边缘粒子动态效果
      g3.strokeStyle = asColorStyle(255, 0, 0, 0);//asColorStyle(255, 0, 0, 1);
      g3.lineWidth = 2;
      g3.stroke();

      // fill the interior with both red and green
      // 用红，绿色通道填充整个区域
      g3.fillStyle = asColorStyle(255, 255, 0, 0);
      g3.fill();

      // draw a small border in red, slightly shrinking the display mask so we don't draw particles directly
      // on top of the visible SVG border
      // 再用红色通道勾勒出行政区域边缘，防止粒子的运动遮盖在行政区域的边框上
      g3.strokeStyle = asColorStyle(255, 0, 0, 0);
      g3.lineWidth = 2;
      g3.stroke();

      imageData = g3.getImageData(0, 0, params.canvas.width, params.canvas.height).data;
      console.log("imageData",imageData)


  }
  
  function drawContour(grid,bounds)
  {
    
    var x = bounds.x;
    
    // var ctx=document.getElementById("myCanvas2")
    var ctx=params.canvasContour;
    // var g3= ctx.getContext("2d");
    // console.log("ctx1",ctx)
    
    //   ctx.node().width=bounds.width;
    // ctx.node().height=bounds.height;
    // ctx.node().style="border:1px solid red;";
    // ctx.node().setAttribute("id", "contour")
    // var g3= ctx.node().getContext("2d");
    // var ctx=params.canvas
    // var ctx=L.DomUtil.create("canvas", "leaflet-layer");
    // ctx.width=bounds.width;
    // ctx.height=bounds.height;
    // var g3= ctx.getContext("2d");
    // g3.clearRect(0, 0, params.canvas.width, params.canvas.height);
    console.log("ctx,l",ctx)
    // console.log("ctx2",ctx.node())
    // clean canvas
    
    // g3.clearRect(0, 0, params.canvas.width, params.canvas.height);
    var bbox = {
      "type": "Polygon",
      "coordinates": [
          [
              [map.getBounds()._northEast.lng, map.getBounds()._northEast.lat], 
              [map.getBounds()._northEast.lng, map.getBounds()._southWest.lat], 
              [map.getBounds()._southWest.lng, map.getBounds()._southWest.lat], 
              [map.getBounds()._southWest.lng, map.getBounds()._northEast.lat],
              [map.getBounds()._northEast.lng, map.getBounds()._northEast.lat]
          ]
      ]
  }


    // var projectionMer = d3.geoMercator()
    // .fitSize([bounds.width, bounds.width], bbox);


    // var path = d3.geoPath()
    //     .projection(projectionMer)
    //     .context(g3);
    var asRainbowColorStyle = function(hue, a) {
      // Map hue [0, 1] to radians [0, 5/6τ]. Don't allow a full rotation because that keeps hue == 0 and
      // hue == 1 from mapping to the same color.
      var τ = 2 * Math.PI;
      var rad = hue * τ * 5 / 6;
      rad *= 0.75; // increase frequency to 2/3 cycle per rad
  
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var r = Math.floor(Math.max(0, -c) * 255);
      var g = Math.floor(Math.max(s, 0) * 255);
      var b = Math.floor(Math.max(c, 0, -s) * 255);
      return asColorStyle(r, g, b, a);
    };
    function drawColumn(x,contourAry,isLogarithmic) {
      // var x = bounds.x;
      var xBound = bounds.x + bounds.width; // upper bound (exclusive)
      var yBound = bounds.y + bounds.height; // upper bound (exclusive)

      // console.log("drawcolumn check")
      var min,max;
      contourAry.forEach(function(itm) {
        itm.forEach(function(itmInner) {
          if (itmInner!=-999)
          {
          min = (min == undefined || itmInner<min) ? itmInner : min;
          max = (max == undefined || itmInner>max) ? itmInner : max;
          }
        });
      });
            
      var range=max-min
      for (var y = bounds.y; y < yBound; y += 2) {
        // console.log("field mask",fieldMask(x, y,imageData,width))
        // if (displayMask(x, y,imageData,width)) {
          if (true){
          // Clamp interpolated z value to the range [min, max].
          // 过滤超出临界值的插值，用临界值代替

          var coord = invert(x, y);
          // console.log("coord",coord)
          // console.log("min",min,max)
          if (coord) {
            var λ = coord[0],
                φ = coord[1];
                // console.log("typeinterpolateVar",typeof(interpolateVar))
          if (isFinite(λ))   var z = interpolateVar(λ, φ,contourAry);      
               
          var z2 = Math.min(Math.max(z[1], min), max);
          // console.log("z2",z2,z[1],range,min,max) 
          // Now map to range [0, 1].
          z2 = (z2 - min) / range;
          if (isLogarithmic) {
            // Map to logarithmic range [1, 101] then back to [0, 1]. Seems legit.
            z2 = Math.log(z2 * 100 + 1) / Math.log(101);
          }
          // console.log("z13",z2) 
          g3.fillStyle = asRainbowColorStyle(z2,z2,z2, 0.4);
          g3.fillRect(x, y, 2, 2);

          
        }
      }
    }    

    // console.log("check",imageData.length == params.canvas.width * params.canvas.height * 4)
  }
  (function batchDraw() {
    var xBound = bounds.x + bounds.width; // upper bound (exclusive)
    // console.log("bounds.width",bounds.width,bounds.x)
    var yBound = bounds.y + bounds.height; // upper bound (exclusive)
    // console.log("check imageData",imageData)
    var speedData = function() {
      var tmp = null;
      // $.getJSON("macau.topojson", function(data) {
      $.ajax({
          'async': false,
          'type': "GET",
          'global': false,
          // 'dataType': 'html',
          'url': "speed.json",
          'data': { },
  
          'success': function(data) {
              // console.log("speed",data);
              tmp=data;
              // tmp = JSON.parse(data);
          }
        });
  
        return tmp;
    }();
  
    // console.log("speed",speedData["z"],typeof(speedData))
    var MAX_TASK_TIME = 100; // amount of time before a task yields control (milliseconds)
    var MIN_SLEEP_TIME = 25; //
    try {
      // var start = +new Date();
      var start=Date.now()
      while (x < xBound) {
        drawColumn(x,speedData["z"],false);
        x += 2;

        if (Date.now() - start > MAX_TASK_TIME) {
          // Drawing is taking too long. Schedule the next batch for later and yield.
          setTimeout(batchDraw, MIN_SLEEP_TIME);
          return;
        }
      }
      // d.resolve(interpolate);
    } catch (e) {
      console.log(e)
      // d.reject(e);
    }
  }
  )();
  }



  
  function fieldMask(x, y,imageData,width) {
    // red channel is field mask
    // 红色通道作为粒子蒙版
    var i = (y * width + x) * 4;
    // if (imageData[i]!=0 && imageData[i]) console.log("check Img",i,imageData[i])
    return imageData[i] > 0;
  }
  
  function displayMask(x, y,imageData,width) {
    // red channel is field mask
    // 红色通道作为粒子蒙版
    
    var i = (y * width + x) * 4+1;
    return imageData[i] > 0;
  }
  var interpolateField = function interpolateField(grid, bounds, extent, callback) {
    var projection = {}; // map.crs used instead

    var mapArea = (extent.south - extent.north) * (extent.west - extent.east);
    var velocityScale = VELOCITY_SCALE * Math.pow(mapArea, 0.4);
    var columns = [];
    var x = bounds.x;

    function interpolateColumn(x) {
      var column = [];
      // console.log("imageData",imageData)
      for (var y = bounds.y; y <= bounds.yMax; y += 2) {
        // if (fieldMask(x, y,imageData,width)) {
        if (true){
          // console.log("field endet")
          var coord = invert(x, y);

          if (coord) {
            var λ = coord[0],
                φ = coord[1];

            if (isFinite(λ)) {
              var wind = grid.interpolate(λ, φ);

              if (wind) {
                wind = distort(projection, λ, φ, x, y, velocityScale, wind);
                column[y + 1] = column[y] = wind;
              }
            }
          }
        }
      }

      columns[x + 1] = columns[x] = column;
    }

    (function batchInterpolate() {
      var start = Date.now();

      while (x < bounds.width) {
        interpolateColumn(x);
        x += 2;

        if (Date.now() - start > 1000) {
          //MAX_TASK_TIME) {
          setTimeout(batchInterpolate, 25);
          return;
        }
      }

      createField(columns, bounds, callback);
    })();
  };




  var animationLoop;

  var animate = function animate(bounds, field) {
    function windIntensityColorScale(min, max) {
      colorScale.indexFor = function (m) {
        // map velocity speed to a style
        return Math.max(0, Math.min(colorScale.length - 1, Math.round((m - min) / (max - min) * (colorScale.length - 1))));
      };

      return colorScale;
    }

    var colorStyles = windIntensityColorScale(MIN_VELOCITY_INTENSITY, MAX_VELOCITY_INTENSITY);
    var buckets = colorStyles.map(function () {
      return [];
    });
    var particleCount = Math.round(bounds.width * bounds.height * PARTICLE_MULTIPLIER);

    if (isMobile()) {
      particleCount *= PARTICLE_REDUCTION;
    }

    var fadeFillStyle = "rgba(0, 0, 0, ".concat(OPACITY, ")");
    var particles = [];

    for (var i = 0; i < particleCount; i++) {
      particles.push(field.randomize({
        age: Math.floor(Math.random() * MAX_PARTICLE_AGE) + 0
      }));
    }

    function evolve() {
      buckets.forEach(function (bucket) {
        bucket.length = 0;
      });
      particles.forEach(function (particle) {
        if (particle.age > MAX_PARTICLE_AGE) {
          field.randomize(particle).age = 0;
        }

        var x = particle.x;
        var y = particle.y;
        var v = field(x, y); // vector at current position

        var m = v[2];

        if (m === null) {
          particle.age = MAX_PARTICLE_AGE; // particle has escaped the grid, never to return...
        } else {
          var xt = x + v[0];
          var yt = y + v[1];

          if (field(xt, yt)[2] !== null) {
            // Path from (x,y) to (xt,yt) is visible, so add this particle to the appropriate draw bucket.
            particle.xt = xt;
            particle.yt = yt;
            buckets[colorStyles.indexFor(m)].push(particle);
          } else {
            // Particle isn't visible, but it still moves through the field.
            particle.x = xt;
            particle.y = yt;
          }
        }

        particle.age += 1;
      });
    }

    
    g.lineWidth = PARTICLE_LINE_WIDTH;
    g.fillStyle = fadeFillStyle;
    g.globalAlpha = 0.6;

    function draw() {
      // Fade existing particle trails.
      // var prev = "lighter";
      
      var prev=g.globalCompositeOperation;
      g.globalCompositeOperation = "destination-in";
      g.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      g.globalCompositeOperation = prev;
      g.globalAlpha = OPACITY === 0 ? 0 : OPACITY * 0.9; // Draw new particle trails.

      buckets.forEach(function (bucket, i) {
        if (bucket.length > 0) {
          g.beginPath();
          g.strokeStyle = colorStyles[i];
          bucket.forEach(function (particle) {
            g.moveTo(particle.x, particle.y);
            g.lineTo(particle.xt, particle.yt);
            particle.x = particle.xt;
            particle.y = particle.yt;
          });
          g.stroke();
        }
      });
    }


    var then = Date.now();

    (function frame() {
      animationLoop = requestAnimationFrame(frame);
      var now = Date.now();
      var delta = now - then;

      if (delta > FRAME_TIME) {
        then = now - delta % FRAME_TIME;
        evolve();
        draw();

      }
    })();
  };

  var start = function start(bounds, width, height, extent) {
    var mapBounds = {
      south: deg2rad(extent[0][1]),
      north: deg2rad(extent[1][1]),
      east: deg2rad(extent[1][0]),
      west: deg2rad(extent[0][0]),
      width: width,
      height: height
    };
    stop(); // build grid

    buildGrid(gridData, function (grid) {
      // interpolateField
      drawBoundary(grid,bounds);
       
      interpolateField(grid, buildBounds(bounds, width, height), mapBounds, function (bounds, field) {
        // drawContour(grid,bounds);
        // animate the canvas with random points
        windy.field = field;
        
        animate(bounds, field);
        
      });
     
    });

  };

  var stop = function stop() {
    if (windy.field) windy.field.release();
    if (animationLoop) cancelAnimationFrame(animationLoop);
  };

  var windy = {
    params: params,
    start: start,
    stop: stop,
    createField: createField,
    interpolatePoint: interpolate,
    setData: setData,
    setOptions: setOptions
  };
  return windy;
};



// drawContour(grid,bounds);
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
}