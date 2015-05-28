var d3 = require('d3');

var utils = require('../utilities');

var preFillLocation = function (input) {
  console.log("Running preFillLocation with", input);

  var locationHash = utils.getLocationHash();
  var key = input.toLowerCase();

  if (key in locationHash) {
    d3.selectAll('#location').text(
      function(d) { this.value = locationsHash[key][0].location; }
    );
  }
}

module.exports = preFillLocation;
