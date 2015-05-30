var d3 = require('d3');

var transformText = function(d) {
  return "translate(" + d.x + "," + d.y + ")";
};

module.exports = transformText;
