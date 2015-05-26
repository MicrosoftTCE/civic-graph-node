var editForm = require('./edit-form');
var preFillFormA = require('./pre-fill-form-a');

var preParseForm = function (input, entitiesHash) {
  console.log("Running preParseForm with", input);

  input = input.toLowerCase();

  if (input in entitiesHash) {
    editForm();
    preFillFormA(entitiesHash[input]);
  }
}

module.exports = preParseForm;
