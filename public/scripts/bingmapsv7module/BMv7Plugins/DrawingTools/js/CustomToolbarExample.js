/// <reference path="/Scripts/BMJS/Microsoft.Maps-vsdoc.js"/>
/// <reference path="/js/DrawingToolsModule/DrawingToolsModule.js"/>

(function () {
    var map, drawingTools;

    function initialize() {
        if (Microsoft.Maps.ClientRegion) {
            // If ClientRegion exists then the map is in a WinJS app.
            Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: GetMap });
        } else { 
            GetMap(); 
        } 

        //Add click events to drawing buttons. 
        $(".drawingBtns > button").click(function () {
            //Check to see if this toogle button is on 
            if ($(this).hasClass("toogleOn")) {
                drawingTools.setDrawingMode(null);
            } else {
                //Get drawing mode 
                var drawMode = $(this).attr("rel");
                drawingTools.setDrawingMode(drawMode);
            }
        });

        //Create color sliders 
        $("#red, #green, #blue, #alpha").slider({
            orientation: "horizontal",
            range: "min",
            max: 255,
            value: 0,
            slide: colorChanged,
            change: colorChanged
        });

        $("#red").slider("value", 0);
        $("#green").slider("value", 255);
        $("#blue").slider("value", 0);
        $("#alpha").slider("value", 150);

        //Create line width slider 
        $("#lineWidth").slider({
            orientation: "horizontal",
            min: 1,
            max: 25,
            value: 0,
            slide: lineWidthChanged,
            change: lineWidthChanged
        });

        $("#lineWidth").slider("value", 5);

        $("#clearBtn").click(function () {
            drawingTools.clear();

            //Toogle off all buttons 
            $(".drawingBtns > button").removeClass("toogleOn");
        });
    }

    function colorChanged(e, ui) {
        var r = $("#red").slider("value"),
            g = $("#green").slider("value"),
            b = $("#blue").slider("value"),
            a = $("#alpha").slider("value");

        var color = new Microsoft.Maps.Color(a, r, g, b);

        if (drawingTools) {
            drawingTools.setOptions({ shapeOptions: { fillColor: color } });
        }

        $("#swatch").css("background-color", "#" + color.toHex());
        $("#" + $(this).attr("rel")).html(ui.value);
    }

    function lineWidthChanged(e, ui) {
        if (drawingTools) {
            drawingTools.setOptions({ shapeOptions: { strokeThickness: ui.value } });
        }

        $("#lwLabel").html(ui.value);
    }

    function GetMap() {
        map = new Microsoft.Maps.Map(document.getElementById("myMap"), {
            credentials: "YOUR_BING_MAPS_KEY",
            zoom: 2
        });

        //Register and load the Drawing Tools Module
        Microsoft.Maps.registerModule("DrawingToolsModule", "js/DrawingToolsModule/DrawingToolsModule.js");

        Microsoft.Maps.loadModule("DrawingToolsModule", {
            callback: function () {
                drawingTools = new DrawingTools.DrawingManager(map, {
                    shapeOptions: {
                        fillColor: new Microsoft.Maps.Color(150, 0, 255, 0),
                        strokeThickness: 5
                    },
                    primaryDragHandleOptions: {
                        typeName: 'customPrimaryDragHandle',
                        htmlContent: '<div></div>',
                        draggable: true,
                        anchor: new Microsoft.Maps.Point(0, 0),
                        width: 14,
                        height: 14
                    },
                    secondaryDragHandleOptions: {
                        typeName: 'customSecondaryDragHandle',
                        htmlContent: '<div></div>',
                        draggable: true,
                        anchor: new Microsoft.Maps.Point(0, 0),
                        width: 14,
                        height: 14
                    },
                    events: {
                        drawingModeChanged: function (mode) {
                            //Toogle off all buttons 
                            $(".drawingBtns > button").removeClass("toogleOn");

                            if (mode) {
                                $(".drawingBtns > button").each(function (i, val) {
                                    var drawMode = $(val).attr("rel");
                                    if (mode == drawMode) {
                                        //Toogle on this button 
                                        $(val).addClass("toogleOn");
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", initialize, false);
})();


