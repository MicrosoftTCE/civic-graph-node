var drag = function (target) {
  console.log("Running drag with target = " + target);

  target
    .on('mouseover', null)
    .on('mouseout', null)
    .on('click', null);
};

module.exports = drag;
