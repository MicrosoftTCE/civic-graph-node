var d3 = require('d3');

var revealConnections = function(selector, visibleNodes) {
  d3.selectAll(selector).style(
    "visibility",
    function(link) {
      if (
        link.source.index in visibleNodes &&
        link.target.index in visibleNodes &&
        this.style.visibility === "hidden"
      ) {
        return "visible";
      } else
        return "hidden";
    }
  );
};

module.exports = revealConnections;
