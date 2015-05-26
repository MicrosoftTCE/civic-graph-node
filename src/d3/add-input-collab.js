    function add_input_collab(counterC) {
      console.log("Running add_input_collab with counterC = " + counterC);

      if ($('#collaboration-' + counterC + ' input[name="collaboration"]').val() !== "") {
        d3.select('#collaboration-' + counterC + ' input[name="collaboration"]').on('keyup', function() {
          console.log("Running collab onKeyup with counterC = " + counterC);
          preFillName(this.value, '#collaboration-' + (counterC - 1) + ' input[name="collaboration"]', entitiesHash);
        });
        counterC++; // counter -> 2


        $("#collaboration-" + (counterC - 1)).after(collaborationTmpl({ idx: CounterC }));

        addDataList('#collaboration-' + counterC + ' datalist');

        d3.select("#collaboration-" + counterC + " input[name='collaboration']").on("keyup", function() {
          console.log("Running collab onKeyup with counterC = " + counterC);
          add_input_collab(counterC);

        });
      }
    }
