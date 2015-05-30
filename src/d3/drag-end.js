var d3 = require('d3');

var handleNodeHover   = require('./handle-node-hover');
var offNode           = require('./off-node');
var sinclick          = require('./sinclick');

var dragEnd = function (target) {
  d3
    .select(this)
    .classed(
      "fixed",
      function(target) { target.fixed = true; }
    );

  window.d3Node
    .on('mouseover', handleNodeHover)
    .on('mouseout', offNode)
    .on('click', sinclick);
};

module.exports = dragEnd;
