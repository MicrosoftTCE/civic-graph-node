var d3 = require('d3');

var determineNullFields = require('./determine-null-fields');
var editForm            = require('./edit-form');
var preFillFormA        = require('./pre-fill-form-a');
var sinclickCb          = require('./sinclick-cb');

var formCTmpl = require('jade!../templates/form-c.jade');

var displayFormC = function (
  allNodes,
  fundLink,
  investLink,
  porucsLink,
  dataLink,
  graph,
  dataListSortedNames,
  dataListSortedLocations,
  entitiesHash,
  locationsHash
) {
  console.log("Running displayFormC");

  var suggestions = determineNullFields(allNodes);

  // Render the string into HTML
  d3.select('#info').html(formCTmpl({ suggestions: suggestions }));

  d3.selectAll('#info ul a').on('click',
    function(d, i) {
      console.log("Running onClick on #info ul a with d, i =", d, i);
      sinclickCb(
        fundLink,
        investLink,
        porucsLink,
        dataLink,
        graph
      )(
        suggestions[i]
      );
      editForm(
        allNodes,
        fundLink,
        investLink,
        porucsLink,
        dataLink,
        graph,
        dataListSortedNames,
        dataListSortedLocations,
        entitiesHash,
        locationsHash
      );
      preFillFormA(
        suggestions[i],
        allNodes,
        fundLink,
        investLink,
        porucsLink,
        dataLink,
        graph,
        dataListSortedNames,
        dataListSortedLocations,
        entitiesHash,
        locationsHash
      );
    }
  );
}

module.exports = displayFormC;
