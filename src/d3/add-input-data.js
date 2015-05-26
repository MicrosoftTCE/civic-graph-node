    function addInputData(counterD) {
      console.log("Running addInputData with counterD = " + counterD);

      if ($('#data-' + counterD + ' input[name="data"]').val() !== "") {
        d3.select('#data-' + counterD + ' input[name="data"]').on('keyup', function() {
          console.log("Running data onKeyup with counterD = " + counterD);
          preFillName(this.value, '#data-' + (counterD - 1) + ' input[name="data"]', entitiesHash);
        });
        counterD++; // counter -> 2


        $("#data-" + (counterD - 1)).after(dataTmpl({ idx: counterD }));

        addDataList('#data-' + counterD + ' datalist');

        d3.select("#data-" + counterD + " input[name='data']").on("keyup", function() {
          console.log("Running data onKeyup with counterD = " + counterD);
          addInputData(counterD);
        });
      }
    }
