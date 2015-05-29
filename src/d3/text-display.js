var d3              = require('d3');
var textDisplayTmpl = require("../templates/text-display.hbs");
var formATmpl       = require("../templates/form-a.hbs");

var textDisplay = function(d) {
  console.log("Running textDisplay with d =", d);

  return textDisplayTmpl(d);
};

module.exports = textDisplay;
