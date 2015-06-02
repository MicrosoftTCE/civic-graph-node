var d3 = require('d3');
var $  = require('jquery');

var addDataList = require('./add-data-list');
var preFillName = require('./pre-fill-name');

var utils = require('../utilities');

var dataTmpl = require("../templates/data.hbs");

var addInputData = function (idx) {
  if ($('#data-' + idx + ' input[name="data"]').val() !== "") {
    d3.select('#data-' + idx + ' input[name="data"]').on(
      'keyup',
      function() {
        preFillName(this.value, '#data-' + (idx - 1) + ' input[name="data"]');
      }
    );
    idx++; // counter -> 2


    $("#data-" + (idx - 1)).after(dataTmpl({ idx: idx }));

    addDataList('#data-' + idx + ' datalist', utils.getSortedNameOptions());

    d3.select("#data-" + idx + " input[name='data']").on(
      "keyup",
      function() {
        addInputData(idx);
      }
    );
  }
};

module.exports = addInputData;
