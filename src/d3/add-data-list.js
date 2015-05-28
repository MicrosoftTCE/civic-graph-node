var d3 = require('d3');

var utils = require('../utilities');

var addDataList = function(dataListSelector) {
  console.log("Running addDataList with dataListSelector = ", dataListSelector);

  d3.select(dataListSelector).html(utils.getSortedNameOptions());
}

module.exports = addDataList;
