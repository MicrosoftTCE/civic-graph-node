    function addInputKp(counterK) {
      console.log("Running addInputKp with counterK = " + counterK);

      if ($('#key-people-' + counterK + ' input[name="kpeople"]').val() !== "") {
        d3.select('#key-people-' + counterK + ' input[name="kpeople"]').on('keyup', null);
        counterK++; // counter -> 2


        $("#key-people-" + (counterK - 1)).after(keyPeopleTmpl({ idx: counterK }));
        d3.select("#key-people-" + counterK + " input[name='kpeople']").on("keyup", function() {
          console.log("Running kp onKeyup with counterK = " + counterK);
          addInputKp(counterK);
        });
      }
    }
