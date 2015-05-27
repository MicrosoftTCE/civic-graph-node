var d3 = require('d3');

var determineVisibleNodes = require('./determine-visible-nodes');
var hideConnections = require('./hide-connections');
var revealConnections = require('./reveal-connections');
var shouldCboxRemainUnchecked = require('./should-cbox-remain-unchecked');

var connectionCboxActions = function(nodeInit) {
  console.log("Running connectionCboxActions");

  var connectionClasses = ['.invest', '.fund', '.porucs', '.data'];

  d3.selectAll('.group-items.connections input')[0].forEach(
    function(input, idx) {
      d3.selectAll('#' + input.id).on(
        'click', (
        function(input, idx) {
          return function() {
            var visibleNodes = determineVisibleNodes(nodeInit);

            document.getElementById(input.id).checked ?
              revealConnections(connectionClasses[idx], visibleNodes) :
              hideConnections(connectionClasses[idx]);

            shouldCboxRemainUnchecked(connectionClasses[idx], visibleNodes);
          };
      }
      )(input, idx));
    }
  );
};

module.exports = connectionCboxActions;
