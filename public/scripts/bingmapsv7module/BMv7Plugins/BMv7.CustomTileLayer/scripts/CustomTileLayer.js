/*******************************************************************************
* Author: Alex Blount
* Website: http://Earthware.co.uk
* Date: August 30th, 2012
* 
* Description: 
* A simple module to allow the use of custom Tile Layers. 
* The tiles are called based on a url created using the template passed into the constructor.
********************************************************************************/

var CustomTileLayer = function (map, tileUrlTemplate, disableBaseBingTiles, tileLayerOptions) {
    var _tileUrlTemplate, _disableBaseBingTiles, _tileSource;

    /************************** Constructor *****************************/

    (function () {
        _tileUrlTemplate = tileUrlTemplate;
        _disableBaseBingTiles = disableBaseBingTiles;

        // Create the tile source
        var tileSource = new Microsoft.Maps.TileSource({ uriConstructor: getTilePath });

        if (!tileLayerOptions) {
            tileLayerOptions = {};
        }
        tileLayerOptions.mercator = tileSource;

        // Construct the layer using the tile source
        var tilelayer = new Microsoft.Maps.TileLayer(tileLayerOptions);

        // Push the tile layer to the map
        map.entities.push(tilelayer);
        // If disable base tiles has been set then change the map type to mercator
        if (_disableBaseBingTiles) {
            map.setMapType(Microsoft.Maps.MapTypeId.mercator);
        }
    })();

    /************************** Private Methods *****************************/

    function getTilePath(tile) {

        var tileUrl = _tileUrlTemplate.replace("{{levelOfDetail}}", tile.levelOfDetail);
        var tileUrl = tileUrl.replace("{{tileX}}", tile.x);
        var tileUrl = tileUrl.replace("{{tileY}}", tile.y);

        return tileUrl;
    }

    /******************** Public Methods ******************************/

    this.getTileUrlTemplate = function () {
        return _tileUrlTemplate;
    };

    this.setTileUrlTemplate = function (url) {
        _tileUrlTemplate = url;
    };
};

// Call the Module Loaded method
Microsoft.Maps.moduleLoaded('CustomTileLayerModule');