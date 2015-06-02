var d3 = require('d3');

var sinclick = require('./sinclick');
var handleNodeHover = require('./handle-node-hover');

var offNode = function offNode(node) {
  if (window.d3Node) {
    window.d3Node
      .style("stroke", "white")
      .on('mouseover',handleNodeHover)
      .on('mouseout', offNode)
      .on('click', sinclick);
  }

  window.civicStore.lines.funding
    .transition()
    .duration(350)
    .delay(0)
    .style("stroke", "rgb(111,93,168)") // lavender
    .style("opacity", "0.2")
    .style("stroke-width", "1px");

  // window.civicStore.lines.investment
  //   .transition()
  //   .duration(350)
  //   .delay(0)
  //   .style("stroke", "rgb(38,114,114)") // teal
  //   .style("opacity", "0.2")
  //   .style("stroke-width", "1px");

  window.civicStore.lines.collaboration
    .transition()
    .duration(350)
    .delay(0)
    .style("stroke", "rgb(235,232,38)") // yellow
    .style("opacity", "0.2")
    .style("stroke-width", "1px");

  window.civicStore.lines.data
    .transition()
    .duration(350)
    .delay(0)
    .style("stroke", "rgb(191,72,150)") // pink
    .style("opacity", "0.2")
    .style("stroke-width", "1px");

  d3
    .selectAll('.node')
    .transition()
    .duration(350)
    .delay(0)
    .style("opacity", "1");

  d3
    .selectAll('.node')
    .selectAll('text')
    .transition()
    .duration(350)
    .delay(0)
    .style(
      'opacity',
      function(entity) {
        var textOpacity;

        // TODO: switch statement?
        if (entity.entity_type === "For-Profit") {
          textOpacity = (window.fiveMostConnectedForProfit.hasOwnProperty(entity.name)) ? 1 : 0;
        }

        if (entity.entity_type === "Non-Profit") {
          textOpacity = (window.fiveMostConnectedNonProfit.hasOwnProperty(entity.name)) ? 1 : 0;
        }

        if (entity.entity_type === "Individual") {
          textOpacity = (window.fiveMostConnectedIndividuals.hasOwnProperty(entity.name)) ? 1 : 0;
        }

        if (entity.entity_type === "Government") {
          textOpacity = (window.fiveMostConnectedGovernment.hasOwnProperty(entity.name)) ? 1 : 0;
        }

        return textOpacity;
      }
    )
    .style('font-size', '14px')
    .style('font-weight', 'normal');
};

module.exports = offNode;
