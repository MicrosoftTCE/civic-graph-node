var prefillCurrent = function(
  obj,
  dataListSortedNames,
  dataListSortedLocations,
  locationsHash
) {
  console.log("Running prefillCurrent with obj =", obj);

  editForm(
    dataListSortedNames,
    dataListSortedLocations,
    locationsHash
  );

  preFillFormA(
    obj,
    dataListSortedNames,
    dataListSortedLocations,
    locationsHash
  );
};

module.exports = prefillCurrent;
