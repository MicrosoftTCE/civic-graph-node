var d3 = require('d3');

var preFillLocation = function (input, locationsHash) {
  console.log("Running preFillLocation with", input);

  if (input.toLowerCase() in locationsHash) {
    d3.selectAll('#location').text(
      function(d) { this.value = locationsHash[input][0].location; }
    );
  }
}

module.exports = preFillLocation;
