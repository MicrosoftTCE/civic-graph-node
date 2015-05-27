var d3 = require('d3');

var shouldCboxRemainUnchecked = function(
  selector,
  visibleNodes,
  cboxForProfit,
  cboxNonProfit,
  cboxGovernment,
  cboxIndividual
) {
  console.log("Running shouldCboxRemainUnchecked with selector, visibleNodes =", selector, visibleNodes);

  if (
    visibleNodes.length === 0 ||
    (
      document.getElementById(cboxIndividual).checked &&
      document.getElementById(cboxForProfit).checked &&
      document.getElementById(cboxNonProfit).checked &&
      document.getElementById(cboxGovernment).checked)
    ) {

    d3.select(selector).attr('checked', false);
  }
};

module.exports = shouldCboxRemainUnchecked;
