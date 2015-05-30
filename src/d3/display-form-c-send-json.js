var $ = require('jquery');

var processFormB = require('./process-form-b');
var displayFormC = require('./display-form-c');

var displayFormCSendJson = function (obj) {
  var formObj = processFormB(obj);

  displayFormC();

  $.ajax({
    type: 'POST',
    data: $.param(formObj),
    url: '/database/save',
    crossDomain: true
  }).done(function(returnData) {
    // TODO: ???
  });
}

module.exports = displayFormCSendJson;
