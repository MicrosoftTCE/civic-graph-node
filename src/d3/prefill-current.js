var prefillCurrent = function(
  obj,
  dataListSortedLocations,
  locationsHash
) {
  console.log("Running prefillCurrent with obj =", obj);

  editForm(
    dataListSortedLocations,
    locationsHash
  );

  preFillFormA(
    obj,
    dataListSortedLocations,
    locationsHash
  );
};

module.exports = prefillCurrent;
