var d3 = require('d3');
var $  = require('jquery');

var dataTmpl               = require("jade!../templates/data.jade");
var fundingTmpl            = require("jade!../templates/funding.jade");
var fundingGivenTmpl       = require("jade!../templates/funding-given.jade");
var investmentMadeTmpl     = require("jade!../templates/investment-made.jade");
var investmentRecievedTmpl = require("jade!../templates/investment-received.jade");
var keyPeopleTmpl          = require("jade!../templates/key-people.jade");
var locationTmpl           = require("jade!../templates/location.jade");

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

var preFillFormA = function (
  obj,
  dataListSortedNames,
  dataListSortedLocations,
  locationsHash
) {
  console.log("Running preFillFormA with obj =", obj);

  // Time to prefill the form...
  d3.selectAll('#name').text(
    function(d) {
      console.log("Setting #name to " + obj.name);
      this.value = obj.name;
    }
  );

  if (obj.location !== null) {

    d3.json("/cities", function(error, cities) {
      console.log("Returning from AJAX GET to /cities with error, cities =", error, cities);

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
            console.log("Settting #location-" + i + " input[name='location'] text with e =", e);

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
          console.log(
            "Running location onKeyup on " + location +
            " and calling addInputLocations with length = " + location.length
          );

          addInputLocations(location.length, locationsHash);
        }
      );
  }

  d3.selectAll('input[name="entitytype"]').filter(
    function(d, i) {
      console.log("Running filter on input[name='entitytype'] with d, i", d, i);

      this.checked = (this.value === obj.type);d = false;
    }
  );

  if (obj.categories !== null) {
    d3.selectAll('.webform-categories input').filter(
      function(d, i) {
        console.log("Running filter on .webform-categories input with d, i", d, i);

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
      console.log("Running text on #website with d =", d);
      console.log("Setting value = " + obj.url);

      this.value = obj.url;
    }
  );

  d3.selectAll('#employee').text(
    function(d) {
      console.log("Running text on #employee with d=", d);
      console.log("Setting value = " + obj.employees);

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
          console.log("Running text on #key-people-" + i + " input[name=kpeople] with e =", e);
          console.log("Setting value = " + keypeople[i].name);

          this.value = keypeople[i].name;
        }
      );
    }

    d3.select('#key-people-' + keypeople.length + ' input[name="kpeople"]')
      .on(
        'keyup',
        function() {
          console.log("Running onKeyup on #key-people-" + keypeople.length + " input[name=kpeople]");
          console.log("Calling addInputKp with length = " + keypeople.length);

          addInputKp(keypeople.length);
        }
      );
  }

  if (obj.funding_received !== null) {
    var fundingreceived = obj.funding_received;

    fundingreceived.forEach(
      function(d, i) {
        console.log("Running fundingreceived forEach with d, i =", d, i);

        $("#funding-" + i).after(fundingTmpl({ idx: i }));

        addDataList('#funding-' + i + ' datalist', dataListSortedNames);

        d3.select('#funding-' + i + ' input[name="fund"]').on('keyup',
          function() {
            console.log("Running preFillName on #funding-" + i + " input[name=fund] with " + this.value);

            preFillName(this.value, '#funding-' + i + ' input[name="fund"]');
          }
        );

        d3.select('#funding-' + i + ' input[name="fund"]').text(
          function(e) {
            console.log("Running text on #funding-" + i + " input[name=fund] set value = " + d.entity);

            this.value = d.entity;
          }
        );

        d3.select('#funding-' + i + ' input[name="fund_amt"]').text(
          function(e) {
            console.log("Running text on #funding-" + i + " input[name=fund_amt] set value = " + d.amount);

            this.value = d.amount;
          }
        );

        d3.select('#funding-' + i + ' input[name="fund_year"]').text(
          function(e) {
            console.log("Running text on #funding-" + i + " input[name=fund_year] set value = " + d.year);

            this.value = d.year;
          }
        );
      }
    );

    d3.select("#funding-" + fundingreceived.length + " input[name='fund']")
      .on(
        "keyup",
        function() {
          console.log("Running onKeyup on #funding-" + fundingreceived.length + " input[name=fund]");
          console.log("Calling addInputFund with length");

          addInputFund(fundingreceived.length, dataListSortedNames);
        }
      );
  }

  if (obj.funding_given !== null) {
    var fundinggiven = obj.funding_given;

    fundinggiven.forEach(
      function(d, i) {
        console.log("Running fundinggiven forEach with d, i =", d, i);
        $("#fundinggiven-" + i).after(fundingGivenTmpl({ idx: i }));

        addDataList('#fundinggiven-' + i + ' datalist', dataListSortedNames);

        d3.select('#fundinggiven-' + i + ' input[name="fundgiven"]').on('keyup', function() {
          console.log("Running preFillName on #fundinggiven-" + i + " input[name=fundgiven] with " + this.value);
          preFillName(this.value, '#fundinggiven-' + i + ' input[name="fundgiven"]');
        });

        d3.select('#fundinggiven-' + i + ' input[name="fundgiven"]').text(function(e) {
          console.log("Running text on #fundinggiven-" + i + " input[name=fundgiven] set value = " + d.entity);
          this.value = d.entity;
        });

        d3.select('#fundinggiven-' + i + ' input[name="fundgiven_amt"]').text(function(e) {
          console.log("Running text on #fundinggiven-" + i + " input[name=fundgiven_amt] set value = " + d.amount);
          this.value = d.amount;
        });

        d3.select('#fundinggiven-' + i + ' input[name="fundgiven_year"]').text(function(e) {
          console.log("Running text on #fundinggiven-" + i + " input[name=fundgiven_year] set value = " + d.year);
          this.value = d.year;
        });
      }
    );

    d3.select("#fundinggiven-" + fundinggiven.length + " input[name='fundgiven']")
      .on(
        "keyup",
        function() {
          console.log("Running onKeyup on #fundinggiven-" + fundinggiven.length + " input[name=fundgiven]");
          console.log("Calling addInputFundGiven with length");

          addInputFundGiven(fundinggiven.length, dataListSortedNames);
        }
      );
  }

  if (obj.investments_received !== null) {
    var investmentreceived = obj.investments_received;

    investmentreceived.forEach(function(d, i) {
      console.log("Running investmentreceived forEach with d, i =", d, i);
      $("#investing-" + i).after(investmentRecievedTmpl({ idx: i }));

      addDataList('#investing-' + i + ' datalist', dataListSortedNames);

      d3.select('#investing-' + i + ' input[name="invest"]').on('keyup',
        function() {
          console.log("Running preFillName on #investing-" + i + " input[name=invest] with " + this.value);
          preFillName(this.value, '#investing-' + i + ' input[name="invest"]');
        }
      );

      d3.select('#investing-' + i + ' input[name="invest"]').text(
        function(e) {
          console.log("Running text on #investing-" + i + " input[name=invest] set value = " + d.entity);
          this.value = d.entity;
        }
      );

      d3.select('#investing-' + i + ' input[name="invest_amt"]').text(
        function(e) {
          console.log("Running text on #investing-" + i + " input[name=invest_amt] set value = " + d.amount);
          this.value = d.amount;
        }
      );

      d3.select('#investing-' + i + ' input[name="invest_year"]').text(
        function(e) {
          console.log("Running text on #investing-" + i + " input[name=invest_year] set value = " + d.year);
          this.value = d.year;
        }
      );
    });

    d3.select("#investing-" + investmentreceived.length + " input[name='invest']")
      .on(
        "keyup",
        function() {
          console.log("Running onKeyup on #investing-" + investmentreceived.length + " input[name=invest]");
          console.log("Calling addInputInvest with length");

          addInputInvest(investmentreceived.length, dataListSortedNames);
        }
      );
  }

  if (obj.investments_made !== null) {
    var investmentsmade = obj.investments_made;

    investmentsmade.forEach(function(d, i) {
      console.log("Running investmentsmade forEach with d, i =", d, i);
      $("#investmentmade-" + i).after(investmentMadeTmpl({ idx: i }));

      addDataList('#investmentmade-' + i + ' datalist', dataListSortedNames);

      d3.select('#investmentmade-' + i + ' input[name="investmade"]')
        .on(
          'keyup',
          function() {
            console.log("Running preFillName on #investing-" + i + " input[name=invest] with " + this.value);
            preFillName(this.value, '#investmentmade-' + i + ' input[name="investmade"]');
          }
        );

      d3.select('#investmentmade-' + i + ' input[name="investmade"]').text(
        function(e) {
          console.log("Running text on #investmentmade-" + i + " input[name=investmade] set value = " + d.entity);
          this.value = d.entity;
        }
      );

      d3.select('#investmentmade-' + i + ' input[name="investmade_amt"]').text(
        function(e) {
          console.log("Running text on #investmentmade-" + i + " input[name=investmade_amt] set value = " + d.amount);
          this.value = d.amount;
        }
      );

      d3.select('#investmentmade-' + i + ' input[name="investmade_year"]').text(
        function(e) {
          console.log("Running text on #investmentmade-" + i + " input[name=investmade_year] set value = " + d.year);
          this.value = d.year;
        }
      );
    });

    d3.select("#investmentmade-" + investmentsmade.length + " input[name='investmade']")
      .on(
        "keyup",
        function() {
          console.log("Running onKeyup on #investmentmade-" + investmentsmade.length + " input[name=investmade]");
          console.log("Calling addInputInvestMade with length");

          addInputInvestMade(investmentsmade.length, dataListSortedNames);
        }
      );
  }

  // if (obj.employment !== null) {
  //   var employers = obj.employer;

  //   dataProviders.forEach(function(d, i) {
  //     console.log("Running dataProviders forEach with d, i =", d, i);
  //     $("#data-" + i).after(dataTmpl({ idx: i }));

  //     addDataList('#data-' + i + ' datalist', dataListSortedNames);

  //     d3.select('#data-' + i + ' input[name="data"]').on('keyup',
  //       function() {
  //         console.log("Running preFillName on #data-" + i + " input[name=data] with " + this.value);
  //         preFillName(this.value, '#data-' + i + ' input[name="data"]');
  //       }
  //     );

  //     d3.select('#data-' + i + ' input[name="data"]').text(
  //       function(e) {
  //         console.log("Running text on #data-" + i + " input[name=data] set value = " + d.entity);
  //         this.value = d.entity;
  //       }
  //     );
  //   });

  //   d3.select("#data-" + dataProviders.length + " input[name='data']")
  //     .on(
  //       "keyup",
  //       function() {
  //         console.log("Running onKeyup on #data-" + dataProviders.length + " input[name=data]");
  //         console.log("Calling addInputData with length");
  //         addInputData(dataProviders.length, dataListSortedNames);
  //       }
  //     );
  // }

  if (obj.data !== null) {
    var dataProviders = obj.data;

    dataProviders.forEach(function(d, i) {
      console.log("Running dataProviders forEach with d, i =", d, i);
      $("#data-" + i).after(dataTmpl({ idx: i }));

      addDataList('#data-' + i + ' datalist', dataListSortedNames);

      d3.select('#data-' + i + ' input[name="data"]').on('keyup',
        function() {
          console.log("Running preFillName on #data-" + i + " input[name=data] with " + this.value);
          preFillName(this.value, '#data-' + i + ' input[name="data"]');
        }
      );

      d3.select('#data-' + i + ' input[name="data"]').text(
        function(e) {
          console.log("Running text on #data-" + i + " input[name=data] set value = " + d.entity);
          this.value = d.entity;
        }
      );
    });

    d3.select("#data-" + dataProviders.length + " input[name='data']")
      .on(
        "keyup",
        function() {
          console.log("Running onKeyup on #data-" + dataProviders.length + " input[name=data]");
          console.log("Calling addInputData with length");
          addInputData(dataProviders.length, dataListSortedNames);
        }
      );
  }

  d3.selectAll('#submit-A').on('click', function() {
    console.log("Running onClick for #submit-A");

    d3.select('#name').style("border-color", "#d9d9d9");
    d3.select('#location').style("border-color", "#d9d9d9");

    displayFormB(
      dataListSortedNames,
      dataListSortedLocations,
      locationsHash
    );
    preFillFormB(obj);
  });
};

module.exports = preFillFormA;

