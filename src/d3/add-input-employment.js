var d3 = require('d3');
var $  = require('jquery');

var addDataList = require('./add-data-list');
var preFillName = require('./pre-fill-name');

var utils = require('../utilities');

var employmentTmpl = require("../templates/employment.hbs");

var addInputEmployment = function (idx) {
  console.log("Running addInputEmployment with idx = " + idx);

  if ($('#employment-' + idx + ' input[name="employment"]').val() !== "") {
    d3.select('#employment-' + idx + ' input[name="employment"]').on(
      'keyup',
      function() {
        console.log("Running data onKeyup with idx = " + idx);

        preFillName(this.value, '#employment-' + (idx - 1) + ' input[name="employment"]');
      }
    );
    idx++; // counter -> 2


    $("#employment-" + (idx - 1)).after(employmentTmpl({ idx: idx }));

    addDataList('#employment-' + idx + ' datalist', utils.getSortedNameOptions());

    d3.select("#employment-" + idx + " input[name='employment']").on(
      "keyup",
      function() {
        console.log("Running data onKeyup with idx = " + idx);

        addInputEmployment(idx);
      }
    );
  }
};

module.exports = addInputEmployment;
