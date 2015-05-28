var d3 = require('d3');

var utils = require('../utilities');

var formATmpl = require("jade!../templates/form-a.jade");

var editForm = function(
  dataListSortedLocations,
  locationsHash
) {
  console.log("Running editForm");

  d3.select('#edit-add-info')
    .html('<i class=" icon-file on-left"></i>Reset Form')
    .on('click', editForm);

  window.d3Node.on('mouseover', null);

  sa = formATmpl();

  // Render the string into HTML
  d3.select('#info').html(sa);

  d3.select('datalist#list-name').html(utils.getSortedNameOptions());

  d3.select('input#name').on('keyup',
    function() {
      console.log("Running onKeyup for input#name");
      preParseForm(this.value);
    });

  d3.select('datalist#list-location').html(dataListSortedLocations);

  d3.select('input#location').on('keyup',
    function() {
      console.log("Running onKeyup for input#location");
      preFillLocation(this.value);
      addInputLocations(0, locationsHash);
    });

  // To split the location string into
  // different fields(city, state and country field)
  $( ".webform-content" ).on( "input", ".locations",
    function() {
      console.log("Running onInput .locations on .webform-content ???");
      var string = $(this).val();
      var splitString = string.split(",");

      $(this).val(splitString[0]);

      var input1 = $(this).siblings("#state");
      var input2 = $(this).siblings("#country");

      // Make an ajax call to get the state and
      // country code on select of a location.
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

  d3.select('#key-people-0 input[name="kpeople"]').on('keyup',
    function() {
      console.log("Running onKeyup on #key-people-0 input[name=kpeople]");
      addInputKp(0);
    });

  addDataList('#funding-0 datalist', utils.getSortedNameOptions());

  d3.select('#funding-0 input[name="fund"]').on('keyup',
    function() {
      console.log("Running onKeyup on #funding-0 input[name=fund]");
      addInputFund(0);
      preFillName(this.value, '#funding-0 input');
    });

  addDataList('#investing-0 datalist', utils.getSortedNameOptions());

  d3.select('#investing-0 input[name="invest"]').on('keyup',
    function() {
      console.log("Running onKeyup on #investing-0 input[name=invest]");
      addInputInvest(0);
      preFillName(this.value, '#investing-0 input');
    });

  addDataList('#fundinggiven-0 datalist', utils.getSortedNameOptions());

  d3.select('#fundinggiven-0 input[name="fundgiven"]').on('keyup',
    function() {
      console.log("Running onKeyup on #fundinggiven-0 input[name=fundgiven]");
      addInputFundGiven(0);
      preFillName(this.value, '#fundinggiven-0 input');
    });

  addDataList('#investmentmade-0 datalist', utils.getSortedNameOptions());

  d3.select('#investmentmade-0 input[name="investmade"]').on('keyup',
    function() {
      console.log("Running onKeyup on #investmentmade-0 input[name=investmade]");
      addInputInvestMade(0);
      preFillName(this.value, '#investmentmade-0 input');
    });

  addDataList('#data-0 datalist', utils.getSortedNameOptions());

  d3.select('#data-0 input[name="data"]').on('keyup',
    function() {
      console.log("Running onKeyup on #data-0 input[name=data]");
      addInputData(0);
      preFillName(this.value, '#data-0 input');
    });

  d3.select("#toFormC").on('click',
    function() {
      console.log("Running onClick on #toFormC");
      displayFormC(
        dataListSortedLocations,
        locationsHash
      );
    });

  d3.selectAll('#submit-A').on('click',
    function() {
      console.log("Running onClick on #submit-A");
      d3.select('#name').style("border-color", "#d9d9d9");
      d3.select('#location').style("border-color", "#d9d9d9");
      displayFormB(
        dataListSortedLocations,
        locationsHash
      );
    });
};

module.exports = editForm;
