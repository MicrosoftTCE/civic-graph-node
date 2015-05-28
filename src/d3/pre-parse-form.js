var editForm = require('./edit-form');
var preFillFormA = require('./pre-fill-form-a');

var preParseForm = function (
  input,
  dataListSortedNames,
  dataListSortedLocations,
  locationsHash
) {
  console.log("Running preParseForm with", input);

  input = input.toLowerCase();

  if (input in entitiesHash) {
    editForm(
      dataListSortedNames,
      dataListSortedLocations,
      locationsHash
    );
    preFillFormA(
      entitiesHash[input],
      dataListSortedNames,
      dataListSortedLocations,
      locationsHash
    );
  }
}

module.exports = preParseForm;
