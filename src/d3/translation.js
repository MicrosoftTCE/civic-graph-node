var d3 = require('d3');

var translation = function(x, y) {
  console.log("Running translation with x, y =", x, y);

  return 'translate(' + x + ',' + y + ')';
};

module.exports = translation;
