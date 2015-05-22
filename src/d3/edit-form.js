var d3 = require('d3');

var editForm = function() {
  d3.select('#edit-add-info').html('<i class=" icon-file on-left"></i>' + 'Reset Form').on('click', editForm);

  node
    .on('mouseover', null);

  sa = displayFormA();

  // Render the string into HTML
  d3.select('#info')
    .html(sa);

  d3.select('datalist#list-name').html(dataListSortedNames);
  d3.select('input#name').on('keyup', function() {
    preParseForm(this.value);
  });

  d3.select('datalist#list-location').html(dataListSortedLocations);
  d3.select('input#location').on('keyup', function() {
    preFillLocation(this.value);
    add_input_locations(0);
  });


  //To split the location string into different fields(city, state and country field)
  $( ".webform-content" ).on( "input", ".locations", function() {
    var string = $(this).val();
    var splitString = string.split(",");
    $(this).val(splitString[0]);
    input1 = $(this).siblings("#state");
    input2 = $(this).siblings("#country");

    //make an ajax call to get the state and country code on select of a location.
    d3.json("/cities", function(error, cities){
      var cityNode = cities.nodes;
      for (var i =0; i <cityNode.length; i++) {
        var city = cityNode[i];
        if(city.City_Name == splitString[0]) {
          if(splitString.length === 2) {
            input1.val(city.State_Code);
          }
          if(splitString.length === 3) {
            input1.val(city.State_Code);
            input2.val(city.Country_Code);
          }
        }
      }
    });
  });

  d3.select('#key-people-0 input[name="kpeople"]').on('keyup', function() {
    add_input_kp(0);
  });

  addDataList('#funding-0 datalist');
  d3.select('#funding-0 input[name="fund"]').on('keyup', function() {
    add_input_fund(0);
    preFillName(this.value, '#funding-0 input');
  });

  addDataList('#investing-0 datalist');
  d3.select('#investing-0 input[name="invest"]').on('keyup', function() {
    add_input_invest(0);
    preFillName(this.value, '#investing-0 input');
  });

  addDataList('#fundinggiven-0 datalist');
  d3.select('#fundinggiven-0 input[name="fundgiven"]').on('keyup', function() {
    add_input_fund_given(0);
    preFillName(this.value, '#fundinggiven-0 input');
  });

  addDataList('#investmentmade-0 datalist');
  d3.select('#investmentmade-0 input[name="investmade"]').on('keyup', function() {
    add_input_invest_made(0);
    preFillName(this.value, '#investmentmade-0 input');
  });

  addDataList('#data-0 datalist');
  d3.select('#data-0 input[name="data"]').on('keyup', function() {
    add_input_data(0);
    preFillName(this.value, '#data-0 input');
  });

  d3.select("#toFormC").on('click', function() {
    displayFormC();
  });

  d3.selectAll('#submit-A').on('click', function() {
    d3.select('#name').style("border-color", "#d9d9d9");
    d3.select('#location').style("border-color", "#d9d9d9");
    displayFormB();
    // if(!_.isEmpty(sb))

  });
};

module.exports = editForm;
