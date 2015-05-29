var editForm = require('./edit-form');
var preFillFormA = require('./pre-fill-form-a');

var preParseForm = function (input) {
  console.log("Running preParseForm with", input);

  input = input.toLowerCase();

  var entitiesHash = {};

  if (input in entitiesHash) {
    editForm();
    preFillFormA(entitiesHash[input]); // TODO
  }
}

module.exports = preParseForm;
