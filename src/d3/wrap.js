var d3 = require('d3');
var _  = require('underscore');

var wrap = function(text, width) {
  console.log("Running wrap with text, width =", text, width);

  text.each(function() {
    console.log("Running each on text");
    var data = d3.select(this)[0][0].__data__;
    var dy = parseFloat(text.attr("dy"));
    var line = [];
    var lineHeight = 1.1; // ems
    var lineNumber = 0;
    var text = d3.select(this);
    var tspan = text
      .text(null)
      .append("tspan")
      .attr("x", 0)
      .attr(
        "y",
        function() {
          if (data.employees !== null) {
            return empScale(data.employees) + 10;
          } else {
            return 7 + 10;
          }
        }
      )
      .attr("dy", dy + "em");

    var word;
    var words = text.text().split(/\s+/).reverse();

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        lineNumber++;
        tspan = text
          .append("tspan")
          .attr("x", 0)
          .attr(
            "y",
            function() {
              if (data.employees !== null) {
                return empScale(data.employees) + 5;
              } else {
                return 7 + 5;
              }
            }
          )
          .attr("dy", lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
};

module.exports = wrap;
