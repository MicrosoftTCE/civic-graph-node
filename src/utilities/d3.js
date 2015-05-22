var d3 = require('d3');
var _  = require('underscore');

exports.wrap = function(text, width) {
  text.each(function() {
    var data = d3.select(this)[0][0].__data__;
    var dy = parseFloat(text.attr("dy"));
    var line = [];
    var lineHeight = 1.1; // ems
    var lineNumber = 0;
    var text = d3.select(this);
    var tspan = text.text(null).append("tspan").attr("x", 0)
      .attr("y", function() {
        if (data.employees !== null) {
          return empScale(data.employees) + 10;
        } else {
          return 7 + 10;
        }
      })
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
        tspan = text.append("tspan").attr("x", 0)
          .attr("y", function() {
            if (data.employees !== null) {
              return empScale(data.employees) + 5;
            } else {
              return 7 + 5;
            }
          })
          .attr("dy", lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
};

exports.transformText = function(d) {
  return "translate(" + d.x + "," + d.y + ")";
};

exports.translation = function(x, y) {
  return 'translate(' + x + ',' + y + ')';
};

exports.numCommas = function(numberStr) {
  numberStr += '';
  var x = numberStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;

  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
};

exports.weightSorter = function(a, b) {
  return a.weight - b.weight;
};

