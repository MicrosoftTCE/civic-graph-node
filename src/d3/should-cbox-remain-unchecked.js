var d3 = require('d3');
var $  = require('jquery');

var shouldCboxRemainUnchecked = function(
  selector,
  visibleNodes
) {
  console.log("Running shouldCboxRemainUnchecked with selector, visibleNodes =", selector, visibleNodes);

  if (
    visibleNodes.length === 0 ||
    (
      $('#cb_individ').is('checked') &&
      $('#cb_forpro').is('checked') &&
      $('#cb_nonpro').is('checked') &&
      $('#cb_gov').is('checked')
    )
  ) {
    $(selector).attr('checked', false);
  }
};

module.exports = shouldCboxRemainUnchecked;
