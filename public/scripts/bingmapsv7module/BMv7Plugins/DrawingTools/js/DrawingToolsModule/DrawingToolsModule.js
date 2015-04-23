/****************************************************************************
* Author: Ricky Brundritt
* Website: http://rbrundritt.wordpress.com
* Date: August 2014
*
* 
* Description:
* This module provides a set of tools for drawing and editing shapes on the map.
* In addition to being able to draw shapes you can add shapes to the base layer of 
* the drawing tools module and it will allow you to edit it. If the toolbarContainer 
* is set with a DOMElement in the options it will generate a toolbar with drawing tools 
* in it. You can specify which tool options should appear in the toolbar using the 
* drawingModes and styleTools properties in the toolbarOptions. 
*
* Currently supports:
* Drawing: Pushpins, Polylines, Polygons, Rectangles, Circles
* Tasks: Erasing, Editting, change shape style
* Events: created, changed, changing, erased, drawingModeChanged
*
*
* Usage:
* 
* <!DOCTYPE html>
* <html>
* <head>
*     <meta charset="utf-8" />
*     <title>Drawing Tools Sample</title>
* 
*     <!-- Bing Map Control references -->
*     <script type="text/javascript" src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0"></script>
* 
*     <!-- Our Bing Maps JavaScript Code -->
*     <link href="js/DrawingToolsModule/DrawingToolsModule.css" rel="stylesheet" type="text/css" />
* 
*     <script type="text/javascript">
*         function GetMap() {
*             map = new Microsoft.Maps.Map(document.getElementById("myMap"), {
*                 credentials: "YOUR_BING_MAPS_KEY"
*             });
* 
*             //Register and load the Drawing Tools Module
*             Microsoft.Maps.registerModule("DrawingToolsModule", "js/DrawingToolsModule/DrawingToolsModule.js");
* 
*             Microsoft.Maps.loadModule("DrawingToolsModule", {
*                 callback: function () {
*                     var drawingTools = new DrawingTools.DrawingManager(map, {
*                         toolbarContainer: document.getElementById('toolbarContainer')
*                     });
*                 }
*             });
*         }
*     </script>
* </head>
* <body onload="GetMap()">
*     <div style="position:relative;width:800px;height:600px;">
*         <div id="myMap" style="position:relative; width:800px;height:600px;"></div>
*         <div id="toolbarContainer" style="position:absolute;right:2px;top:2px;"></div>
*     </div>
* </body>
* </html>
* 
* Ideas to expand:
* - Add support for cutting out holes in polygons
* - Add support for geodesic lines
* - Add support for drawing free hand lines
* - Undo function
* - Snap to handle or shape node.
* - Delete single node when erasing
****************************************************************************/

var DrawingTools = {
    /****************************** 
    * Enumerators 
    *******************************/

    /// <field type='DrawingTools.DrawingMode'>An enumerator that specifies the different types of drawing modes that are supported.</field>
    DrawingMode: {
        pushpin: 'pushpin',
        polyline: 'polyline',
        polygon: 'polygon',
        circle: 'circle',
        rectangle: 'rectangle',
        erase: 'erase',
        edit: 'edit'
    },

    /// <field type='DrawingTools.StyleTools'>An enumerator that specifies the different types of style tools that are supported.</field>
    StyleTools: {
        strokeColor: 'strokeColor',
        fillColor: 'fillColor', 
        strokeThickness: 'strokeThickness', 
        strokeDashArray : 'strokeDashArray'
    },

    /// <field type='DrawingTools.DistanceUnit'>An enumerator that specifies the different types of distance units that are supported.</field>
    DistanceUnit: {
        meters: 'meters',
        km: 'km',
        miles: 'miles',
        feet: 'feett',
        yards: 'yards'
    },
    
    /****************************** 
    * Public Classes 
    *******************************/

    DrawingManager: function (map, options) {
        /// <signature>
        /// <summary>
        /// Creates tools for drawing shapes on the map.
        /// </summary>
        /// <param name="map" type="Microsoft.Maps.Map">Map to add map to.</param>
        /// </signature>

        /// <signature>
        /// <summary>
        /// Creates tools for drawing shapes on the map.
        /// </summary>
        /// <param name="map" type="Microsoft.Maps.Map">Map to add map to.</param>
        /// <param name="options" type="Object(DrawingToolOptions)">{
        /// <para> showToolbar (Boolean), toolbarOptions (ToolbarOptions), pushpinOptions (PushpinOptions), shapeOptions (PolygonOptions), primaryDragHandleOptions (PushpinOptions), secondaryDragHandleOptions (PushpinOptions)</para>
        /// <para>}</para>
        /// </param>
        /// </signature>

        /****************************** 
        * Private Properties 
        *******************************/

        var shapeLayer = new Microsoft.Maps.EntityCollection(),
            edittingLayer = new Microsoft.Maps.EntityCollection(),
            currentShape,
            currentLocation,
            coordIdx,
            isDrawing = false,
            drawingMode = null,
            self = this,
            eventIds = [],
            editEventIds = [],
            toolbar,
            mapContainer = map.getRootElement(),
            numCirlceNodes = 36,
            ignoreOnce = false,
            numberRx = new RegExp('^[0-9]+$'),
            hexRx = new RegExp('^#?[A-Fa-f0-9]{6}$');

        //Default Options
        var _options = {
            /// <field type='DOMElement'>A reference to a DOM element where the toolbar should be loaded to.</field>
            toolbarContainer: null,
            /// <field type='Object(ToolbarOptions)'>Options that specify how the toolbar should be rendered.</field>
            toolbarOptions: {
                /// <field type='DrawingTools.DrawingMode[]'>A list of drawing modes to show in the toolbar. Icons will be ordered in the toolbar as they are in the array.
                /// <para>Supported Drawing modes: 'pushpin', 'polyline', 'polygon', 'circle', 'rectangle', 'erase', 'edit'</para>
                /// </field>
                drawingModes: ['pushpin', 'polyline', 'polygon', 'circle', 'rectangle', 'erase', 'edit'],
                /// <field type='DrawingTools.StyleTools[]'>A list of style options to display in the toolbar beside the drawing modes.
                /// <para>Supported Drawing modes: 'strokeThickness', 'strokeDashArray', 'strokeColor', 'fillColor'</para>
                /// </field>
                styleTools: ['strokeColor', 'fillColor', 'strokeThickness', 'strokeDashArray'],
                /// <field type='String[]'>Dash array values to be used for styling lines.</field>
                dashedArray: [null, '5,5', '5,10', '10,5', '10,10', '20,10,5,5,5,10', '15,10,5,10,15'],
                /// <field type='Boolean'>A boolean value that indicates if style flyouts should appear above the style buttons.</field>
                openFlyoutAbove: false
            },
            /// <field type='Object(PushpinOptons)'>Pushpin options. Defaults to Bing Maps options.</field>
            pushpinOptions: {},
            /// <field type='Object(PolygonOptions)'></field>
            shapeOptions: {
                strokeThickness: 3,
                strokeColor: new Microsoft.Maps.Color(150, 0, 255, 0),
                fillColor: new Microsoft.Maps.Color(150, 0, 0, 255)
            },
            /// <field type='Object(PushpinOptons)'>Options used to define what the primary drag handles should look like.</field>
            primaryDragHandleOptions: {
                typeName: 'drawingToolsPrimaryDragHandle',
                htmlContent: '<div></div>',
                draggable: true,
                anchor: new Microsoft.Maps.Point(0, 0),
                width: 14,
                height: 14
            },
            /// <field type='Object(PushpinOptons)'>Options used to define what the secondary drag handles, which are used to show midpoints on lines, should look like.</field>
            secondaryDragHandleOptions: {
                typeName: 'drawingToolsSecondaryDragHandle',
                htmlContent: '<div></div>',
                draggable: true,
                anchor: new Microsoft.Maps.Point(0, 0),
                width: 14,
                height: 14
            },
            /// <field type='Object'>An object that contains the event callbacks for the drawing tools.</field>
            events: {
                /// <field type='Function'>An event handler that is fired when the locations for a shape has been updated.</field>
                drawingChanged: null,
                /// <field type='Function'>An event handler that is fired when the locations for a shape are being updated. This event will fire constantly while dragging shape locations.</field>
                drawingChanging: null,
                /// <field type='Function'>An event handler that is fired when a shape is deleted.</field>
                drawingErased:null,
                /// <field type='Function'>An event handler that is fired when the the drawing mode changes.</field>
                drawingModeChanged: null,
                /// <field type='Function'>An event handler that is fired when the drawing of a shape is started.</field>
                drawingStarted: null,
                /// <field type='Function'>An event handler that is fired when the initial drawing of a shape is started.</field>
                drawingEnded: null
            }
        };

        var drawingModeToolTips = {
            pushpin: 'Add a pushpin',
            polyline: 'Draw a line or path on the map',
            polygon: 'Draw an area on the map',
            circle: 'Draw a circle on the map',
            rectangle: 'Draw a rectangle on the map',
            erase: 'Erase shapes',
            edit: 'Select shapes for to edit',
            strokeThickness: 'Change the thickness of lines',
            strokeColor: 'Change the stroke color of shapes',
            fillColor: 'Change the fill color of shapes',
            strokeDashArray: 'Change the dash style of lines'
        };

        /****************************** 
        * Constructor
        *******************************/

        function init() {
            map.entities.push(shapeLayer);
            map.entities.push(edittingLayer);

            setOptions(options);

            if (!toolbar) {
                createToolbar();
            }
        }

        /****************************** 
        * Public Methods
        *******************************/

        this.addCircle = function (center, radius, options) {
            /// <signature>
            /// <summary></summary>
            /// <param name='center' type='Microsoft.Maps.Location'></param>
            /// <param name='radius' type='Number'>The radius of the circle in kilometers.</param>
            /// </signature>

            /// <signature>
            /// <summary></summary>
            /// <param name='center' type='Microsoft.Maps.Location'></param>
            /// <param name='radius' type='Number'>The radius of the circle in kilometers.</param>
            /// <param name='options' type='Object(PolygonOptions)'></param>
            /// </signature>

            var locs = DrawingTools.MapMath.generateRegularPolygon(center, radius, DrawingTools.DistanceUnit.km, numCirlceNodes, 0);
            var circle = new Microsoft.Maps.Polygon(locs, options || _options.shapeOptions);

            circle.ShapeInfo = {
                type: 'circle',
                radius: radius,
                center: center
            };

            shapeLayer.push(circle);
        };

        this.addRectangle = function (northWest, southEast, options) {
            /// <signature>
            /// <summary></summary>
            /// <param name='northWest' type='Microsoft.Maps.Location'></param>
            /// <param name='southEast' type='Microsoft.Maps.Location'></param>
            /// </signature>

            /// <signature>
            /// <summary></summary>
            /// <param name='northWest' type='Microsoft.Maps.Location'></param>
            /// <param name='southEast' type='Microsoft.Maps.Location'></param>
            /// <param name='options' type='Object(PolygonOptions)'></param>
            /// </signature>

            var rect = new Microsoft.Maps.Polygon([
                northWest,
                new Microsoft.Maps.Location(northWest.latitude, southEast.longitude),
                southEast,
                Microsoft.Maps.Location(southEast.latitude, northWest.longitude),
                northWest
            ], options || _options.shapeOptions);

            rect.ShapeInfo = {
                type: 'rectangle'
            };

            shapeLayer.push(rect);
        };

        this.clear = function () {
            /// <summary>Removes all shapes from the drawing layer.</summary>
            edittingLayer.clear();
            shapeLayer.clear();
        };

        this.calculateVisualMidpoint = function (loc1, loc2) {
            /// <summary>Calculates the visual midpoint between two locations.</summary>
            /// <param name='loc1' type='Microsoft.Maps.Location'/>
            /// <param name='loc2' type='Microsoft.Maps.Location'/>
            /// <returns type='Microsoft.Maps.Location'/>
            var pixels = map.tryLocationToPixel([loc1, loc2]);
            var x2 = (pixels[0].x + pixels[1].x) / 2;
            var y2 = (pixels[0].y + pixels[1].y) / 2;

            return map.tryPixelToLocation(new Microsoft.Maps.Point(x2, y2));
        };

        this.getOptions = function () {
            /// <summary>Gets the options for the drawing tools.</summary>
            /// <returns type='Object(DrawingToolOptions)'></returns>
            return _options;
        };

        this.getShapeLayer = function () {
            /// <summary>Gets the base layer that the shapes are rendered on. Use this to add or retrieve shapes to the drawing layer.</summary>
            /// <returns type='Microsoft.Maps.EntityCollection'/>
            return shapeLayer;
        };

        this.getDrawingMode = function () {
            /// <summary>Gets the current drawing mode.</summary>
            /// <returns type='DrawingTools.DrawingMode'>Returns a drawing mode or null.</returns>
            return drawingMode;
        };

        this.setOptions = function (options) {
            /// <summary>Sets the drawing tool options.</summary>
            /// <param name='options' type='Object(DrawingToolOptions)'></param>
            setOptions(options);
        };

        this.setDrawingMode = function (mode) {
            /// <summary>Sets drawing mode and lets you start drawing. If the mode is set to null then the current drawing mode is completed.</summary>
            /// <param name='mode' type='DrawingTools.DrawingMode'></param>

            if (drawingMode != mode && _options.events.drawingModeChanged) {
                _options.events.drawingModeChanged(mode);
            }

            // End any previous drawing state 
            endDrawing();

            drawingMode = mode;

            setToolbarDrawingMode();

            if (drawingMode) {
                if (drawingMode == "erase") {
                    for (var i = 0; i < shapeLayer.getLength() ; i++) {
                        var s = shapeLayer.get(i);
                        eventIds.push(Microsoft.Maps.Events.addHandler(s, 'click', eraseShape));

                        eventIds.push(Microsoft.Maps.Events.addHandler(s, 'mouseover', function (e) {
                            mapContainer.style.cursor = 'default';
                        }));

                        eventIds.push(Microsoft.Maps.Events.addHandler(s, 'mouseout', function (e) {
                            mapContainer.style.cursor = 'pointer';
                        }));
                    }
                } else if (drawingMode == "edit") {
                    for (var i = 0; i < shapeLayer.getLength() ; i++) {
                        var s = shapeLayer.get(i);

                        //Make all pushpins draggable when in edit mode.
                        if (s.getIcon) {
                            s.setOptions({ draggable: true });

                            eventIds.push(Microsoft.Maps.Events.addHandler(s, 'drag', function (e) {
                                if (_options.events && _options.events.drawingChanging) {
                                    _options.events.drawingChanging(e.entity);
                                }
                            }));

                            eventIds.push(Microsoft.Maps.Events.addHandler(s, 'dragend', function (e) {
                                if (_options.events && _options.events.drawingChanged) {
                                    _options.events.drawingChanged(e.entity);
                                }
                            }));

                            eventIds.push(Microsoft.Maps.Events.addHandler(s, 'mouseover', function (e) {
                                mapContainer.style.cursor = 'move';
                            }));
                        } else {
                            //Edit all other shapes after they have been selected
                            eventIds.push(Microsoft.Maps.Events.addHandler(s, 'click', function (e) {
                                if (e.target) {
                                    currentShape = e.target;
                                    startEditting();
                                }
                            }));

                            eventIds.push(Microsoft.Maps.Events.addHandler(s, 'mouseover', function (e) {
                                mapContainer.style.cursor = 'default';
                            }));
                        }

                        eventIds.push(Microsoft.Maps.Events.addHandler(s, 'mouseout', function (e) {
                            mapContainer.style.cursor = 'pointer';
                        }));
                    }
                }
                else {
                    eventIds.push(Microsoft.Maps.Events.addHandler(map, 'mouseup', mapPointReleased));
                    eventIds.push(Microsoft.Maps.Events.addHandler(map, 'mousemove', mapPointerMoved));

                    //disable panning and zooming 
                    map.setOptions({ disablePanning: true, disableZooming: true });
                    mapContainer.style.cursor = 'default';
                }

                eventIds.push(Microsoft.Maps.Events.addHandler(map, 'keyup', function (e) {
                    //Stop drawing when ESC button pressed.
                    if (e.keyCode == '27') {
                        self.setDrawingMode(null);
                    }
                }));
            }
        };

        /****************** 
        * Private Methods 
        *******************/

        //Updates the default options with new options
        function setOptions(options) {
            _options = deepMerge(_options, options);

            for (attrname in options) {
                switch (attrname) {
                    case 'showToolbar':
                        if (toolbar) {
                            toolbar.style.display = (_options.showToolbar) ? '' : 'none';
                        }
                        break;
                    case 'toolbarOptions':
                        createToolbar();
                        break;
                    case 'shapeOptions':
                        if (currentShape && !currentShape.getIcon)
                        {
                            currentShape.setOptions(_options.shapeOptions);
                        }
                        break;
                }
            }
        }

        function endDrawing() {
            for (var i = 0; i < eventIds.length; i++) {
                Microsoft.Maps.Events.removeHandler(eventIds[i]);
            }

            eventIds = [];

            for (var i = 0; i < editEventIds.length; i++) {
                Microsoft.Maps.Events.removeHandler(editEventIds[i]);
            }

            editEventIds = [];
            edittingLayer.clear();

            if (currentShape && (drawingMode == 'polygon' || drawingMode == 'rectangle' || drawingMode == 'circle' || drawingMode == 'polyline')) {
                var locs = currentShape.getLocations();

                while (locs.length > coordIdx) {
                    locs.pop();
                }

                switch (drawingMode) {
                    case "polygon":
                    case "rectangle":
                    case "circle":
                        //Close the polygon 
                        locs.push(locs[0]);
                        break;
                }

                currentShape.setLocations(locs);

                if (_options.events && _options.events.drawingEnded &&
                    (drawingMode == 'polygon' || drawingMode == 'polyline')) {
                    _options.events.drawingEnded(currentShape);
                }
            }

            if (drawingMode == "edit") {
                for (var i = 0; i < shapeLayer.getLength() ; i++) {
                    var s = shapeLayer.get(i);

                    if (s.getIcon) { //Stop letting pushpins be draggable
                        s.setOptions({ draggable: false });
                    }
                }
            }

            //re-enable panning and zooming 
            map.setOptions({ disablePanning: false, disableZooming: false });

            currentShape = null;
            drawingMode = null;
            isDrawing = false;

            setToolbarDrawingMode();

            mapContainer.style.cursor = 'hand';
        }

        function mapPointReleased(e) {
            if (ignoreOnce) {
                ignoreOnce = false;
                return;
            }

            var point = new Microsoft.Maps.Point(e.getX(), e.getY());

            //Convert the point pixel to a Location coordinate 
            currentLocation = map.tryPixelToLocation(point);

            //Initialize drawing state 
            if (!isDrawing) {
                switch (drawingMode) {
                    case "pushpin":
                        isDrawing = true;
                        break;
                    case "polyline":
                        currentShape = new Microsoft.Maps.Polyline([currentLocation, currentLocation], _options.shapeOptions);
                        currentShape.ShapeInfo = {
                            type: 'polyline'
                        };
                        coordIdx = 0;
                        break;
                    case "polygon":
                        currentShape = new Microsoft.Maps.Polygon([currentLocation, currentLocation, currentLocation], _options.shapeOptions);
                        currentShape.ShapeInfo = {
                            type: 'polygon'
                        };
                        coordIdx = 0;
                        break;
                    case "rectangle":
                        currentShape = new Microsoft.Maps.Polygon([currentLocation, currentLocation, currentLocation, currentLocation], _options.shapeOptions);
                        currentShape.ShapeInfo = {
                            type: 'rectangle'
                        };
                        coordIdx = 4;
                        break;
                    case "circle":
                        var locs = DrawingTools.MapMath.generateRegularPolygon(currentLocation, 0, DrawingTools.DistanceUnit.km, numCirlceNodes, 0);
                        currentShape = new Microsoft.Maps.Polygon(locs, _options.shapeOptions);

                        currentShape.ShapeInfo = {
                            type: 'circle',
                            radius: 0,
                            center: currentLocation
                        };
                        coordIdx = numCirlceNodes;
                        break;
                    default:
                        break;
                }

                if (currentShape != null) {
                    shapeLayer.push(currentShape);
                    isDrawing = true;

                    if (_options.events && _options.events.drawingStarted) {
                        _options.events.drawingStarted(currentShape);
                    }
                }
            } else if (isDrawing && (drawingMode == 'rectangle' || drawingMode == 'circle')) {
                //Stop drawing rectangle
                isDrawing = false;
                if (_options.events && _options.events.drawingEnded) {
                    _options.events.drawingEnded(currentShape);
                }
            }

            //Continue drawing shape with each press 
            switch (drawingMode) {
                case "pushpin":
                    var pin = new Microsoft.Maps.Pushpin(currentLocation, _options.pushpinOptions);
                    pin.ShapeInfo = {
                        type: 'pushpin'
                    };
                    shapeLayer.push(pin);

                    if (_options.events && _options.events.drawingStarted) {
                        _options.events.drawingStarted(pin);
                    }

                    if (_options.events.drawingEnded) {
                        _options.events.drawingEnded(pin);
                    }
                    break;
                case "polyline":
                case "polygon":
                    var locs = currentShape.getLocations();

                    if (coordIdx < locs.length) {
                        locs[coordIdx] = currentLocation;
                    } else {
                        locs.push(currentLocation);
                    }

                    currentShape.setLocations(locs);
                    coordIdx++;

                    createPolyDragHandles();
                    break;
                default:
                    break;
            }
        }

        function mapPointerMoved(e) {
            if (isDrawing) {
                var point = new Microsoft.Maps.Point(e.getX(), e.getY());
                var tempLocation = map.tryPixelToLocation(point);

                switch (drawingMode) {
                    case "polyline":
                    case "polygon":
                        var locs = currentShape.getLocations();

                        //Update the last coordinate in shape to preview new point 
                        locs[coordIdx] = tempLocation;

                        currentShape.setLocations(locs);

                        if (_options.events && _options.events.drawingChanging) {
                            _options.events.drawingChanging(currentShape);
                        }
                        break;
                    case "rectangle":
                        var locs = currentShape.getLocations();

                        if (locs.length >= 4) {
                            var p = locs[0];
                            locs = [p];
                            locs.push(new Microsoft.Maps.Location(p.latitude, tempLocation.longitude));
                            locs.push(tempLocation);
                            locs.push(new Microsoft.Maps.Location(tempLocation.latitude, p.longitude));
                            locs.push(p);
                        }

                        currentShape.setLocations(locs);

                        if (_options.events && _options.events.drawingChanging) {
                            _options.events.drawingChanging(currentShape);
                        }
                        break;
                    case "circle":
                        currentShape.ShapeInfo.center = currentLocation;
                        currentShape.ShapeInfo.radius = DrawingTools.MapMath.haversineDistance(currentLocation, tempLocation, DrawingTools.DistanceUnit.km);
                        var locs = DrawingTools.MapMath.generateRegularPolygon(currentLocation, currentShape.ShapeInfo.radius, DrawingTools.DistanceUnit.km, numCirlceNodes, 0);
                        currentShape.setLocations(locs);

                        if (_options.events && _options.events.drawingChanging) {
                            _options.events.drawingChanging(currentShape);
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        function eraseShape(e) {
            if (e.target) {
                shapeLayer.remove(e.target);

                if (_options.events.drawingErased) {
                    _options.events.drawingErased(e.target);
                }
            }
        }

        function startEditting() {
            var type;

            if (currentShape.ShapeInfo && currentShape.ShapeInfo.type) {
                type = currentShape.ShapeInfo.type;
            } else if (currentShape.getFillColor) { //Shape is a polygon
                type = 'polygon';
            } else if (currentShape.getStroke) { //Shape is a polyline
                type = 'polyline';
            }

            if (!currentShape.ShapeInfo) {
                currentShape.ShapeInfo = {};
            }

            if (!currentShape.ShapeInfo.type) {
                currentShape.ShapeInfo.type = type;
            }

            switch (type) {
                case 'polyline':
                case 'polygon':
                    createPolyDragHandles();
                    break;
                case 'rectangle':
                    createRectangleDragHandles();
                    break;
                case 'circle':
                    createCircleDragHandles();
                    break;
                default:
                    self.setDrawingMode(null);
                    break;
            }
        }

        function createPolyDragHandles() {
            edittingLayer.clear();

            var locs = currentShape.getLocations();
            var len = locs.length;

            var numMidPoints = len;

            if (currentShape.ShapeInfo.type == 'polygon') {
                len--;
            } else {
                numMidPoints--;
            }

            for (var i = 0; i < len; i++) {
                //Create mid-point handles
                if (drawingMode == 'edit' && i < numMidPoints) {

                    var loc = self.calculateVisualMidpoint(locs[i], locs[i + 1]);

                    var dragPin2 = new Microsoft.Maps.Pushpin(loc, _options.secondaryDragHandleOptions);

                    dragPin2.EditInfo = {
                        locIdx: i,
                        dragPinType: 'secondary'
                    };
                    edittingLayer.push(dragPin2);

                    editEventIds.push(Microsoft.Maps.Events.addHandler(dragPin2, 'drag', function (e) {
                        if (e.entity.EditInfo) {
                            var locs = currentShape.getLocations();

                            if (e.entity.EditInfo.locIdx < locs.length && e.entity.EditInfo.locIdx >= 0) {
                                if (!e.entity.EditInfo.isAdded) {
                                    locs.splice(e.entity.EditInfo.locIdx + 1, 0, e.entity.getLocation());
                                    e.entity.EditInfo.isAdded = true;
                                } else if (e.entity.EditInfo.locIdx < locs.length - 1) {
                                    locs[e.entity.EditInfo.locIdx + 1] = e.entity.getLocation();
                                }

                                currentShape.setLocations(locs);

                                if (_options.events && _options.events.drawingChanging) {
                                    _options.events.drawingChanging(currentShape);
                                }
                            }
                        }
                    }));

                    editEventIds.push(Microsoft.Maps.Events.addHandler(dragPin2, 'dragend', function (e) {
                        startEditting();
                        if (_options.events && _options.events.drawingChanged) {
                            _options.events.drawingChanged(currentShape);
                        }
                    }));
                }

                var dragPin = new Microsoft.Maps.Pushpin(locs[i], _options.primaryDragHandleOptions);

                dragPin.EditInfo = {
                    locIdx: i,
                    dragPinType: 'primary'
                };
                edittingLayer.push(dragPin);

                editEventIds.push(Microsoft.Maps.Events.addHandler(dragPin, 'drag', function (e) {
                    if (e.entity.EditInfo && currentShape.ShapeInfo) {
                        var locs = currentShape.getLocations();

                        if (e.entity.EditInfo.locIdx < locs.length && e.entity.EditInfo.locIdx >= 0) {
                            if (e.entity.EditInfo.locIdx == 0 || e.entity.EditInfo.locIdx == locs.length - 1) {
                                locs[0] = e.entity.getLocation();
                                locs[locs.length - 1] = e.entity.getLocation();
                            } else {
                                locs[e.entity.EditInfo.locIdx] = e.entity.getLocation();
                            }

                            currentShape.setLocations(locs);

                            if (_options.events && _options.events.drawingChanging) {
                                _options.events.drawingChanging(currentShape);
                            }

                            ignoreOnce = true;
                        }
                    }
                }));

                editEventIds.push(Microsoft.Maps.Events.addHandler(dragPin, 'dragend', function (e) {
                    startEditting();

                    if (_options.events && _options.events.drawingChanged) {
                        _options.events.drawingChanged(currentShape);
                    }
                }));

                editEventIds.push(Microsoft.Maps.Events.addHandler(dragPin, 'dragstart', function (e) {
                    for (var i = 0; i < edittingLayer.getLength() ; i++) {
                        var s = edittingLayer.get(i);

                        if (s.EditInfo.dragPinType == 'secondary') {
                            edittingLayer.remove(s);
                        }
                    }
                }));
            }
        }

        function createRectangleDragHandles() {
            edittingLayer.clear();

            var locs = currentShape.getLocations();

            var cornerPin1 = new Microsoft.Maps.Pushpin(locs[0], _options.primaryDragHandleOptions);
            edittingLayer.push(cornerPin1);

            editEventIds.push(Microsoft.Maps.Events.addHandler(cornerPin1, 'drag', function (e) {
                var locs = currentShape.getLocations();
                locs[0] = e.entity.getLocation();

                if (locs.length == 5) {
                    locs[4] = locs[0];
                }

                locs[1] = new Microsoft.Maps.Location(locs[0].latitude, locs[2].longitude);
                locs[3] = new Microsoft.Maps.Location(locs[2].latitude, locs[0].longitude);
                currentShape.setLocations(locs);

                if (_options.events && _options.events.drawingChanging) {
                    _options.events.drawingChanging(currentShape);
                }
            }));

            editEventIds.push(Microsoft.Maps.Events.addHandler(cornerPin1, 'dragend', function (e) {
                if (_options.events && _options.events.drawingChanged) {
                    _options.events.drawingChanged(currentShape);
                }
            }));

            var cornerPin2 = new Microsoft.Maps.Pushpin(locs[2], _options.primaryDragHandleOptions);
            edittingLayer.push(cornerPin2);

            editEventIds.push(Microsoft.Maps.Events.addHandler(cornerPin2, 'drag', function (e) {
                var locs = currentShape.getLocations();
                locs[2] = e.entity.getLocation();
                locs[1] = new Microsoft.Maps.Location(locs[0].latitude, locs[2].longitude);
                locs[3] = new Microsoft.Maps.Location(locs[2].latitude, locs[0].longitude);
                currentShape.setLocations(locs);

                if (_options.events && _options.events.drawingChanging) {
                    _options.events.drawingChanging(currentShape);
                }
            }));

            editEventIds.push(Microsoft.Maps.Events.addHandler(cornerPin2, 'dragend', function (e) {
                if (_options.events && _options.events.drawingChanged) {
                    _options.events.drawingChanged(currentShape);
                }
            }));
        }

        function createCircleDragHandles() {
            edittingLayer.clear();

            if (currentShape.ShapeInfo.center && currentShape.ShapeInfo.radius != null) {
                var radiusHandleLoc = DrawingTools.MapMath.calculateCoord(currentShape.ShapeInfo.center, 90, currentShape.ShapeInfo.radius, DrawingTools.DistanceUnit.km);

                var dragRadiusPin = new Microsoft.Maps.Pushpin(radiusHandleLoc, _options.primaryDragHandleOptions);
                edittingLayer.push(dragRadiusPin);

                editEventIds.push(Microsoft.Maps.Events.addHandler(dragRadiusPin, 'drag', function (e) {
                    currentShape.ShapeInfo.radius = DrawingTools.MapMath.haversineDistance(currentShape.ShapeInfo.center, e.entity.getLocation(), DrawingTools.DistanceUnit.km);

                    var locs = DrawingTools.MapMath.generateRegularPolygon(currentShape.ShapeInfo.center, currentShape.ShapeInfo.radius, DrawingTools.DistanceUnit.km, numCirlceNodes, 0);
                    currentShape.setLocations(locs);

                    if (_options.events && _options.events.drawingChanging) {
                        _options.events.drawingChanging(currentShape);
                    }
                }));

                editEventIds.push(Microsoft.Maps.Events.addHandler(dragRadiusPin, 'dragend', function (e) {
                    if (_options.events && _options.events.drawingChanged) {
                        _options.events.drawingChanged(currentShape);
                    }
                }));

                var dragCenterPin = new Microsoft.Maps.Pushpin(currentShape.ShapeInfo.center, _options.primaryDragHandleOptions);

                dragCenterPin.EditInfo = {
                    radiusHandle: dragRadiusPin
                };
                edittingLayer.push(dragCenterPin);

                editEventIds.push(Microsoft.Maps.Events.addHandler(dragCenterPin, 'drag', function (e) {
                    var loc = e.entity.getLocation();
                    currentShape.ShapeInfo.center = loc;

                    var locs = DrawingTools.MapMath.generateRegularPolygon(loc, currentShape.ShapeInfo.radius, DrawingTools.DistanceUnit.km, numCirlceNodes, 0);
                    currentShape.setLocations(locs);

                    if (_options.events && _options.events.drawingChanging) {
                        _options.events.drawingChanging(currentShape);
                    }

                    if (dragCenterPin.EditInfo && dragCenterPin.EditInfo.radiusHandle) {
                        var radiusHandleLoc = DrawingTools.MapMath.calculateCoord(currentShape.ShapeInfo.center, 90, currentShape.ShapeInfo.radius, DrawingTools.DistanceUnit.km);
                        dragCenterPin.EditInfo.radiusHandle.setLocation(radiusHandleLoc);
                    }
                }));

                editEventIds.push(Microsoft.Maps.Events.addHandler(dragCenterPin, 'dragend', function (e) {
                    if (_options.events && _options.events.drawingChanged) {
                        _options.events.drawingChanged(currentShape);
                    }
                }));
            }
        }

        function deepMerge(obj1, obj2) {
            for (var p in obj2) {
                try {
                    // Property in destination object set; update its value.
                    if (obj2[p].constructor == Object && "undefined" != typeof (obj1[p])) {
                        obj1[p] = obj2[p];

                    } else {
                        obj1[p] = deepMerge(obj1[p], obj2[p]);

                    }

                } catch (e) {
                    // Property in destination object not set; create it and set its value.
                    obj1[p] = obj2[p];

                }
            }

            return obj1;
        }

        function createToolbar() {
            if (toolbar) {
                toolbar.parentNode.removeChild(toolbar);
                toolbar = null;
            }

            if (_options.toolbarContainer) {
                toolbar = document.createElement('div');
                toolbar.className = 'drawingToolsToolbar';

                if (_options.toolbarOptions && _options.toolbarOptions.drawingModes
                    && _options.toolbarOptions.drawingModes.length > 0) {
                    var modes = _options.toolbarOptions.drawingModes;

                    for (var i = 0; i < modes.length; i++) {
                        var btn = document.createElement('a');
                        btn.href = 'javascript:void(0);';

                        //btn.attributes.
                        btn.className = 'drawingToolsIcon drawingToolsIcon_' + modes[i];

                        var rel = document.createAttribute("rel");
                        rel.nodeValue = modes[i];
                        btn.attributes.setNamedItem(rel);

                        btn.title = drawingModeToolTips[modes[i]];

                        btn.addEventListener('click', function (e) {
                            rel = this.attributes.getNamedItem('rel').value;
                            var dm = drawingMode;
                            endDrawing();

                            if (dm != rel) {
                                self.setDrawingMode(rel);
                            }
                        });

                        toolbar.appendChild(btn);
                    }

                    var styleTools = [];

                    if (_options.toolbarOptions.styleTools && _options.toolbarOptions.styleTools.length > 0) {
                        styleTools = _options.toolbarOptions.styleTools;

                        for (var i = 0; i < styleTools.length; i++) {
                            var btn = document.createElement('a');
                            btn.href = 'javascript:void(0);';
                            btn.className = 'drawingToolsIcon drawingToolsIcon_' + styleTools[i];
                            btn.title = drawingModeToolTips[styleTools[i]];

                            var flyout = document.createElement('div');
                            flyout.className = 'drawingToolsFlyout';
                            flyout.style.display = 'none';

                            switch (styleTools[i]) {
                                case 'strokeThickness':
                                    if (_options.shapeOptions && _options.shapeOptions.strokeThickness) {
                                        for (var j = 1; j < 8; j++) {
                                            var svg = createSvgLine(j, null, function (l) {
                                                _options.shapeOptions.strokeThickness = parseInt(l.style.strokeWidth);

                                                if (currentShape && currentShape.getStrokeThickness) {
                                                    currentShape.setOptions({ strokeThickness: parseInt(l.style.strokeWidth) });
                                                }
                                            });

                                            if (_options.shapeOptions.strokeThickness == j) {
                                                svg.style.backgroundColor = '#26a0da';
                                            }

                                            flyout.appendChild(svg);
                                        }
                                    }
                                    break;
                                case 'fillColor':
                                    if (_options.shapeOptions && _options.shapeOptions.fillColor) {
                                        createColorPicker(flyout, _options.shapeOptions.fillColor, function (c) {
                                            _options.shapeOptions.fillColor = c;

                                            if (currentShape && currentShape.getFillColor) {
                                                currentShape.setOptions({ fillColor: c });
                                            }
                                        });
                                    }
                                    break;
                                case 'strokeColor':
                                    if (_options.shapeOptions && _options.shapeOptions.strokeColor) {
                                        createColorPicker(flyout, _options.shapeOptions.strokeColor, function (c) {
                                            _options.shapeOptions.strokeColor = c;

                                            if (currentShape && currentShape.getStrokeColor) {
                                                currentShape.setOptions({strokeColor: c});
                                            }
                                        });
                                    }
                                    break;
                                case 'strokeDashArray':
                                    if (_options.toolbarOptions && _options.toolbarOptions.dashedArray) {
                                        for (var j = 0; j < _options.toolbarOptions.dashedArray.length; j++) {
                                            var svg = createSvgLine(4, _options.toolbarOptions.dashedArray[j], function (l) {
                                                _options.shapeOptions.strokeDashArray = l.style.strokeDasharray;

                                                if (currentShape && currentShape.getStrokeDashArray) {
                                                    currentShape.setOptions({ strokeDashArray: l.style.strokeDasharray });
                                                }
                                            });

                                            if (_options.shapeOptions.strokeDashArray == _options.toolbarOptions.dashedArray[j]) {
                                                svg.style.backgroundColor = '#26a0da';
                                            }

                                            flyout.appendChild(svg);
                                        }
                                    }
                                    break;
                            }

                            btn.flyout = flyout;
                            toolbar.appendChild(flyout);

                            btn.addEventListener('click', function (e) {
                                if (this.flyout.style.display == '') {
                                    this.flyout.style.display = 'none';
                                } else {
                                    setToolbarDrawingMode();
                                    if (_options.toolbarOptions.openFlyoutAbove) {
                                        this.flyout.style.top = this.offsetTop - 140 + 'px';
                                    } else {
                                        this.flyout.style.top = this.offsetTop + 30 + 'px';
                                    }
                                    this.flyout.style.left = this.offsetLeft + 'px';
                                    this.flyout.style.display = '';
                                }
                            });

                            toolbar.appendChild(btn);
                        }
                    }
                }

                toolbarContainer.appendChild(toolbar);
            }
        }

        function setToolbarDrawingMode() {
            if (toolbar && toolbar.childNodes) {
                //remove all active buttons styles
                for (var i = 0; i < toolbar.childNodes.length; i++) {
                    var child = toolbar.childNodes[i];
                    var rel = child.attributes.getNamedItem('rel');

                    if (rel && rel.value) {
                        if (rel.value == drawingMode) {
                            toolbar.childNodes[i].classList.add('drawingToolsIcon_' + rel.value + '_active');
                        } else {
                            toolbar.childNodes[i].classList.remove('drawingToolsIcon_' + rel.value + '_active');
                        }
                    } else if (child.className == 'drawingToolsFlyout') {
                        child.style.display = 'none';
                    }
                }
            }
        }

        function createSvgLine(strokeWidth, dashArray, callback) {
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            var w = document.createAttribute("width");
            w.nodeValue = 150;
            svg.attributes.setNamedItem(w);

            var h = document.createAttribute("height");
            h.nodeValue = 14;
            svg.attributes.setNamedItem(h);

            var cl = document.createAttribute("class");
            cl.nodeValue = 'drawingToolsFlyout_line';
            svg.attributes.setNamedItem(cl);

            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.style.stroke = '#000';
            line.style.strokeWidth = strokeWidth;
            line.style.strokeDasharray = dashArray;
            line.setAttribute('x1', 10);
            line.setAttribute('y1', 7);
            line.setAttribute('x2', 140);
            line.setAttribute('y2', 7);

            svg.addEventListener('click', function (e) {
                var f = this.parentNode;

                for (var j = 0; j < f.childNodes.length; j++) {
                    f.childNodes[j].style.backgroundColor = '';
                }

                this.style.backgroundColor = '#26a0da';

                f.style.display = 'none';
                callback(this.firstChild);
            });

            svg.appendChild(line);

            return svg;
        }

        function createColorPicker(flyout, color, callback) {
            var colors = ['#fefe33', '#fb9902', '#ff0000', '#ff0066', '#8601af', '#000066', '#0000ff', '#0392ce', '#00ff00', '#006600', '#000000', '#ffffff'];

            var hexTbx = document.createElement('input');
            hexTbx.type = 'text';
            hexTbx.value = color.toHex();
            hexTbx.style.width = '60px';

            var alphaTbx = document.createElement('input');
            alphaTbx.type = 'text';
            alphaTbx.value = color.a;
            alphaTbx.style.width = '60px';

            for (var i = 0; i < colors.length; i++) {
                var btn = document.createElement('a');
                btn.className = "drawingToolsColor";
                btn.style.backgroundColor = colors[i];
                btn.rel = colors[i]
                btn.addEventListener('click', function (e) {
                    hexTbx.value = this.rel;
                });
                flyout.appendChild(btn);
            }

            var txt = document.createElement('span');
            txt.innerText = 'Color:';
            flyout.appendChild(txt);
            flyout.appendChild(hexTbx);

            var txt2 = document.createElement('span');
            txt2.innerText = 'Alpha:';
            flyout.appendChild(txt2);
            flyout.appendChild(alphaTbx);

            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = 'Select';
            btn.style.margin = '5px 0px 0px 23px';
            btn.style.width = '100px';
            btn.addEventListener('click', function (e) {
                if (!alphaTbx.value || alphaTbx.value == '' || !alphaTbx.value.match(numberRx)) {
                    alphaTbx.value = 150;
                }

                if (!hexTbx.value.match(hexRx)) {
                    hexTbx.value = color.toHex();
                }

                if (callback) {
                    var c = Microsoft.Maps.Color.fromHex(hexTbx.value);
                    var a = parseInt(alphaTbx.value);

                    if (a > 255) {
                        a = 255;
                        alphaTbx.value = 255;
                    }

                    c.a = a;
                    callback(c);
                }

                flyout.style.display = 'none';
            });

            flyout.appendChild(btn);
        }

        init();
    },


    /****************************** 
    * Static Methods 
    *******************************/

    /// <field>A set of spatial mathematic tools for use with the DrawingTools module.</field>
    MapMath: {
        areLocationsEqual: function (loc1, loc2) {
            /// <summary>Checks to see if two location objects are equal at an accuracy of 5 decimal places.</summary>
            /// <param name='loc1' type='Microsoft.Maps.Location'/>
            /// <param name='loc2' type='Microsoft.Maps.Location'/>
            /// <returns type='Boolean'/>
            return Math.round(loc1.latitude * 10000) == Math.round(loc2.latitude * 10000) &&
                Math.round(loc1.longitude * 10000) == Math.round(loc2.longitude * 10000);
        },
        degToRad: function (angle) {
            /// <summary>Converts an angle in radians to degress.</summary>
            /// <param name='angle' type='Number'>Angle in radians.</param>
            /// <returns type='Number'>Angle in degress.</returns>
            return angle * Math.PI / 180;
        },
        radToDeg: function (angle) {
            /// <summary>Converts an angle in degress to radians.</summary>
            /// <param name='angle' type='Number'>Angle in degrees.</param>
            /// <returns type='Number'>Angle in radians.</returns>
            return angle * 180 / Math.PI;
        },
        /// <field>A set of spatial constants.</field>
        constants: {
            EARTH_RADIUS_METERS: 6378100,
            EARTH_RADIUS_KM: 6378.1,
            EARTH_RADIUS_MILES: 3963.1676,
            EARTH_RADIUS_FEET: 20925524.9,
        },
        convertDistance: function (distance, from, to) {
            /// <summary>Converts a distance value from one distance unit to another.</summary>
            /// <param name='distance' type='Number'></param>
            /// <param name='from' type='DrawingTools.DistanceUnit'>The distance unit to convert from.</param>
            /// <param name='to' type='DrawingTools.DistanceUnit'>The distance unit to convert to.</param>
            /// <returns type='Number'/>

            //Convert the distance to kilometers
            switch (from) {
                case DrawingTools.DistanceUnit.meters:
                    distance /= 1000;
                    break;
                case DrawingTools.DistanceUnit.feet:
                    distance /= 3288.839895;
                    break;
                case DrawingTools.DistanceUnit.miles:
                    distance *= 1.609344;
                    break;
                case DrawingTools.DistanceUnit.yards:
                    distance *= 0.0009144;
                    break;
                case DrawingTools.DistanceUnit.km:
                    break;
            }

            //Convert from kilometers to output distance unit
            switch (to) {
                case DrawingTools.DistanceUnit.meters:
                    distance *= 1000;
                    break;
                case DrawingTools.DistanceUnit.feet:
                    distance *= 5280;
                    break;
                case DrawingTools.DistanceUnit.miles:
                    distance /= 1.609344;
                    break;
                case DrawingTools.DistanceUnit.yards:
                    distance *= 1093.6133;
                    break;
                case DrawingTools.DistanceUnit.km:
                    break;
            }

            return distance;
        },
        getEarthRadius: function (distanceUnits) {
            /// <summary>Gets the earths radius for the specified distance units.</summary>
            /// <param name='distanceUnits' type='DrawingTools.DistanceUnit'>The distance unit to get the earth radius for.</param>
            /// <returns type='Number'/>

            switch (distanceUnits) {
                case DrawingTools.DistanceUnit.km:
                    return DrawingTools.MapMath.constants.EARTH_RADIUS_KM;
                case DrawingTools.DistanceUnit.meters:
                    return DrawingTools.MapMath.constants.EARTH_RADIUS_METERS;
                case DrawingTools.DistanceUnit.feet:
                    return DrawingTools.MapMath.constants.EARTH_RADIUS_FEET;
                case DrawingTools.DistanceUnit.miles:
                    return DrawingTools.MapMath.constants.EARTH_RADIUS_MILES;
                case DrawingTools.DistanceUnit.yards:
                    return DrawingTools.MapMath.constants.EARTH_RADIUS_KM * 1093.6133;
                    break;
            }
        },
        calculateCoord: function (origin, brng, arcLength, distanceUnits) {
            /// <summary>Calcualtes a destination coordinate based on a starting location, bearing, and distance along the curvature of the earth.</summary>
            /// <param name='origin' type='Microsoft.Maps.Location'/>
            /// <param name='brng' type='Number'>The bearing from the orgin coordinate to the destination coordinate.</param>
            /// <param name='arcLength' type='Number'>The distance the destination coordinate is from the origin.</param>
            /// <param name='distanceUnits' type='DrawingTools.DistanceUnit'>The distance unit that the arcLength is in.</param>
            /// <returns type='Number'/>

            var earthRadius = DrawingTools.MapMath.getEarthRadius(distanceUnits);

            var lat1 = DrawingTools.MapMath.degToRad(origin.latitude),
            lon1 = DrawingTools.MapMath.degToRad(origin.longitude),
            centralAngle = arcLength / earthRadius;

            var lat2 = Math.asin(Math.sin(lat1) * Math.cos(centralAngle) + Math.cos(lat1) * Math.sin(centralAngle) * Math.cos(DrawingTools.MapMath.degToRad(brng)));
            var lon2 = lon1 + Math.atan2(Math.sin(DrawingTools.MapMath.degToRad(brng)) * Math.sin(centralAngle) * Math.cos(lat1), Math.cos(centralAngle) - Math.sin(lat1) * Math.sin(lat2));

            return new Microsoft.Maps.Location(DrawingTools.MapMath.radToDeg(lat2), DrawingTools.MapMath.radToDeg(lon2));
        },
        generateRegularPolygon: function (centerPoint, radius, distanceUnits, numberOfPoints, offset) {
            /// <summary>Calcualtes a points that make up a regular polygon. This method is often used with a lot of points to approximate the shape of a circle.</summary>
            /// <param name='centerPoint' type='Microsoft.Maps.Location'/>
            /// <param name='radius' type='Number'>Radius distance from the center to each data point.</param>
            /// <param name='distanceUnits' type='DrawingTools.DistanceUnit'>The distance units that the radius is in.</param>
            /// <param name='radius' type='Number'>The number of data points to create the polygon.</param>
            /// <param name='offset' type='Number'>An angle in degrees to rotate the polygon by.</param>
            /// <returns type='Microsoft.Maps.Location[]'>An array of location coordinates that can be used to create a polygon</returns>

            var points = [],
            centralAngle = 360 / numberOfPoints;

            for (var i = 0; i <= numberOfPoints; i++) {
                points.push(DrawingTools.MapMath.calculateCoord(centerPoint, (i * centralAngle + offset) % 360, radius, distanceUnits));
            }

            return points;
        },
        haversineDistance: function (loc1, loc2, distanceUnits) {
            /// <summary>Calcualtes the shorest distance between two locations on the curvature of the earth.</summary>
            /// <param name='loc1' type='Microsoft.Maps.Location'/>
            /// <param name='loc2' type='Microsoft.Maps.Location'/>
            /// <param name='distanceUnits' type='DrawingTools.DistanceUnit'>The distance units to return distance in.</param>
            /// <returns type='Number'>The distance between two points in the specified distance units.</returns>

            if (loc1 && loc2) {
                var lat1 = DrawingTools.MapMath.degToRad(loc1.latitude),
                lon1 = DrawingTools.MapMath.degToRad(loc1.longitude),
                lat2 = DrawingTools.MapMath.degToRad(loc2.latitude),
                lon2 = DrawingTools.MapMath.degToRad(loc2.longitude);

                var dLat = lat2 - lat1,
                dLon = lon2 - lon1,
                cordLength = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dLon / 2), 2),
                centralAngle = 2 * Math.atan2(Math.sqrt(cordLength), Math.sqrt(1 - cordLength));

                var earthRadius = DrawingTools.MapMath.getEarthRadius(distanceUnits);
                return earthRadius * centralAngle;
            }

            return 0;
        }
    }
};

//Call the Module Loaded method
Microsoft.Maps.moduleLoaded('DrawingToolsModule');