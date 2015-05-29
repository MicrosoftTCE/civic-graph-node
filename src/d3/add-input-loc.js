var d3 = require('d3');
var $  = require('jquery');

var locTmpl = require("../templates/loc.hbs");

var addInputLoc = function (idx) {
  console.log("Running addInputLoc with idx = " + idx);

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
        console.log("Running loc onKeyup with idx = " + idx);

        addInputLoc(idx);
      }
    );
  }
};

module.exports = addInputLoc;
