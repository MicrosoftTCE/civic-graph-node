var d3 = require('d3');
var $  = require('jquery');

var addDataList = require('./add-data-list');
var preFillName = require('./pre-fill-name');

var investmentMadeTmpl = require("jade!../templates/investment-made.jade");

var addInputInvestMade = function (idx, entitiesHash, dataListSortedNames) {
  console.log("Running addInputInvestMade with idx = " + idx);

  if ($('#investmentmade-' + idx + ' input[name="investmade"]').val() !== "") {
    d3.select('#investmentmade-' + idx + ' input[name="investmade"]').on(
      'keyup',
      function() {
        console.log("Running fund made onKeyup with idx = " + idx);

        preFillName(
          this.value,
          '#investmentmade-' + (idx - 1) + ' input[name="investmade"]',
          entitiesHash
        );
      }
    );
    idx++; // counter -> 2


    $("#investmentmade-" + (idx - 1)).after(investmentMadeTmpl({ idx: idx }));

    addDataList('#investmentmade-' + idx + ' datalist', dataListSortedNames);

    d3.select("#investmentmade-" + idx + " input[name='investmade']").on(
      "keyup",
      function() {
        console.log("Running fund made onKeyup with idx = " + idx);

        addInputInvestMade(idx, entitiesHash, dataListSortedNames);
      }
    );
  }
};

module.exports = addInputInvestMade;
