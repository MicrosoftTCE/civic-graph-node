    function addInputFund(counterF) {
      console.log("Running addInputFund with counterF = " + counterF);

      if ($('#funding-' + counterF + ' input[name="fund"]').val() !== "") {
        d3.select('#funding-' + counterF + ' input[name="fund"]').on('keyup', function() {
          console.log("Running fund onKeyup with counterF = " + counterF);
          preFillName(this.value, '#funding-' + (counterF - 1) + ' input[name="fund"]', entitiesHash);
        });
        counterF++; // counter -> 2


        $("#funding-" + (counterF - 1)).after(fundingTmpl({ idx: counterF }));
        addDataList('#funding-' + counterF + ' datalist');
        d3.select("#funding-" + counterF + " input[name='fund']").on("keyup", function() {
          console.log("Running fund onKeyup with counterF = " + counterF);
          addInputFund(counterF);
        });
      }
    }
