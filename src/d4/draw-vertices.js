var d3 = require('d3');

var u = require('../utilities');

var drawVertices = function (vertices) {
  var network = d3.select('#network');
  var width   = network.attr('width');
  var height  = network.attr('height');

  var force = d3
    .layout
    .force()
    .nodes(vertices)
    .size([width, height])
    .links(window.connections)
    .linkStrength(0)
    .charge(function(vertex) {
      if (vertex.employees) {
        return -6 * u.employeeScale(vertex.employees);
      } else {
        return -25;
      }
    })
    .linkDistance(50);
};

module.exports = drawVertices;
