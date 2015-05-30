var reflectConnectionChanges = require('./reflect-connection-changes');
var setVisibility            = require('./set-visibility');

var toggleLinks = function(visibleNodes) {
  window.civicStore.lines.funding.filter(
    function(link) {
      setVisibility(this, this.__data__, visibleNodes, "Funding");
    }
  );

  window.civicStore.lines.investment.filter(
    function(link) {
      setVisibility(this, this.__data__, visibleNodes, "Investment");
    }
  );

  window.civicStore.lines.collaboration.filter(
    function(link) {
      setVisibility(this, this.__data__, visibleNodes, "Collaboration");
    }
  );

  window.civicStore.lines.data.filter(
    function(link) {
      setVisibility(this, this.__data__, visibleNodes, "Data");
    }
  );

  // Time to reflect these changes accordingly with the connection checkboxes to ensure consistency.
  reflectConnectionChanges();
};

module.exports = toggleLinks;
