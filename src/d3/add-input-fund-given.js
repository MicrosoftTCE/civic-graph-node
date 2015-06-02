var d3 = require('d3');
var $  = require('jquery');

var addDataList = require('./add-data-list');
var preFillName = require('./pre-fill-name');

var utils = require('../utilities');

var fundingGivenTmpl = require("../templates/funding-given.hbs");

var addInputFundGiven = function (idx) {
  if ($('#fundinggiven-' + idx + ' input[name="fundgiven"]').val() !== "") {

    d3.select('#fundinggiven-' + idx + ' input[name="fundgiven"]').on(
      'keyup',
      function() {
        preFillName(
          this.value,
          '#fundinggiven-' + (idx - 1) + ' input[name="fundgiven"]'
        );
      }
    );
    idx++; // counter -> 2


    $("#fundinggiven-" + (idx - 1))
      .after(fundingGivenTmpl({ idx: idx }));

    addDataList('#fundinggiven-' + idx + ' datalist', utils.getSortedNameOptions());

    d3.select("#fundinggiven-" + idx + " input[name='fundgiven']").on(
      "keyup",
      function() {
        addInputFundGiven(idx);
      }
    );
  }
};

module.exports = addInputFundGiven;
