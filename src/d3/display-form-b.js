var d3 = require('d3');
var formB = require("jade!../templates/form-b.jade");

var displayFormB = function() {
  // Now we have a perfectly structured JSON object that contains
  // the information given by the user and inputted into the webform.
  // Send this object as a parameter to form B, and render form B accordingly.

  var formObject = processFormA();

  if (formObject.location && formObject.name) {
    var counterKey = 0;
    var counterK = 0;

    var counterFund = 0;
    var counterF = 0;

    // Render form B.
    var form = formB({});

    d3.select('#info')
      .html(s);

    addDataList('#collaboration-0 datalist');


    // Time to prefill the form...
    d3.selectAll('#name').text(function(d) {
      this.value = formObject.name;
    }).attr("disabled", true);

    if( formObject.location !== null) {
      var location = formObject.location;
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
            this.value = location[i];
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
    d3.selectAll('input[name="collaboration"]').on('keyup', function() {
      add_input_collab(0);
      preFillName(this.value, '#collaboration-0 input');
    });
    d3.selectAll('input[name="revenue_amt"]').on('keyup', function() {
      add_input_rev(0);
    });
    d3.selectAll('input[name="expense_amt"]').on('keyup', function() {
      add_input_exp(0);
    });
    // d3.selectAll('input[name="grant_amt"]').on('keyup', function() {
    //   add_input_grant(0);
    // });

    d3.selectAll('#submit-B').on('click', function() {
      displayFormCSendJSON(formObject);
      // if(!_.isEmpty(sb))
    });
  } else { //  Error checking the form...
    if (!formObject.name && !formObject.location) {
      d3.select('#name').style("border-color", "#e51400");
      d3.select('#location').style("border-color", "#e51400");
    } else {
      if (!formObject.name)
        d3.select('#name').style("border-color", "#e51400");
      else
        d3.select('#location').style("border-color", "#e51400");
    }
  }
};

module.exports = displayFormB;
