var d3 = require('d3');

var hideConnections = function(selector) {
  d3.selectAll(selector).style(
    "visibility",
    function(link) { return "hidden"; }
  );
};

module.exports = hideConnections;
