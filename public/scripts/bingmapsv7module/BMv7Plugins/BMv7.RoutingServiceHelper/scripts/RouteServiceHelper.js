/********************************************************************************************************
* Author: Ricky Brundritt
* Website: http://rbrundritt.wordpress.com
* Date: Aug 31st, 2011
* 
* Description: 
* This module is designed for use with Bing Maps v7. It wraps the Bing Maps REST Routing service and makes 
* it easy to request routes with any number of waypoints. This does this by making multiple route requests 
* and merging the route results. 
*
* Limitations:
* - Does not support route tolerances
* - Does not support user context information
* - Does not support transit directions
*********************************************************************************************************/

var RouteServiceHelper = new function () {
    var _isProcessing = false,
        _options = {
            avoid: null,                //A comma-separated list of values from the following list that limit the use of highways and toll roads in the route. In the definitions below, “highway” also refers to a “limited-access highway”. 
            distanceBeforeFirstTurn: 0, //An integer distance specified in meters. Use this parameter to make sure that the moving vehicle has enough distance to make the first turn. 
            heading: null,              //An integer value between 0 and 359 that represents degrees from north where north is 0 degrees and the heading is specified clockwise from north. 
            optimize: 'time',           //Specifies what parameters to use to optimize the route. distance, time or timeWithTraffic
            routePathOutput: 'None',    //Specifies whether the response should include information about Point (latitude and longitude) values for the route’s path. None or Points
            travelMode: 'Driving',      //The mode of travel for the route. Driving or Walking
            distanceUnit: 'km',         //Distance units to use: km, kilometer, mi, or miles
            culture: null,              //The culture of the route request as defined here: http://msdn.microsoft.com/en-us/library/ff701709.aspx
            batchSize: 15              //The number of waypoints to use in each route request
        },
        _callback,
        _routes,
        _returnSegments,
        _hasErrors = false;

    /********************
    * Private Methods
    ********************/

    //This method generates the REST URL and sends the request to Bing.
    function requestRoute(waypoints, segmentId, options, bingMapsKey) {
        var url = ['http://dev.virtualearth.net/REST/v1/Routes/'];

        //specify travel mode
        if (options.travelMode.toLowerCase() == 'walking') {
            url.push('Walking');
        } else {  //Assume driving directions
            url.push('Driving');
        }

        //Add bing maps key and json helpers
        url.push('?key=', bingMapsKey);
        url.push('&jsonp=RouteServiceHelper.__InternalCallback&jsonso=', segmentId);

        //Add waypoints
        for (var i = 0; i < waypoints.length; i++) {
            url.push('&wp.', i, '=');

            if (typeof waypoints[i] == 'string') {
                url.push(waypoints[i]);
            }
            else if (waypoints[i].latitude != null && waypoints[i].longitude != null) {
                url.push(waypoints[i].latitude, ',', waypoints[i].longitude);
            } else {
                //error invalid waypoint entered
                _hasErrors = true;
                throw 'Invalid waypoint encountered.';
            }
        }

        //Add route options to request
        url.push(isNullOrWhiteSpace(options.avoid) ? '' : '&avoid=' + options.avoid);
        url.push((_options.distanceBeforeFirstTurn == null && options.distanceBeforeFirstTurn > 0) ? '' : '&dbft=' + options.distanceBeforeFirstTurn);
        url.push(isNullOrWhiteSpace(options.distanceUnit) ? '' : '&du=' + options.distanceUnit);
        url.push((_options.heading == null) ? '' : '&hd=' + options.heading);
        url.push(isNullOrWhiteSpace(options.optimize) ? '' : '&optmz=' + options.optimize);
        url.push(isNullOrWhiteSpace(options.routePathOutput) ? '' : '&rpo=' + options.routePathOutput);
        url.push(isNullOrWhiteSpace(options.culture) ? '' : '&c=' + options.culture);

        //call rest service
        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", url.join(''));
        document.body.appendChild(script);
    }

    //This is a helper method for testing string values
    function isNullOrWhiteSpace(str) {
        if (str == null) return true;
        return (typeof str == 'string' && str.replace(/\s/g, '').length < 1);
    }

    //This method merges all the routes into one.
    function mergeRoutes() {
        var mergedRoute = _routes[0];

        if (mergedRoute && mergedRoute.statusCode == 200 &&
            mergedRoute.resourceSets &&
            mergedRoute.resourceSets.length > 0 &&
            mergedRoute.resourceSets[0].resources &&
            mergedRoute.resourceSets[0].resources.length > 0) {

            var mres = mergedRoute.resourceSets[0].resources[0];

            for (var i = 1; i < _routes.length; i++) {
                if (_routes[i] && _routes[i].statusCode == 200 &&
                    _routes[i].resourceSets &&
                    _routes[i].resourceSets.length > 0 &&
                    _routes[i].resourceSets[0].resources &&
                    _routes[i].resourceSets[0].resources.length > 0) {

                    var res = _routes[i].resourceSets[0].resources[0];

                    mres.travelDistance += res.travelDistance;
                    mres.travelDuration += res.travelDuration;

                    mres.bbox = mergeBoundingBoxes(mres.bbox, res.bbox);

                    mres.routeLegs = mres.routeLegs.concat(res.routeLegs);

                    if (mres.routePath == null && res.routePath != null) {
                        mres.routePath = {
                            line: {
                                type: "LineString",
                                coordinates: []
                            }
                        }
                    }

                    if (res.routePath != null) {
                        mres.routePath.line.coordinates = mres.routePath.line.coordinates.concat(res.routePath.line.coordinates);
                    }
                } else {
                    if (_routes[i] && _routes[i].errorDetails) {
                        throw _routes[i].errorDetails;
                    } else {
                        throw 'Unable to route between locations.';
                    }
                }
            }

            mergedRoute.resourceSets[0].resources[0] = mres;
        }

        return mergedRoute;
    }

    //Merges two bounding boxes
    function mergeBoundingBoxes(bb1, bb2) {
        bb1[0] = Math.min(bb1[0], bb2[0]);
        bb1[1] = Math.min(bb1[1], bb2[1]);
        bb1[2] = Math.max(bb1[2], bb2[2]);
        bb1[3] = Math.max(bb1[3], bb2[3]);

        return bb1;
    }

    /********************
    * Public Methods
    ********************/

    /*
    * Calculates a route between an array of waypoints.
    * @param waypoints Array of waypoints to route between, can be string address or Microsoft.Maps.Location objects.
    * @param bingMapsKey A bing maps key to use when requesting the route.
    * @param options An object that specifies the options to use when generating a route request.
    * @param callback A callback method to return the route data to.
    */
    this.GetRoute = function (waypoints, bingMapsKey, options, callback) {
        if (callback != null) {
            if (_isProcessing) {
                throw 'Already processing a route.';
            }

            try {
                //merge options
                var opt = _options;
                for (attrname in options) {
                    opt[attrname] = options[attrname];
                }

                if (opt.batchSize > 24 || opt.batchSize < 0) {
                    opt.batchSize = 24;
                }

                _callback = function (result, state) {
                    _routes[parseInt(state)] = result;
                    _returnSegments++;

                    if (result == null) {
                    } else if (result.statusCode != 200) {
                        _hasErrors = true;
                    }

                    if (_returnSegments == _routes.length) {
                        _isProcessing = false;
                        callback(mergeRoutes());
                    }
                };

                _isProcessing = true;
                _routes = [];

                if (waypoints == null || waypoints.length < 2) {
                    throw 'Invalid waypoint array.';
                }

                var numSegments = Math.ceil(waypoints.length / opt.batchSize);
                _returnSegments = 0;
                _routes = [numSegments];

                var startIdx, lastIdx;

                //Loop through and request all routes
                for (var i = 0; i < numSegments; i++) {
                    startIdx = i * opt.batchSize;
                    lastIdx = startIdx + opt.batchSize + 1;

                    if (lastIdx > waypoints.length) {
                        lastIdx = waypoints.length;
                    }

                    requestRoute(waypoints.slice(startIdx, lastIdx), i, opt, bingMapsKey);
                }
            } catch (e) {
                callback({
                    statusCode: 400,
                    errorDetails: e
                });
            }
        } else {
            _callback = null;
        }
    };

    /*
    * A simple method for checking to see if a route is still processing
    */
    this.IsProcessing = function () {
        return _isProcessing;
    };

    // This is an internal callback method. Do not use or modify.
    this.__InternalCallback = function (result, state) {
        if (_callback != null) {
            _callback(result, state);
        }
    };
};

//Call the Module Loaded method
Microsoft.Maps.moduleLoaded('RouteServiceHelper');