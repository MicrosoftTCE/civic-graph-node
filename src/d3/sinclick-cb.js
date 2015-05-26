var d3 = require('d3');

var handleClickNodeHover = require('./handle-click-node-hover');

var sinclickCb = function (
  fundLink,
  investLink,
  porucsLink,
  dataLink,
  graph
) {
  return function (node) {
    console.log("Running sinclick with node = ", node);

    var clearResetFlag = 0;

    handleClickNodeHover(node);

    fundLink
      .transition()
      .duration(350)
      .delay(0)
      .style(
        "opacity",
        function(l) {
          console.log("Setting opacity on fundLink l = ", l);
          if (d === l.source || d === l.target) {
            return "1";
          } else {
            return "0.05";
          }
        }
      );

    investLink
      .transition()
      .duration(350)
      .delay(0)
      .style(
        "opacity",
        function(l) {
          console.log("Setting opacity on investLink l = ", l);
          if (d === l.source || d === l.target) {
            return "1";
          } else {
            return "0.05";
          }
        }
      );

    porucsLink
      .transition()
      .duration(350)
      .delay(0)
      .style(
        "opacity",
        function(l) {
          console.log("Setting opacity on porucsLink l = ", l);
          if (d === l.source || d === l.target) {
            return "1";
          } else {
            return "0.05";
          }
        }
      );

    dataLink
      .transition()
      .duration(350)
      .delay(0)
      .style(
        "opacity",
        function(l) {
          console.log("Setting opacity on dataLink l = ", l);
          if (d === l.source || d === l.target) {
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
          if (singleNode !== d) {
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
          if (singleNode !== d) { return singleNode; }
        }
      )
      .on('mouseover', null);

    var neighborFund = graph
      .funding_connections
      .filter(
        function(link) {
          console.log("Running filter on funding_connections link = ", link);
          return link.source.index === d.index ||
            link.target.index === d.index;
        }
      )
      .map(
        function(link) {
          console.log("Mapping funding_connections link = ", link);
          return link.source.index === d.index ?
            link.target.index :
            link.source.index;
        }
      );
    console.log("Set neighborFund to ", neighborFund);

    var neighborInvest = graph
      .investment_connections
      .filter(
        function(link) {
          console.log("Running filter on investment_connections link = ", link);
          return link.source.index === d.index ||
            link.target.index === d.index;
        }
      )
      .map(
        function(link) {
          console.log("Mapping investment_connections link = ", link);
          return link.source.index === d.index ?
          link.target.index :
          link.source.index;
        }
      );
    console.log("Set neighborInvest to ", neighborInvest);

    var neighborPorucs = graph
      .collaboration_connections
      .filter(
        function(link) {
          console.log("Running filter on collaboration_connections link = ", link);
          return link.source.index === d.index ||
          link.target.index === d.index;
        }
      )
      .map(
        function(link) {
          console.log("Mapping collaboration_connections link = ", link);
          return link.source.index === d.index ?
          link.target.index :
          link.source.index;
        }
      );
    console.log("Set neighborPorucs to ", neighborPorucs);

    var neighborData = graph
      .data_connections
      .filter(
        function(link) {
          console.log("Running filter on data_connections link = ", link);
          return link.source.index === d.index ||
          link.target.index === d.index;
        }
      )
      .map(
        function(link) {
          console.log("Mapping data_connections link = ", link);
          return link.source.index === d.index ? link.target.index : link.source.index;
        }
      );
    console.log("Set neighborData to ", neighborData);

    svg
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

  }
};

module.exports = sinclickCb;
