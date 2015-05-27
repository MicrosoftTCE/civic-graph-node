var d3 = require('d3');

var processFormA          = require('./process-form-a');
var preFillName           = require('./pre-fill-name');
var addDataList           = require('./add-data-list');
var addInputLoc           = require('./add-input-loc');
var addInputCollab        = require('./add-input-collab');
var addInputRev           = require('./add-input-rev');
var addInputExp           = require('./add-input-exp');
var displayFormCSendJson  = require('./display-form-c-send-json');

var formBTmpl = require("jade!../templates/form-b.jade");

var displayFormB = function(
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
  console.log("Running displayFormB");
  // Now we have a perfectly structured JSON object that contains
  // the information given by the user and inputted into the webform.
  // Send this object as a parameter to form B, and render form B accordingly.

  var formObject = processFormA();

  if (formObject.location && formObject.name) {
    console.log("formObject.location =", formObject.location);
    console.log("formObject.name =", formObject.name);

    var counterKey = 0;
    var counterK = 0;

    var counterFund = 0;
    var counterF = 0;

    // Render form B.
    var form = formBTmpl(formObject);

    d3.select('#info').html(form);

    addDataList('#collaboration-0 datalist', dataListSortedNames);

    if( formObject.location !== null) {
      var location = formObject.location;

      d3.select('#location-' + formObject.location.length + ' input[name="location"]')
        .on('keyup', function() {
          addInputLoc(formObject.location.length);
        })
    }

    // Add action listeners
    d3.selectAll('input[name="collaboration"]').on(
      'keyup',
      function() {
        addInputCollab(0, entitiesHash), dataListSortedNames;

        preFillName(this.value, '#collaboration-0 input');
      }
    );

    d3.selectAll('input[name="revenue_amt"]').on(
      'keyup',
      function() { addInputRev(0); }
    );

    d3.selectAll('input[name="expense_amt"]').on(
      'keyup',
      function() { addInputExp(0); }
    );

    d3.selectAll('#submit-B').on(
      'click',
      function() { displayFormCSendJson(
        formObject,
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
      ); }
    );

  } else { //  Error checking the form...
    if (!formObject.name && !formObject.location) {
      d3.select('#name').style("border-color", "#e51400");
      d3.select('#location').style("border-color", "#e51400");
    } else {
      if (!formObject.name) {
        d3.select('#name').style("border-color", "#e51400");
      } else {
        d3.select('#location').style("border-color", "#e51400");
      }
    }
  }
};

module.exports = displayFormB;
