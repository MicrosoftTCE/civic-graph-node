var d3 = require('d3');

var determineVisibleNodes = require('./determine-visible-nodes');
var nodeVisibility        = require('./node-visibility');
var toggleLinks           = require('./toggle-links');

var typesCboxActions = function(
  nodeInit,
  fundLink,
  investLink,
  porucsLink,
  dataLink
) {
  console.log("Running typesCheckboxActions");

  d3.selectAll('#cb_forpro, #cb_nonpro, #cb_gov, #cb_individ').on(
    'click',
    function() {
      var visibleNodes = determineVisibleNodes(nodeInit);

      $('#cb_forpro').is(':checked') ?
        nodeVisibility('For-Profit', 'visible') :
        nodeVisibility('For-Profit', 'hidden');

      $('#cb_nonpro').is(':checked') ?
        nodeVisibility('Non-Profit', 'visible') :
        nodeVisibility('Non-Profit', 'hidden');

      $('#cb_gov').is(':checked') ?
        nodeVisibility('Government', 'visible') :
        nodeVisibility('Government', 'hidden');

      $('#cb_individ').is(':checked') ?
        nodeVisibility('Individual', 'visible') :
        nodeVisibility('Individual', 'hidden');

      toggleLinks(
        visibleNodes,
        fundLink,
        investLink,
        porucsLink,
        dataLink
      );
    }
  );
};

module.exports = typesCboxActions;
