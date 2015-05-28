var d3 = require('d3');
var _  = require('lodash');

var drawVertices = require('./draw-vertices');

var drawGraph = function (root) {
  var vertices = _.values(window.civicStore.vertices)

  console.log("vertices", vertices);

  drawVertices(vertices);
};

module.exports = drawGraph;
