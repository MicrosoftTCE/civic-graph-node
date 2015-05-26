var d3 = require('d3');
var textDisplayTmpl = require("jade!../templates/text-display.jade");

var textDisplay = function(d) {
  console.log("Running textDisplay with d =", d);

  displayFormA(d);

  return textDisplayTmpl(d);
};

module.exports = textDisplay;

