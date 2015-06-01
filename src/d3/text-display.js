var d3              = require('d3');
var textDisplayTmpl = require("../templates/text-display.jade");
var formATmpl       = require("../templates/form-a.jade");

var textDisplay = function(d) {
  return textDisplayTmpl(d);
};

module.exports = textDisplay;
