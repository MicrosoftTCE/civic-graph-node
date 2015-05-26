    function addInputLocations(counterJ) {
      console.log("Running addInputLocations with counterJ = " + counterJ);

      if ($('#location-' + counterJ + ' input[name="location"]').val() !== "") {
        d3.select('#location-' + counterJ + ' input[name="location"]').on('keyup', function () {
          console.log("Running onKeyup with counterJ = " + counterJ);
          preFillLocation(this.value, locationsHash);
        });

        counterJ++;

        $("#location-" + (counterJ - 1)).after(locationTmpl({ idx: counterJ }));
        d3.select("#location-" + counterJ +  " input[name='location']").on("keyup", function() {
          console.log("Running location onKeyup with counterJ = " + counterJ);
          addInputLocations(counterJ);
        });
      }
    }
