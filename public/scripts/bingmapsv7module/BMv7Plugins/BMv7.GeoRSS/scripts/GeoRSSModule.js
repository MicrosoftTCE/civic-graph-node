/****************************************************************************
* Author: Ricky Brundritt
* Website: http://rbrundritt.wordpress.com
* Date: December 10th, 2010
*
* Source: http://rbrundritt.wordpress.com/2010/12/10/georss-support-for-bing-maps-v7-ajax-control/
* 
* Description:
* This plugin allows you to import GeoRSS files into Bing Maps. A GeoRSS feed will be downloaded 
* and parsed into an EntityCollection which can then be added to the map. Additional metadata is 
* captured and stored in a Metadata tag on each shape making it easy to relate shapes to their metadata.
*
* Currently supports:
*
* Feed Tags:
*   - item
*   - entry
*
* GeoRSS Tags:
*   - georss:point
*   - georss:line
*   - georss:polygon
*   - georss:circle
*   - georss:where
*   - geo:lat/geo:long/geo:lon
*
* GML Tags:
*   - gml:point
*   - gml:lineString
*   - gml:polygon - Complex Polygons are support
*   - gml:pos
*   - gml:coordinates
*   - gml:poslist
*   - gml:interior
*   - gml:exterior
*   - gml:linearring
*   - gml:outerboundaryis
*   - gml:innerboundaryis
*
* Metadata Tags:
*   - title
*   - content/summary/description
*   - icon/mappoint:icon
*   - link
*
****************************************************************************/

//Define custom Metadata property for the shape classes.
Microsoft.Maps.Pushpin.prototype.Metadata = null;
Microsoft.Maps.Polyline.prototype.Metadata = null;
Microsoft.Maps.Polygon.prototype.Metadata = null;

var GeoRSSModule = function () {
    var _allCoords = [],
        _callback = null,
        _options = {
            pushpinOptions: null,
            polylineOptions: null,
            polygonOptions: null
        };

    /*****************
    * Private Methods
    ******************/
    function parseGeoRSS(xml) {
        var items = new Microsoft.Maps.EntityCollection();

        //Read RSS itms
        $(xml).find("item").each(function () {
            var shape = parseGeoRSSItem($(this));
            if (shape != null) {
                items.push(shape);
            }
        });

        //Read ATOM entry's
        $(xml).find("entry").each(function () {
            var shape = parseGeoRSSItem($(this));
            if (shape != null) {
                items.push(shape);
            }
        });

        var bounds;

        if (_allCoords != null && _allCoords.length > 0) {
            bounds = Microsoft.Maps.LocationRect.fromLocations(_allCoords);
        } else {
            bounds = new Microsoft.Maps.LocationRect(new Microsoft.Maps.Location(0, 0), 360, 180);
        }

        if (_callback != null) {
            _callback(items, bounds);
        }
    }

    function parseGeoRSSItem(i) {
        var tempCoord = null;

        var title, description, icon, link, isPushpin = false;
        var shape = null;

        i.children().each(function () {
            var tag = this.tagName.toLowerCase();
            switch (tag) {
                case "title":
                    title = $(this).text();
                    break;
                case "content":
                case "summary":
                case "description":
                    description = $(this).text();
                    break;
                case "icon":
                case "mappoint:icon":
                    icon = $(this).text();
                    break;
                case "link":
                    link = $(this).text();
                    break;
                case "geo:lat":
                    var c = parseFloat($(this).text());

                    if (tempCoord == null) {
                        tempCoord = c;
                    }
                    else {
                        tempCoord = new Microsoft.Maps.Location(c, tempCoord);
                        _allCoords.push(tempCoord);
                        shape = new Microsoft.Maps.Pushpin(tempCoord);
                        isPushpin = true;
                    }
                    break;
                case "geo:lon":
                case "geo:long":
                    var c = parseFloat($(this).text());

                    if (tempCoord == null) {
                        tempCoord = c;
                    }
                    else {
                        tempCoord = new Microsoft.Maps.Location(tempCoord, c);
                        _allCoords.push(tempCoord);
                        shape = new Microsoft.Maps.Pushpin(tempCoord);
                        isPushpin = true;
                    }
                    break;
                case "geo:point":
                    var tLat, tLon;
                    i.children().each(function () {
                        if (this.tagName.toLowerCase() == "geo:lat") {
                            tLat = parseFloat($(this).text());
                        }
                        else if (this.tagName.toLowerCase() == "geo:long") {
                            tLon = parseFloat($(this).text());
                        }
                    });

                    if (tLat != null && tLon != null) {
                        tempCoord = new Microsoft.Maps.Location(tLat, tLon);
                        _allCoords.push(tempCoord);
                        shape = new Microsoft.Maps.Pushpin(tempCoord);
                        isPushpin = true;
                    }
                    break;
                case "georss:point":
                    tempCoord = parseCoord($(this).text());
                    if (tempCoord != null) {
                        _allCoords.push(tempCoord);
                        shape = new Microsoft.Maps.Pushpin(tempCoord);
                        isPushpin = true;
                    }
                    break;
                case "georss:line":
                    tempCoord = parseCoords($(this).text(), 2);
                    if (tempCoord != null && tempCoord.length >= 2) {
                        _allCoords = _allCoords.concat(tempCoord);
                        shape = new Microsoft.Maps.Polyline(tempCoord, _options.polylineOptions);
                    }
                    break;
                case "georss:polygon":
                    tempCoord = parseCoords($(this).text(), 2);
                    if (tempCoord != null && tempCoord.length >= 3) {
                        _allCoords = _allCoords.concat(tempCoord);
                        shape = new Microsoft.Maps.Polygon(tempCoord, _options.polygonOptions);
                    }
                    break;
                case "georss:where":
                    var gmlItem = parseGMLItem(this.firstChild);
                    shape = gmlItem.shape;
                    isPushpin = gmlItem.isPushpin;
                    break;
                case "georss:circle":
                    var v = $.trim($(this).text().replace(/,/g, ' ').replace(/[\s]{2,}/g, ' ')).split(' ');
                    if (v.length > 2) {
                        tempCoord = geoTools.GenerateRegularPolygon(new Microsoft.Maps.Location(parseFloat(v[0]), parseFloat(v[1])), parseFloat(v[2]), geoTools.Constants.EARTH_RADIUS_METERS, 25, 0);
                        _allCoords = _allCoords.concat(tempCoord);
                        shape = new Microsoft.Maps.Polygon(tempCoord, _options.polygonOptions);
                    }
                    break;
                default:
                    //Handle GML tags
                    if (tag.match("^gml:") == "gml:") {
                        var gmlItem = parseGMLItem(this);
                        shape = gmlItem.shape;
                        isPushpin = gmlItem.isPushpin;
                    }
                    break;
            }
        });

        if (shape != null) {
            shape.Metadata = {
                title: title,
                description: description,
                icon: icon,
                link: link
            };

            var opt = null;
            if (isPushpin) {
                opt = _options.pushpinOptions;

                if (icon != null && icon != '') {
                    if (opt != null) {
                        opt.icon = icon;
                    }
                    else {
                        opt = { icon: icon };
                    }
                }
            }

            if (opt != null) {
                shape.setOptions(opt);
            }
        }

        return shape;
    }

    function parseGMLItem(i) {
        var s = null, isPushpin = false;

        if (i != null && i.tagName == null) {
            if (i.nextSibling.tagName != null) {
                i = i.nextSibling;
            }
            else {
                i == null;
            }
        }

        if (i != null) {
            switch (i.tagName.toLowerCase()) {
                case "gml:point":
                    var coord = null;
                    $(i).children().each(function () {
                        if (this.tagName.toLowerCase() == "gml:pos" ||
                            this.tagName.toLowerCase() == "gml:coordinates") {
                            coord = parseCoord($(this).text());
                        }
                    });

                    if (coord != null) {
                        _allCoords.push(coord);
                        s = new Microsoft.Maps.Pushpin(coord);
                        isPushpin = true;
                    }
                    break;
                case "gml:linestring":
                    var v = [];
                    $(i).children().each(function () {
                        var coords = parsePosList(this);
                        if (coords != null && coords.length >= 2) {
                            v.push(coords);
                        }
                    });

                    if (v.length > 0) {
                        _allCoords = _allCoords.concat(v[0]);
                        s = new Microsoft.Maps.Polyline(v[0], _options.polylineOptions);
                    }
                    break;
                case "gml:polygon":
                    var exR = [], inR = [];
                    $(i).children().each(function () {
                        switch (this.tagName.toLowerCase()) {
                            case "gml:exterior":
                            case "gml:outerboundaryis":
                                var coords = parseLinearRing(this);
                                if (coords != null && coords.length >= 3) {
                                    exR = coords;
                                }
                                break;
                            case "gml:interior":
                            case "gml:innerboundaryis":
                                var coords = parseLinearRing(this);
                                if (coords != null && coords.length >= 3) {
                                    inR.push(coords);
                                }
                                break;
                        }
                    });

                    if (exR.length > 0) {
                        //Supports inner rings   
                        _allCoords = _allCoords.concat(exR);
                        s = new Microsoft.Maps.Polygon([exR].concat(inR), _options.polygonOptions);
                    }
                    break;
                    break;
                default:
                    break;
            }
        }

        return { shape: s, isPushpin: isPushpin };
    }

    /*
    * Parses a GML LinearRing tag
    */
    function parseLinearRing(ring) {
        var rCoords = null;
        $(ring).children().each(function () {
            if (this.tagName.toLowerCase() == "gml:linearring") {
                $(this).children().each(function () {
                    var coords = parsePosList(this);
                    if (coords != null && coords.length >= 3) {
                        rCoords = coords;
                    }
                });
            }
        });

        return rCoords;
    }

    /*
    * Parses a GML posList or coordinates tag
    */
    function parsePosList(list) {
        if (list.tagName.toLowerCase() == "gml:poslist" ||
           list.tagName.toLowerCase() == "gml:coordinates") {
            var dim = $(list).attr("dimension");
            if (dim != null && dim != '') {
                dim = parseInt(dim);
                if (dim == null || dim < 1) {
                    dim = 2;
                }
            }
            else {
                dim = 2;
            }

            return parseCoords($(list).text(), dim);
        }

        return null;
    }

    /*
    * Parses a string list of coordinates. Handles 2D and 3D coordinate sets.
    * sCoord - String coordinate
    * dim - number of values to represent coordinate. 
    */
    function parseCoords(sCoord, dim) {
        if (dim == null || dim < 1) {
            dim = 2;
        }

        var v = $.trim(sCoord.replace(/,/g, ' ').replace(/[\s]{2,}/g, ' ')).split(' ');
        if (v.length > 1) {
            var c = [];

            for (var i = 0; i < v.length; i = i + dim) {
                c.push(new Microsoft.Maps.Location(parseFloat(v[i]), parseFloat(v[i + 1])));
            }

            return c;
        }

        return null;
    }

    /*
    * Parses a string list of coordinate.
    */
    function parseCoord(sCoord) {
        var v = $.trim(sCoord.replace(/,/g, ' ').replace(/[\s]{2,}/g, ' ')).split(' ');
        if (v.length > 1) {
            return new Microsoft.Maps.Location(parseFloat(v[0]), parseFloat(v[1]));
        }

        return null;
    }

    /*
    * Sub class that contains several helpful tools for dealing with spatial data.
    * TODO: Consider pulling this out in the future and creating a seperate plugin that has spatial tools.
    */
    var geoTools = new function () {
        function DegtoRad(x) {
            return x * Math.PI / 180;
        }

        function RadtoDeg(x) {
            return x * 180 / Math.PI;
        }

        this.Constants = {
            EARTH_RADIUS_METERS: 6378100,
            EARTH_RADIUS_KM: 6378.1,
            EARTH_RADIUS_MILES: 3963.1676,
            EARTH_RADIUS_FEET: 20925524.9
        };

        this.CalculateCoord = function (origin, brng, arcLength, earthRadius) {
            var lat1 = DegtoRad(origin.latitude),
            lon1 = DegtoRad(origin.longitude),
            centralAngle = arcLength / earthRadius;

            var lat2 = Math.asin(Math.sin(lat1) * Math.cos(centralAngle) + Math.cos(lat1) * Math.sin(centralAngle) * Math.cos(DegtoRad(brng)));
            var lon2 = lon1 + Math.atan2(Math.sin(DegtoRad(brng)) * Math.sin(centralAngle) * Math.cos(lat1), Math.cos(centralAngle) - Math.sin(lat1) * Math.sin(lat2));

            return new Microsoft.Maps.Location(RadtoDeg(lat2), RadtoDeg(lon2));
        };

        this.GenerateRegularPolygon = function (centerPoint, radius, earthRadius, numberOfPoints, offset) {
            var points = [],
            centralAngle = 360 / numberOfPoints;

            for (var i = 0; i <= numberOfPoints; i++) {
                points.push(geoTools.CalculateCoord(centerPoint, (i * centralAngle + offset) % 360, radius, earthRadius));
            }

            return points;
        };

        this.HaversineDistance = function (coord1, coord2, earthRadius) {
            var lat1 = DegtoRad(coord1.latitude),
            lon1 = DegtoRad(coord1.longitude),
            lat2 = DegtoRad(coord2.latitude),
            lon2 = DegtoRad(coord2.longitude);

            var dLat = lat2 - lat1,
            dLon = lon2 - lon1,
            cordLength = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dLon / 2), 2),
            centralAngle = 2 * Math.atan2(Math.sqrt(cordLength), Math.sqrt(1 - cordLength));

            return earthRadius * centralAngle;
        };
    };

    /****************
    * Public Methods
    ****************/

    /*
    * Takes in a URL to a GeoRSS file, loads and parses it into an Entity Collection. Data is then sent back to a callback function.
    */
    this.ImportGeoRSS = function (link, callback, options) {
        _callback = callback;

        if (options != null) {
            for (attrname in options) {
                _options[attrname] = options[attrname];
            }
        }

        $.ajax({
            type: "GET",
            url: link,
            dataType: "xml",
            success: function (xml) {
                parseGeoRSS(xml);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(thrownError.description);
            }
        });
    };
};

(function () {
    //Load complex polygon module is not already loaded
    var p = new Microsoft.Maps.Polygon();
    if (!p.getRings) {
        Microsoft.Maps.loadModule('Microsoft.Maps.AdvancedShapes', { callback: function () {
            // Call the Module Loaded method
            Microsoft.Maps.moduleLoaded('GeoRSSModule');
        } 
        });
    } else {
        // Call the Module Loaded method
        Microsoft.Maps.moduleLoaded('GeoRSSModule');
    }
})();