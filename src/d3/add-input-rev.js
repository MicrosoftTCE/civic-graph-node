
    function addInputRev(counterR) {
      console.log("Running addInputRev with counterR = " + counterR);

      if ($('#revenue-' + counterR + ' input[name="revenue_amt"]').val() !== "") {
        d3.select('#revenue-' + counterR + ' input[name="revenue_amt"]').on('keyup', null);
        counterR++; // counter -> 2


        $("#revenue-" + (counterR - 1)).after(revenueTmpl({ idx: counterR }));

        d3.select("#revenue-" + counterR + " input[name=revenue_amt]").on("keyup", function() {
          console.log("Running rev onKeyup with counterR = " + counterR);
          addInputRev(counterR);
        });
      }
    }
