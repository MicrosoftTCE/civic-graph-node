var d3 = require('d3');

/**
 *  Takes a text name/nickname and the CSS selector for an input
 *  and sets the value of the input to the name or nickname
 */
var preFillName = function (name, inputSelector) {
  var key = name.toLowerCase();

  var entitiesHash = {};

  if (key in entitiesHash) {
    d3.selectAll(inputSelector).text(
      function(d) { this.value = entitiesHash[key].name; }
    );
  }
};

module.exports = preFillName;
