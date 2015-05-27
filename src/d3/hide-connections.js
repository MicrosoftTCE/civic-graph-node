var d3 = require('d3');

var hideConnections = function(selector) {
  console.log("Running hideConnections with selector = ", selector);

  d3.selectAll(selector).style(
    "visibility",
    function(link) { return "hidden"; }
  );
};

module.exports = hideConnections;
