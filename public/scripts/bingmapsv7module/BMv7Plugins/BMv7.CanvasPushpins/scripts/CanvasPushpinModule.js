/***************************************************************
* Canvas Pushpin Module
*
* Author: Ricky Brundritt
* Website: http://rbrundritt.wordpress.com
* Date: Feb 7th, 2013
* 
* This module creates two classes; CanvasLayer and CanvasPushpin 
* The CanvasLayer will render a CanvasPushpin when it is added 
* to the layer. 
*
* The CanvasPushpin creates a custom HTML pushpin that contains 
* an HTML5 canvas. This class takes in two properties; a location 
* and a callback function that renders the HTML5 canvas.
*
*
* Classes:
* --------
* 
* CanvasLayer 
*
* An EntityCollection modified to render Canvas pushpins after 
* then have been added to the collection.
*
*   Usage: 
*
*   var canvasLayer = new CanvasLayer();
*   map.entities.push(canvasLayer);
*
* CanvasPushpin 
*
* A custom pushpin that exposes a HTML5 Canvas element. 
*
*   Usage: 
*
*   var pin = new CanvasPushpin(location, function(pin, context){
*       //Logic that renders the data on the canvas
*   });
*   canvasLayer.push(pin);
*
****************************************************************/

var CanvasLayer, CanvasPushpin;

(function () {
    var canvasIdNumber = 0;

    function generateUniqueID() {
        var canvasID = 'canvasElm' + canvasIdNumber;
        canvasIdNumber++;

        if (window[canvasID]) {
            return generateUniqueID();
        }

        return canvasID;
    }

    function getCanvas(canvasID) {
        var c = document.getElementById(canvasID);

        if (c) {
            c = c.getContext("2d");
        }

        return c;
    }

    //The canvas layer will render a CanvasPushpin when it is added to the layer. 
    CanvasLayer = function (map) {
        var canvasLayer = new Microsoft.Maps.EntityCollection();
        Microsoft.Maps.Events.addHandler(canvasLayer, 'entityadded', function (e) {
            if (e.entity._canvasID) {
                e.entity._renderCanvas();
            }
        });
        Microsoft.Maps.Events.addHandler(map, 'viewchangeend', function (e) {
            var cnt = canvasLayer.getLength(), pin;
            for (var i = 0; i < cnt; i++) {
                pin = canvasLayer.get(i);
                pin._renderCanvas();
            }
        });
        return canvasLayer;
    };

    CanvasPushpin = function (location, renderCallback) {
        var canvasID = generateUniqueID();

        var pinOptions = {
            htmlContent: '<canvas id="' + canvasID + '"></canvas>'
        };

        var pin = new Microsoft.Maps.Pushpin(location, pinOptions);

        pin._canvasID = canvasID;

        pin._renderCanvas = function () {
            renderCallback(pin, getCanvas(pin._canvasID));
        };

        return pin;
    };
})();

// Call the Module Loaded method
Microsoft.Maps.moduleLoaded('CanvasPushpinModule');