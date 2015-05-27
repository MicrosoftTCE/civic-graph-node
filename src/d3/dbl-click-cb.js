var d3 = require('d3');
var _  = require('lodash');

var dblClickCb = function(allNodes, connections, tick) {

  return function(d) {
    console.log("Running dblClick with d =", d);

    d3.select(this).classed("fixed", function(d) { d.fixed = false; });

    d3.select(this).on('mousedown.drag', null);

    var dblclickobject = (d3.select(this).data())[0];

    var svgWidth = parseInt(
      svg.style("width").substring(0, ((svg.style("width")).length + 1) / 2)
    );

    var svgHeight = parseInt(
      svg.style("height").substring(0, ((svg.style("height")).length + 1) / 2)
    );

    var halfSVGWidth = parseInt(svgWidth / 2);
    var halfSVGHeight = parseInt(svgHeight / 2);

    var multiplierX = svgWidth / width;
    var multiplierY = svgHeight / height;

    var scaledDX = multiplierX * d.x;
    var scaledDY = multiplierY * d.y;

    var centeredNode = _.merge({}, d);

    // Half viewbox...
    centeredNode.x = width / 2 - 10;
    centeredNode.y = height / 2 - 60;

    var force = d3.layout.force()
      .nodes(allNodes)
      .size([width, height])
      .links(connections)
      .linkStrength(0)
      .charge(function(d) {
        if (d.render === 1) {
          if (d.employees !== null) {
            return -6 * empScale(d.employees);
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
  }
}

module.exports = dblClickCb;
