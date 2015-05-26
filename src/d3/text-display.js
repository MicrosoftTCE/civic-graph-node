var d3              = require('d3');
var textDisplayTmpl = require("jade!../templates/text-display.jade");
var formATmpl       = require("jade!../templates/form-a.jade");

var textDisplay = function(d) {
  console.log("Running textDisplay with d =", d);

  formATmpl(d);

  return textDisplayTmpl(d);
};

module.exports = textDisplay;

