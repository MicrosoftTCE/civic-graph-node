var drag = function (target) {
  target
    .on('mouseover', null)
    .on('mouseout', null)
    .on('click', null);
};

module.exports = drag;
