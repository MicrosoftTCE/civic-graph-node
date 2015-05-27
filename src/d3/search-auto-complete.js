var searchAutoComplete = function (allNodes, entitiesHash, sortedNamesList, sortedLocationsList) {
  console.log("Running searchAutoComplete");

  var s = ""; /////

  console.log("Running forEach on allNodes to splitLocations, sort, and create option tags.");

  allNodes.forEach(
    function(entity) {
      var name = entity.name.toLowerCase();
      var nickname = entity.nickname.toLowerCase();
      var splitLocations = entity.location;

      if (!(name in entitiesHash)) {
        entitiesHash[name] = entity;
        sortedNamesList.push(entity.name);
      }

      if (!(nickname in entitiesHash)) {
        entitiesHash[nickname] = entity;
        sortedNamesList.push(entity.nickname);
      }

      if (splitLocations) {
        // console.log("splitLocations", splitLocations);
        // console.log("Ain't no forEach here!");
        // splitLocations.forEach(function(l) {
        //   console.log("l", l)
        //   var location = l;
        //   var lwcLocation = location.toLowerCase();
        //   (!(lwcLocation in locationsHash)) ?
        //     (
        //       locationsHash[lwcLocation] = [],
        //       locationsHash[lwcLocation].push(d),
        //       sortedLocationsList.push(location)
        //     ) :
        //     (locationsHash[lwcLocation].push(d));
        // });
      }
    }
  );

  sortedNamesList = _.sortBy(
    sortedNamesList,
    function(names) {
      // console.log("Running sortBy on sortedNamesList with names =", names);
      return names.toLowerCase();
    }
  );

  sortedLocationsList = _.sortBy(
    sortedLocationsList,
    function(locations) {
      // console.log("Running sortBy on sortedLocationsList with locations =", locations);
      return locations.toLowerCase();
    }
  );

  var sortedSearchList = _.sortBy(
    sortedNamesList.concat(sortedLocationsList),
    function(keys) {
      // console.log("Running sortBy on sortedNamesList.concat(sortedLocationsList) with keys =", keys);
      return keys;
    }
  );

  console.log("Setting option tags");

  for (var count = 0; count < sortedSearchList.length; count++) {
    s += '<option value="' + sortedSearchList[count] + '">';
  }

  // d3.select('.filter-name-location datalist').html(s);
};

module.exports = searchAutoComplete;
