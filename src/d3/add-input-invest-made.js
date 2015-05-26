    function addInputInvestMade(counterIM) {
      console.log("Running addInputInvestMade with counterIM = " + counterIM);

      if ($('#investmentmade-' + counterIM + ' input[name="investmade"]').val() !== "") {
        d3.select('#investmentmade-' + counterIM + ' input[name="investmade"]').on('keyup', function() {
          console.log("Running fund made onKeyup with counterIM = " + counterIM);
          preFillName(this.value, '#investmentmade-' + (counterIM - 1) + ' input[name="investmade"]', entitiesHash);
        });
        counterIM++; // counter -> 2


        $("#investmentmade-" + (counterIM - 1)).after(investmentMadeTmpl({ idx: counterIM }));

        addDataList('#investmentmade-' + counterIM + ' datalist');

        d3.select("#investmentmade-" + counterIM + " input[name='investmade']").on("keyup", function() {
          console.log("Running fund made onKeyup with counterIM = " + counterIM);
          addInputInvestMade(counterIM);
        });
      }
    }
