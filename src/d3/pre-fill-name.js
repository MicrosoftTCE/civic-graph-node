var d3 = require('d3');

var preFillName = function (input, inputSelector, entitiesHash) {
  console.log("Running preFillName with", input, inputSelector);

  if (input.toLowerCase() in entitiesHash) {
    d3.selectAll(inputSelector).text(
      function(d) { this.value = entitiesHash[input].name; }
    );
  }
};

module.exports = preFillName;
