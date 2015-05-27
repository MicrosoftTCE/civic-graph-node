var prefillCurrent = function(
  obj,
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
  console.log("Running prefillCurrent with obj =", obj);

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
    obj,
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
};

module.exports = prefillCurrent;
