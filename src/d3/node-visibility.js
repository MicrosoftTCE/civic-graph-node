var d3 = require('d3');

var nodeVisibility = function(type, visibility) {
  d3
    .selectAll(".node").filter(
      function(target) { if (target.entity_type === type) { return this; } }
    )
    .style("visibility", visibility);
};

module.exports = nodeVisibility;
