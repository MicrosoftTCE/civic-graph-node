/*******************************************************************************
* Author: John OBrien
* Website: http://www.soulsolutions.com.au
* Date: 1st October 2012
* 
* Description: 
* This JavaScript file provides any Bing Map application with a plotted chart of elevation information.
*
* Requirements:
* This module uses jquery, jqplot and it's cursor module. For browser that do not support canvas an extension is provided. 
* The style of the jqplot can be modified in the CSS file also referenced.
* The following scripts/styles must be referenced:
*
*	<script type="text/javascript" src="scripts/jquery.min.js"></script>
*	<script type="text/javascript" src="scripts/jquery.jqplot.min.js"></script>
*   <script type="text/javascript" src="scripts/jqplot.cursor.min.js"></script>
*	<link rel="stylesheet" type="text/css" href="styles/jquery.jqplot.min.css" />
*
* Usage:
* The ElevationPlot constructor requires:
* - A reference to a map object
* - The ID of the DIV for the Chart to render
* - (optional) Options: 
*       mode, enum, 0 = spaceEvenly, 1 = distance
*       samples, int, in spaceEvenly mode the number of elevation samples to request and plot (1-1000)
*       showpoint, bool, shows a corrosponding point on the map when mouseover the chart
*       loadingCSS, string, cssClass name added to the Chart div while data is loading.
*/

var ElevationPlot = function (map, plotdivid, options) {

    /* Private Properties */
    var _map = map,
        _divid = plotdivid,
        _div = $('#' + plotdivid),
        _locations = [],
        _distances = [],
        _totaldistance = 0,
        _pin = null,
        _data = [[0, 0], [0, 0]];

    // Set default options
    var _options = {
        mode: 0,
        samples: 200,
        showpoint: true,
        loadingCSS: 'jqplot-loading',
    };

    /* Private Methods */
    function _init() {
        _setOptions(options);
        _createPlot();
        _createMapPoint();
        delete _init;
    }

    function _updatepointOnMap(x) {
        if (_pin) {
            switch (_options.mode) {
                case 0:
                    //TODO:
                    //samples / (total locations-1) give proportional along that segment
                    //Double check what projection they use to draw this line in the elevation service.
                    break;
                case 1:
                    _pin.setOptions({ visible: true });
                    //find the closest distance, get the corrosponding location
                    for (var i = 0; i < _distances.length; i++) {
                        if (_distances[i] > x && i > 0) {
                            _pin.setLocation(_locations[i]);
                            break;
                        }
                    }
                    break;
            }
        }
    }

    // Resets the chart
    function _clear() {
        _div.html('');
    }

    // Sets any options passed in
    function _setOptions(options) {
        for (attrname in options) {
            _options[attrname] = options[attrname];
        }
    }

    function _createMapPoint() {
        //events
        _div.bind("mouseleave", function () {
            if (_pin) {
                _pin.setOptions({ visible: false });
            }
        });
        _div.bind("jqplotMouseMove", function (ev, gridpos, datapos, neighbor) {
            if (_options.showpoint) {
                _updatepointOnMap(datapos.xaxis);
            }
        });

        //pin itself
        _pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(0, 0), { visible: false });
        _map.entities.push(_pin);
    }

    // Sets the elevation points from an array of Microsoft.Maps.Locations  
    function _setPoints(locations) {
        _locations = locations;
    }

    // Create the plot, switches on current mode
    function _createPlot() {
        if (_locations && _locations.length > 0) {
            switch (_options.mode) {
                case 0:
                    _createPlotPolyline();
                    break;
                case 1:
                    _createPlotDistance();
                    break;
            }
        } else {
            //plot empty placeholder
            _renderElevationProfile(0);
        }
    }

    // Create the plot based on evenly spaced points along a polyline
    function _createPlotPolyline() {
        //Generate a Bing Maps Session key to make our call to the REST service non-billable.
        _map.getCredentials(function (sessionKey) {
            var elevationURL = 'http://dev.virtualearth.net/REST/v1/Elevation/Polyline?jsonp=?';

            //show loading:
            _div.addClass(_options.loadingCSS);

            $.ajax({
                url: elevationURL,
                data: {
                    samples: _options.samples,
                    points: _encodePoints(_locations),
                    key: sessionKey,
                        },
                dataType: "jsonp",
                context: this,
                success: function (data) {              
                    if (data != null &&
                            data.resourceSets &&
                            data.resourceSets.length > 0 &&
                            data.resourceSets[0].resources &&
                            data.resourceSets[0].resources.length > 0) {
                        _data = data.resourceSets[0].resources[0].elevations;
                        _renderElevationProfile(_options.samples);
                    }
                },
                complete: function () { _div.removeClass(_options.loadingCSS); }
            });
        });
    }

    // Create the plot based on distance of coordinates
    function _createPlotDistance() {
        //Generate a Bing Maps Session key to make our call to the REST service non-billable.
        _map.getCredentials(function (sessionKey) {
            var elevationURL = 'http://dev.virtualearth.net/REST/v1/Elevation/List?jsonp=?';

            //reset and calculate distances
            _distances = [0];
            _distance = 0;
            for (var i = 0; i < _locations.length; i++) {
                if (i > 0) {
                    _distance += _haversine(_locations[i - 1], _locations[i]);
                    _distances.push(_distance);
                }
            }

            //show loading:
            _div.addClass(_options.loadingCSS);

            $.ajax({
                url: elevationURL,
                data: {
                    points: _encodePoints(_locations),
                    key: sessionKey,
                },
                dataType: "jsonp",
                context: this,
                success: function (data) {
                    if (data != null &&
                            data.resourceSets &&
                            data.resourceSets.length > 0 &&
                            data.resourceSets[0].resources &&
                            data.resourceSets[0].resources.length > 0) {
                        var elevations = data.resourceSets[0].resources[0].elevations
                        _data = [];
                        for (var i = 0; i < elevations.length; i++) {
                            _data.push([_distances[i], elevations[i]]);
                        }
                        _renderElevationProfile(_distance);
                    }
                },
                complete: function () { _div.removeClass(_options.loadingCSS); }
            });
        });
    }

    //The Haversine formula calculates the distance between two coordinates on a sphere.
    //This will return a distance in kilometers.
    function _haversine(latlong1, latlong2) {
        var R = 6371; // km  
        var dLat = (latlong2.latitude - latlong1.latitude) * Math.PI / 180;
        var dLon = (latlong2.longitude - latlong1.longitude) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(latlong1.latitude * Math.PI / 180)
            * Math.cos(latlong2.latitude * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.asin(Math.sqrt(a));
        return R * c;
    }

    function _encodePoints(points) { 
        var latitude = 0; 
        var longitude = 0; 
        var result = [];  
        var l;  
        for (var i = 0; i < points.length;i++) {
            // step 2 
            var newLatitude = Math.round(points[i].latitude * 100000); 
            var newLongitude = Math.round(points[i].longitude * 100000);
            // step 3 
            var dy = newLatitude - latitude; 
            var dx = newLongitude - longitude; 
            latitude = newLatitude; 
            longitude = newLongitude;  
            // step 4 and 5 
            dy = (dy << 1) ^ (dy >> 31); 
            dx = (dx << 1) ^ (dx >> 31);  
            // step 6 
            var index = ((dy + dx) * (dy + dx + 1) / 2) + dy;  
            while (index > 0) {  
                // step 7 
                var rem = index & 31; 
                index = (index - rem) / 32;  
                // step 8 
                if (index > 0) rem += 32;  
                // step 9 
                result.push("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"[rem]); 
            } 
        }  
        // step 10 
        return result.join(""); 
    } 

    function _renderElevationProfile(maxX) {
        _clear();
        $.jqplot(_divid, [_data],
        {
            seriesDefaults: {
                fill: true
            },
            axes: {
                xaxis: {
                    min: 0,
                    max: maxX,
                    tickOptions: {
                        show: false
                    }
                },
                yaxis: {
                    min: 0,
                }
            },
            cursor: {
                show: true,
                followMouse: true,
                showVerticalLine: true,
                showTooltipDataPosition: true,
                style: 'none',
                tooltipFormatString: '%3$d (m)',
            }
        });
    }

    /* Public Methods */

    // Sets options.
    this.SetOptions = function (options) {
        _setOptions(options);
        // Recreate the plot
        _createPlot();
    }

    // Sets an array of Microsoft.Maps.Locations from which the plot is created
    this.SetPoints = function (locations) {
        _setPoints(locations);
        // Recreate the plot
        _createPlot();
    }

    // Removes the chart, map objects and all events
    this.Remove = function () {
        _clear();
        _div.unbind("jqplotMouseMove");
    }

    // Call the initialisation routine
    _init();

};

// Call the Module Loaded method
Microsoft.Maps.moduleLoaded('ElevationPlotModule');