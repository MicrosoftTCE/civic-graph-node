var d3 = require('d3');
var $  = require('jquery');

var addInputData = require('./add-input-data');
var addInputLocations = require('./add-input-locations');
var addInputFund = require('./add-input-fund');
var addInputInvest = require('./add-input-invest');
var addInputFundGiven = require('./add-input-fund-given');
var addInputInvestMade = require('./add-input-invest-made');
var addInputKp = require('./add-input-kp');
var addDataList = require('./add-data-list');
var preParseForm = require('./pre-parse-form');
var displayFormB = require('./display-form-b');
var displayFormC = require('./display-form-c');
var preFillLocation = require('./pre-fill-location');
var preFillName = require('./pre-fill-name');

var u = require('../utilities');

var formATmpl = require("../templates/form-a.hbs");

var editForm = function() {
  d3.select('#edit-add-info')
    .html('<i class=" icon-file on-left"></i>Reset Form')
    .on('click', editForm);

  window.d3Node.on('mouseover', null);

  // Render the string into HTML
  d3.select('#info').html(formATmpl());

  d3.select('datalist#list-name').html(u.getSortedNameOptions());

  d3.select('input#name').on('keyup',
    function() {
      preParseForm(this.value);
    });

  d3.select('datalist#list-location').html(u.getSortedLocationOptions());

  d3.select('input#location').on(
    'keyup',
    function() {
      preFillLocation(this.value);
      addInputLocations(0);
    });

  // To split the location string into
  // different fields(city, state and country field)
  $( ".webform-content" ).on( "input", ".locations",
    function() {
      var string = $(this).val();
      var splitString = string.split(",");

      $(this).val(splitString[0]);

      var input1 = $(this).siblings("#state");
      var input2 = $(this).siblings("#country");

      // TODO: set cities
      // Make an ajax call to get the state and
      // country code on select of a location.
      // d3.json("/cities", function(error, cities){
      //   var cityNode = cities.nodes;

      //   for (var i =0; i <cityNode.length; i++) {
      //     var city = cityNode[i];

      //     if(city.City_Name == splitString[0]) {
      //       if(splitString.length === 2) {
      //         input1.val(city.State_Code);
      //       }
      //       if(splitString.length === 3) {
      //         input1.val(city.State_Code);
      //         input2.val(city.Country_Code);
      //       }
      //     }
      //   }
      // });
    });

  d3.select('#key-people-0 input[name="kpeople"]').on('keyup',
    function() {
      addInputKp(0);
    });

  addDataList('#funding-0 datalist', u.getSortedNameOptions());

  d3.select('#funding-0 input[name="fund"]').on('keyup',
    function() {
      addInputFund(0);
      preFillName(this.value, '#funding-0 input');
    });

  addDataList('#investing-0 datalist', u.getSortedNameOptions());

  d3.select('#investing-0 input[name="invest"]').on('keyup',
    function() {
      addInputInvest(0);
      preFillName(this.value, '#investing-0 input');
    });

  addDataList('#fundinggiven-0 datalist', u.getSortedNameOptions());

  d3.select('#fundinggiven-0 input[name="fundgiven"]').on('keyup',
    function() {
      addInputFundGiven(0);
      preFillName(this.value, '#fundinggiven-0 input');
    });

  addDataList('#investmentmade-0 datalist', u.getSortedNameOptions());

  d3.select('#investmentmade-0 input[name="investmade"]').on('keyup',
    function() {
      addInputInvestMade(0);
      preFillName(this.value, '#investmentmade-0 input');
    });

  addDataList('#data-0 datalist', u.getSortedNameOptions());

  d3.select('#data-0 input[name="data"]').on('keyup',
    function() {
      addInputData(0);
      preFillName(this.value, '#data-0 input');
    });

  d3.select("#toFormC").on('click',
    function() {
      displayFormC();
    });

  d3.selectAll('#submit-A').on('click',
    function() {
      d3.select('#name').style("border-color", "#d9d9d9");
      d3.select('#location').style("border-color", "#d9d9d9");
      displayFormB();
    });
};

module.exports = editForm;
