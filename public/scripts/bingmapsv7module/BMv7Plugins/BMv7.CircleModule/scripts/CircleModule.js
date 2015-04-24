/***************************************************************
* Canvas Pushpin Module
*
* Author: Ricky Brundritt
* Website: http://rbrundritt.wordpress.com
* Date: Feb 12th, 2013
* 
* This module creates two classes called Circle and RegularPolygon 
* which are under the Namespace BM. These class wrap the Polygon 
* class in Bing Maps to provide additional shapes templates.
*
* Based on: http://rbrundritt.wordpress.com/2011/06/10/advance-shapes-in-bing-maps-v7/
* Also mostly extracted from the GeoRSS Module: 
*
* Classes:
* --------
* 
* BM.Circle
*
*   This class derives from the RegularPolygon class but has a set 
*   number of node points that makes the polygon look like a circle.
*
*   Constuctor: BM.Circle(center, radius, distanceUnits, options)
*
*   center - Center of shape as a Microsoft.Maps.Location object
*   radius - Radius of the shape as a number
*   distanceUnits - Distance units used by the radius. Takes in a string value of; 'm' (meters), 'ft' (feet), 'mi' (miles), 'km' (kilometers)
*   options - Polygon options used to render shape as a Microsoft.Maps.PolygonOptions object
*
*   Usage:
*   
*   circle = new BM.Circle(map.getCenter(), 1000, 'km', {
*            fillColor: new Microsoft.Maps.Color(100,0,0,255), 
*            strokeColor: new Microsoft.Maps.Color(200,0,255,0),
*            strokeThickness: 5
*        });
*
*   map.entities.push(circle);
*
*
* BM.RegularPolygon
*
*   This class generates regular polygons. This is useful for creating 
*   shapes like triangles, squares, pentagons or circles.
*
*   Constuctor: BM.RegularPolygon(center, radius, distanceUnits, nodeSize, offset, options)
*
*   center - Center of shape as a Microsoft.Maps.Location object
*   radius - Radius of the shape as a number
*   distanceUnits - Distance units used by the radius. Takes in a string value of; 'm' (meters), 'ft' (feet), 'mi' (miles), 'km' (kilometers)
*   nodeSize - Number of nodes (points) the shape should have.
*   offset - The angle to rotate the shape in degrees.
*   options - Polygon options used to render shape as a Microsoft.Maps.PolygonOptions object
*
*   Usage:
*
*   var poly = new BM.RegularPolygon(map.getCenter(), 1000, 'km', 3, 15, {
*        fillColor: new Microsoft.Maps.Color(100, 0, 0, 255),
*        strokeColor: new Microsoft.Maps.Color(200, 0, 255, 0),
*        strokeThickness: 5
*    });
*
*    map.entities.push(poly);
* 
*
*   Methods - In both Circle and RegularPolygon class
*     getCenter - returns the center of the shape
*     getDistanceUnits - returns the distance units used by the radius
*     getNodeSize - returns the number of points used to create shape
*     getOffset - returns the offset used to rotate the shape in degrees
*     getRadius - returns the radius of the shape
*     setCenter - changes the location of the shape. Takes in a Microsoft.Map.Location object
*     setDistanceUnits - changes the distance units used by the radius. Takes in a string value of; 'm' (meters), 'ft' (feet), 'mi' (miles), 'km' (kilometers)
*     setNodeSize - changes the number of points used to create the shape. Takes in an integer.
*     setOffset - changes the amount of offset used to rotate the shape. Takes in a number.
*     setRadius - changes the radius of the shape. Takes in a disance as a number.   
*     All methods for the Microsoft.Maps.Polygon class are also available
*
***************************************************************/

(function () {
    //Create a Namespace called BM
    if (typeof BM == 'undefined') {
        BM = {};
    }

    var _defaultNodeSize = 72, //Number node points to use to create circle.
        EARTH_RADIUS_METERS = 6378100,
        EARTH_RADIUS_KM = 6378.1,
        EARTH_RADIUS_MILES = 3963.1676,
        EARTH_RADIUS_FEET = 20925524.9;

    if (typeof BM.Circle == 'undefined') {
        BM.Circle = function(center, radius, distanceUnits, options){       
            return new BM.RegularPolygon(center, radius, distanceUnits, _defaultNodeSize, 0, options);      
        };
    }

    if (typeof BM.RegularPolygon == 'undefined') {
        BM.RegularPolygon = function(center, radius, distanceUnits, nodeSize, offset, options){   
            var points = [];
            var _basePolygon;

            var _refreshPoly = function(){
                points = generateRegularPolygonPoints(center, radius, getEarthRadius(distanceUnits), nodeSize, offset);

                if(!_basePolygon){
                    _basePolygon = new Microsoft.Maps.Polygon(points, options);
                }
            
                _basePolygon.setLocations(points);
            };

            _refreshPoly();

            _basePolygon.getCenter = function(){
                return center;
            };

            _basePolygon.getDistanceUnits = function(){
                return distanceUnits;
            };

            _basePolygon.getNodeSize = function(){
                return nodeSize;
            };

            _basePolygon.getOffset = function(){
                return offset;
            };

            _basePolygon.getRadius = function(){
                return radius;
            };
        
            _basePolygon.setCenter = function(c){
                center = c;
               _refreshPoly();
            };

            _basePolygon.setDistanceUnits = function(du){
                distanceUnits = du;
                _refreshPoly();
            };

            _basePolygon.setNodeSize = function(ns){
                nodeSize = ns;
               _refreshPoly();
            };

            _basePolygon.setOffset = function(off){
                offset = off;
               _refreshPoly();
            };

            _basePolygon.setRadius = function(r){
                radius = r;
                _refreshPoly();
            };
        
            return _basePolygon;
        };
    }

    /*
    * Private Functions
    */
    function getEarthRadius(distanceUnits){
        switch(distanceUnits.toLowerCase()){
            case 'm':
            case 'meters':
                return EARTH_RADIUS_METERS;
            case 'ft':
            case 'feet':
                return EARTH_RADIUS_FEET;
            case 'mi':
            case 'miles':
                return EARTH_RADIUS_MILES; 
            case 'km':
            case 'kilometers':
            default:
                return EARTH_RADIUS_KM;
        }
    }

    function generateRegularPolygonPoints(centerPoint, radius, earthRadius, nodeSize, offset) {
        var points = [],
            centralAngle = 360 / nodeSize;

        for (var i = 0; i <= nodeSize; i++) {
            points.push(calculateCoord(centerPoint, (i * centralAngle + offset) % 360, radius, earthRadius));
        }

        return points;
    }

    function calculateCoord(origin, brng, arcLength, earthRadius) {
        var lat1 = origin.latitude * Math.PI / 180,
            lon1 = origin.longitude * Math.PI / 180,
            centralAngle = arcLength / earthRadius;

        var lat2 = Math.asin(Math.sin(lat1) * Math.cos(centralAngle) + Math.cos(lat1) * Math.sin(centralAngle) * Math.cos(brng * Math.PI / 180));
        var lon2 = lon1 + Math.atan2(Math.sin(brng * Math.PI / 180) * Math.sin(centralAngle) * Math.cos(lat1), Math.cos(centralAngle) - Math.sin(lat1) * Math.sin(lat2));

        return new Microsoft.Maps.Location(lat2 * 180 / Math.PI, lon2 * 180 / Math.PI);
    }
})();

// Call the Module Loaded method
Microsoft.Maps.moduleLoaded('CircleModule');