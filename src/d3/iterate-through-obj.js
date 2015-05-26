var _ = require('lodash');

var iterateThroughObj = function (obj) {
  console.log("Running iterateThroughObj with obj =", obj);

  var objValue = _.object(
    _.map( obj, function(value, key) { return [key, value]; } )
  );

  console.log("Set objValue = ", objValue);

  return objValue;
}

module.exports = iterateThroughObj;
