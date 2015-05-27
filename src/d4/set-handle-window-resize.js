var d3 = require('d3');

var setHandleWindowResize = function (aspect) {

  var handleWindowResize = function () {

    var network = d3.select('#network');
    var container = network.node().parentNode;
    var width = container.getBoundingClientRect().width;
    var height = width / aspect;

    network.attr('width', Math.round(width));
    network.attr('height', Math.round(height));

    console.log("Set width = " + width + ", height = " + height + " on window resize");
  };

  d3.select(window).on('resize', handleWindowResize);

  handleWindowResize();
};

module.exports = setHandleWindowResize;
