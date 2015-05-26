var handleAdjNodeClick = function (
  node,
  fundLink,
  investLink,
  porucsLink,
  dataLink,
  fundingConnections,
  investmentConnections,
  collaborationConnections,
  dataConnections
) {
  console.log("Running handleAdjNodeClick with node =", node);

  fundLink.style("opacity", function(l) {
    if (node === l.source || node === l.target) {
      return "1";
    } else {
      return "0.05";
    }
  });

  investLink.style("opacity", function(l) {
    if (node === l.source || node === l.target) {
      return "1";
    } else {
      return "0.05";
    }
  });

  porucsLink.style("opacity", function(l) {
    if (node === l.source || node === l.target) {
      return "1";
    } else {
      return "0.05";
    }
  });

  dataLink.style("opacity", function(l) {
    if (node === l.source || node === l.target) {
      return "1";
    } else {
      return "0.05";
    }
  });

  var isLinkTarget = function(link, node) {
    console.log("Running isLinkTarget with link, node =", link, node);
    return link.target.index === node.index;
  }

  var isLinkSource = function(link, node) {
    console.log("Running isLinkSource with link, node =", link, node);
    return link.source.index === node.index;
  }

  var neighboringNodesIndices = {};

  neighboringNodesIndices[d.ID] = 1;

  fundingConnections.forEach(function(link) {
    console.log("Running forEach on fundingConnections with link = ", link);
    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  investmentConnections.forEach(function(link) {
    console.log("Running forEach on investmentConnections with link = ", link);
    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  collaborationConnections.forEach(function(link) {
    console.log("Running forEach on collaborationConnections with link = ", link);
    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  dataConnections.forEach(function(link) {
    console.log("Running forEach on dataConnections with link = ", link);
    if (isLinkSource(link, node)) {
      neighboringNodesIndices[link.target.index] = 1;
    }

    if (isLinkTarget(link, node)) {
      neighboringNodesIndices[link.source.index] = 1;
    }
  });

  svg.selectAll('.node').style("opacity", function(n) {
    console.log("Running opacity on .node with n = ", n);
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

  node.filter(function(singleNode) {
    console.log("Running filter on node with singleNode = ", singleNode);
      if (singleNode !== node) {
        return singleNode;
      }
    })
    .style("stroke", "white")
    .on('mouseover', null)
    .on('mouseout', null)
    .on('click', null);

  node
    .filter(function(link) {
      console.log("Running filter on node with l = ", l);
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

