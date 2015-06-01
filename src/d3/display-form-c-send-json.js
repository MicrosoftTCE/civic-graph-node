var $ = require('jquery');

var processFormB = require('./process-form-b');
var displayFormC = require('./display-form-c');

<<<<<<< HEAD
var displayFormCSendJson = function (obj) {
  // var formObj = processFormB(obj);

  displayFormC();


  // d3.xhr.post('/entities').data(formObj).on("success", callback);

  // $.ajax({
  //   type: 'POST',
  //   data: $.param(formObj),
  //   url: '/database/save',
  //   crossDomain: true
  // }).done(function(returnData) {
  //   console.log("Returning from AJAX POST to /database/save with returnData =", returnData);
  //   // TODO: ???
  // });
  var formObj = {
    name: 'kenny',
    age: 26
  };

  d3.xhr('/entities')
    .header("Content-Type", "application/json")
    .post(
      JSON.stringify(formObj),
      function(err, rawData){
        var data = JSON.parse(rawData);
        console.log("got response", data);
      }
    );
};

// displayFormCSendJson();

module.exports = displayFormCSendJson;
