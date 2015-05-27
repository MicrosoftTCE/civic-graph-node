var editForm = require('./edit-form');
var preFillFormA = require('./pre-fill-form-a');

var preParseForm = function (
  input,
  allNodes,
  fundLink,
  investLink,
  porucsLink,
  dataLink,
  graph,
  dataListSortedNames,
  dataListSortedLocations,
  entitiesHash,
  locationsHash
) {
  console.log("Running preParseForm with", input);

  input = input.toLowerCase();

  if (input in entitiesHash) {
    editForm(
      allNodes,
      fundLink,
      investLink,
      porucsLink,
      dataLink,
      graph,
      dataListSortedNames,
      dataListSortedLocations,
      entitiesHash,
      locationsHash
    );
    preFillFormA(
      entitiesHash[input],
      allNodes,
      fundLink,
      investLink,
      porucsLink,
      dataLink,
      graph,
      dataListSortedNames,
      dataListSortedLocations,
      entitiesHash,
      locationsHash
    );
  }
}

module.exports = preParseForm;
