var d3 = require('d3');
var $  = require('jquery');

var addDataList = require('./add-data-list');
var preFillName = require('./pre-fill-name');

var utils = require('../utilities');

var fundingTmpl = require("../templates/funding.jade");

var addInputFund = function (idx) {
  if ($('#funding-' + idx + ' input[name="fund"]').val() !== "") {
    d3.select('#funding-' + idx + ' input[name="fund"]').on(
      'keyup',
      function() {
        preFillName(this.value, '#funding-' + (idx - 1) + ' input[name="fund"]');
      }
    );
    idx++; // counter -> 2


    $("#funding-" + (idx - 1)).after(fundingTmpl({ idx: idx }));

    addDataList('#funding-' + idx + ' datalist', utils.getSortedNameOptions());

    d3.select("#funding-" + idx + " input[name='fund']").on(
      "keyup",
      function() {
        addInputFund(idx);
      }
    );
  }
};

module.exports = addInputFund;
