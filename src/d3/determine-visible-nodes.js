var determineVisibleNodes = function(nodeInit) {
  console.log("Running determineVisibleNodes");

  // Construct associative array of the visible nodes'
  // indices (keys) and corresponding objects (values).
  var visibleNodes = {};

  for (var x = 0; x < nodeInit[0].length; x++) {
    if (nodeInit[0][x].style.visibility === "visible") {
      visibleNodes[nodeInit[0][x].__data__.ID] = nodeInit[0][x];
    }
  }

  return visibleNodes;
};

module.exports = determineVisibleNodes;
