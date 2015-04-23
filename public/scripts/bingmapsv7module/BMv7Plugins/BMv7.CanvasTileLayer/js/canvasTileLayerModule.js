/*******************************************************************************
* Author: Pedro Sousa
* Website: http://build-failed.blogspot.com
* Date: March 28th, 2013
* 
* Description: 
* Provides a HTML5 Canvas Tile-Layer implementation for Bing Maps allowing full control on how the
* drawing occurs for each tile.
* 
* Example Usage:
*
* function loadMap() {
*     var map = new Microsoft.Maps.Map(document.getElementById("myMap"),{ credentials: "YOUR_BING_MAPS_KEY" });
*	
*	  Microsoft.Maps.registerModule("CanvasTileLayerModule", "scripts/CanvasTileLayerModule.min.js");
*     Microsoft.Maps.loadModule("CanvasTileLayerModule", { callback: function () {
*         new CanvasTileLayer(map, drawTile);
*     }});
* }
*
* function drawTile(context, tile) {
*     // use context to paint on the html5 canvas. Ex:
*
*     context.textAlign = "center";
*     context.fillText("hello world", 128, 128);
* }
*
********************************************************************************/

var CanvasTileLayer = function (mapInstance, options) {

    var _map = mapInstance;
    var _canvas = _createCanvas();
    var _tileLayer;
    var _cache;

    var _options = {

        drawTile: function(context, tile) {
        },

        opacity: 1.0,

        //shows the tiles boundaries including some info about them
        debugMode: false,

        //if the images should be cached
        cacheTiles: false,

        //number of seconds the tiles will remain in cache
        cacheTimeout: 60
    };

    /*********************** Private Methods ****************************/

    //Initialization method
    function _init() {

        _setOptions(options);
        var tileSource = new Microsoft.Maps.TileSource({uriConstructor: _getTilePath});
        _tileLayer= new Microsoft.Maps.TileLayer({ mercator: tileSource, opacity: _options.opacity});
		_map.entities.push(_tileLayer);

        if(_options.cacheTiles) {
            //_cache = new Cache(-1, false, new Cache.LocalStorageCacheStorage());
            _cache = new Cache();
        }
    }
	
	function _createCanvas() {
	
		var canvas = document.createElement("canvas");
		canvas.id = "canvas";
		canvas.width = 256;
		canvas.height = 256;
		return canvas;
	}
	
	function _getTilePath(tileInfo) {

        var tileKey = tileInfo.levelOfDetail + "_" + tileInfo.x + "_" + tileInfo.y;

        if(_options.cacheTiles) {

            var dataUrl = _cache.getItem(tileKey);

            if(dataUrl != undefined) {
                return dataUrl;
            }
        }

		var tile = {

            x: tileInfo.x,
			y: tileInfo.y,
			z: tileInfo.levelOfDetail,

			pixelCoordinates: _getTilePixelXY(tileInfo),
			getLocationPixelOffset: function(location) {
			
				// get pixel coordinate
				var pixel = _latLonToPixelXY(location, this.z);

				// canvas pixel coordinates (offset from the point coordinate and the tile coordinate)
				var x = (pixel.x - this.pixelCoordinates.x) | 0;
				var y = (pixel.y - this.pixelCoordinates.y) | 0;

				return { x: x, y:y };			
			},

            metersPerPixel: (2 * Math.PI * 6378137) / (256 << tileInfo.levelOfDetail)
		};

		var context = _canvas.getContext('2d');

        var start = new Date().getTime();

        context.clearRect (0,0, 256, 256);

        context.save();
        _options.drawTile(context, tile);
        context.restore();

        var end = new Date().getTime();

        if(_options.debugMode) {
            _drawDebugInformation(context, tile, end - start);
        }

        var dataUrl = _canvas.toDataURL();

        if(_options.cacheTiles) {

            _cache.setItem(tileKey, dataUrl,
                {expirationAbsolute: null,
                expirationSliding: _options.cacheTimeout,
                priority: CachePriority.NORMAL
            });
        }

		return dataUrl;
    }

    function _drawDebugInformation(context, tile, timeToDraw) {

        var tileDescription = ""
            + "z:" + tile.z + "  "
            + "x:" + tile.x + "  "
            + "y:" + tile.y + "";

        var tileGeneration = "Created at: " + _getCurrentTimeDescription() + "";

        var tileDraw = "Time to draw: " + timeToDraw.toString();


        context.shadowColor = "black";
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        context.fillStyle = "rgba(255, 255, 255, 0.7)";
        context.fillRect(5, 5, 130, 50);


        context.font = "bold 12px Arial";
        context.fillStyle = "black";
        context.textAlign = "left";
        context.textBaseline = "middle";

        context.fillText(tileDescription, 10, 15);
        context.fillText(tileGeneration, 10, 30);
        context.fillText(tileDraw, 10, 45);

        context.strokeRect(0,0,256,266);
    };
	
	/*
	 * Returns the Pixel coordinates for the tile top left corner(not viewport based)
	 */
    function _getTilePixelXY(tileInfo) {

		var tilePixelX = tileInfo.x * 256;
		var tilePixelY = tileInfo.y * 256;

		return { x: tilePixelX, y: tilePixelY };	
    };
	
	/*
	 * Returns the Pixel coordinates for a specific location (not viewport based)
	 */
	function _latLonToPixelXY(location, levelOfDetail) {
	
		var sinLatitude = Math.sin(location.latitude * Math.PI / 180.0);
		var pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) /(Math.PI * 4)) * 256 * Math.pow(2, levelOfDetail);
		var pixelX = ((location.longitude + 180) / 360) * 256 * Math.pow(2, levelOfDetail) ;
		
		return {
			x: (0.5 + pixelX) | 0,
			y: (0.5 + pixelY) | 0
		};
	};

    function _getCurrentTimeDescription() {

        var now= new Date(),
            h= now.getHours(),
            m= now.getMinutes(),
            s= now.getSeconds();

        if(h<10) h= '0'+h;
        if(m<10) m= '0'+m;
        if(s<10) s= '0'+s;
        return ''+h+':'+m+':'+s;
    };

    /*
     * Overrides any of the default settings
     */
    function _setOptions(options) {
        for (attrname in options) {
            _options[attrname] = options[attrname];
        }
    }

	
	/*********************** Public Methods ****************************/

    this.hide = function() {
        _tileLayer.setOptions({ visible: false});
    };

    this.show = function() {
        _tileLayer.setOptions({ visible: true});
    };

    this.setOpacity = function(opacityValue) {
        _tileLayer.setOptions({ opacity: opacityValue});
    };

    this.remove = function () {
        _map.entities.remove(_tileLayer);
    }

    _init();
};

//Call the Module Loaded method
Microsoft.Maps.moduleLoaded('CanvasTileLayerModule');