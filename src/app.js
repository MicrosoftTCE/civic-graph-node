var d3    = require('d3');
var _     = require('underscore');
var $     = require('jquery');
var utils = require('./utilities');

require('./scripts/mapcontrol');

require('./styles/reset.css');
require('./styles/normalize.css');
require('./styles/metro-bootstrap.css');
require('./styles/metro-bootstrap-responsive.css');
require('./styles/iconFont.min.css');
require('./styles/font-awesome/css/font-awesome.css');
require('./styles/style.css');
require('./styles/herograph.css');
require('./styles/checkboxes.css');
require('./styles/footer.css');
require('./styles/left-nav.css');
require('./styles/developer-style.css');

d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};

d3.selection.prototype.moveToBack = function() {
  return this.each(function() {
    var firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};

d3.selectAll('#cb_networkview').on('click', function() {
  if (document.getElementById('cb_networkview').checked) {
    drawGraph();
    var map = document.getElementById('map');
    map.parentNode.removeChild(map);
  }
});

d3.selectAll('#cb_mapview').on('click', function() {
  if (document.getElementById('cb_mapview').checked) {
    console.log("asd");
    var network = document.getElementById('network');
    network.parentNode.removeChild(network);
    drawMap();
  }
});

var drawGraph = require('./d3/draw-graph');
var drawMap = require('./d3/draw-map');
var loadD3Layer = require('./d3/load-d3-layer');

var currentView = utils.getQueryParams()['view'];

// TODO: set checkboxes on document ready
var mapView     = document.getElementById('cb_mapview');
var networkView = document.getElementById('cb_networkview');

if (currentView == 'map') {
  drawMap();
  if (mapView && networkView) {
    mapView.checked = true;
    networkView.checked = false;
  }
} else {
  drawGraph();
  if (mapView && networkView) {
    mapView.checked = false;
    networkView.checked = true;
  }
}
