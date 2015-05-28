var d3 = require('d3');
var $  = require('jquery');

var addDataList = require('./add-data-list');
var preFillName = require('./pre-fill-name');

var collaborationTmpl = require("jade!../templates/collaboration.jade");

/**
 *  Adds a collaborator text input with a datalist dropdown
 *  using the dataListSortedNames and calling addDataList
 */
var addInputCollab = function (idx, dataListSortedNames) {
  console.log("Running addInputCollab with idx = " + idx);

  if ($('#collaboration-' + idx + ' input[name="collaboration"]').val() !== "") {
    d3.select('#collaboration-' + idx + ' input[name="collaboration"]').on(
      'keyup',
      function() {
        console.log("Running collab onKeyup with idx = " + idx);

        preFillName(this.value, '#collaboration-' + (idx - 1) + ' input[name="collaboration"]');
      }
    );
    idx++; // counter -> 2


    $("#collaboration-" + (idx - 1)).after(collaborationTmpl({ idx: CounterC }));

    addDataList('#collaboration-' + idx + ' datalist', dataListSortedNames);

    d3.select("#collaboration-" + idx + " input[name='collaboration']").on(
      "keyup",
      function() {
        console.log("Running collab onKeyup with idx = " + idx);

        addInputCollab(idx, dataListSortedNames);
      }
    );
  }
};

module.exports = addInputCollab;
