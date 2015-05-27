var d3 = require('d3');
var $  = require('jquery');

var revenueTmpl = require("jade!../templates/revenue.jade");

var addInputRev = function (idx) {
  console.log("Running addInputRev with idx = " + idx);

  if ($('#revenue-' + idx + ' input[name="revenue_amt"]').val() !== "") {
    d3.select('#revenue-' + idx + ' input[name="revenue_amt"]').on(
      'keyup',
      null
    );

    idx++;

    $("#revenue-" + (idx - 1)).after(revenueTmpl({ idx: idx }));

    d3.select("#revenue-" + idx + " input[name=revenue_amt]").on(
      "keyup",
      function() {
        console.log("Running rev onKeyup with idx = " + idx);

        addInputRev(idx);
      }
    );
  }
};

module.exports = addInputRev;
