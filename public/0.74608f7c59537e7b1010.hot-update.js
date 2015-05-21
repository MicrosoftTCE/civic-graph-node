webpackHotUpdate(0,{

/***/ 43:
/***/ function(module, exports, __webpack_require__) {

	eval("var _ = __webpack_require__(4);\n\nexports.getQueryParams = function() {\n  var qStr = {};\n\n  var qry = window.location.search.substring(1);\n\n  var pairs = qry.split('&');\n\n  console.log(\"pairs\", pairs);\n\n  _.each(pairs, function(pair) {\n\n    var arr = pair.split('=');\n\n    if (arr.length > 1) {\n      var prop = arr[0];\n      var value = arr[1];\n\n      if (typeof prop === \"undefined\") {\n        qStr[prop] = value;\n      } else if (typeof qStr[prop] === \"string\") {\n        qStr[prop] = [ qStr[prop], value ];\n      } else {\n        qStr[prop].push(value);\n      }\n    }\n  })\n\n  return qStr;\n};\n\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/utilities/index.js\n ** module id = 43\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/utilities/index.js?");

/***/ }

})