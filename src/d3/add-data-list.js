var d3 = require('d3');

var addDataList = function(dataListSelector) {
  d3.select(dataListSelector).html(dataListSortedNames);
}

module.exports = addDataList;
