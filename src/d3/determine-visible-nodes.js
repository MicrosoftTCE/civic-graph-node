var determineVisibleNodes = function() {
  console.log("Running determineVisibleNodes");

  // Construct associative array of the visible nodes'
  // indices (keys) and corresponding objects (values).
  var visibleNodes = {};

  for (var x = 0; x < window.nodeInit[0].length; x++) {
    if (window.nodeInit[0][x].style.visibility === "visible") {
      visibleNodes[window.nodeInit[0][x].__data__.ID] = window.nodeInit[0][x];
    }
  }

  return visibleNodes;
};

module.exports = determineVisibleNodes;
