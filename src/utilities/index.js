var d3 = require('d3');
var _  = require('lodash');

exports.colors = {
  cyan: "rgb(46, 146, 207)"
};

exports.employeeScale = d3.scale.sqrt().domain([10, 130000]).range([10, 50]);
exports.twitterScale  = d3.scale.sqrt().domain([10, 1000000]).range([10, 50]);

exports.getQueryParams = function() {
  console.log("Running getQueryParams");

  var qStr = {};

  var qry = window.location.search.substring(1);

  var pairs = qry.split('&');

  _.each(pairs, function(pair) {

    var arr = pair.split('=');

    if (arr.length > 1) {
      var prop = arr[0];
      var value = arr[1];

      if (typeof qStr[prop] === "undefined") {
        qStr[prop] = value;
      } else if (typeof qStr[prop] === "string") {
        qStr[prop] = [ qStr[prop], value ];
      } else {
        qStr[prop].push(value);
      }
    }
  })

  console.log("And returning qStr = ", qStr);
  return qStr;
};
