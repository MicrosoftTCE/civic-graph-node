var _ = require('underscore');

exports.getQueryParams = function() {
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

  return qStr;
};
