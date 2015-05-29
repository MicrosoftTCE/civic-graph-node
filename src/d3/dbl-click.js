var d3 = require('d3');
var _  = require('lodash');

var tick = require('./tick');

var u = require('../utilities');

var dblClick = function(d) {
  console.log("Running dblClick with d =", d);

  d3.select(this).classed("fixed", function(d) { d.fixed = false; });

  d3.select(this).on('mousedown.drag', null);

  var dblclickobject = (d3.select(this).data())[0];

  var svgWidth = parseInt(
    window.d3RootElem.style("width").substring(0, ((window.d3RootElem.style("width")).length + 1) / 2)
  );

  var svgHeight = parseInt(
    window.d3RootElem.style("height").substring(0, ((window.d3RootElem.style("height")).length + 1) / 2)
  );

  var halfSVGWidth = parseInt(svgWidth / 2);
  var halfSVGHeight = parseInt(svgHeight / 2);

  var multiplierX = svgWidth / window.width;
  var multiplierY = svgHeight / window.height;

  var scaledDX = multiplierX * d.x;
  var scaledDY = multiplierY * d.y;

  window.centeredNode = _.cloneDeep(d);

  // Half viewbox...
  window.centeredNode.x = window.width / 2 - 10;
  window.centeredNode.y = window.height / 2 - 60;

  var force = d3.layout.force()
    .nodes(_.values(window.civicStore.vertices))
    .size([window.width, window.height])
    .links(window.connections)
    .linkStrength(0)
    .charge(function(d) {
      if (d.render === 1) {
        if (d.employees !== null) {
          return -6 * u.employeeScale(d.employees);
        } else {
          return -25;
        }
      } else {
        return 0;
      }
    })
    .linkDistance(50)
    .on("tick", tick)
    .start();
};

module.exports = dblClick;
