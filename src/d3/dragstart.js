var dragstart = function (d) {
  console.log("Running dragstart with d = " + d);
  d3
    .select(this)
    .classed(
      "fixed",
      function(d) { d.fixed = false; }
    );

  node
    .on('mouseover', null)
    .on('mouseout', null)
    .on('click', null);
};

module.exports = dragstart;
