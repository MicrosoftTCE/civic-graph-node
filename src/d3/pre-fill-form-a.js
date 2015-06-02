var d3 = require('d3');
var $  = require('jquery');

var utils = require('../utilities');

var dataTmpl               = require("../templates/data.hbs");
var fundingTmpl            = require("../templates/funding.hbs");
var fundingGivenTmpl       = require("../templates/funding-given.hbs");
var investmentMadeTmpl     = require("../templates/investment-made.hbs");
var investmentRecievedTmpl = require("../templates/investment-received.hbs");
var keyPeopleTmpl          = require("../templates/key-people.hbs");
var locationTmpl           = require("../templates/location.hbs");
var employmentTmpl         = require("../templates/employment.hbs");

var preFillFormB = require('./pre-fill-form-b');
var preFillName  = require('./pre-fill-name');
var addDataList  = require('./add-data-list');
var displayFormB = require('./display-form-b');

var addInputFund        = require('./add-input-fund');
var addInputKp          = require('./add-input-kp');
var addInputLocations   = require('./add-input-locations');
var addInputFundGiven   = require('./add-input-fund-given');
var addInputInvest      = require('./add-input-invest');
var addInputInvestMade  = require('./add-input-invest-made');
var addInputData        = require('./add-input-data');


var preFillFormA = function (obj) {

  obj = obj[0][0].__data__;

  // Time to prefill the form...
  d3.selectAll('#name').text(
    function(d) {
      this.value = obj.name;
    }
  );

  if (obj.location.length > 0) {

    d3.json("/cities", function(error, cities) {
      var cityNodes = cities.cities;
      var locations  = obj.locations;

      for (var i = 0; i < locations.length; i++) {
        var cityObj = locations[i].city;
        var address = locations[i].address;
        var city      = cityObj.city_name;
        var state =   cityObj.state_name;
        var country = cityObj.country_name;

        $("#location-" + i) .after(locationTmpl({ idx: i }));

        d3.select('#location-' + i + ' input[name="location"]').on('keyup', null);

        d3.select('#location-' + i + ' input[name="location"]').text(
          function(e) {
            $(this).val(city);

            var input1 = $(this).siblings("#state");
            var input2 = $(this).siblings("#country");
            var input3 = $(this).siblings("#address").val(address);

            var length    = cityNodes.length;

            for (var j = 0; j < length; j++) {
              var cityStr = cityNodes[j];

              // console.log(cityStr, 'here', city);
              if(city === cityStr.city_name) {
                console.log('got in here too');
                input1.val(cityStr.state_code);
                input2.val(cityStr.country_code);
              }
            }
          }
        );
      }
    });

    d3.select('#location-' + obj.location.length + ' input[name="location"]')
      .on(
        'keyup',
        function() {
          addInputLocations(obj.location.length);
        }
      );
  }

  d3.selectAll('input[name="entitytype"]').filter(
    function(d, i) {

      this.checked = (this.value === obj.entity_type);d = false;
    }
  );

  if (obj.categories !== null) {
    d3.selectAll('.webform-categories input').filter(
      function(d, i) {

        this.checked =  (
          (obj.categories).indexOf(
            d3.selectAll('.webform-categories h4')[0][i].textContent
          ) > -1
        );
      }
    );
  }

  d3.selectAll('#website').text(
    function(d) {
      this.value = obj.website;
    }
  );

  d3.selectAll('#employee').text(
    function(d) {
      this.value = obj.employees;
    }
  );

  if (obj.key_people !== null) {
    var keypeople = obj.key_people;
    var len       = keypeople.length;

    for (var i = 0; i < len; i++) {
      $("#key-people-" + i).after(keyPeopleTmpl({ idx: i }));

      d3.select('#key-people-' + i + ' input[name="kpeople"]').on('keyup', null);

      d3.select('#key-people-' + i + ' input[name="kpeople"]').text(
        function(e) {
          this.value = keypeople[i].name;
        }
      );
    }

    d3.select('#key-people-' + keypeople.length + ' input[name="kpeople"]')
      .on(
        'keyup',
        function() {
          addInputKp(keypeople.length);
        }
      );
  }

  if (obj.funding_received.length > 0) {

    obj.funding_received.forEach(
      function(d, i) {
        $("#funding-" + i).after(fundingTmpl({ idx: i }));

        addDataList('#funding-' + i + ' datalist', utils.getSortedNameOptions());

        d3.select('#funding-' + i + ' input[name="fund"]').on('keyup',
          function() {
            preFillName(this.value, '#funding-' + i + ' input[name="fund"]');
          }
        );

        d3.select('#funding-' + i + ' input[name="fund"]').text(
          function(e) {
            this.value = d.entity;
          }
        );

        d3.select('#funding-' + i + ' input[name="fund_amt"]').text(
          function(e) {
            this.value = d.amount;
          }
        );

        d3.select('#funding-' + i + ' input[name="fund_year"]').text(
          function(e) {
            this.value = d.year;
          }
        );
      }
    );

    d3.select("#funding-" + fundingreceived.length + " input[name='fund']")
      .on(
        "keyup",
        function() {
          addInputFund(fundingreceived.length);
        }
      );
  }

  if (obj.funding_given.length > 0) {

    obj.funding_given.forEach(
      function(d, i) {
        $("#fundinggiven-" + i).after(fundingGivenTmpl({ idx: i }));

        addDataList('#fundinggiven-' + i + ' datalist', utils.getSortedNameOptions());

        d3.select('#fundinggiven-' + i + ' input[name="fundgiven"]').on('keyup', function() {
          preFillName(this.value, '#fundinggiven-' + i + ' input[name="fundgiven"]');
        });

        d3.select('#fundinggiven-' + i + ' input[name="fundgiven"]').text(function(e) {
          this.value = d.entity;
        });

        d3.select('#fundinggiven-' + i + ' input[name="fundgiven_amt"]').text(function(e) {
          this.value = d.amount;
        });

        d3.select('#fundinggiven-' + i + ' input[name="fundgiven_year"]').text(function(e) {
          this.value = d.year;
        });
      }
    );

    d3.select("#fundinggiven-" + fundinggiven.length + " input[name='fundgiven']")
      .on(
        "keyup",
        function() {
          addInputFundGiven(fundinggiven.length);
        }
      );
  }

  if (obj.investments_received.length > 0) {

    obj.investments_received.forEach(function(d, i) {
      $("#investing-" + i).after(investmentRecievedTmpl({ idx: i }));

      addDataList('#investing-' + i + ' datalist', utils.getSortedNameOptions());

      d3.select('#investing-' + i + ' input[name="invest"]').on('keyup',
        function() {
          preFillName(this.value, '#investing-' + i + ' input[name="invest"]');
        }
      );

      d3.select('#investing-' + i + ' input[name="invest"]').text(
        function(e) {
          this.value = d.entity;
        }
      );

      d3.select('#investing-' + i + ' input[name="invest_amt"]').text(
        function(e) {
          this.value = d.amount;
        }
      );

      d3.select('#investing-' + i + ' input[name="invest_year"]').text(
        function(e) {
          this.value = d.year;
        }
      );
    });

    d3.select("#investing-" + investmentreceived.length + " input[name='invest']")
      .on(
        "keyup",
        function() {
          addInputInvest(investmentreceived.length);
        }
      );
  }

  if (obj.investments_made.length > 0) {

    obj.investments_made.forEach(function(d, i) {
      $("#investmentmade-" + i).after(investmentMadeTmpl({ idx: i }));

      addDataList('#investmentmade-' + i + ' datalist', utils.getSortedNameOptions());

      d3.select('#investmentmade-' + i + ' input[name="investmade"]')
        .on(
          'keyup',
          function() {
            preFillName(this.value, '#investmentmade-' + i + ' input[name="investmade"]');
          }
        );

      d3.select('#investmentmade-' + i + ' input[name="investmade"]').text(
        function(e) {
          this.value = d.entity;
        }
      );

      d3.select('#investmentmade-' + i + ' input[name="investmade_amt"]').text(
        function(e) {
          this.value = d.amount;
        }
      );

      d3.select('#investmentmade-' + i + ' input[name="investmade_year"]').text(
        function(e) {
          this.value = d.year;
        }
      );
    });

    d3.select("#investmentmade-" + obj.investments_made.length + " input[name='investmade']")
      .on(
        "keyup",
        function() {
          addInputInvestMade(obj.investments_made.length);
        }
      );
  }

  if (obj.employers.length > 0) {

    obj.employers.forEach(function(d, i) {
      $("#employment-" + i).after(employmentTmpl({ idx: i }));

      addDataList('#employment-' + i + ' datalist', utils.getSortedNameOptions());

      d3.select('#employment-' + i + ' input[name="employment"]').on('keyup',
        function() {
          preFillName(this.value, '#employment-' + i + ' input[name="employment"]');
        }
      );

      d3.select('#employment-' + i + ' input[name="employment"]').text(
        function(e) {
          this.value = d.entity;
        }
      );
    });

    d3.select("#employment-" + obj.employers.length + " input[name='employment']")
      .on(
        "keyup",
        function() {
          addInputData(obj.employers.length);
        }
      );
  }

  if (obj.data.length > 0) {

    obj.data.forEach(function(d, i) {
      $("#data-" + i).after(dataTmpl({ idx: i }));

      addDataList('#data-' + i + ' datalist', utils.getSortedNameOptions());

      d3.select('#data-' + i + ' input[name="data"]').on('keyup',
        function() {
          preFillName(this.value, '#data-' + i + ' input[name="data"]');
        }
      );

      d3.select('#data-' + i + ' input[name="data"]').text(
        function(e) {
          this.value = d.entity;
        }
      );
    });

    d3.select("#data-" + dataProviders.length + " input[name='data']")
      .on(
        "keyup",
        function() {
          addInputData(dataProviders.length);
        }
      );
  }

  d3.selectAll('#submit-A').on('click', function() {
    d3.select('#name').style("border-color", "#d9d9d9");
    d3.select('#location').style("border-color", "#d9d9d9");
    displayFormB();
    preFillFormB(obj);
  });
};

module.exports = preFillFormA;

