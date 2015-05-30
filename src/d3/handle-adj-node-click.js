var handleClickNodeHover = require('./handle-click-node-hover');

var handleAdjNodeClick = function (node) {
  window.civicStore.lines.funding.style("opacity", function(link) {
    if (node === link.source || node === link.target) {
      return "1";
    } else {
      return "0.05";
    }
  });

  window.civicStore.lines.investment.style("opacity", function(link) {
    if (node === link.source || node === link.target) {
      return "1";
    } else {
      return "0.05";
    }
  });

  window.civicStore.lines.collaboration.style("opacity", function(link) {
    if (node === link.source || node === link.target) {
      return "1";
    } else {
      return "0.05";
    }
  });

  window.civicStore.lines.data.style("opacity", function(link) {
    if (node === link.source || node === link.target) {
      return "1";
    } else {
      return "0.05";
    }
  });

  var isLinkTarget = function(link, node) {
    return link.target.index === node.index;
  }

  var isLinkSource = function(link, node) {
    return link.source.index === node.index;
  }

  var neighboringNodesIndices = {};

  neighboringNodesIndices[d.ID] = 1;

  window.civicStore.edges.funding.forEach(function(link) {

    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.investment.forEach(function(link) {
    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.collaboration.forEach(function(link) {

    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.civicStore.edges.data.forEach(function(link) {

    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  window.svg.selectAll('.node').style("opacity", function(n) {
    if (n.ID in neighboringNodesIndices) {
      return "1";
    } else {
      return "0.05";
    }
  });

  d3
    .select(this)
    .style("stroke", "black")
    .on('mouseout', null);

  node
    .filter(function(singleNode) {
      if (singleNode !== node) {
        return singleNode;
      }
    })
    .style("stroke", "white")
    .on('mouseover', null)
    .on('mouseout', null)
    .on('click', null);

  var neighborFund;
  var neighborInvest;
  var neighborPorucs;
  var neighborData;

  node
    .filter(function(link) {
      return (
        neighborFund.indexOf(link.index) > -1 ||
        neighborInvest.indexOf(link.index) > -1 ||
        neighborPorucs.indexOf(link.index) > -1 ||
        neighborData.indexOf(link.index) > -1 ||
        link === node
      );
    })
    .on('mouseover', handleClickNodeHover)
    .on('click', sinclick);
};

module.exports = handleAdjNodeClick;

