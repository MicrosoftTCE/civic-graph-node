var d3 = require('d3');

var determineNullFields = require('./determine-null-fields');
var editForm            = require('./edit-form');
var preFillFormA        = require('./pre-fill-form-a');
var sinclick            = require('./sinclick');

var formCTmpl = require('jade!../templates/form-c.jade');

var displayFormC = function (
  dataListSortedLocations,
  locationsHash
) {
  console.log("Running displayFormC");

  var suggestions = determineNullFields(_.values(window.civicStore.vertices));

  // Render the string into HTML
  d3.select('#info').html(formCTmpl({ suggestions: suggestions }));

  d3.selectAll('#info ul a').on('click',
    function(d, i) {
      console.log("Running onClick on #info ul a with d, i =", d, i);
      sinclick(suggestions[i]);
      editForm(
        dataListSortedLocations,
        locationsHash
      );
      preFillFormA(
        suggestions[i],
        dataListSortedLocations,
        locationsHash
      );
    }
  );
}

module.exports = displayFormC;
