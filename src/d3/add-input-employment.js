// function addInputEmployment(counterFG) {
//   console.log("Running addInputFundGiven with counterFG = " + counterFG);

//   if ($('#fundinggiven-' + counterFG + ' input[name="fundgiven"]').val() !== "") {
//     d3.select('#fundinggiven-' + counterFG + ' input[name="fundgiven"]').on('keyup', function() {
//       console.log("Running fund given onKeyup with counterFG = " + counterFG);
//       preFillName(this.value, '#fundinggiven-' + (counterFG - 1) + ' input[name="fundgiven"]', entitiesHash);
//     });
//     counterFG++; // counter -> 2


//     $("#fundinggiven-" + (counterFG - 1)).after(fundingGivenTmpl({ idx: counterFG }));

//     addDataList('#fundinggiven-' + counterFG + ' datalist');

//     d3.select("#fundinggiven-" + counterFG + " input[name='fundgiven']").on("keyup", function() {
//       console.log("Running fund given onKeyup with counterFG = " + counterFG);
//       addInputFundGiven(counterFG);
//     });
//   }
// }
