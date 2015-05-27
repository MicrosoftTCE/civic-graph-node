var d3 = require('d3');
var $  = require('jquery');

var addDataList = require('./add-data-list');
var preFillName = require('./pre-fill-name');

var fundingTmpl = require("jade!../templates/funding.jade");

var addInputFund = function (idx, entitiesHash, dataListSortedNames) {
  console.log("Running addInputFund with idx = " + idx);

  if ($('#funding-' + idx + ' input[name="fund"]').val() !== "") {
    d3.select('#funding-' + idx + ' input[name="fund"]').on(
      'keyup',
      function() {
        console.log("Running fund onKeyup with idx = " + idx);
        preFillName(this.value, '#funding-' + (idx - 1) + ' input[name="fund"]', entitiesHash);
      }
    );
    idx++; // counter -> 2


    $("#funding-" + (idx - 1)).after(fundingTmpl({ idx: idx }));

    addDataList('#funding-' + idx + ' datalist', dataListSortedNames);

    d3.select("#funding-" + idx + " input[name='fund']").on(
      "keyup",
      function() {
        console.log("Running fund onKeyup with idx = " + idx);
        addInputFund(idx, entitiesHash, dataListSortedNames);
      }
    );
  }
};

module.exports = addInputFund;
