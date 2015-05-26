var _ = require('lodash');

var determineNullFields = function () {
  console.log("Running determineNullFields");

  var nullFieldCount = 0;
  var nullFieldArr   = [];

  // We know which nodes have how many null fields...
  allNodes.forEach(
    function(node) {
      var objValue = _.object(
        _.map(
          node,
          function(value, key) {
            if (value === null) { nullFieldCount++; }
            return [key, value];
          }
        )
      );

      // Individuals do not have employees, people, rande, randeY
      // Not a fair comparison of null fields.
      if (node.type === 'Individual') { nullFieldCount -= 4; }

      nullFieldArr.push({ name: node.name, nullFields: nullFieldCount });
      nullFieldCount = 0;
    }
  );

  console.log("Looped through allNodes to set nullFieldArr =", nullFieldArr);

  //  Let's determine the nodes with the most null fields.
  var maxNullObj = _.max(nullFieldArr,
    function(node) { return node.nullFields }
  );

  var potentialSuggestions = [];

  nullFieldArr.forEach(
    function(node) {
      if (
        node.nullFields <= maxNullObj.nullFields &&
        node.nullFields >= maxNullObj.nullFields - 7
      ) {
        var nodeObj = _.find(
          allNodes,
          function(e) { return node.name === e.name; }
        );

        potentialSuggestions.push(nodeObj);
      }
    }
  );

  console.log("Set potentialSuggestions =", potentialSuggestions);

  var fiveSuggestions = [];

  while (fiveSuggestions.length < 5) {
    var indexValue = Math.floor(Math.random() * potentialSuggestions.length);

    if (fiveSuggestions.indexOf(potentialSuggestions[indexValue]) !== -1) {
      continue;
    } else {
      fiveSuggestions.push(potentialSuggestions[indexValue]);
    }
  }

  console.log("set fiveSuggestions =", fiveSuggestions);

  return fiveSuggestions;
}

module.exports = determineNullFields;
