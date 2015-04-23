/*******************************************************************************
* Module: ShapeToolboxModule.js
* Author: Mike Garza
* Website: http://www.garzilla.net/vemaps
* Date: 14 Feb 2012
* 
* Description: 
* This module will add a toolbar to the current map that allows various shapes to be
* drawn/placed on the map.  Once the shapes have been added, clicking on the shape 
* allows the shape to be edited.
* 
* 
* Usage:
*
* To implement the module:
*   // Register and load a new module
*   Microsoft.Maps.registerModule("DrawShapeModule", "your-path-to/ShapeToolboxModule.js");
*   Microsoft.Maps.loadModule("DrawShapeModule", { callback: myModuleLoaded });
*
* Call back function to initialize:
*   function myModuleLoaded() {
*       //Create new instance of module (options are optional)
*        myToolbox = new ShapeToolboxModule(map, options);
*   }
*
*
* Display toolbar:
*   myToolbox.show();
*
* Hide toolbar:
*   myToolbox.hide();
*
********************************************************************************/

var ShapeToolboxModule = function (map, options) {
    var _this = this;

    //Global Variables
    var _map = map,
        _shape = null,
        _editShape = null,
        _points = [],
        _editPoints = [],
        _maskLine = null,
        _maskPoints = [],
        _currentLocation = null,
        _MapMoveHandler = null,
        _MapClickHandler = null,
        _MapKeyPressHandler = null,
        _MapDoubleClickHandler = null,
        _InProcess = false,
        _toolBarTemplate = '',
        _shapeType = null,
        _pointIndex = null,
        _shapeMask = null,
        _DragHandleLayer = null,
        _MapKeyPressHandler = null,
        _circleCenter = null,
        _anchorIndex = null,
        _anchorRightIndex = null,
        _anchorLeftIndex = null,
        _currentToolBarElement = null,
        _toolBarQueuedImage = null,
        _MM = Microsoft.Maps;

    var _version = "1.1";

    //Tracks the list of all shapes added to be able to pass them back as a callback
    var _shapes = [];

    //Default Options
    var _options = {
        shapeType: 'polyline',                                                  // Default of shape to draw
        targetLayer: _map.entities,                                             // Default layer to add shapes
        maskStrokeColor: new Microsoft.Maps.Color(200, 100, 100, 100),          // Line color of shape mask
        maskFillColor: new Microsoft.Maps.Color(000, 000, 000, 000),            // fill color of shape mask (polygon only)
        maskStrokeThickness: 2,                                                 // line width of shape mask
        maskStrokeDashArray: '2 2',                                             // dash pattern of shape mask
        shapeStrokeColor: new Microsoft.Maps.Color(200, 0, 0, 200),             // Line color of shape
        shapeStrokeThickness: 2,                                                // line width of shape
        shapeFillColor: new Microsoft.Maps.Color(100, 000, 100, 000),           // fill color of shape (polygon only)
        toolBarPolygonIcon: 'images/polygonIcon.png',                           // Icon for polygon
        toolBarPolygonHoverIcon: 'images/polygonHoverIcon.png',                 // Hover icon for polygon
        toolBarPolygonActiveIcon: 'images/polygonActiveIcon.png',               // Active icon for polygon
        toolBarPolylineIcon: 'images/polylineIcon.png',                         // Icon for polyline
        toolBarPolylineHoverIcon: 'images/polylineHoverIcon.png',               // Hover icon for polyline
        toolBarPolylineActiveIcon: 'images/polylineActiveIcon.png',             // Active icon for polyline
        toolBarPushPinIcon: 'images/pushpinIcon.png',                           // Icon for push pin
        toolBarPushPinHoverIcon: 'images/pushpinHoverIcon.png',                 // Hover icon for push pin
        toolBarPushPinActiveIcon: 'images/pushpinActiveIcon.png',               // Active icon for push pin
        toolBarPushPinMultiple: true,                                           // Allows inserting multiple pushpins at once
        toolBarRectangleIcon: 'images/rectangleIcon.png',                       // Icon for rectangle
        toolBarRectangleHoverIcon: 'images/rectangleHoverIcon.png',             // Hover icon for rectangle
        toolbarRectangleActiveIcon: 'images/rectangleActiveIcon.png',           // Active icon for rectangle
        toolbarCircleIcon: 'images/circleIcon.png',                             // Icon for circle
        toolbarCircleHoverIcon: 'images/circleHoverIcon.png',                   // Hover icon for circle
        toolbarCircleActiveIcon: 'images/circleActiveIcon.png',                 // Active icon for circle
        dragHandleImage: 'images/DragHandleWhite.gif',                          // Image for default drag handle
        dragHandleImageActive: 'images/DragHandleGreen.gif',                    // Image for active drag handle
        dragHandleImageHeight: 10,                                              // Height for default and active drag handle image
        dragHandleImageWidth: 10,                                               // Width for default and active drag handle image
        dragHandleImageAnchor: new Microsoft.Maps.Point(5, 5),                  // Anchor Point for drag handle image
        shapeMaskStrokeColor: new Microsoft.Maps.Color(200, 100, 100, 100),     // Line color of shape mask
        shapeMaskFillColor: new Microsoft.Maps.Color(000, 000, 000, 000),       // Fill color of shape mask (polygon only)
        shapeMaskStrokeThickness: 2,                                            // Line width of shape mask
        shapeMaskStrokeDashArray: '2 2',                                        // Dash pattern of shape mask
        shapeMouseCursor: 'images/grab.cur',                                    // Mouse cursor icon
        shapeChangedCallback: null                                              // Callback function when the shape changes
    };

    //Load user defined options
    if (options) {
        _LoadOptions(options);
    }

    //add tool bar
    var mapContainer = map.getRootElement(),
        mapDivId = mapContainer.offsetParent.id,
        toolbarId = mapDivId + '_ToolBarContainer';

    (function () {  //Isolate local variables created in this section as they are only temporary and do not need to stay in scope
        var toolbar = document.createElement('div');
        toolbar.id = toolbarId;
        toolbar.style.top = '0px';
        toolbar.style.right = '0px';
        toolbar.style.position = "absolute"
        toolbar.style.width = '140px';
        toolbar.style.height = '28px';
        toolbar.style.backgroundColor = 'rgb(250, 247, 245)';
        toolbar.style.border = '1px solid #a0a0a0';
        toolbar.style.visibility = 'hidden';

        var createBtn = function (a, b, c, d, e, f) {
            //preload images for better user experience
            var img = new Image();
            img.src = b;

            img = new Image();
            img.src = c;

            img = new Image();
            img.src = e;

            //Create button html
            var btnTemplate = '<div id="' + toolbarId + '_{0}Button" style="width: 28px; height: 29px; background-image: url({1}); background-repeat: no-repeat; float:left;" onclick="toolBarClick(this, \'{2}\', { shapeType: \'{3}\' });" onmouseover="changeToolBarBackground(this, \'{4}\');" onmouseout="changeToolBarBackground(this, \'{5}\');"></div>';
            return btnTemplate.replace(/\{0\}/g, a).replace(/\{1\}/g, b).replace(/\{2\}/g, c).replace(/\{3\}/g, d).replace(/\{4\}/g, e).replace(/\{5\}/g, f);
        };

        _toolBarTemplate += createBtn('Polyline', _options.toolBarPolylineIcon, _options.toolBarPolylineActiveIcon, 'polyline', _options.toolBarPolylineHoverIcon, _options.toolBarPolylineIcon);
        _toolBarTemplate += createBtn('Polygon', _options.toolBarPolygonIcon, _options.toolBarPolygonActiveIcon, 'polygon', _options.toolBarPolygonHoverIcon, _options.toolBarPolygonIcon);
        _toolBarTemplate += createBtn('Rectangle', _options.toolBarRectangleIcon, _options.toolbarRectangleActiveIcon, 'rectangle', _options.toolBarRectangleHoverIcon, _options.toolBarRectangleIcon);
        _toolBarTemplate += createBtn('Circle', _options.toolbarCircleIcon, _options.toolbarCircleActiveIcon, 'circle', _options.toolbarCircleHoverIcon, _options.toolbarCircleIcon);
        _toolBarTemplate += createBtn('PushPin', _options.toolBarPushPinIcon, _options.toolBarPushPinActiveIcon, 'pushpin', _options.toolBarPushPinHoverIcon, _options.toolBarPushPinIcon);

        toolbar.innerHTML = _toolBarTemplate;
        mapContainer.parentNode.appendChild(toolbar);

        //Inject CSS class to add custom cursor to drag handle hover
        _createCSSClass('.BM_Module_DragHandle', '{ cursor:pointer; }');

        function _createCSSClass(selector, style) {
            if (!document.styleSheets) {
                return;
            }

            if (document.getElementsByTagName("head").length == 0) {
                return;
            }

            var stylesheet;
            var mediaType;
            if (document.styleSheets.length > 0) {
                for (i = 0; i < document.styleSheets.length; i++) {
                    if (document.styleSheets[i].disabled) {
                        continue;
                    }
                    var media = document.styleSheets[i].media;
                    var href = document.styleSheets[i].href;
                    mediaType = typeof media;

                    if (mediaType == "string") {
                        if (media == "" || (media.indexOf("screen") != -1)) {
                            styleSheet = document.styleSheets[i];
                        }
                    } else if (mediaType == "object" && href != null) {
                        if (media.mediaText == "" || (media.mediaText.indexOf("screen") != -1)) {
                            styleSheet = document.styleSheets[i];
                        }
                    }

                    if (typeof styleSheet != "undefined") {
                        break;
                    }
                }
            }

            if (typeof styleSheet == "undefined") {
                var styleSheetElement = document.createElement("style");
                styleSheetElement.type = "text/css";

                document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

                for (i = 0; i < document.styleSheets.length; i++) {
                    if (document.styleSheets[i].disabled) {
                        continue;
                    }
                    styleSheet = document.styleSheets[i];
                }

                var media = styleSheet.media;
                mediaType = typeof media;
            }

            if (mediaType == "string") {
                for (i = 0; i < styleSheet.rules.length; i++) {
                    if (styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                        styleSheet.rules[i].style.cssText = style;
                        return;
                    }
                }

                styleSheet.addRule(selector, style);
            } else if (mediaType == "object") {
                for (i = 0; i < styleSheet.cssRules.length; i++) {
                    if (styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                        styleSheet.cssRules[i].style.cssText = style;
                        return;
                    }
                }

                styleSheet.insertRule(selector + "{" + style + "}", 0);
            }
        }
    })();

    /*********************** Private Methods ****************************/

    function _init() {
        //Raise exception if incorrect shape type is passed to module
        if (_options.targetLayer.toString() != '[EntityCollection]') { throw 'Module can only be used to add shapes to an entity collection.'; }

        //Wire initial events to Map
        _MapDoubleClickHandler = _MM.Events.addHandler(_map, 'dblclick', _DoubleClickHandler);
        _MapClickHandler = _MM.Events.addHandler(_map, 'click', _MapMouseDownHandler);
        _MapKeyPressHandler = _MM.Events.addHandler(_map, 'keypress', _KeyPressHandler);

        _setMouseCursor("crosshair");
        _maskPoints = [new _MM.Location(0, 0), new _MM.Location(0, 0)];
        _maskLine = new _MM.Polyline(_maskPoints, { strokeColor: _options.maskStrokeColor, strokeThickness: _options.maskStrokeThickness, strokeDashArray: _options.maskStrokeDashArray });
        _points = [];
        _InProcess = true;
    }

    function _initEdit() {
        //Raise exception if incorrect shape type is passed to module
        if (_editShape.toString() != '[Polyline]' && _editShape.toString() != '[Polygon]' && _editShape.toString() != '[AdvancedShapes.Polygon]') { throw 'Module can only be used for shapes that are polylines or polygons'; }

        //Get shape points
        _editPoints = [];
        _editPoints = _editShape.getLocations();

        if (_DragHandleLayer != null) {
            map.entities.remove(_DragHandleLayer);
            _DragHandleLayer = null;
        }

        //Entity Collection for Drag Hanldes
        _DragHandleLayer = new _MM.EntityCollection()

        var opt = { fillColor: _options.shapeMaskFillColor, strokeColor: _options.shapeMaskStrokeColor, strokeThickness: _options.shapeMaskStrokeThickness, strokeDashArray: _options.shapeMaskStrokeDashArray };

        //Build Shape Mask
        switch (_editShape.toString()) {
            case '[Polyline]':
                _shapeMask = new _MM.Polyline(_editPoints, opt);
                break;
            case '[Polygon]':
            case '[AdvancedShapes.Polygon]':
                _shapeMask = new _MM.Polygon(_editPoints, opt);
                break;
        }

        //Add drag handles and wire events
        var lenOffset = 1
        if (_editShape.toString() == '[Polygon]' || _editShape.toString() == '[AdvancedShapes.Polygon]') { lenOffset = 2 };

        opt = { draggable: true, icon: _options.dragHandleImage, height: _options.dragHandleImageHeight, width: _options.dragHandleImageWidth, anchor: _options.dragHandleImageAnchor, typeName: 'BM_Module_DragHandle' };

        switch (_shapeType.toLowerCase()) {
            case 'polyline':
            case 'polygon':
            case 'rectangle':
                for (i = 0; i <= (_editPoints.length - lenOffset) ; i++) {
                    var dragHandle = new _MM.Pushpin(_editPoints[i], opt);
                    _AddDragHandleEvents(dragHandle);
                }
                break;
            case 'circle':
                var dragHandle = new _MM.Pushpin(_editPoints[26], opt);
                _AddDragHandleEvents(dragHandle);
                break;
        }

        _DragHandleLayer.push(_shapeMask);

        //Add Drag Handles/Mask to Map
        map.entities.push(_DragHandleLayer);

        //Keypress event to exit
        _MapKeyPressHandler = _MM.Events.addHandler(_map, 'keypress', _EditKeyPressHandler);
        mapContainer.onkeyup = _EditKeyPressHandler; //Need to use Javascript onkeyup for delete button to be captured
    }

    //Add drag handle events
    function _AddDragHandleEvents(dragHandle) {
        _MM.Events.addHandler(dragHandle, 'dragstart', _StartDragHandler);
        _MM.Events.addHandler(dragHandle, 'drag', _DragHandler);
        _MM.Events.addHandler(dragHandle, 'dragend', _EndDragHandler);
        _MM.Events.addHandler(dragHandle, 'mouseover', _MouseOverDragHandle);
        _MM.Events.addHandler(dragHandle, 'mouseout', _MouseOutDragHandle);
        _DragHandleLayer.push(dragHandle);
    }

    function _MapMouseDownHandler(e) {
        _currentLocation = _map.tryPixelToLocation(new _MM.Point(e.getX(), e.getY()));
        _points.push(_currentLocation);
        _maskPoints[0] = _currentLocation;

        switch (_options.shapeType.toLowerCase()) {
            case 'pushpin':
                var newShape = new _MM.Pushpin(_currentLocation, { draggable: false })
                _options.targetLayer.push(newShape);
                newShape.shapeType = 'pushpin';

                // When mouse goes down in pushpin, start editing pushpin
                _this.edit(newShape);

                if (_options.toolBarPushPinMultiple)
                    _setMouseCursor("crosshair");
                else
                    _Dispose();
                break;
            case 'polygon':
            case 'polyline':
            case 'rectangle':
            case 'circle':
                switch (_points.length) {
                    case 1:
                        _maskPoints[1] = _currentLocation;
                        _options.targetLayer.push(_maskLine);
                        _MapMoveHandler = _MM.Events.addHandler(_map, 'mousemove', _MapMouseMoveHandler);
                        break;
                    case 2:
                        var opt = { strokeColor: _options.shapeStrokeColor, strokeThickness: _options.shapeStrokeThickness, fillColor: _options.shapeFillColor };
                        switch (_options.shapeType.toLowerCase()) {
                            case 'polyline':
                                _shape = new _MM.Polyline(_points, opt);
                                _shape.shapeType = _options.shapeType;
                                _options.targetLayer.push(_shape);
                                break;
                            case 'polygon':
                                _shape = new _MM.Polygon(_points, opt);
                                _shape.shapeType = _options.shapeType;
                                _options.targetLayer.push(_shape);
                                break;
                            case 'rectangle':
                            case 'circle':
                                _points = _maskPoints;
                                _points.shift();
                                _shape = new _MM.Polygon(_points, opt);
                                _shape.shapeType = _options.shapeType;
                                _options.targetLayer.push(_shape);
                                _Dispose();
                                break;
                            default:
                                throw 'Shape type must be "polygon" or "polyline".';
                        }
                        break;
                    default:
                        _maskLine.setLocations(_maskPoints);
                        _shape.setLocations(_points);
                        break;
                }
                break;
        }

        e.handled = true;
    }

    function _MapMouseMoveHandler(e) {
        _setMouseCursor("crosshair");
        _tempLocation = _map.tryPixelToLocation(new _MM.Point(e.getX(), e.getY()));

        switch (_options.shapeType.toLowerCase()) {
            case 'rectangle':
                if (_maskPoints.length == 2) {
                    _maskPoints.push(_tempLocation);
                    _maskPoints.push(_tempLocation);
                    _maskPoints.push(_maskPoints[0]);
                }
                _maskPoints[2] = _tempLocation;

                _maskPoints[1] = new _MM.Location(_maskPoints[0].latitude, _maskPoints[2].longitude);
                _maskPoints[3] = new _MM.Location(_maskPoints[2].latitude, _maskPoints[0].longitude);
                break;
            case 'circle':
                distance = _GetDistance(_points[0], _tempLocation);
                _maskPoints = _BuildCirclePoint(_points[0].latitude, _points[0].longitude, distance);

                break;
            default:
                _maskPoints[1] = _tempLocation;
                break;
        }

        _maskLine.setLocations(_maskPoints);

        e.handled = true;
    }

    function _setMouseCursor(val) {
        mapContainer.style.cursor = val;
    }

    //mouseover event handler
    function _MouseOverDragHandle(e) {
        //Update handle image
        e.target.setOptions({ icon: _options.dragHandleImageActive });
    }

    //mouseout event handler
    function _MouseOutDragHandle(e) {
        //Update handle image
        e.target.setOptions({ icon: _options.dragHandleImage });
    }

    //drag start event handler
    function _StartDragHandler(e) {
        var handleLocation = e.entity.getLocation();

        //Determine point index
        for (i = 0; i <= (_editPoints.length - 1) ; i++) {
            if (handleLocation == _editPoints[i]) {
                _pointIndex = i;
                break;
            }
        }

        switch (_shapeType.toLowerCase()) {
            case 'circle':
                locs = _editShape.getLocations();
                _circleCenter = _GetMidPointLocation(locs[17], locs[35]);
                break;
            case 'rectangle':
                if (_editPoints.length == 4) { _editPoints.push(_points[0]); }
                switch (_pointIndex) {
                    case 0:
                        _anchorRightIndex = 1;
                        _anchorIndex = 2;
                        _anchorLeftIndex = 3;
                        break;
                    case 1:
                        _anchorRightIndex = 2;
                        _anchorIndex = 3;
                        _anchorLeftIndex = 0;
                        break;
                    case 2:
                        _anchorRightIndex = 1;
                        _anchorIndex = 0;
                        _anchorLeftIndex = 3;
                        break;
                    case 3:
                        _anchorRightIndex = 2;
                        _anchorIndex = 1;
                        _anchorLeftIndex = 0;
                        break;
                }
                break;
            default:
                break;
        }
    }

    //drag event handler
    function _DragHandler(e) {
        var loc = e.entity.getLocation();

        switch (_shapeType.toLowerCase()) {
            case 'circle':
                _editPoints = _BuildCirclePoint(_circleCenter.latitude, _circleCenter.longitude, _GetDistance(_circleCenter, loc));
                _shapeMask.setLocations(_editPoints);
                break;
            case 'polyline':
            case 'polygon':
                _editPoints[_pointIndex] = loc;
                if (_pointIndex == 0 && (_editShape.toString() == '[Polygon]' || _editShape.toString() == '[AdvancedShapes.Polygon]')) { _editPoints[_editPoints.length - 1] = loc; }
                _shapeMask.setLocations(_editPoints);
                break;
            case 'rectangle':
                _editPoints[_pointIndex] = loc;

                _editPoints[_anchorRightIndex] = new _MM.Location(_editPoints[_anchorIndex].latitude, _editPoints[_pointIndex].longitude);
                _editPoints[_anchorLeftIndex] = new _MM.Location(_editPoints[_pointIndex].latitude, _editPoints[_anchorIndex].longitude);
                _editPoints[_editPoints.length - 1] = _editPoints[0];
                _shapeMask.setLocations(_editPoints);

                _DragHandleLayer.get(_anchorRightIndex).setLocation(_editPoints[_anchorRightIndex]);
                _DragHandleLayer.get(_anchorIndex).setLocation(_editPoints[_anchorIndex]);
                _DragHandleLayer.get(_anchorLeftIndex).setLocation(_editPoints[_anchorLeftIndex]);
                break;
            default:
                break;
        }
    }

    //drag end event handler
    function _EndDragHandler(e) {
        //Update source shape
        _editShape.setLocations(_editPoints);
        updateShapeList(_editShape, _editPoints);
    }

    function _EndDragHandlerPushpin(e) {
        if (e.target != null)
            updateShapeList(e.target, [e.target.getLocation()]);
    }

    function _KeyPressHandler(e) {
        if (_getKeycode(e) == '27') {
            _Dispose();
        }
        e.handled = true;
    }

    //Escape to exit editing
    function _EditKeyPressHandler(e) {
        if (_getKeycode(e) == '27') {
            _EditDispose();
        } else if (_getKeycode(e) == '46') {    //delete key handler
            _options.targetLayer.remove(_editShape);

            _editPoints = _editShape.points = null;
            if (_editShape && _editShape.id != null)
                _shapes[_editShape.id].points = null;

            _EditDispose();
        }

        if (e) {
            e.handled = true;
        }
    }

    function _getKeycode(e) {
        if (window.event) { return window.event.keyCode; } else if (e.keyCode) { return e.keyCode; } else if (e.which) { return e.which; };
    }

    function _DoubleClickHandler(e) {
        _Dispose();
        e.handled = true;
    }

    function _Dispose() {
        if ((_shape && _shape.toString() == '[Polygon]') ||
            (_shape && _shape.toString() == '[AdvancedShapes.Polygon]') ||
            (_editShape && _editShape.toString() == '[Polygon]') ||
            (_editShape && _editShape.toString() == '[AdvancedShapes.Polygon]')) {
            //fix for FireFox double click event issue
            if (_points[_points.length - 1].toString() == _points[_points.length - 2].toString()) { _points.pop(); }

            _points.push(_points[0]);
            _shape.setLocations(_points);
        }

        if (_shape) {
            updateShapeList(_shape, _points);
        }

        _MM.Events.addHandler(_shape, 'click', function (e) {
            _this.edit(e.target);
        });

        _options.targetLayer.remove(_maskLine);
        _shape = null;
        _setMouseCursor("url(" + _options.shapeMouseCursor + ")");

        _MM.Events.removeHandler(_MapClickHandler);
        _MM.Events.removeHandler(_MapMoveHandler);
        _MM.Events.removeHandler(_MapKeyPressHandler);
        _MM.Events.removeHandler(_MapDoubleClickHandler);

        //Reset toolbar icons
        document.getElementById(toolbarId + '_PolylineButton').style.backgroundImage = 'url(' + _options.toolBarPolylineIcon + ')';
        document.getElementById(toolbarId + '_PolygonButton').style.backgroundImage = 'url(' + _options.toolBarPolygonIcon + ')';
        document.getElementById(toolbarId + '_RectangleButton').style.backgroundImage = 'url(' + _options.toolBarRectangleIcon + ')';
        document.getElementById(toolbarId + '_CircleButton').style.backgroundImage = 'url(' + _options.toolbarCircleIcon + ')';
        document.getElementById(toolbarId + '_PushPinButton').style.backgroundImage = 'url(' + _options.toolBarPushPinIcon + ')';

        _InProcess = false;
    }

    function _EditDispose() {
        if (_editShape && _options.shapeChangedCallback) {
            _options.shapeChangedCallback(_shapes);
        }

        _MM.Events.removeHandler(_MapKeyPressHandler);
        mapContainer.onkeyup = null;
        map.entities.remove(_DragHandleLayer);
        _DragHandleLayer = null;
        _editShape = null;
    }

    function _LoadOptions(options) {
        for (optionName in options) {
            _options[optionName] = options[optionName];
        }
    }

    function _GetDistance(startLocation, endLocation) {
        var lat1 = startLocation.latitude,
            lon1 = startLocation.longitude,
            lat2 = endLocation.latitude,
            lon2 = endLocation.longitude;

        var R = 6371 / 1.609344; // earth's mean radius in km
        var dLat = (lat2 - lat1).toRad(),
            dLon = (lon2 - lon1).toRad();

        lat1 = lat1.toRad(), lat2 = lat2.toRad();

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function _GetMidPointLocation(startLocation, endLocation) {
        lat1 = startLocation.latitude.toRad();
        lon1 = startLocation.longitude.toRad();

        lat2 = endLocation.latitude.toRad();
        var dLon = (endLocation.longitude - startLocation.longitude).toRad();

        var Bx = Math.cos(lat2) * Math.cos(dLon),
            By = Math.cos(lat2) * Math.sin(dLon);

        lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2),
                    Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By));
        lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);
        lon3 = (lon3 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;  // normalise to -180..+180º

        return new _MM.Location(lat3.toDeg(), lon3.toDeg());
    }

    function _BuildCirclePoint(latin, lonin, radius) {
        var locs = [],
            lat1 = latin.toRad(),
            lon1 = lonin.toRad(),
            d = radius / 3956;
        for (var x = 0; x <= 360; x += 10) {
            var tc = (x / 90) * Math.PI / 2,
                lat = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(tc)),
                lon;

            lat = lat.toDeg();

            if (Math.cos(lat1) == 0) {
                lon = lonin; // endpoint a pole 
            }
            else {
                lon = ((lon1 - Math.asin(Math.sin(tc) * Math.sin(d) / Math.cos(lat1)) + Math.PI) % (2 * Math.PI)) - Math.PI;
            }

            lon = lon.toDeg();
            locs.push(new _MM.Location(lat, lon));
        }
        return locs;
    }

    /*********************** Public Methods ****************************/

    //Dispose function
    this.dispose = function () {
        //Clean up functions
        _Dispose();
    };

    //Return Module version
    this.version = function () {
        return _version;
    };

    //Hide Toolbar
    this.show = function () {
        document.getElementById(toolbarId).style.visibility = 'visible';
    };

    //Hide Toolbar
    this.hide = function () {
        document.getElementById(toolbarId).style.visibility = 'hidden';
    };

    //Set Options
    this.setOptions = function (options) {
        _LoadOptions(options);
    };

    //Draw the Shape
    draw = function (options) {
        if (_InProcess) {
            _Dispose();
            changeToolBarBackground(_currentToolBarElement, _toolBarQueuedImage);
        }
        _EditDispose();
        _LoadOptions(options);
        _init();
    };

    //Edit the Shape
    this.edit = function (shape) {
        if (shape.shapeType != null) {
            if (shape.shapeType == 'pushpin') {
                map.entities.remove(_DragHandleLayer);

                _editShape = shape;

                updateShapeList(shape, [shape.getLocation()]);
                _MM.Events.addHandler(shape, 'dragend', _EndDragHandlerPushpin);

                _MapKeyPressHandler = _MM.Events.addHandler(_map, 'keypress', _EditKeyPressHandler);
                mapContainer.onkeyup = _EditKeyPressHandler; //Need to use Javascript onkeyup for delete button to be captured
            }
            else {
                _editShape = shape;
                _shapeType = shape.shapeType;
                _initEdit();
            }
        }
    };

    //Reset all Shapes, optionally, initialize an array of loaded shapes.
    this.reset = function (shapes) {
        if (shapes)
            _shapes = shapes;
    };

    //Tool bar background utility
    changeToolBarBackground = function (toolBarElement, backgroundImage) {
        if (!_InProcess && backgroundImage != null) {
            toolBarElement.style.backgroundImage = 'url(' + backgroundImage + ')';
        }
    };

    //Tool bar click handler
    toolBarClick = function (toolBarElement, backgroundImage, moduleOptions) {
        _EditDispose();
        if ((moduleOptions && moduleOptions.shapeType == 'none') || _InProcess && (toolBarElement == _currentToolBarElement)) {
            _Dispose();
        } else if (moduleOptions != null) {
            _currentToolBarElement = toolBarElement;
            _toolBarQueuedImage = backgroundImage;
            changeToolBarBackground(_currentToolBarElement, _toolBarQueuedImage);
            draw(moduleOptions);
        }
    };

    function updateShapeList(editShape, editPoints) {
        if (editShape.id == null)
            editShape.id = _shapes.length;

        editShape.points = editPoints;

        if (_options.shapeChangedCallback) {
            _shapes[editShape.id] = editShape;
            _options.shapeChangedCallback(_shapes);
        }
    }
};

// extend Number object with methods for converting degrees/radians
Number.prototype.toRad = function () { return this * Math.PI / 180; }
Number.prototype.toDeg = function () { return this * 180 / Math.PI; }

Microsoft.Maps.moduleLoaded('ShapeToolboxModule');