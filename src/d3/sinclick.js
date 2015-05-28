var d3 = require('d3');

var handleClickNodeHover = require('./handle-click-node-hover');

var sinclick = function (node) {
  console.log("Running sinclick with node = ", node);

  var clearResetFlag = 0;

  handleClickNodeHover(node);

  window.civicStore.lines.funding
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        console.log("Setting opacity on funding line = ", link);
        if (node === link.source || node === link.target) {
          return "1";
        } else {
          return "0.05";
        }
      }
    );

  window.civicStore.lines.investment
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        console.log("Setting opacity on investment line = ", link);
        if (node === link.source || node === link.target) {
          return "1";
        } else {
          return "0.05";
        }
      }
    );

  window.civicStore.lines.collaboration
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        console.log("Setting opacity on collaboration line = ", link);
        if (node === link.source || node === link.target) {
          return "1";
        } else {
          return "0.05";
        }
      }
    );

  window.civicStore.lines.data
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
        console.log("Setting opacity on data line = ", link);
        if (node === link.source || node === link.target) {
          return "1";
        } else {
          return "0.05";
        }
      }
    );

  node
    .style(
      "stroke",
      function(singleNode) {
        console.log("Setting stroke on singleNode = ", singleNode);
        if (singleNode !== node) {
          return "white";
        } else {
          return "black";
        }
      }
    ).on('mouseout', null);

  node
    .filter(
      function(singleNode) {
        console.log("Running filter on node singleNode = ", singleNode);
        if (singleNode !== node) { return singleNode; }
      }
    )
    .on('mouseover', null);

  var neighborFund = window.civicStore.edges.funding
    .filter(
      function(link) {
        console.log("Running filter on funding_connections link = ", link);
        return link.source.index === node.index ||
          link.target.index === node.index;
      }
    )
    .map(
      function(link) {
        console.log("Mapping funding_connections link = ", link);
        return link.source.index === node.index ?
          link.target.index :
          link.source.index;
      }
    );
  console.log("Set neighborFund to ", neighborFund);

  var neighborInvest = window.civicStore.edges.investment
    .filter(
      function(link) {
        console.log("Running filter on investment_connections link = ", link);
        return link.source.index === node.index ||
          link.target.index === node.index;
      }
    )
    .map(
      function(link) {
        console.log("Mapping investment_connections link = ", link);
        return link.source.index === node.index ?
        link.target.index :
        link.source.index;
      }
    );
  console.log("Set neighborInvest to ", neighborInvest);

  var neighborPorucs = window.civicStore.edges.collaboration
    .filter(
      function(link) {
        console.log("Running filter on collaboration_connections link = ", link);
        return link.source.index === node.index ||
        link.target.index === node.index;
      }
    )
    .map(
      function(link) {
        console.log("Mapping collaboration_connections link = ", link);
        return link.source.index === node.index ?
        link.target.index :
        link.source.index;
      }
    );
  console.log("Set neighborPorucs to ", neighborPorucs);

  var neighborData = window.civicStore.edges.data
    .filter(
      function(link) {
        console.log("Running filter on data_connections link = ", link);
        return link.source.index === node.index ||
        link.target.index === node.index;
      }
    )
    .map(
      function(link) {
        console.log("Mapping data_connections link = ", link);
        return link.source.index === node.index ? link.target.index : link.source.index;
      }
    );
  console.log("Set neighborData to ", neighborData);

  window.d3RootElem
    .selectAll('.node')
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(l) {
        console.log("Setting opacity on .node to l = " + l);
        return (
          neighborFund.indexOf(l.index) > -1 ||
          neighborInvest.indexOf(l.index) > -1 ||
          neighborPorucs.indexOf(l.index) > -1 ||
          neighborData.indexOf(l.index) > -1 || l === d
        ) ? 1 : 0.05;
      }
    ).select('text').style('opacity', 1);


  node
    .filter(
      function(l) {
        console.log("Running filter on node with l = " + l);
        return (
          neighborFund.indexOf(l.index) > -1 ||
          neighborInvest.indexOf(l.index) > -1 ||
          neighborPorucs.indexOf(l.index) > -1 ||
          neighborData.indexOf(l.index) > -1 || l === d
        );
      }
    )
    .on('mouseover', handleClickNodeHover)
    .on('click', function(l) {});

};

module.exports = sinclick;
