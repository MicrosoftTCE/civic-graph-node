var d3 = require('d3');

var u = require('../utilities');

var drawGraph             = require('./draw-graph');
var setHandleWindowResize = require('./set-handle-window-resize');

var drawEntityGraph = function () {
  console.log("Drawing the entity graph.");

  // Set the default height and width
  var height = width = 1000;

  /**
   *  Create the root svg#network within div.content
   */
   var root = d3
    .select('.content')
    .append('svg')
    .attr("xmlns", 'http://www.w3.org/2000/svg')
    .attr("id", 'network')
    .attr("height", height)
    .attr("width", width)
    .style("top", "-50px")
    .style("position", "relative");

  /**
   *  Append div#editBox with text 'Edit' and cyan color
   */
  d3
    .select('body > nav > nav > div')
    .append('div')
    .attr('id', 'editBox')
    .append('p')
    .text('Edit')
    .style('color', u.colors.cyan);

  /**
   *  Set the window resize handler and call it immediately
   */
  setHandleWindowResize(width / height);

  /**
   *  Set the viewbox parameters on root
   */
  root
    .attr("viewBox", [0, 0, width, height].join(' '))
    .attr("preserveAspectRatio", 'xMidYMid');

  console.log("Drawing graph at " + root);
  drawGraph(root);
};

module.exports = drawEntityGraph;
