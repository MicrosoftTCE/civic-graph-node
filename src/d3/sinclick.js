var d3 = require('d3');

var handleClickNodeHover = require('./handle-click-node-hover');
var u                     = require('../utilities');

var sinclick = function (node) {
  u.clearResetFlag = 0;

  handleClickNodeHover(node);

  window.civicStore.lines.funding
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(link) {
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
        if (node === link.source || node === link.target) {
          return "1";
        } else {
          return "0.05";
        }
      }
    );

  window.d3Node
    .style(
      "stroke",
      function(singleNode) {
        if (singleNode !== node) {
          return "white";
        } else {
          return "black";
        }
      }
    ).on('mouseout', null);

  window.d3Node
    .filter(
      function(singleNode) {
        if (singleNode !== node) { return singleNode; }
      }
    )
    .on('mouseover', null);

  var neighborFund = window.civicStore.edges.funding
    .filter(
      function(link) {
        return link.source.index === node.index ||
          link.target.index === node.index;
      }
    )
    .map(
      function(link) {
        return link.source.index === node.index ?
          link.target.index :
          link.source.index;
      }
    );

  var neighborInvest = window.civicStore.edges.investment
    .filter(
      function(link) {
        return link.source.index === node.index ||
          link.target.index === node.index;
      }
    )
    .map(
      function(link) {
        return link.source.index === node.index ?
        link.target.index :
        link.source.index;
      }
    );

  var neighborPorucs = window.civicStore.edges.collaboration
    .filter(
      function(link) {
        return link.source.index === node.index ||
        link.target.index === node.index;
      }
    )
    .map(
      function(link) {
        return link.source.index === node.index ?
        link.target.index :
        link.source.index;
      }
    );

  var neighborData = window.civicStore.edges.data
    .filter(
      function(link) {
        return link.source.index === node.index ||
        link.target.index === node.index;
      }
    )
    .map(
      function(link) {
        return link.source.index === node.index ? link.target.index : link.source.index;
      }
    );

  window.svg
    .selectAll('.node')
    .transition()
    .duration(350)
    .delay(0)
    .style(
      "opacity",
      function(l) {
        return (
          neighborFund.indexOf(l.index) > -1 ||
          neighborInvest.indexOf(l.index) > -1 ||
          neighborPorucs.indexOf(l.index) > -1 ||
          neighborData.indexOf(l.index) > -1 || l === node
        ) ? 1 : 0.05;
      }
    ).select('text').style('opacity', 1);


  window.d3Node
    .filter(
      function(l) {
        return (
          neighborFund.indexOf(l.index) > -1 ||
          neighborInvest.indexOf(l.index) > -1 ||
          neighborPorucs.indexOf(l.index) > -1 ||
          neighborData.indexOf(l.index) > -1 || l === node
        );
      }
    )
    .on('mouseover', handleClickNodeHover)
    .on('click', function(l) {});

};

module.exports = sinclick;
