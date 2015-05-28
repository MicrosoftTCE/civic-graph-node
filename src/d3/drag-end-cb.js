var d3 = require('d3');

var handleNodeHover   = require('./handle-node-hover');
var offNode           = require('./off-node');
var sinclick          = require('./sinclick');

var dragEndCb = function (node) {
 return function (target) {
    console.log("Running dragend with target = " + target);

    d3
      .select(this)
      .classed(
        "fixed",
        function(target) { target.fixed = true; }
      );

    node
      .on('mouseover', handleNodeHover)
      .on('mouseout', offNode)
      .on('click', sinclick);
  }
};

module.exports = dragEndCb;
