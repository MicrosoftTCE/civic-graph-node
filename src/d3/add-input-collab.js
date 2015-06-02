var d3 = require('d3');
var $  = require('jquery');

var addDataList = require('./add-data-list');
var preFillName = require('./pre-fill-name');

var utils = require('../utilities');

var collaborationTmpl = require("../templates/collaboration.hbs");

/**
 *  Adds a collaborator text input with a datalist dropdown
 *  using the utils.getSortedNameOptions() and calling addDataList
 */
var addInputCollab = function (idx) {
  if ($('#collaboration-' + idx + ' input[name="collaboration"]').val() !== "") {
    d3.select('#collaboration-' + idx + ' input[name="collaboration"]').on(
      'keyup',
      function() {
        preFillName(this.value, '#collaboration-' + (idx - 1) + ' input[name="collaboration"]');
      }
    );
    idx++; // counter -> 2


    $("#collaboration-" + (idx - 1)).after(collaborationTmpl({ idx: CounterC }));

    addDataList('#collaboration-' + idx + ' datalist', utils.getSortedNameOptions());

    d3.select("#collaboration-" + idx + " input[name='collaboration']").on(
      "keyup",
      function() {
        addInputCollab(idx);
      }
    );
  }
};

module.exports = addInputCollab;
