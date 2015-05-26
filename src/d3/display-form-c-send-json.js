var $ = require('jquery');

var processFormB = require('./process-form-b');
var displayFormC = require('./display-form-c');

var displayFormCSendJson = function (obj) {
  console.log("Running displayFormCSendJson with obj =", obj);

  var formObj = processFormB(obj);

  displayFormC();

  $.ajax({
    type: 'POST',
    data: $.param(formObj),
    url: '/database/save',
    crossDomain: true
  }).done(function(returnData) {
    console.log("Returning from AJAX POST to /database/save with returnData =", returnData);
    // TODO: ???
  });
}

module.exports = displayFormCSendJson;
