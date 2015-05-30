var d3 = require('d3');
var $  = require('jquery');

var locTmpl = require("../templates/loc.hbs");

var addInputLoc = function (idx) {
  if ($('#location-' + idx + ' input[name="location"]').val() !== "") {
    d3.select('#location-' + idx + ' input[name="location"]').on(
      'keyup',
      null
    );

    idx++;

    $("#location-" + (idx - 1)).after(locTmpl({ idx: idx }));

    d3.select("#location-" + idx +  " input[name='location']").on(
      "keyup",
      function() {
        addInputLoc(idx);
      }
    );
  }
};

module.exports = addInputLoc;
