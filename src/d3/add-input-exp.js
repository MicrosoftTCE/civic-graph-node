    function addInputExp(counterE) {
      console.log("Running addInputExp with counterE = " + counterE);

      if ($('#expense-' + counterE + ' input[name="expense_amt"]').val() !== "") {
        d3.select('#expense-' + counterE + ' input[name="expense_amt"]').on('keyup', null);
        counterE++; // counter -> 2


        $("#expense-" + (counterE - 1)).after(expensesTmpl({ idx: counterE }));
        d3.select("#expense-" + counterE + " input[name=expense_amt]").on("keyup", function() {
          console.log("Running exp onKeyup with counterE = " + counterE);
          addInputExp(counterE);
        });
      }
    }
