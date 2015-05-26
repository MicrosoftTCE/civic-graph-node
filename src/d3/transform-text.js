var d3 = require('d3');

var transformText = function(d) {
  console.log("Running transformText with d =", d);

  return "translate(" + d.x + "," + d.y + ")";
};

module.exports = transformText;
