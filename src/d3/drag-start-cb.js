var d3 = require('d3');

var dragStartCb = function (node) {
  return function (target) {
    d3
      .select(this)
      .classed(
        "fixed",
        function(target) { target.fixed = false; }
      );

    node
      .on('mouseover', null)
      .on('mouseout', null)
      .on('click', null);
  };
}

module.exports = dragStartCb;
