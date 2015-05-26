var drag = function (node) {
  console.log("Running drag with node = " + node);

  node
    .on('mouseover', null)
    .on('mouseout', null)
    .on('click', null);
};

module.exports = drag;
