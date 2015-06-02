var d3 = require('d3');
var $  = require('jquery');

var utils = require('../utilities');

var preFillLocation = require('./pre-fill-location');

var locationTmpl = require("../templates/location.hbs");

var addInputLocations = function (idx) {
  if ($('#location-' + idx + ' input[name="location"]').val() !== "") {
    d3.select('#location-' + idx + ' input[name="location"]').on(
      'keyup',
      function () {
        preFillLocation(this.value, utils.getLocationHash());
      }
    );

    idx++;

    $("#location-" + (idx - 1)).after(locationTmpl({ idx: idx }));

    d3.select("#location-" + idx +  " input[name='location']").on(
      "keyup",
      function() {
        addInputLocations(idx);
      }
    );
  }
};

module.exports = addInputLocations;
