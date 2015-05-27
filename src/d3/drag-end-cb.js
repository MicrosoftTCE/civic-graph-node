var d3 = require('d3');

var handleNodeHoverCb = require('./handle-node-hover-cb');
var offNodeCb         = require('./off-node-cb');
var sinclickCb        = require('./sinclick-cb');

var dragEndCb = function (
  node,
  fundLink,
  investLink,
  porucsLink,
  dataLink,
  fundingConnections,
  investmentConnections,
  collaborationConnections,
  dataConnections,
  graph
) {
 return function (target) {
    console.log("Running dragend with target = " + target);

    d3
      .select(this)
      .classed(
        "fixed",
        function(target) { target.fixed = true; }
      );

    node
      .on(
        'mouseover',
        handleNodeHoverCb(
          fundLink,
          investLink,
          porucsLink,
          dataLink,
          fundingConnections,
          investmentConnections,
          collaborationConnections,
          dataConnections
        )
      )
      .on(
        'mouseout',
        offNodeCb(
          fundLink,
          investLink,
          porucsLink,
          dataLink,
          fundingConnections,
          investmentConnections,
          collaborationConnections,
          dataConnections,
          graph
        )
      )
      .on(
        'click',
        sinclickCb(
          fundLink,
          investLink,
          porucsLink,
          dataLink,
          graph
        )
      );
  }
};

module.exports = dragEndCb;
