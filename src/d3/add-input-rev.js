var d3 = require('d3');
var $  = require('jquery');

var revenueTmpl = require("../templates/revenue.hbs");

var addInputRev = function (idx) {
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
        addInputRev(idx);
      }
    );
  }
};

module.exports = addInputRev;
