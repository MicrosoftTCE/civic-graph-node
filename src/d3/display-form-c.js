var d3 = require('d3');

var displayFormC = function () {
  console.log("Running displayFormC");

  var suggestions = determineNullFields();

  // Render the string into HTML
  d3.select('#info').html(formCTmpl({ suggestions: suggestions }));

  d3.selectAll('#info ul a').on('click',
    function(d, i) {
      console.log("Running onClick on #info ul a with d, i =", d, i);
      sinclick(suggestions[i]);
      editForm();
      preFillFormA(suggestions[i]);
    }
  );
}

module.exports = displayFormC;
