    function addInputLoc(counterU) {
      console.log("Running addInputLoc with counterU = " + counterU);

      if ($('#location-' + counterU + ' input[name="location"]').val() !== "") {
        d3.select('#location-' + counterU + ' input[name="location"]').on('keyup', null);

        counterU++;

        $("#location-" + (counterU - 1)).after(locTmpl({ idx: counterU }));
        d3.select("#location-" + counterU +  " input[name='location']").on("keyup", function() {
          console.log("Running loc onKeyup with counterU = " + counterU);
          addInputLoc(counterU);
        });
      }
    }
