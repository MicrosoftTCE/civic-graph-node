    function addInputInvest(counterI) {
      console.log("Running addInputInvest with counterI = " + counterI);

      if ($('#investing-' + counterI + ' input[name="invest"]').val() !== "") {
        d3.select('#investing-' + counterI + ' input[name="invest"]').on('keyup', function() {
          console.log("Running invest onKeyup with counterI = " + counterI);
          preFillName(this.value, '#investing-' + (counterI - 1) + ' input[name="invest"]', entitiesHash);
        });
        counterI++; // counter -> 2


        $("#investing-" + (counterI - 1)).after(investingTmpl({ idx: counterI }));
        addDataList('#investing-' + counterI + ' datalist');
        d3.select("#investing-" + counterI + " input[name='invest']").on("keyup", function() {
          console.log("Running invest onKeyup with counterI = " + counterI);
          addInputInvest(counterI);
        });
      }
    }
