var d3 = require('d3');

var nodeVisibility = function(type, visibility) {
  console.log("Running nodeVisibility with type, visibility =", type, visibility);

  d3
    .selectAll(".node").filter(
      function(target) { if (target.type === type) { return this; } }
    )
    .style("visibility", visibility);
};

module.exports = nodeVisibility;
