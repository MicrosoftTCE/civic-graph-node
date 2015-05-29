var textDisplay = require('./text-display');

var editDisplayTmpl = require("jade!../templates/edit-display.jade");

var handleNodeHover = function () {
  console.log("Running handleNodeHover with node = ", window.d3Node);

  var s = textDisplay(window.d3Node);

  //  Printing to side panel within web application.
  console.log("Calling editDisplayTmpl with ", window.d3Node);
  webform = editDisplayTmpl(window.d3Node);

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
        return (window.d3Node === link.source || window.d3Node === link.target) ? 1 : 0.05;
      }
    );

  window.civicStore.lines.investment
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        return (window.d3Node === link.source || window.d3Node === link.target) ? 1 : 0.05;
      }
    );

  window.civicStore.lines.collaboration
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        return (window.d3Node === link.source || window.d3Node === link.target) ? 1 : 0.05;
      }
    );

  window.civicStore.lines.data
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        return (window.d3Node === link.source || window.d3Node === link.target) ? 1 : 0.05;
      }
    );

  var isLinkTarget = function(link, node) {
    return link.target.index === node.index;
  }

  var isLinkSource = function(link, node) {
    return link.source.index === node.index;
  }

  var neighboringNodesIndices = {};

  neighboringNodesIndices[window.d3Node.id] = 1;

  window.civicStore.edges.funding.forEach(function(link) {
    // console.log("Running forEach on funding connections with link = ", link);

    if (isLinkSource(link, window.d3Node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, window.d3Node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.investment.forEach(function(link) {
    // console.log("Running forEach on investment connections with link = ", link);

    if (isLinkSource(link, window.d3Node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, window.d3Node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.collaboration.forEach(function(link) {
    // console.log("Running forEach on collaboration connections with link = ", link);

    if (isLinkSource(link, window.d3Node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, window.d3Node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.data.forEach(function(link) {
    // console.log("Running forEach on data connections with link = ", link);

    if (isLinkSource(link, window.d3Node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, window.d3Node)) {
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
