webpackHotUpdate(0,{

/***/ 45:
/***/ function(module, exports, __webpack_require__) {

	eval("var d3 = __webpack_require__(5);\nvar _  = __webpack_require__(30);\n\nexports.wrap = function(text, width) {\n  text.each(function() {\n    var text = d3.select(this),\n      words = text.text().split(/\\s+/).reverse(),\n      word,\n      line = [],\n      lineNumber = 0,\n      lineHeight = 1.1, // ems\n      dy = parseFloat(text.attr(\"dy\")),\n      data = d3.select(this)[0][0].__data__,\n      tspan = text.text(null).append(\"tspan\").attr(\"x\", 0).attr(\"y\", function() {\n        if (data.employees !== null)\n          return empScale(data.employees) + 10;\n        else\n          return 7 + 10;\n      }).attr(\"dy\", dy + \"em\");\n\n    while (word = words.pop()) {\n      line.push(word);\n      tspan.text(line.join(\" \"));\n      if (tspan.node().getComputedTextLength() > width) {\n        line.pop();\n        tspan.text(line.join(\" \"));\n        line = [word];\n        lineNumber++;\n        tspan = text.append(\"tspan\").attr(\"x\", 0).attr(\"y\", function() {\n          if (data.employees !== null)\n            return empScale(data.employees) + 5;\n          else\n            return 7 + 5;\n        }).attr(\"dy\", lineNumber * lineHeight + dy + \"em\").text(word);\n      }\n    }\n  });\n};\n\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/utilities/d3.js\n ** module id = 45\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/utilities/d3.js?");

/***/ }

})