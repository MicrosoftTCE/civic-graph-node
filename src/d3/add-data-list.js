var d3 = require('d3');

var addDataList = function(dataListSelector) {
  console.log("Running addDataList with dataListSelector = ", dataListSelector);
  d3.select(dataListSelector).html(dataListSortedNames);
}

module.exports = addDataList;
