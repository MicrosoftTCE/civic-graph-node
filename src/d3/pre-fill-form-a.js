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

var displayFormB = require('./display-form-b');
var preFillFormB = require('./pre-fill-form-b');
var preFillName  = require('./pre-fill-name');
var addDataList  = require('./add-data-list');

var addInputFund        = require('./add-input-fund');
var addInputKp          = require('./add-input-kp');
var addInputLocations   = require('./add-input-locations');
var addInputFundGiven   = require('./add-input-fund-given');
var addInputInvest      = require('./add-input-invest');
var addInputInvestMade  = require('./add-input-invest-made');
var addInputData        = require('./add-input-data');

var preFillFormA = function (obj) {
  // Time to prefill the form...
  d3.selectAll('#name').text(
    function(d) {
      this.value = obj.name;
    }
  );

  if (obj.location !== null) {

    d3.json("/cities", function(error, cities) {
      var cityNodes = cities.nodes;
      var location  = obj.location;
      var len       = location.length;

      for (var i = 0; i < len; i++) {
        var string      = location[i].location;
        var splitString = string.split(",");

        $("#location-" + i) .after(locationTmpl({ idx: i }));

        d3.select('#location-' + i + ' input[name="location"]').on('keyup', null);

        d3.select('#location-' + i + ' input[name="location"]').text(
          function(e) {
            $(this).val(splitString[0]);

            var input1 = $(this).siblings("#state");
            var input2 = $(this).siblings("#country");
            var len    = cityNodes.length;

            for (var j = 0; j < len; j++) {
              var city = cityNodes[j];

              if(city.cityName == splitString[0]) {
                if(splitString.length === 2) {
                  input1.val(city.stateCode);
                }

                if(splitString.length === 3) {
                  input1.val(city.stateCode);
                  input2.val(city.countryCode);
                }
              }
            }
          }
        );
      }
    });

    d3.select('#location-' + location.length + ' input[name="location"]')
      .on(
        'keyup',
        function() {
          addInputLocations(location.length);
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
      this.value = obj.url;
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

  if (obj.funding_received !== null) {
    var fundingreceived = obj.funding_received;

    fundingreceived.forEach(
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

  if (obj.funding_given !== null) {
    var fundinggiven = obj.funding_given;

    fundinggiven.forEach(
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

  if (obj.investments_received !== null) {
    var investmentreceived = obj.investments_received;

    investmentreceived.forEach(function(d, i) {
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

  if (obj.investments_made !== null) {
    var investmentsmade = obj.investments_made;

    investmentsmade.forEach(function(d, i) {
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

    d3.select("#investmentmade-" + investmentsmade.length + " input[name='investmade']")
      .on(
        "keyup",
        function() {
          addInputInvestMade(investmentsmade.length);
        }
      );
  }

  if (obj.data !== null) {
    var dataProviders = obj.data;

    dataProviders.forEach(function(d, i) {
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

