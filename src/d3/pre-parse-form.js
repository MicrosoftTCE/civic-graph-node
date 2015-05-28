var editForm = require('./edit-form');
var preFillFormA = require('./pre-fill-form-a');

var preParseForm = function (
  input,
  dataListSortedLocations,
  locationsHash
) {
  console.log("Running preParseForm with", input);

  input = input.toLowerCase();

  if (input in entitiesHash) {
    editForm(
      dataListSortedLocations,
      locationsHash
    );
    preFillFormA(
      entitiesHash[input],
      dataListSortedLocations,
      locationsHash
    );
  }
}

module.exports = preParseForm;
