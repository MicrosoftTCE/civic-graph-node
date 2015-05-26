var textDisplay = require('./text-display');

var editDisplayTmpl = require("jade!../templates/edit-display.jade");

var handleNodeHoverCb = function (
  fundLink,
  investLink,
  porucsLink,
  dataLink,
  fundingConnections,
  investmentConnections,
  collaborationConnections,
  dataConnections
) {
  return function (node) {
    console.log("Running handleNodeHover with node = ", node);

    var s = textDisplay(node);

    //  Printing to side panel within web application.
    webform = editDisplayTmpl(node);

    // For editing the data displayed within the side panel.
    d3
      .select('#edit')
      .html(webform);

    d3
      .select('#info')
      .html(s)
      .style('list-style', 'square');

    fundLink
      .transition()
      .duration(350)
      .delay(0)
      .style(
        "opacity",
        function(link) {
          return (node === link.source || node === link.target) ? 1 : 0.05;
        }
      );

    investLink
      .transition()
      .duration(350)
      .delay(0)
      .style(
        "opacity",
        function(link) {
          return (node === link.source || node === link.target) ? 1 : 0.05;
        }
      );

    porucsLink
      .transition()
      .duration(350)
      .delay(0)
      .style(
        "opacity",
        function(link) {
          return (node === link.source || node === link.target) ? 1 : 0.05;
        }
      );

    dataLink
      .transition()
      .duration(350)
      .delay(0)
      .style(
        "opacity",
        function(link) {
          return (node === link.source || node === link.target) ? 1 : 0.05;
        }
      );

    var isLinkTarget = function(link, node) {
      return link.target.index === node.index;
    }

    var isLinkSource = function(link, node) {
      return link.source.index === node.index;
    }

    var neighboringNodesIndices = {};

    neighboringNodesIndices[node.id] = 1;

    fundingConnections.forEach(function(link) {
      console.log("Running forEach on fundingConnections with link = ", link);
      if (isLinkSource(link, d)) {
        neighboringNodesIndices[link.target.index] = 1;
      }

      if (isLinkTarget(link, d)) {
        neighboringNodesIndices[link.source.index] = 1;
      }
    });

    investmentConnections.forEach(function(link) {
      console.log("Running forEach on investmentConnections with link = ", link);
      if (isLinkSource(link, d)) {
        neighboringNodesIndices[link.target.index] = 1;
      }

      if (isLinkTarget(link, d)) {
        neighboringNodesIndices[link.source.index] = 1;
      }
    });

    collaborationConnections.forEach(function(link) {
      console.log("Running forEach on collaborationConnections with link = ", link);
      if (isLinkSource(link, d)) {
        neighboringNodesIndices[link.target.index] = 1;
      }

      if (isLinkTarget(link, d)) {
        neighboringNodesIndices[link.source.index] = 1;
      }
    });

    dataConnections.forEach(function(link) {
      console.log("Running forEach on dataConnections with link = ", link);
      if (isLinkSource(link, d)) {
        neighboringNodesIndices[link.target.index] = 1;
      }

      if (isLinkTarget(link, d)) {
        neighboringNodesIndices[link.source.index] = 1;
      }
    });

    d3.select(this).style("stroke", "rgba(0,0,0,0.6)");

    svg
      .selectAll('.node')
      .transition()
      .duration(350)
      .delay(0)
      .style("opacity", function(n) {
        if (n.ID in neighboringNodesIndices) {
          return "1";
        } else {
          return "0.05";
        }
      }).select('text')
      .style('opacity', 1);

    d3
      .select(this.parentNode)
      .select("text")
      .transition()
      .duration(350)
      .delay(0)
      .style("opacity", 1)
      .style("font-weight", "bold");
  }
};

module.exports = handleNodeHoverCb;
