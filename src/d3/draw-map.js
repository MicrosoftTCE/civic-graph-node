var d3 = require("d3");

var loadD3Layer = require("./load-d3-layer")

var drawMap = function () {
  var width  = 960;
  var height = 500;

  var wmap = d3
    .select(".content")
    .append("div")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "map");


  var map = new Microsoft.Maps.Map(document.getElementById('map'), {
    credentials: 'Ah_CBBU6s6tupk_v45WVz46zMfevFT5Lkt9vpmwqV5LedzE221Kfridd7khQxD8M',
    center: new Microsoft.Maps.Location(25, -30),
    zoom: 3,
    mapTypeId: Microsoft.Maps.MapTypeId.road
  });

  Microsoft.Maps.registerModule("D3OverlayModule", "./scripts/D3OverlayManager.js");

  Microsoft.Maps.loadModule("D3OverlayModule", {
    callback: function() {
      loadD3Layer(map);
    }
  });

  d3.select(self.frameElement).style("height", height + "px");
}

module.exports = drawMap;
