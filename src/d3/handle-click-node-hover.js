var d3 = require('d3');

var editDisplay    = require('./edit-display');
var prefillCurrent = require('./prefill-current');
var textDisplay    = require('./text-display');

var handleClickNodeHover = function(obj) {
  var display = textDisplay(obj);

  webform = editDisplay(obj);

  // For editing the data displayed within the side panel.
  d3.
    select('#edit')
    .html(webform);

  //  Printing to side panel within web application.
  d3
    .select('#info')
    .html(display)
    .style('list-style', 'square');

  d3
    .selectAll('#editCurrentInfo').on(
      'click',
      function() {
        prefillCurrent(obj);
      }
    )
    .on(
      'mouseover',
      function() {
        d3
          .select(this)
          .style('cursor', 'pointer');

        return d3
          .select('#editBox')
          .style("visibility", "visible");
      }
    )
    .on(
      'mousemove',
      function() {
        return d3
          .select('#editBox')
          .style("top", (d3.event.pageY + 4) + "px")
          .style("left", (d3.event.pageX + 16) + "px");
      }
    )
    .on('mouseout', function() {
      return d3
        .select('#editBox')
        .style("visibility", "hidden");
    });
}

module.exports = handleClickNodeHover;
