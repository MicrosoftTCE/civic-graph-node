/*******************************************************************************
* Author: Richard Brundritt
* Website: http://rbrundritt.wordpress.com
* Date: April 4th, 2012
* 
* Description: 
* A simple module that keeps the user within a specified area on the map. 
* This includes both a bounding box area and also a zoom level range. Simply 
* setting either the bounds or zoom range value to null will cause that limitation 
* to be ignored which may be desired if you want to limit the bounding area but 
* not the zoom level, or vice versa.
********************************************************************************/

var RestrictedView = function (map, bounds, zoomRange) {
    var _bounds, _zoomRange;

    /************************** Constructor *****************************/

    (function () {
        _bounds = bounds;
        _zoomRange = zoomRange;

        Microsoft.Maps.Events.addThrottledHandler(map, 'viewchange', function (e) {
            if (e.linear) {
                checkBounds();
            }
        }, 250);

        Microsoft.Maps.Events.addHandler(map, "viewchangestart", checkZoom);
        Microsoft.Maps.Events.addHandler(map, "viewchangeend", checkZoom);

        checkZoom();
        checkBounds();
    })();

    /************************** Private Methods *****************************/

    function checkZoom() {
        var zoom = map.getZoom(), newZoom;

        if (_zoomRange) {
            if (zoom < _zoomRange.min) {
                newZoom = _zoomRange.min;
            }
            else if (zoom > _zoomRange.max) {
                newZoom = _zoomRange.max;
            }

            if (newZoom) {
                map.setView({ zoom: newZoom, animate: false });
                $(map.getRootElement().children[1].children[1]).trigger("click");
                return;
            }
        }
    }

    function checkBounds() {
        var bounds = map.getBounds(), center;

        if (_bounds && (!_bounds.contains(bounds.getNorthwest()) || !_bounds.contains(bounds.getSoutheast()))) {
            center = map.getCenter();

            //Round numbers to 5 decimal places for easier comparision without floating point error
            var north = Math.round(bounds.getNorth() * 10000) / 10000;
            var south = Math.round(bounds.getSouth() * 10000) / 10000;
            var east = Math.round(bounds.getEast() * 10000) / 10000;
            var west = Math.round(bounds.getWest() * 10000) / 10000;

            var n = Math.round(_bounds.getNorth() * 10000) / 10000;
            var s = Math.round(_bounds.getSouth() * 10000) / 10000;
            var e = Math.round(_bounds.getEast() * 10000) / 10000;
            var w = Math.round(_bounds.getWest() * 10000) / 10000;

            if (north > n) {
                center.latitude -= Math.abs(north - n);
            }

            if (south < s) {
                center.latitude += Math.abs(s - south);
            }

            var c = (w + e) / 2;

            if (Math.abs(east - west) > Math.abs(e - w) || c == center.longitude) {
                center.longitude = c;
            } else {
                if (east > e) {
                    center.longitude -= Math.abs(east - e);
                } else if (east < w) {
                    center.longitude -= Math.abs((east + 360) - e);
                }

                if (west < w && east > w) {
                    center.longitude += Math.abs(w - west);
                }
            }

            if (_bounds.contains(center)) {
                map.setView({ center: center, animate: false });
            }
        }
    }

    /******************** Public Methods ******************************/

    this.getBounds = function () {
        return _bounds;
    };

    this.getZoomRange = function () {
        return _zoomRange;
    };

    this.setBounds = function (bounds) {
        _bounds = bounds
        checkBounds();
    };

    this.setZoomRange = function (zoomRange) {
        _zoomRange = zoomRange;
        checkZoom();
    };
};

// Call the Module Loaded method
Microsoft.Maps.moduleLoaded('RestrictedViewModule');