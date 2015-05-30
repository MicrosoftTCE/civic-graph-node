var d3 = require('d3');

var determineNullFields = require('./determine-null-fields');
var editForm            = require('./edit-form');
var preFillFormA        = require('./pre-fill-form-a');
var sinclick            = require('./sinclick');

var formCTmpl = require('../templates/form-c.hbs');

var displayFormC = function () {
  var suggestions = determineNullFields(_.values(window.civicStore.vertices));

  // Render the string into HTML
  d3.select('#info').html(formCTmpl({ suggestions: suggestions }));

  d3.selectAll('#info ul a').on('click',
    function(d, i) {
      sinclick(suggestions[i]);
      editForm();
      preFillFormA(suggestions[i]);
    }
  );
}

module.exports = displayFormC;
