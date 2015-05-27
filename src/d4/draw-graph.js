var d3 = require('d3');

var drawVertices = require('./draw-vertices');

var drawGraph = function (root) {
  d3.json("/graph/vertices"), function(err, result) {
    if (err) {
      console.log("ERROR retrieving vertices!", err);
    } else {
      var vertices = result.vertices;

      drawVertices(vertices);
    }
  })
};

module.exports = drawGraph;
