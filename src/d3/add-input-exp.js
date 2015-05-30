var d3 = require('d3');
var $  = require('jquery');

var expensesTmpl = require("../templates/expenses.hbs");

var addInputExp = function (idx) {
  if ($('#expense-' + idx + ' input[name="expense_amt"]').val() !== "") {
    d3.select('#expense-' + idx + ' input[name="expense_amt"]').on(
      'keyup',
      null
    );
    idx++; // counter -> 2


    $("#expense-" + (idx - 1)).after(expensesTmpl({ idx: idx }));

    d3.select("#expense-" + idx + " input[name=expense_amt]").on(
      "keyup",
      function() {
        addInputExp(idx);
      }
    );
  }
};

module.exports = addInputExp;
