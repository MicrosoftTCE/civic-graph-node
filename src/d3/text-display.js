var d3 = require('d3');
var template = require("jade!../templates/text-display.jade");

var textDisplay = function(d) {

  displayFormA(d);

  return template(d);
};

module.exports = textDisplay;

