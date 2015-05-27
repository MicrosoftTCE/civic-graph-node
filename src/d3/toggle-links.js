var reflectConnectionChanges = require('./reflect-connection-changes');
var setVisibility            = require('./set-visibility');

var toggleLinks = function(
  visibleNodes,
  fundLink,
  investLink,
  porucsLink,
  dataLink
) {
  console.log("Running toggleLinks with visibleNodes =", visibleNodes);

  fundLink.filter(
    function(link) {
      setVisibility(this, this.__data__, visibleNodes, "Funding");
    }
  );

  investLink.filter(
    function(link) {
      setVisibility(this, this.__data__, visibleNodes, "Investment");
    }
  );

  porucsLink.filter(
    function(link) {
      setVisibility(this, this.__data__, visibleNodes, "Collaboration");
    }
  );

  dataLink.filter(
    function(link) {
      setVisibility(this, this.__data__, visibleNodes, "Data");
    }
  );

  // Time to reflect these changes accordingly with the connection checkboxes to ensure consistency.
  reflectConnectionChanges(
    fundLink,
    investLink,
    porucsLink,
    dataLink
  );
};

module.exports = toggleLinks;
