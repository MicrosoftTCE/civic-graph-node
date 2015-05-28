var d3 = require('d3');
var $  = require('jquery');

var utils = require('../utilities');

var preFillLocation = require('./pre-fill-location');

var locationTmpl = require("jade!../templates/location.jade");

var addInputLocations = function (idx) {
  console.log("Running addInputLocations with idx = " + idx);

  if ($('#location-' + idx + ' input[name="location"]').val() !== "") {
    d3.select('#location-' + idx + ' input[name="location"]').on(
      'keyup',
      function () {
        console.log("Running onKeyup with idx = " + idx);

        preFillLocation(this.value, utils.getLocationHash());
      }
    );

    idx++;

    $("#location-" + (idx - 1)).after(locationTmpl({ idx: idx }));

    d3.select("#location-" + idx +  " input[name='location']").on(
      "keyup",
      function() {
        console.log("Running location onKeyup with idx = " + idx);

        addInputLocations(idx);
      }
    );
  }
};

module.exports = addInputLocations;
