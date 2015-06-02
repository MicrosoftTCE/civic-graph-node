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

var d3    = require('d3');
var _     = require('lodash');
var $     = require('jquery');

var utils = require('./utilities');

// var fs = require('fs');
// require('d3-geo-projection');
require('topojson');
var queue = require('queue-async');
var tip = require('d3-tip');


// TEMP
// var formATmpl = require('jade!./templates/form-a.jade');
// var formBTmpl = require('jade!./templates/form-b.jade');
// var formCTmpl = require('jade!./templates/form-c.jade');

// $('.example').html(formATmpl());

// TEMP


function hideSideBar(className){
    var elements = document.getElementsByClassName(className);
    elements[0].style.visibility = "hidden";
}

function showSideBar(className){
    var elements = document.getElementsByClassName(className);
    elements[0].style.visibility = "visible";

}

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
            if(document.getElementById('network')) {
                $('#network').fadeIn("slow");
            }
            else {
                drawGraph();
            }
            $('#map').fadeOut("slow");
            $('.d3-tip').hide();
            showSideBar("example");
        }
});

d3.selectAll('#cb_mapview').on('click', function() {
  console.log("Running cb_mapview click handler");

   if (document.getElementById('cb_mapview').checked) {
            if(document.getElementById('map')) {
                $('#map').fadeIn("slow");
                $('.d3-tip').show();
            }
            else {
                drawMap();
            }
            $('#network').fadeOut("slow");
            hideSideBar("example");
        }
});

// var drawEntityGraph = require('./d4/draw-entity-graph');
var drawGraph = require('./d3/draw-graph');
var drawMap = require('./d3/draw-map');
var loadD3Layer = require('./d3/load-d3-layer');

var currentView = utils.getQueryParams()['view'];

// TODO: set checkboxes on document ready
var mapView     = $('#cb_mapview');
var networkView = $('#cb_networkview');

if (currentView == 'map') {
  console.log("currentView == map; calling drawMap");

  drawMap();

  if (mapView && networkView) {
    mapView.checked = true;
    networkView.checked = false;
  }
  hideSideBar("example");
} else {
  console.log("currentView == network; calling drawGraph");

  drawGraph();

  if (mapView && networkView) {
    mapView.checked = false;
    networkView.checked = true;
  }
  showSideBar("example");
}
