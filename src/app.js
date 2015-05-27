var d3    = require('d3');
var _     = require('underscore');
var $     = require('jquery');
var utils = require('./utilities');

// var fs = require('fs');
// require('d3-geo-projection');
require('topojson');
require('devbridge-autocomplete');
require('queue-async');
require('d3-tip');

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
  console.log("Running moveToFront");
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};

d3.selection.prototype.moveToBack = function() {
  console.log("Running moveToBack");
  return this.each(function() {
    var firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};

d3.selectAll('#cb_networkview').on('click', function() {
  console.log("Running cb_networkview click handler");
  if (document.getElementById('cb_networkview').checked) {
    drawGraph();
    var map = document.getElementById('map');
    map.parentNode.removeChild(map);
  }
});

d3.selectAll('#cb_mapview').on('click', function() {
  console.log("Running cb_mapview click handler");
  if (document.getElementById('cb_mapview').checked) {
    console.log("asd");
    var network = document.getElementById('network');
    network.parentNode.removeChild(network);
    drawMap();
  }
});

// var drawEntityGraph = require('./d4/draw-entity-graph');
var drawGraph = require('./d3/draw-graph');
var drawMap = require('./d3/draw-map');
var loadD3Layer = require('./d3/load-d3-layer');

// drawEntityGraph();

var currentView = utils.getQueryParams()['view'];

// TODO: set checkboxes on document ready
var mapView     = document.getElementById('cb_mapview');
var networkView = document.getElementById('cb_networkview');

if (currentView == 'map') {
  console.log("currentView == map; calling drawMap");
  drawMap();
  if (mapView && networkView) {
    mapView.checked = true;
    networkView.checked = false;
  }
} else {
  console.log("currentView == network; calling drawGraph");
  drawGraph();
  if (mapView && networkView) {
    mapView.checked = false;
    networkView.checked = true;
  }
}
