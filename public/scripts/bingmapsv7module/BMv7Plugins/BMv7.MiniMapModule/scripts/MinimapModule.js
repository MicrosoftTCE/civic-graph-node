/// <reference path="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0">
/// <reference path="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.6.2-vsdoc.js">

// currently the module only handles a single minimap for a single map
function MinimapModule(map, credentials, atStart) {
    var module = this;
    this.ParentMap = null;
    this.Minimap = null;
    this.MinimapViewHandlerId = null;
    this.MapViewHandlerId = null;
    this.MinimapPolygonOptions = {
        strokeColor: new Microsoft.Maps.Color(128, 0, 0, 255),
        strokeThickness: 1,
        fillColor: new Microsoft.Maps.Color(128, 200, 200, 255)
    };

    // when the main map moves, update the display
    this.UpdateMinimap = function () {
        if (!module.Minimap) {
            return;
        }
        var bounds = module.ParentMap.getBounds();

        // set the map view to contain it
        module.Minimap.setView({ bounds: bounds, padding: 20 });

        // make a rectangle with the corners
        var nw = bounds.getNorthwest();
        var se = bounds.getSoutheast();
        var ne = new Microsoft.Maps.Location(se.latitude, nw.longitude);
        var sw = new Microsoft.Maps.Location(nw.latitude, se.longitude);
        var corners = [nw, ne, se, sw, nw];
        var rect = new Microsoft.Maps.Polygon(corners, module.MinimapPolygonOptions);

        // display the rectangle
        module.Minimap.entities.clear();
        module.Minimap.entities.push(rect);
    };

    // update the parent map when the user moves the minimap view
    this.UpdateMapFromMinimap = function (e) {
        if (!module.Minimap) {
            return;
        }
        module.ParentMap.setView({ center: module.Minimap.getCenter() });
    };


    this.Initialize = function (map, atStart) {
        $("head").append('<link type="text/css" rel="Stylesheet" href="MinimapModule.css" />');

        module.ParentMap = map;
        module.MapViewHandlerId = Microsoft.Maps.Events.addHandler(module.ParentMap,
            "viewchangeend", module.UpdateMinimap);
        var container = $('<div class="minimap-container"/>')
            .appendTo($(map.getRootElement()).parent())
            .hide();

        // show button
        var opener = $('<div class="minimap-glyph minimap-glyph-show">&laquo;</>')
            .appendTo($(map.getRootElement()).parent())
            .click(function () {
                container.show();
                module.Minimap = new Microsoft.Maps.Map(container[0], {
                    credentials: credentials,
                    mapTypeId: Microsoft.Maps.MapTypeId.road,
                    showDashboard: false,
                    showCopyright: false,
                    showScalebar: false,
                    showLogo: false, // undocumented but it works
                    disableZooming: true,
                    fixedMapPosition: true
                });
                module.MinimapViewHandlerId = Microsoft.Maps.Events.addHandler(module.Minimap, "viewchangeend", module.UpdateMapFromMinimap);
                module.UpdateMinimap();
                $(this).hide();
            });

        // hide button
        var closer = $('<div class="minimap-glyph minimap-glyph-hide">&raquo;</>')
            .appendTo(container)
            .click(function () {
                Microsoft.Maps.Events.removeHandler(module.MinimapViewHandlerId);
                module.MinimapViewHandlerId = null;
                module.Minimap.dispose();
                module.Minimap = null;
                container.hide();
                opener.show();
            });

        if (atStart) {
            opener.click();
        }
    };

    this.Initialize(map, credentials, atStart);
}

Microsoft.Maps.moduleLoaded('MinimapModule');