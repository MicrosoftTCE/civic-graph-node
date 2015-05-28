var textDisplay = require('./text-display');

var editDisplayTmpl = require("jade!../templates/edit-display.jade");

var handleNodeHover = function (node) {
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

  window.civicStore.lines.funding
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        return (node === link.source || node === link.target) ? 1 : 0.05;
      }
    );

  window.civicStore.lines.investment
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        return (node === link.source || node === link.target) ? 1 : 0.05;
      }
    );

  window.civicStore.lines.collaboration
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        return (node === link.source || node === link.target) ? 1 : 0.05;
      }
    );

  window.civicStore.lines.data
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

  window.civicStore.edges.funding.forEach(function(link) {
    console.log("Running forEach on funding connections with link = ", link);
    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.investment.forEach(function(link) {
    console.log("Running forEach on investment connections with link = ", link);
    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.collaboration.forEach(function(link) {
    console.log("Running forEach on collaboration connections with link = ", link);
    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.data.forEach(function(link) {
    console.log("Running forEach on data connections with link = ", link);
    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  d3.select(this).style("stroke", "rgba(0,0,0,0.6)");

  window.d3RootElem
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
};

module.exports = handleNodeHover;
