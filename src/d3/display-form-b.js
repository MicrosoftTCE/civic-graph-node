var d3 = require('d3');

var processFormA          = require('./process-form-a');
var preFillName           = require('./pre-fill-name');
var addDataList           = require('./add-data-list');
var addInputLoc           = require('./add-input-loc');
var addInputCollab        = require('./add-input-collab');
var addInputRev           = require('./add-input-rev');
var addInputExp           = require('./add-input-exp');
var processFormB          = require('./process-form-b')

var utils = require('../utilities');

var formBTmpl = require("../templates/form-b.hbs");

var displayFormB = function() {
  // Now we have a perfectly structured JSON object that contains
  // the information given by the user and inputted into the webform.
  // Send this object as a parameter to form B, and render form B accordingly.

  var formObject = processFormA();

  if (formObject.locations && formObject.name) {
    var counterKey = 0;
    var counterK = 0;

    var counterFund = 0;
    var counterF = 0;

    // Render form B.
    var form = formBTmpl(formObject);

    d3.select('#info').html(form);

    addDataList('#collaboration-0 datalist', utils.getSortedNameOptions());

    if( formObject.locations > 0) {

      d3.select('#location-' + formObject.locations.length + ' input[name="location"]')
        .on('keyup', function() {
          addInputLoc(formObject.locations.length);
        })
    }


    d3.selectAll('#name').text(function(d) {
        this.value = formObject.name;
    }).attr("disabled", true);

    if( formObject.locations > 0) {
      var location = formObject.locations;
      for(var i=0; i<location.length; i++) {
        if(i === 0) {
          d3.select('#location-' + i + ' input[name="location"]').on('keyup', null);
          d3.select('#location-' + i + ' input[name="location"]').text(function(e) {
            this.value = location[i];
            this.disabled = true;
          });
        } else {
          $("#location-" + (i-1)).after('<div id="location-' + i + '" class="input-control text" data-role="input-control"><input type="text" name="location" class="locations" id="location" placeholder="City" /></div>');
          d3.select('#location-' + i + ' input[name="location"]').on('keyup', null);
          d3.select('#location-' + i + ' input[name="location"]').text(function(e) {
            if(location[i].length === 2) {
              var secondStr = location[i][1] ? location[i][1] : location[i][2];
              var cityStr = location[i].city.concat(secondStr);
            } else if (location[i].length === 3) {
              var cityString = location[i].city.concat(location[i].state).concat(location[i].country);
            }
            this.value = location[i].city;
            this.disabled = true;
          });
        }
      }

      d3.select('#location-' + location.length + ' input[name="location"]').on('keyup', function() {
        add_input_loc(location.length);
      }).style("margin-top", "10px");
    }

    d3.selectAll('input[name="entitytype"]').filter(function(d, i) {
      if (this.value === formObject.type)
        this.checked = true;
      else
        this.checked = false;
      this.disabled = true;
    });



    // Add action listeners
    d3.selectAll('input[name="collaboration"]').on(
      'keyup',
      function() {
        addInputCollab(0);

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
      function() {
        var formObj = processFormB(formObject);

        console.log('clicked submit button');
        d3.xhr('/entities')
          .header("Content-Type", "application/json")
          .post(
            JSON.stringify(formObject),
            function(err, rawData){
              var data = JSON.parse(rawData);
              console.log("got response", data);
            }
        );
      }
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
