var d3 = require('d3');
var $  = require('jquery');

var addDataList = require('./add-data-list');
var preFillName = require('./pre-fill-name');

var dataTmpl = require("jade!../templates/data.jade");

var addInputData = function (idx, entitiesHash, dataListSortedNames) {
  console.log("Running addInputData with idx = " + idx);

  if ($('#data-' + idx + ' input[name="data"]').val() !== "") {
    d3.select('#data-' + idx + ' input[name="data"]').on(
      'keyup',
      function() {
        console.log("Running data onKeyup with idx = " + idx);

        preFillName(this.value, '#data-' + (idx - 1) + ' input[name="data"]', entitiesHash);
      }
    );
    idx++; // counter -> 2


    $("#data-" + (idx - 1)).after(dataTmpl({ idx: idx }));

    addDataList('#data-' + idx + ' datalist', dataListSortedNames);

    d3.select("#data-" + idx + " input[name='data']").on(
      "keyup",
      function() {
        console.log("Running data onKeyup with idx = " + idx);

        addInputData(idx, entitiesHash, dataListSortedNames);
      }
    );
  }
};

module.exports = addInputData;
