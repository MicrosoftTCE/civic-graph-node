var textDisplay = require('./text-display');

var editDisplayTmpl = require("../templates/edit-display.hbs");

var handleNodeHover = function (d) {
  var s = textDisplay(d);

  //  Printing to side panel within web application.
  webform = editDisplayTmpl(d);

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
        return (d === link.source || d === link.target) ? 1 : 0.05;
      }
    );

  window.civicStore.lines.investment
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        return (d === link.source || d === link.target) ? 1 : 0.05;
      }
    );

  window.civicStore.lines.collaboration
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        return (d === link.source || d === link.target) ? 1 : 0.05;
      }
    );

  window.civicStore.lines.data
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        return (d === link.source || d === link.target) ? 1 : 0.05;
      }
    );

  var isLinkTarget = function(link, node) {
    return link.target.index === node.index;
  }

  var isLinkSource = function(link, node) {
    return link.source.index === node.index;
  }

  var neighboringNodesIndices = {};

  neighboringNodesIndices[d.id] = 1;

  window.civicStore.edges.funding.forEach(function(link) {

    if (isLinkSource(link, d)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, d)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.investment.forEach(function(link) {

    if (isLinkSource(link, d)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, d)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.collaboration.forEach(function(link) {

    if (isLinkSource(link, d)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, d)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.data.forEach(function(link) {

    if (isLinkSource(link, d)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, d)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  d3.select(this).style("stroke", "rgba(0,0,0,0.6)");

  window.svg
    .selectAll('.node')
    .transition()
    .duration(350)
    .delay(0)
    .style("opacity", function(n) {
      if (n.id in neighboringNodesIndices) {
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
