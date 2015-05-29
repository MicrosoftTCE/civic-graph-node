var d3 = require('d3');
var $  = require('jquery');

var addDataList = require('./add-data-list');
var preFillName = require('./pre-fill-name');

var utils = require('../utilities');

var investmentMadeTmpl = require("../templates/investment-made.hbs");

var addInputInvestMade = function (idx) {
  console.log("Running addInputInvestMade with idx = " + idx);

  if ($('#investmentmade-' + idx + ' input[name="investmade"]').val() !== "") {
    d3.select('#investmentmade-' + idx + ' input[name="investmade"]').on(
      'keyup',
      function() {
        console.log("Running fund made onKeyup with idx = " + idx);

        preFillName(
          this.value,
          '#investmentmade-' + (idx - 1) + ' input[name="investmade"]'
        );
      }
    );
    idx++; // counter -> 2


    $("#investmentmade-" + (idx - 1)).after(investmentMadeTmpl({ idx: idx }));

    addDataList('#investmentmade-' + idx + ' datalist', utils.getSortedNameOptions());

    d3.select("#investmentmade-" + idx + " input[name='investmade']").on(
      "keyup",
      function() {
        console.log("Running fund made onKeyup with idx = " + idx);

        addInputInvestMade(idx);
      }
    );
  }
};

module.exports = addInputInvestMade;
