var formATmpl              = require("jade!../templates/form-a.jade");
var editDisplayTmpl        = require("jade!../templates/edit-display.jade");
var locTmpl                = require("jade!../templates/loc.jade");
var locationTmpl           = require("jade!../templates/location.jade");
var keyPeopleTmpl          = require("jade!../templates/key-people.jade");
var investingTmpl          = require("jade!../templates/investing.jade");
var fundingGivenTmpl       = require("jade!../templates/funding-given.jade");
var dataTmpl               = require("jade!../templates/data.jade");
var collaborationTmpl      = require("jade!../templates/collaboration.jade");
var revenueTmpl            = require("jade!../templates/revenue.jade");
var expensesTmpl           = require("jade!../templates/expenses.jade");
var investmentMadeTmpl     = require("jade!../templates/investment-made.jade");
var investmentRecievedTmpl = require("jade!../templates/investment-received.jade");
var entityNamesTmpl        = require("jade!../templates/entity-names.jade");

function drawGraph() {
  var wrap = require('./wrap');
  var transformText = require('./transform-text');
  var translation = require('./translation');
  var numCommas = require('./num-commas');
  var weightSorter = require('./weight-sorter');

  var width = 1000;
  var height = 1000;

  var allNodes;
  var forProfitNodes;
  var nonProfitNodes;
  var individualNodes;
  var governmentNodes;

  var fiveMostConnectedForProfit = {};
  var fiveMostConnectedNonProfit = {};
  var fiveMostConnectedIndividuals = {};
  var fiveMostConnectedGovernment = {};

  var clearResetFlag = 1;

  var collaborationConnections;
  var dataConnections;
  // var fundingConnections;
  var investmentConnections;

  var centeredNode = {};

  var entitiesHash = {}; // lowercase
  var locationsHash = {}; // Lowercase

  var sortedNamesList = []; // Presentation
  var sortedLocationsList = []; // Presentation
  var sortedSearchList = []; // Presentation

  var dataListSortedNames;
  var dataListSortedLocations;

  var svg = d3.select('.content')
    .append('svg')
    .attr("xmlns", 'http://www.w3.org/2000/svg')
    .attr("id", 'network')
    .attr("height", height)
    .attr("width", width)
    .style("top", "-50px")
    .style("position", "relative");

  d3.select('body > nav > nav > div')
    .append('div')
    .attr('id', 'editBox')
    .append('p')
    .text('Edit')
    .style('color', '#2e92cf');

  var aspect = width / height;
  var network = $('#network');
  var container = network.parent();

  $(window).on('resize', function() {
    var targetWidth = container.width();
    network.attr("width", targetWidth);
    network.attr("height", Math.round(targetWidth / aspect));
  }).trigger("resize");

  var viewBoxParameters = '0 0 ' + width + ' ' + height;

  svg.attr("viewBox", viewBoxParameters)
    .attr("preserveAspectRatio", 'xMidYMid');

  //  Static Scale
  //  Improve by dynamically obtaining min and max values
  var empScale = d3.scale.sqrt().domain([10, 130000]).range([10, 50]);
  var twitScale = d3.scale.sqrt().domain([10, 1000000]).range([10, 50]);


  d3.json("/athena", function(error, graph) {
    var allNodes                 = graph.entities;
    var fundingConnections       = graph.funding_connections;
    var investmentConnections    = graph.investment_connections;
    var collaborationConnections = graph.collaboration_connections;
    var dataConnections          = graph.data_connections;

    var connections = fundingConnections
      .concat(investmentConnections)
      .concat(collaborationConnections)
      .concat(dataConnections);

    var force = d3
      .layout
      .force()
      .nodes(allNodes)
      .size([width, height])
      .links(connections)
      .linkStrength(0)
      .charge(function(d) {
        if (d.render === 1) {
          if (d.employees !== null) {
            return -6 * empScale(d.employees);
          } else {
            return -25;
          }
        } else {
          return 0;
        }
      })
      .linkDistance(50)

    var drag = force
      .drag()
      .on("dragstart", drag)
      .on("drag", drag)
      .on("dragend", dragend);

    //  FUNDINGS
    var fundLink = svg
      .selectAll(".fund")
      .data(fundingConnections)
      .enter().append("line")
      .attr("class", "fund")
      .style("stroke", "rgb(111,93,168)")
      .style("stroke-width", "1")
      .style("opacity", "0.2")
      .style("visibility", "visible");

    //  INVESTMENTS
    var investLink = svg
      .selectAll(".invest")
      .data(investmentConnections)
      .enter().append("line")
      .attr("class", "invest")
      .style("stroke", "rgb(38,114,114)")
      .style("stroke-width", "1")
      .style("opacity", "0.2")
      .style("visibility", "visible");

    //  COLLABORATIONS
    var porucsLink = svg
      .selectAll(".porucs")
      .data(collaborationConnections)
      .enter().append("line")
      .attr("class", "porucs")
      .style("stroke", "rgb(235,232,38)")
      .style("stroke-width", "1")
      .style("opacity", "0.2")
      .style("visibility", "visible");

    //  data
    var dataLink = svg
      .selectAll(".data")
      .data(dataConnections)
      .enter().append("line")
      .attr("class", "data")
      .style("stroke", "rgb(191,72,150)")
      .style("stroke-width", "1")
      .style("opacity", "0.2")
      .style("visibility", "visible");

    var nodeInit = svg
      .selectAll(".node")
      .data(allNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("visibility", "visible")
      .on('dblclick', dblclick)
      .call(drag);

    force
      .on("tick", tick)
      .start();

    forProfitNodes = svg
      .selectAll('.node')
      .filter(function(d) { return d.type === "For-Profit"; })
      .sort(weightSorter);
    nonProfitNodes = svg
      .selectAll('.node')
      .filter(function(d) { return d.type === "Non-Profit"; })
      .sort(weightSorter);
    individualNodes = svg
      .selectAll('.node')
      .filter(function(d) { return d.type === "Individual"; })
      .sort(weightSorter);
    governmentNodes = svg
      .selectAll('.node')
      .filter(function(d) { return d.type === "Government"; })
      .sort(weightSorter);

    // Select the nodes to choose for highlighting nickname
    // on visualization (TOP 5)
    forProfitNodes.each(function(d, i) {
      if (i >= forProfitNodes[0].length - 5) {
        fiveMostConnectedForProfit[d.name] = d.weight;
      }
    });

    nonProfitNodes.each(function(d, i) {
      if (i >= nonProfitNodes[0].length - 5) {
        fiveMostConnectedNonProfit[d.name] = d.weight;
      }
    });

    individualNodes.each(function(d, i) {
      if (i >= individualNodes[0].length - 5) {
        fiveMostConnectedIndividuals[d.name] = d.weight;
      }
    });

    governmentNodes.each(function(d, i) {
      if (i >= governmentNodes[0].length - 5) {
        fiveMostConnectedGovernment[d.name] = d.weight;
      }
    });

    var textElement = svg
      .selectAll('.node')
      .append('text')
      .text(function(d) { return d.nickname; })
      .attr("x", 0)
      .attr("dy", "0.1em")
      .attr("y",
        function(d) {
          if (d.employees !== null) {
            return empScale(d.employees) + 10;
          } else {
            return 7 + 10;
          }
        })
      .style('opacity',
        function(d) {
          var textOpacity;

          if (d.type === "For-Profit") {
            textOpacity =
              (fiveMostConnectedForProfit.hasOwnProperty(d.name)) ? 1 : 0;
          }

          if (d.type === "Non-Profit") {
            textOpacity =
              (fiveMostConnectedNonProfit.hasOwnProperty(d.name)) ? 1 : 0;
          }

          if (d.type === "Individual") {
            textOpacity =
              (fiveMostConnectedIndividuals.hasOwnProperty(d.name)) ? 1 : 0;
          }

          if (d.type === "Government") {
            textOpacity =
              (fiveMostConnectedGovernment.hasOwnProperty(d.name)) ? 1 : 0;
          }

          return textOpacity;
        })
      .style('font-size', '14px')
      .style('color', '#FFFFFF')
      .style('pointer-events', 'none');

    var node = nodeInit
      .append("circle")
      .attr("r",
        function(d) {
          if (d.employees !== null) {
            return empScale(d.employees);
          } else {
            return "7";
          }
        })
      .style("fill",
        function(d) {
          if (d.type !== null) {
            if (d.type === "Individual") { return "rgb(255,185,0)"; }
            if (d.type === "Non-Profit") { return "rgb(0,164,239)"; }
            if (d.type === "For-Profit") { return "rgb(127,186,0)"; }
            if (d.type === "Government") { return "rgb(242,80,34)"; }
          }
        })
      .attr("cx",
        function(d) {
          return d.x;
        })
      .attr("cy",
        function(d) {
          return d.y;
        })
      .style("stroke-width", '1.5px')
      .style("stroke", 'white')
      .on('mouseover', handleNodeHover)
      .on('mouseout', offNode)
      .on('click', sinclick);

    textElement.call(wrap, 80);

    while (force.alpha() > 0.025) { force.tick(); }

    // Must adjust the force parameters...

    var dblclick = require('./dblclick');
    var handleClickNodeHover = require('./handle-click-node-hover');
    var prefillCurrent = require('./prefill-current');
    var editDisplay = require('./edit-display');
    var textDisplay = require('./text-display');
    var editForm = require('./edit-form');

    // Form A has the required items + basic items
    // Also, the user has the options of going directly to form B or C
    // Form B - click submit button
    // Form C - click on hyperlink below the submission button
    d3.selectAll('#edit').on('click', editForm);

    var processFormA = require('./process-form-a');
    var processFormB = require('./process-form-b');

    // Form B has the required items, which are already filled out,
    // and the advanced items. This form takes the user directly to form C
    // if the user submits the data via clicking the submit button.
    var displayFormB = require('./display-form-b');
    var addDataList = require('./add-data-list');

    function preFillName(input, inputSelector) {
      if (input.toLowerCase() in entitiesHash) {
        d3.selectAll(inputSelector).text(function(d) {
          this.value = entitiesHash[input].name;
          // this.data('id') = entitiesHash[input].id;
        });
      }
    }

    function preParseForm(input) {
      input = input.toLowerCase();
      if (input in entitiesHash) {
        editForm();
        preFillFormA(entitiesHash[input]);
      }
    }

    function preFillLocation(input) {
      if (input.toLowerCase() in locationsHash) {
        d3.selectAll('#location').text(function(d) {
          this.value = locationsHash[input][0].location;
        });
      }
    }

    function add_input_locations(counterJ) {
      if ($('#location-' + counterJ + ' input[name="location"]').val() !== "") {
        d3.select('#location-' + counterJ + ' input[name="location"]').on('keyup', function (){
          preFillLocation(this.value);
        });

        counterJ++;

        $("#location-" + (counterJ - 1)).after(locationTmpl({ idx: counterJ }));
        d3.select("#location-" + counterJ +  " input[name='location']").on("keyup", function() {
          add_input_locations(counterJ);
        });
      }
    }

    function add_input_loc(counterU) {
      if ($('#location-' + counterU + ' input[name="location"]').val() !== "") {
        d3.select('#location-' + counterU + ' input[name="location"]').on('keyup', null);

        counterU++;

        $("#location-" + (counterU - 1)).after(locTmpl({ idx: counterU }));
        d3.select("#location-" + counterU +  " input[name='location']").on("keyup", function() {
          add_input_loc(counterU);
        });
      }
    }

    function add_input_kp(counterK) {
      if ($('#key-people-' + counterK + ' input[name="kpeople"]').val() !== "") {
        d3.select('#key-people-' + counterK + ' input[name="kpeople"]').on('keyup', null);
        counterK++; // counter -> 2


        $("#key-people-" + (counterK - 1)).after(keyPeopleTmpl({ idx: counterK }));
        d3.select("#key-people-" + counterK + " input[name='kpeople']").on("keyup", function() {
          add_input_kp(counterK);
        });
      }
    }

    function add_input_fund(counterF) {
      if ($('#funding-' + counterF + ' input[name="fund"]').val() !== "") {
        d3.select('#funding-' + counterF + ' input[name="fund"]').on('keyup', function() {
          preFillName(this.value, '#funding-' + (counterF - 1) + ' input[name="fund"]');
        });
        counterF++; // counter -> 2


        $("#funding-" + (counterF - 1)).after(fundingTmpl({ idx: counterF }));
        addDataList('#funding-' + counterF + ' datalist');
        d3.select("#funding-" + counterF + " input[name='fund']").on("keyup", function() {
          add_input_fund(counterF);
        });
      }
    }

    function add_input_invest(counterI) {
      if ($('#investing-' + counterI + ' input[name="invest"]').val() !== "") {
        d3.select('#investing-' + counterI + ' input[name="invest"]').on('keyup', function() {
          preFillName(this.value, '#investing-' + (counterI - 1) + ' input[name="invest"]');
        });
        counterI++; // counter -> 2


        $("#investing-" + (counterI - 1)).after(investingTmpl({ idx: counterI }));
        addDataList('#investing-' + counterI + ' datalist');
        d3.select("#investing-" + counterI + " input[name='invest']").on("keyup", function() {
          add_input_invest(counterI);
        });
      }
    }

    function add_input_fund_given(counterFG) {
      if ($('#fundinggiven-' + counterFG + ' input[name="fundgiven"]').val() !== "") {
        d3.select('#fundinggiven-' + counterFG + ' input[name="fundgiven"]').on('keyup', function() {
          preFillName(this.value, '#fundinggiven-' + (counterFG - 1) + ' input[name="fundgiven"]');
        });
        counterFG++; // counter -> 2


        $("#fundinggiven-" + (counterFG - 1)).after(fundingGivenTmpl({ idx: counterFG }));

        addDataList('#fundinggiven-' + counterFG + ' datalist');

        d3.select("#fundinggiven-" + counterFG + " input[name='fundgiven']").on("keyup", function() {
          add_input_fund_given(counterFG);
        });
      }
    }

    function add_input_invest_made(counterIM) {
      if ($('#investmentmade-' + counterIM + ' input[name="investmade"]').val() !== "") {
        d3.select('#investmentmade-' + counterIM + ' input[name="investmade"]').on('keyup', function() {
          preFillName(this.value, '#investmentmade-' + (counterIM - 1) + ' input[name="investmade"]');
        });
        counterIM++; // counter -> 2


        $("#investmentmade-" + (counterIM - 1)).after(investmentMadeTmpl({ idx: counterIM }));

        addDataList('#investmentmade-' + counterIM + ' datalist');

        d3.select("#investmentmade-" + counterIM + " input[name='investmade']").on("keyup", function() {
          add_input_invest_made(counterIM);
        });
      }
    }

    function add_input_data(counterD) {
      if ($('#data-' + counterD + ' input[name="data"]').val() !== "") {
        d3.select('#data-' + counterD + ' input[name="data"]').on('keyup', function() {
          preFillName(this.value, '#data-' + (counterD - 1) + ' input[name="data"]');
        });
        counterD++; // counter -> 2


        $("#data-" + (counterD - 1)).after(dataTmpl({ idx: counterD }));

        addDataList('#data-' + counterD + ' datalist');

        d3.select("#data-" + counterD + " input[name='data']").on("keyup", function() {
          add_input_data(counterD);
        });
      }
    }

    function add_input_collab(counterC) {
      if ($('#collaboration-' + counterC + ' input[name="collaboration"]').val() !== "") {
        d3.select('#collaboration-' + counterC + ' input[name="collaboration"]').on('keyup', function() {
          preFillName(this.value, '#collaboration-' + (counterC - 1) + ' input[name="collaboration"]');
        });
        counterC++; // counter -> 2


        $("#collaboration-" + (counterC - 1)).after(collaborationTmpl({ idx: CounterC }));

        addDataList('#collaboration-' + counterC + ' datalist');

        d3.select("#collaboration-" + counterC + " input[name='collaboration']").on("keyup", function() {
          add_input_collab(counterC);

        });
      }
    }

    function add_input_rev(counterR) {
      if ($('#revenue-' + counterR + ' input[name="revenue_amt"]').val() !== "") {
        d3.select('#revenue-' + counterR + ' input[name="revenue_amt"]').on('keyup', null);
        counterR++; // counter -> 2


        $("#revenue-" + (counterR - 1)).after(revenueTmpl({ idx: counterR }));

        d3.select("#revenue-" + counterR + " input[name=revenue_amt]").on("keyup", function() {
          add_input_rev(counterR);
        });
      }
    }

    function add_input_exp(counterE) {
      if ($('#expense-' + counterE + ' input[name="expense_amt"]').val() !== "") {
        d3.select('#expense-' + counterE + ' input[name="expense_amt"]').on('keyup', null);
        counterE++; // counter -> 2


        $("#expense-" + (counterE - 1)).after(expensesTmpl({ idx: counterE }));
        d3.select("#expense-" + counterE + " input[name=expense_amt]").on("keyup", function() {
          add_input_exp(counterE);
        });
      }
    }

    function displayFormA() {
      return formATmpl();
    }

    function iterateThroughObj(obj) {
      var objValue = _.object(_.map(obj, function(value, key) {
        return [key, value];
      }));

      return objValue;
    }

    function determineNullFields() {
      var nullFieldCount = 0;
      var nullFieldArr = [];

      // We know which nodes have how many null fields...
      allNodes.forEach(
        function(d) {
          var objValue = _.object(
            _.map(
              d,
              function(value, key) {
                if (value === null) { nullFieldCount++; }
                return [key, value];
              }
            )
          );

          // Individuals do not have employees, people, rande, randeY
          // Not a fair comparison of null fields.
          if (d.type === 'Individual') { nullFieldCount -= 4; }

          nullFieldArr.push({ name: d.name, nullFields: nullFieldCount });
          nullFieldCount = 0;
        }
      );

      //  Let's determine the nodes with the most null fields.
      var maxNullObj = _.max(nullFieldArr, function(d) {
        return d.nullFields
      });

      var potentialSuggestions = [];

      nullFieldArr.forEach(function(d) {
        if (
          d.nullFields <= maxNullObj.nullFields &&
          d.nullFields >= maxNullObj.nullFields - 7
        ) {
          var nodeObj = _.find(allNodes, function(e) {
            return d.name === e.name;
          });

          potentialSuggestions.push(nodeObj);
        }
      });

      var fiveSuggestions = [];

      while (fiveSuggestions.length < 5) {
        var indexValue = Math.floor(Math.random() * potentialSuggestions.length);

        if (fiveSuggestions.indexOf(potentialSuggestions[indexValue]) !== -1) {
          continue;
        } else {
          fiveSuggestions.push(potentialSuggestions[indexValue]);
        }
      }

      return fiveSuggestions;
    }

    function displayFormCSendJSON(obj) {
      var formObj = processFormB(obj);

      displayFormC();

      $.ajax({
        type: 'POST',
        data: $.param(formObj),
        url: '/database/save',
        crossDomain: true
      }).done(function(returnData) {
        // TODO: ???
      });
    }

    function displayFormC() {
      var suggestions = determineNullFields();

      // Render the string into HTML
      d3.select('#info').html(formCTmpl({ suggestions: suggestions }));

      d3.selectAll('#info ul a').on('click',
        function(d, i) {
          sinclick(suggestions[i]);
          editForm();
          preFillFormA(suggestions[i]);
        }
      );
    }

    // Prefilling the form for editing...
    function preFillFormA(obj) {
      // Time to prefill the form...
      d3.selectAll('#name').text(function(d) {
        this.value = obj.name;
      });

      if(obj.location !== null) {
        d3.json("/cities", function(error, cities){
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
            function() { add_input_locaions(location.length); }
          );
      }

      d3.selectAll('input[name="entitytype"]').filter(
        function(d, i) {
          this.checked = (this.value === obj.type);d = false;
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
        );
      }

      d3.selectAll('#website').text(function(d) { this.value = obj.url; });

      d3.selectAll('#employee').text(function(d) { this.value = obj.employees; });

      if (obj.key_people !== null) {
        var keypeople = obj.key_people;
        var len       = keypeople.length;

        for (var i = 0; i < len; i++) {
          $("#key-people-" + i).after(keyPeopleTmpl({ idx: i }));

          d3.select('#key-people-' + i + ' input[name="kpeople"]').on('keyup', null);

          d3.select('#key-people-' + i + ' input[name="kpeople"]').text(
            function(e) { this.value = keypeople[i].name; }
          );
        }

        d3.select('#key-people-' + keypeople.length + ' input[name="kpeople"]')
          .on(
            'keyup',
            function() { add_input_kp(keypeople.length); }
          );
      }

      if (obj.funding_received !== null) {
        var fundingreceived = obj.funding_received;

        fundingreceived.forEach(
          function(d, i) {
            $("#funding-" + i).after(fundingTmpl({ idx: i }));

            addDataList('#funding-' + i + ' datalist');

            d3.select('#funding-' + i + ' input[name="fund"]').on('keyup',
              function() {
                preFillName(this.value, '#funding-' + i + ' input[name="fund"]');
              }
            );

            d3.select('#funding-' + i + ' input[name="fund"]').text(
              function(e) { this.value = d.entity; }
            );

            d3.select('#funding-' + i + ' input[name="fund_amt"]').text(
              function(e) { this.value = d.amount; }
            );

            d3.select('#funding-' + i + ' input[name="fund_year"]').text(
              function(e) { this.value = d.year; }
            );
          }
        );

        d3.select("#funding-" + fundingreceived.length + " input[name='fund']")
          .on(
            "keyup",
            function() { add_input_fund(fundingreceived.length); }
          );
      }

      if (obj.funding_given !== null) {
        var fundinggiven = obj.funding_given;

        fundinggiven.forEach(
          function(d, i) {
            $("#fundinggiven-" + i).after(fundingGivenTmpl({ idx: i }));

            addDataList('#fundinggiven-' + i + ' datalist');

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
            function() { add_input_fund_given(fundinggiven.length); }
          );
      }

      if (obj.investments_received !== null) {
        var investmentreceived = obj.investments_received;

        investmentreceived.forEach(function(d, i) {
          $("#investing-" + i).after(investmentRecievedTmpl({ idx: i }));

          addDataList('#investing-' + i + ' datalist');

          d3.select('#investing-' + i + ' input[name="invest"]').on('keyup',
            function() {
              preFillName(this.value, '#investing-' + i + ' input[name="invest"]');
            }
          );

          d3.select('#investing-' + i + ' input[name="invest"]').text(
            function(e) { this.value = d.entity; }
          );

          d3.select('#investing-' + i + ' input[name="invest_amt"]').text(
            function(e) { this.value = d.amount; }
          );

          d3.select('#investing-' + i + ' input[name="invest_year"]').text(
            function(e) { this.value = d.year; }
          );
        });

        d3.select("#investing-" + investmentreceived.length + " input[name='invest']")
          .on(
            "keyup",
            function() { add_input_invest(investmentreceived.length); }
          );
      }

      if (obj.investments_made !== null) {
        var investmentsmade = obj.investments_made;

        investmentsmade.forEach(function(d, i) {
          $("#investmentmade-" + i).after(investmentMadeTmpl({ idx: i }));

          addDataList('#investmentmade-' + i + ' datalist');

          d3.select('#investmentmade-' + i + ' input[name="investmade"]')
            .on(
              'keyup',
              function() {
                preFillName(this.value, '#investmentmade-' + i + ' input[name="investmade"]');
              }
            );

          d3.select('#investmentmade-' + i + ' input[name="investmade"]').text(
            function(e) { this.value = d.entity; }
          );

          d3.select('#investmentmade-' + i + ' input[name="investmade_amt"]').text(
            function(e) { this.value = d.amount; }
          );

          d3.select('#investmentmade-' + i + ' input[name="investmade_year"]').text(
            function(e) { this.value = d.year; }
          );
        });

        d3.select("#investmentmade-" + investmentsmade.length + " input[name='investmade']")
          .on(
            "keyup",
            function() { add_input_invest_made(investmentsmade.length); }
          );
      }

      if (obj.data !== null) {
        var dataProviders = obj.data;

        dataProviders.forEach(function(d, i) {
          $("#data-" + i).after(dataTmpl({ idx: i }));

          addDataList('#data-' + i + ' datalist');

          d3.select('#data-' + i + ' input[name="data"]').on('keyup',
            function() {
              preFillName(this.value, '#data-' + i + ' input[name="data"]');
            }
          );

          d3.select('#data-' + i + ' input[name="data"]').text(
            function(e) { this.value = d.entity; }
          );
        });

        d3.select("#data-" + dataProviders.length + " input[name='data']")
          .on(
            "keyup",
            function() { add_input_data(dataProviders.length); }
          );
      }

      d3.selectAll('#submit-A').on('click', function() {
        d3.select('#name').style("border-color", "#d9d9d9");
        d3.select('#location').style("border-color", "#d9d9d9");
        displayFormB();
        preFillFormB(obj);
      });
    }

    function preFillFormB(obj) {
      d3.selectAll('#nickname').text(function(d) {
        this.value = obj.nickname;
      });

      d3.selectAll('#twitterhandle').text(function(d) {
        this.value = obj.twitter_handle;
      });

      d3.selectAll('input[name="influence-type"]').filter(function(d, i) {
        if (obj.influence === "local" && this.value === "Local Influence")
          this.checked = true;
        else if (obj.influence === "global" && this.value === "Global Influence")
          this.checked = true;
        else
          this.checked = false;
      });

      if (obj.collaborations !== null) {
        var collaboration = obj.collaborations;

        collaboration.forEach(function(d, i) {
          $("#collaboration-" + i).after(collaborationTmpl({ idx: i }));

          addDataList('#collaboration-' + i + ' datalist');

          d3.select('#collaboration-' + i + ' input[name="collaboration"]').on('keyup', function() {
            preFillName(this.value, '#collaboration-' + i + ' input[name="collaboration"]');
          });

          d3.select('#collaboration-' + i + ' input[name="collaboration"]').text(function(e) {
            this.value = d.entity;
          });

        });

        d3.select('#collaboration-' + collaboration.length + ' input[name="collaboration"]').on('keyup', function() {
          add_input_collab(collaboration.length);
        });
      }

      if (obj.expenses !== null) {
        var expenseValues = obj.expenses;

        expenseValues.forEach(function(d, i) {
          $("#expense-" + i).after(expensesTmpl({ idx: i }));
          d3.select('#expense-' + i + ' input[name="expense_amt"]').on('keyup', null);
          d3.select('#expense-' + i + ' input[name="expense_amt"]').text(function(e) {
            this.value = d.amount;
          });
          d3.select('#expense-' + i + ' input[name="expense_year"]').text(function(e) {
            this.value = d.year;
          });
        });
        d3.select('#expense-' + expenseValues.length + ' input[name="expense_amt"]').on('keyup', function() {
          add_input_exp(expenseValues.length);
        });
      }

      if (obj.revenue !== null) {
        var revenueValues = obj.revenue;

        revenueValues.forEach(function(d, i) {
          $("#revenue-" + i).after(revenueTmpl({ idx: i }));
          d3.select('#revenue-' + i + ' input[name="revenue_amt"]').on('keyup', null);
          d3.select('#revenue-' + i + ' input[name="revenue_amt"]').text(function(e) {
            this.value = d.amount;
          });
          d3.select('#revenue-' + i + ' input[name="revenue_year"]').text(function(e) {
            this.value = d.year;
          });
        });
        d3.select('#revenue-' + revenueValues.length + ' input[name="revenue_amt"]').on('keyup', function() {
          add_input_rev(revenueValues.length);
        });
      }
    }

    var forProfitObjects = [];
    var nonProfitObjects = [];
    var governmentObjects = [];
    var individualObjects = [];

    initialInfo();

    // Initial display on sidebar
    function initialInfo() {
      var countTypes = [0, 0, 0, 0];

      var forProfitsArray = [];
      var nonProfitsArray = [];
      var governmentArray = [];
      var individualArray = [];

      for (var x = 0; x < allNodes.length; x++) {
        if (allNodes[x].type === "Individual") {
          individualArray.push(allNodes[x].name);
          individualObjects.push(allNodes[x]);
          countTypes[3]++;
        }
        if (allNodes[x].type === "Non-Profit") {
          nonProfitsArray.push(allNodes[x].name);
          nonProfitObjects.push(allNodes[x]);
          countTypes[1]++;
        }
        if (allNodes[x].type === "For-Profit") {
          forProfitsArray.push(allNodes[x].name);
          forProfitObjects.push(allNodes[x]);
          countTypes[0]++;
        }
        if (allNodes[x].type === "Government") {
          governmentArray.push(allNodes[x].name);
          governmentObjects.push(allNodes[x]);
          countTypes[2]++;
        }
      }

      //  Printing to side panel within web application.
      d3.select('#info')
        .html("<h3 style='padding-bottom:10px;'>The Data</h3>")
        .style('list-style', 'square');

      d3.select('#info').append('div').attr('id', 'breakdown').style('width', '100%');

      var x = d3.scale.linear()
        .domain([0, d3.max(countTypes)])
        .range([0, $('#breakdown').width()]);

      var typesColor = 0;
      var typesText = 0;

      d3.select("#breakdown")
        .selectAll("div")
        .data(countTypes)
        .enter().append("div")
        .style("width", function(d) { return x(d) / 5 + "%"; })
        .style("height", "20px")
        .style("font", "8px sans-serif")
        .style("background-color", function(d) {
          if (typesColor === 0) {
            typesColor++;
            return "rgb(127,186,0)";
          }
          if (typesColor === 1) {
            typesColor++;
            return "rgb(0,164,239)";
          }
          if (typesColor === 2) {
            typesColor++;
            return "rgb(242,80,34)";
          }
          if (typesColor === 3) {
            typesColor++;
            return "rgb(255,185,0)";
          }
        })
        .style("text-align", "right")
        .style("padding", "3px")
        .style("margin", "1px")
        .style("color", "white")
        .text(function(d) {
          if (typesText >= 0 && typesText < 4) {
            typesText++;
            return;
          }
        });



      d3.select('#info')
        .append('text')
        .style('padding-bottom', '20px')
        .html(entityNamesTmpl({
          forProfits: forProfitsArray,
          nonProfits: nonProfitsArray,
          governments: governmentArray,
          individuals: individualArray
        }));

    }

    d3.selectAll('.for-profit-entity').on('click', function(n, i) {

      sinclick(forProfitObjects[i]);

    });

    d3.selectAll('.non-profit-entity').on('click', function(n, i) {

      sinclick(nonProfitObjects[i]);

    });

    d3.selectAll('.individual-entity').on('click', function(n, i) {

      sinclick(individualObjects[i]);

    });

    d3.selectAll('.government-entity').on('click', function(n, i) {

      sinclick(governmentObjects[i]);

    });

    //click-location works here...
    d3.selectAll('.click-location').on('click', function(r) {

      handleQuery(this.innerHTML);
    });


    searchAutoComplete();




    function searchAutoComplete() {
      var s = "";

      allNodes.forEach(function(d) {
        name = d.name.toLowerCase();
        nickname = d.nickname.toLowerCase();
        var splitLocations = d.location;

        if (!(name in entitiesHash)) {
          entitiesHash[name] = d;
          sortedNamesList.push(d.name);
          // sortedNamesList.push({ id: d.id, name: d.name })
        }

        if (!(nickname in entitiesHash)) {
          entitiesHash[nickname] = d;
          sortedNamesList.push(d.nickname);
        }

        if(splitLocations) {
          splitLocations.forEach(function(l) {
            var location = l.location;
            var lwcLocation = location.toLowerCase();
            (!(lwcLocation in locationsHash)) ?
              (
                locationsHash[lwcLocation] = [],
                locationsHash[lwcLocation].push(d),
                sortedLocationsList.push(location)
              ) :
              (locationsHash[lwcLocation].push(d));
          });
        }
      });

      sortedNamesList = _.sortBy(sortedNamesList,
        function(names) { return names.toLowerCase(); }
      );

      sortedLocationsList = _.sortBy(sortedLocationsList,
        function(locations) { return locations.toLowerCase(); }
      );

      sortedSearchList = _.sortBy(sortedNamesList.concat(sortedLocationsList),
        function(keys) { return keys; }
      );

      for (var count = 0; count < sortedSearchList.length; count++) {
        s += '<option value="' + sortedSearchList[count] + '">';
      }
    }

    //filter the sortedSearchList on keyup
    $('#search-text').autocomplete({
      lookup: sortedSearchList,
      appendTo: $('.filter-name-location'),
      onSelect: function (suggestion) { handleQuery(suggestion.value); }
    }).on('keyup', function() {
      handleQuery(this.value);
    });

    d3.selectAll('option').on('keydown',
      function(n, i) {
        if (d3.event.keyCode === 13) {
          var query = (d3.selectAll('option'))[0][i].value;
          handleQuery(query);
        }
      }
    );

    function handleQuery(query) {
      query = query.toLowerCase();

      if (query in entitiesHash) { sinclick(entitiesHash[query]); }

      if (query in locationsHash) {
        fundLink.style("opacity", function(l) {
          var locationSource = l.source.location;
          var locationTarget = l.target.location;
          if(locationSource && locationTarget){
            for(var i =0; i < locationSource.length; i++){
              for(var j=0; j<locationTarget.length; j++){
                return (
                  locationSource[i].location.toLowerCase() === query &&
                  locationTarget[j].location.toLowerCase() === query
                ) ? 1 : 0.05;
              }
            }
          }
        });

        investLink.style("opacity", function(l) {
          var locationSource = l.source.location;
          var locationTarget = l.target.location;
          if(locationSource && locationTarget){
            for(var i =0; i<locationSource.length; i++){
              for(var j=0; j<locationTarget.length; j++){
                return (
                  locationSource[i].location.toLowerCase() === query &&
                  locationTarget[j].location.toLowerCase() === query
                ) ? 1 : 0.05;
              }
            }
          }
        });

        porucsLink.style("opacity", function(l) {
          var locationSource = l.source.location;
          var locationTarget = l.target.location;
          if(locationSource && locationTarget){
            for(var i =0; i<locationSource.length; i++){
              for(var j=0; j<locationTarget.length; j++){
                return (
                  locationSource[i].location.toLowerCase() === query &&
                  locationTarget[j].location.toLowerCase() === query
                ) ? 1 : 0.05;
              }
            }
          }
        });

        dataLink.style("opacity", function(l) {
          var locationSource = l.source.location;
          var locationTarget = l.target.location;
          if(locationSource && locationTarget){
            for(var i =0; i<locationSource.length; i++){
              for(var j=0; j<locationTarget.length; j++){
                return (
                  locationSource[i].location.toLowerCase() === query &&
                  locationTarget[j].location.toLowerCase() === query
                ) ? 1 : 0.05;
              }
            }
          }
        });

        d3.selectAll('circle').style("stroke", "white");

        d3.selectAll('.node').style('opacity', function(n) {
          var locationSource = n.location;
          if(locationSource){
            for(var i =0; i<locationSource.length; i++){
              return (
                locationSource[i].location.toLowerCase().indexOf(query) === -1
              ) ? 0.05 : 1;
            }
          }
        }).select('text').style('opacity', 1);

        node.on('mouseout', null)
          .on('mouseover', null)
          .on('click', null);

        node
          .filter(function(n, i) { return nodeInit[0][i].style.opacity == 1; })
          .on('mouseover', handleClickNodeHover);
      }
    }

    dataListSortedNames = generateNamesDataList(sortedNamesList);
    dataListSortedLocations = generateNamesDataList(sortedLocationsList);

    function generateNamesDataList(sortedList) {
      var datalist = "";

      for (var i = 0; i < sortedList.length; i++) {
        datalist += '<option value="' + sortedList[i] + '">';
      }

      return datalist;
    }

    function handleNodeHover(d) {
      var s = textDisplay(d);

      //  Printing to side panel within web application.
      webform = editDisplayTmpl(d);

      // For editing the data displayed within the side panel.
      d3
        .select('#edit')
        .html(webform);

      d3
        .select('#info')
        .html(s)
        .style('list-style', 'square');

      fundLink
        .transition()
        .duration(350)
        .delay(0).style("opacity", function(l) {
          return (d === l.source || d === l.target) ? 1 : 0.05;
        });

      investLink
        .transition()
        .duration(350)
        .delay(0).style("opacity", function(l) {
          return (d === l.source || d === l.target) ? 1 : 0.05;
        });

      porucsLink
        .transition()
        .duration(350)
        .delay(0).style("opacity", function(l) {
          return (d === l.source || d === l.target) ? 1 : 0.05;
        });

      dataLink
        .transition()
        .duration(350)
        .delay(0).style("opacity", function(l) {
          return (d === l.source || d === l.target) ? 1 : 0.05;
        });

      var isLinkTarget = function(link, node) {
        return link.target.index === node.index;
      }

      var isLinkSource = function(link, node) {
        return link.source.index === node.index;
      }

      var neighboringNodesIndices = {};

      neighboringNodesIndices[d.ID] = 1;

      fundingConnections.forEach(function(link) {
        if (isLinkSource(link, d)) {
          neighboringNodesIndices[link.target.index] = 1;
        }

        if (isLinkTarget(link, d)) {
          neighboringNodesIndices[link.source.index] = 1;
        }
      });

      investmentConnections.forEach(function(link) {
        if (isLinkSource(link, d)) {
          neighboringNodesIndices[link.target.index] = 1;
        }

        if (isLinkTarget(link, d)) {
          neighboringNodesIndices[link.source.index] = 1;
        }
      });

      collaborationConnections.forEach(function(link) {
        if (isLinkSource(link, d)) {
          neighboringNodesIndices[link.target.index] = 1;
        }

        if (isLinkTarget(link, d)) {
          neighboringNodesIndices[link.source.index] = 1;
        }
      });

      dataConnections.forEach(function(link) {
        if (isLinkSource(link, d)) {
          neighboringNodesIndices[link.target.index] = 1;
        }

        if (isLinkTarget(link, d)) {
          neighboringNodesIndices[link.source.index] = 1;
        }
      });

      d3.select(this).style("stroke", "rgba(0,0,0,0.6)");

      svg
        .selectAll('.node')
        .transition()
        .duration(350)
        .delay(0)
        .style("opacity", function(n) {
          if (n.ID in neighboringNodesIndices) {
            return "1";
          } else {
            return "0.05";
          }
        }).select('text')
        .style('opacity', 1);

      d3
        .select(this.parentNode)
        .select("text")
        .transition()
        .duration(350)
        .delay(0)
        .style("opacity", 1)
        .style("font-weight", "bold");
    }

    function handleAdjNodeClick(d) {
      fundLink.style("opacity", function(l) {
        if (d === l.source || d === l.target) {
          return "1";
        } else {
          return "0.05";
        }
      });

      investLink.style("opacity", function(l) {
        if (d === l.source || d === l.target) {
          return "1";
        } else {
          return "0.05";
        }
      });

      porucsLink.style("opacity", function(l) {
        if (d === l.source || d === l.target) {
          return "1";
        } else {
          return "0.05";
        }
      });

      dataLink.style("opacity", function(l) {
        if (d === l.source || d === l.target) {
          return "1";
        } else {
          return "0.05";
        }
      });

      var isLinkTarget = function(link, node) {
        return link.target.index === node.index;
      }

      var isLinkSource = function(link, node) {
        return link.source.index === node.index;
      }

      var neighboringNodesIndices = {};

      neighboringNodesIndices[d.ID] = 1;

      fundingConnections.forEach(function(link) {
        if (isLinkSource(link, d)) {
          neighboringNodesIndices[link.target.index] = 1;
        }

        if (isLinkTarget(link, d)) {
          neighboringNodesIndices[link.source.index] = 1;
        }
      });

      investmentConnections.forEach(function(link) {
        if (isLinkSource(link, d)) {
          neighboringNodesIndices[link.target.index] = 1;
        }

        if (isLinkTarget(link, d)) {
          neighboringNodesIndices[link.source.index] = 1;
        }
      });

      collaborationConnections.forEach(function(link) {
        if (isLinkSource(link, d)) {
          neighboringNodesIndices[link.target.index] = 1;
        }

        if (isLinkTarget(link, d)) {
          neighboringNodesIndices[link.source.index] = 1;
        }
      });

      dataConnections.forEach(function(link) {
        if (isLinkSource(link, d)) {
          neighboringNodesIndices[link.target.index] = 1;
        }

        if (isLinkTarget(link, d)) {
          neighboringNodesIndices[link.source.index] = 1;
        }
      });

      svg.selectAll('.node').style("opacity", function(n) {
        if (n.ID in neighboringNodesIndices) {
          return "1";
        } else {
          return "0.05";
        }
      });

      d3
        .select(this)
        .style("stroke", "black")
        .on('mouseout', null);

      node.filter(function(singleNode) {
          if (singleNode !== d) {
            return singleNode;
          }
        })
        .style("stroke", "white")
        .on('mouseover', null)
        .on('mouseout', null)
        .on('click', null);

      node
        .filter(function(l) {
          return (
            neighborFund.indexOf(l.index) > -1 ||
            neighborInvest.indexOf(l.index) > -1 ||
            neighborPorucs.indexOf(l.index) > -1 ||
            neighborData.indexOf(l.index) > -1 ||
            l === d)
          );
        })
        .on('mouseover', handleClickNodeHover)
        .on('click', sinclick);

    }

    function offNode() {
      node
        .style("stroke", "white")
        .on('mouseover', handleNodeHover)
        .on('mouseout', offNode)
        .on('click', sinclick);

      fundLink
        .transition()
        .duration(350)
        .delay(0)
        .style("stroke", "rgb(111,93,168)")
        .style("opacity", "0.2")
        .style("stroke-width", "1px");

      investLink
        .transition()
        .duration(350)
        .delay(0)
        .style("stroke", "rgb(38,114,114)")
        .style("opacity", "0.2")
        .style("stroke-width", "1px");

      porucsLink
        .transition()
        .duration(350)
        .delay(0)
        .style("stroke", "rgb(235,232,38)")
        .style("opacity", "0.2")
        .style("stroke-width", "1px");

      dataLink
        .transition()
        .duration(350)
        .delay(0)
        .style("stroke", "rgb(191,72,150)")
        .style("opacity", "0.2")
        .style("stroke-width", "1px");

      d3
        .selectAll('.node')
        .transition()
        .duration(350)
        .delay(0)
        .style("opacity", "1");

      d3
        .selectAll('.node')
        .selectAll('text')
        .transition()
        .duration(350)
        .delay(0)
        .style(
          'opacity',
          function(d) {
            var textOpacity;

            if (d.type === "For-Profit") {
              textOpacity = (fiveMostConnectedForProfit.hasOwnProperty(d.name)) ? 1 : 0;
            }

            if (d.type === "Non-Profit") {
              textOpacity = (fiveMostConnectedNonProfit.hasOwnProperty(d.name)) ? 1 : 0;
            }

            if (d.type === "Individual") {
              textOpacity = (fiveMostConnectedIndividuals.hasOwnProperty(d.name)) ? 1 : 0;
            }

            if (d.type === "Government") {
              textOpacity = (fiveMostConnectedGovernment.hasOwnProperty(d.name)) ? 1 : 0;
            }

            return textOpacity;
          }
        )
        .style('font-size', '14px')
        .style('font-weight', 'normal');
    }

    function sinclick(d) {
      var clearResetFlag = 0;

      handleClickNodeHover(d);

      fundLink
        .transition()
        .duration(350)
        .delay(0)
        .style(
          "opacity",
          function(l) {
            if (d === l.source || d === l.target) {
              return "1";
            } else {
              return "0.05";
            }
          }
        );

      investLink
        .transition()
        .duration(350)
        .delay(0)
        .style(
          "opacity",
          function(l) {
            if (d === l.source || d === l.target) {
              return "1";
            } else {
              return "0.05";
            }
          }
        );

      porucsLink
        .transition()
        .duration(350)
        .delay(0)
        .style(
          "opacity",
          function(l) {
            if (d === l.source || d === l.target) {
              return "1";
            } else {
              return "0.05";
            }
          }
        );

      dataLink
        .transition()
        .duration(350)
        .delay(0)
        .style(
          "opacity",
          function(l) {
            if (d === l.source || d === l.target) {
              return "1";
            } else {
              return "0.05";
            }
          }
        );

      node
        .style(
          "stroke",
          function(singleNode) {
            if (singleNode !== d) {
              return "white";
            } else {
              return "black";
            }
          }
        ).on('mouseout', null);

      node
        .filter(
          function(singleNode) {
            if (singleNode !== d) { return singleNode; }
          }
        )
        .on('mouseover', null);

      var neighborFund = graph
        .funding_connections
        .filter(
          function(link) {
            return link.source.index === d.index ||
              link.target.index === d.index;
          }
        )
        .map(
          function(link) {
            return link.source.index === d.index ?
              link.target.index :
              link.source.index;
          }
        );

      var neighborInvest = graph
        .investment_connections
        .filter(
          function(link) {
            return link.source.index === d.index ||
              link.target.index === d.index;
          }
        )
        .map(
          function(link) {
            return link.source.index === d.index ?
            link.target.index :
            link.source.index;
          }
        );

      var neighborPorucs = graph
        .collaboration_connections
        .filter(
          function(link) {
            return link.source.index === d.index ||
            link.target.index === d.index;
          }
        )
        .map(
          function(link) {
            return link.source.index === d.index ?
            link.target.index :
            link.source.index;
          }
        );

      var neighborData = graph
        .data_connections
        .filter(
          function(link) {
            return link.source.index === d.index ||
            link.target.index === d.index;
          }
        )
        .map(
          function(link) {
            return link.source.index === d.index ? link.target.index : link.source.index;
          }
        );

      svg
        .selectAll('.node')
        .transition()
        .duration(350)
        .delay(0)
        .style(
          "opacity",
          function(l) {
            return (
              neighborFund.indexOf(l.index) > -1 ||
              neighborInvest.indexOf(l.index) > -1 ||
              neighborPorucs.indexOf(l.index) > -1 ||
              neighborData.indexOf(l.index) > -1 || l === d
            ) ? 1 : 0.05;
          }
        ).select('text').style('opacity', 1);


      node
        .filter(
          function(l) {
            return (
              neighborFund.indexOf(l.index) > -1 ||
              neighborInvest.indexOf(l.index) > -1 ||
              neighborPorucs.indexOf(l.index) > -1 ||
              neighborData.indexOf(l.index) > -1 || l === d
            );
          }
        )
        .on('mouseover', handleClickNodeHover)
        .on('click', function(l) {});

    }

    function dragstart(d) {
      d3
        .select(this)
        .classed(
          "fixed",
          function(d) { d.fixed = false; }
        );

      node
        .on('mouseover', null)
        .on('mouseout', null)
        .on('click', null);
    }

    function drag(d) {
      node
        .on('mouseover', null)
        .on('mouseout', null)
        .on('click', null);
    }

    function dragend(d) {
      d3
        .select(this)
        .classed(
          "fixed",
          function(d) { d.fixed = true; }
        );

      node
        .on('mouseover', handleNodeHover)
        .on('mouseout', offNode)
        .on('click', sinclick);
    }

    function tick(e) {
      // Push different nodes in different directions for clustering.
      var k = 8 * e.alpha;

      /* Four quandrant separation */
      allNodes.forEach(
        function(o, i) {
          if (o.type !== null) {
            if (o.type === "Individual") {
              o.x += (k + k);
              o.y += (k + k);
            }
            if (o.type === "Non-Profit") {
              o.x += (-k - k);
              o.y += (k + k);
            }
            if (o.type === "For-Profit") {
              o.x += (k + k);
              o.y += (-k - k);
            }
            if (o.type === "Government") {
              o.x += (-k - k);
              o.y += (-k - k);
            }
          }
        }
      );

      if (_.isEmpty(centeredNode)) {
        fundLink
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        investLink
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        porucsLink
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        dataLink
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        node
          .attr("cx", function(d) { return d.x = d.x; })
          .attr("cy", function(d) { return d.y = d.y; });

        textElement.attr("transform", transformText);

      } else {
        fundLink
          .attr(
            "x1",
            function(d) {
              if (d.source === centeredNode) { d.source.x = centeredNode.x; }
              return d.source.x;
            }
          )
          .attr(
            "y1",
            function(d) {
              if (d.source === centeredNode) { d.source.y = centeredNode.y; }
              return d.source.y;
            }
          )
          .attr(
            "x2",
            function(d) {
              if (d.target === centeredNode) { d.target.x = centeredNode.x; }
              return d.target.x;
            }
          )
          .attr(
            "y2",
            function(d) {
              if (d.target === centeredNode) { d.target.y = centeredNode.y; }
              return d.target.y;
            }
          );

        investLink
          .attr(
            "x1",
            function(d) {
              if (d.source === centeredNode) { d.source.x = centeredNode.x; }
              return d.source.x;
            }
          )
          .attr(
            "y1",
            function(d) {
              if (d.source === centeredNode) { d.source.y = centeredNode.y; }
              return d.source.y;
            }
          )
          .attr(
            "x2",
            function(d) {
              if (d.target === centeredNode) { d.target.x = centeredNode.x; }
              return d.target.x;
            }
          )
          .attr(
            "y2",
            function(d) {
              if (d.target === centeredNode) { d.target.y = centeredNode.y; }
              return d.target.y;
            }
          );

        porucsLink
          .attr(
            "x1",
            function(d) {
              if (d.source === centeredNode) { d.source.x = centeredNode.x; }
              return d.source.x;
            }
          )
          .attr(
            "y1",
            function(d) {
              if (d.source === centeredNode) { d.source.y = centeredNode.y; }
              return d.source.y;
            }
          )
          .attr(
            "x2",
            function(d) {
              if (d.target === centeredNode) { d.target.x = centeredNode.x; }
              return d.target.x;
            }
          )
          .attr(
            "y2",
            function(d) {
              if (d.target === centeredNode) { d.target.y = centeredNode.y; }
              return d.target.y;
            }
          );

        dataLink
          .attr(
            "x1",
            function(d) {
              if (d.source === centeredNode) { d.source.x = centeredNode.x; }
              return d.source.x;
            }
          )
          .attr(
            "y1",
            function(d) {
              if (d.source === centeredNode) { d.source.y = centeredNode.y; }
              return d.source.y;
            }
          )
          .attr(
            "x2",
            function(d) {
              if (d.target === centeredNode) { d.target.x = centeredNode.x; }
              return d.target.x;
            }
          )
          .attr(
            "y2",
            function(d) {
              if (d.target === centeredNode) { d.target.y = centeredNode.y; }
              return d.target.y;
            }
          );

        node
          .attr(
            "cx",
            function(d, i) {
              if ((d3.select(node)[0][0].data())[i].name === centeredNode.name) {
                d.x = centeredNode.x;
              }
              return d.x;
            }
          )
          .attr(
            "cy",
            function(d, i) {
              if ((d3.select(node)[0][0].data())[i].name === centeredNode.name) {
                d.y = centeredNode.y;
              }
              return d.y;
            }
          );

        textElement.attr("transform", transformText);

      }

    }

    var determineVisibleNodes = function() {
      //  Construct associative array of the visible nodes' indices (keys) and corresponding objects (values).
      var visibleNodes = {};

      for (var x = 0; x < nodeInit[0].length; x++) {
        if (nodeInit[0][x].style.visibility === "visible") {
          visibleNodes[nodeInit[0][x].__data__.ID] = nodeInit[0][x];
        }
      }

      return visibleNodes;
    };

    /***

      For the "Connections" checkboxes

    ***/
    var connectionsCheckboxActions = function() {
      var connectionClasses = ['.invest', '.fund', '.porucs', '.data'];

      d3.selectAll('.group-items.connections input')[0].forEach(
        function(d, i) {
          d3.selectAll('#' + d.id).on('click', (
            function(d, i) {
              return function() {
                var visibleNodes = determineVisibleNodes();

                document.getElementById(d.id).checked ?
                  revealConnections(connectionClasses[i], visibleNodes) :
                  hideConnections(connectionClasses[i]);

                shouldCheckboxRemainUnchecked(connectionClasses[i], visibleNodes);
              };
          }
          )(d, i));
        }
      );
    };

    // Only reveal the connections with both source and target nodes visible.
    var revealConnections = function(selector, visibleNodes) {
      d3.selectAll(selector).style(
        "visibility",
        function(l) {
          if (
            l.source.index in visibleNodes &&
            l.target.index in visibleNodes &&
            this.style.visibility === "hidden"
          ) {
            return "visible";
          } else
            return "hidden";
        }
      );
    };

    var hideConnections = function(selector) {
      d3.selectAll(selector).style(
        "visibility",
        function(l) { return "hidden"; }
      );
    };


    // If none of the type's nodes are visible, then the connections should not be visible as well (no nodes = no connections).
    var shouldCheckboxRemainUnchecked = function(selector, visibleNodes) {
      if (
        visibleNodes.length === 0 ||
        (
          document.getElementById(cb_individ).checked &&
          document.getElementById(cb_forpro).checked &&
          document.getElementById(cb_nonpro).checked &&
          document.getElementById(cb_gov).checked)
        ) {
        d3.select(selector).attr('checked', false);
      }
    }

    connectionsCheckboxActions();

    /***

      For the "Types" checkboxes

    ***/
    var typesCheckboxActions = function() {

      d3.selectAll('#cb_forpro, #cb_nonpro, #cb_gov, #cb_individ').on(
        'click',
        function() {
          var visibleNodes = determineVisibleNodes();

          $('#cb_forpro').is(':checked') ?
            nodeVisibility('For-Profit', 'visible') :
            nodeVisibility('For-Profit', 'hidden');

          $('#cb_nonpro').is(':checked') ?
            nodeVisibility('Non-Profit', 'visible') :
            nodeVisibility('Non-Profit', 'hidden');

          $('#cb_gov').is(':checked') ?
            nodeVisibility('Government', 'visible') :
            nodeVisibility('Government', 'hidden');

          $('#cb_individ').is(':checked') ?
            nodeVisibility('Individual', 'visible') :
            nodeVisibility('Individual', 'hidden');

          toggleLinks(visibleNodes);
        }
      );
    };

    //  Initialize the display accordingly...
    var nodeVisibility = function(type, visibility) {
      d3
        .selectAll(".node").filter(
          function(d) { if (d.type === type) { return this; } }
        )
        .style("visibility", visibility);
    };

    var setVisibility = function(link, linkData, visibleNodes, connectionType) {
      if (linkData.source.ID in visibleNodes && linkData.target.ID in visibleNodes) {
        switch (connectionType) {
          case "Funding":
            ($('#cb_fund').is(':checked')) ?
              d3.select(link).style('visibility', 'visible') :
              d3.select(link).style('visibility', 'hidden');
            break;
          case "Investment":
            ($('#cb_invest').is(':checked')) ?
              d3.select(link).style('visibility', 'visible') :
              d3.select(link).style('visibility', 'hidden');
            break;
          case "Collaboration":
            ($('#cb_porucs').is(':checked')) ?
              d3.select(link).style('visibility', 'visible') :
              d3.select(link).style('visibility', 'hidden');
            break;
          case "Data":
            ($('#cb_data').is(':checked')) ?
              d3.select(link).style('visibility', 'visible') :
              d3.select(link).style('visibility', 'hidden');
            break;
          default:
            break;
        }
      } else {
        d3.select(link).style('visibility', 'hidden');
      }
    };

    //  For each rendered node, if the node is a for-profit, then for each connection type, determine if the node is a source or target of the connection, add the connection to the array.
    var toggleLinks = function(visibleNodes) {

      //  Finding links with nodes of a certain type.
      fundLink.filter(
        function(link) {
          setVisibility(this, this.__data__, visibleNodes, "Funding");
        }
      );
      investLink.filter(
        function(link) {
          setVisibility(this, this.__data__, visibleNodes, "Investment");
        }
      );
      porucsLink.filter(
        function(link) {
          setVisibility(this, this.__data__, visibleNodes, "Collaboration");
        }
      );
      dataLink.filter(
        function(link) {
          setVisibility(this, this.__data__, visibleNodes, "Data");
        }
      );

      // Time to reflect these changes accordingly with the connection checkboxes to ensure consistency.
      reflectConnectionChanges();
    };

    var reflectConnectionChanges = function() {
      var visibleFundingConnections = fundLink.filter(
        function(link) {
          return d3.select(this).style('visibility') === 'visible';
        }
      );

      var visibleInvestmentConnections = investLink.filter(
        function(link) {
          return d3.select(this).style('visibility') === 'visible';
        }
      );

      var visibleCollaborationsConnections = porucsLink.filter(
        function(link) {
          return d3.select(this).style('visibility') === 'visible';
        }
      );

      var visibleDataConnections = dataLink.filter(
        function(link) {
          return d3.select(this).style('visibility') === 'visible';
        }
      );

      if (visibleFundingConnections[0].length === 0) {
        $('#cb_fund').attr('checked', false);
      }

      if (visibleInvestmentConnections[0].length === 0) {
        $('#cb_invest').attr('checked', false);
      }

      if (visibleCollaborationsConnections[0].length === 0) {
        $('#cb_porucs').attr('checked', false);
      }

      if (visibleDataConnections[0].length === 0) {
        $('#cb_data').attr('checked', false);
      }
    };

    typesCheckboxActions();

    d3.selectAll('#cb_emp, #cb_numtwit').on(
      'click',
      function() {
        if (document.getElementById("cb_emp").checked) {
          node
            .transition()
            .duration(350)
            .delay(0)
            .attr(
              "r",
              function(d) {
                if (d.employees !== null) {
                  return empScale(d.employees);
                } else {
                  return "7";
                }
              }
            );

          textElement
            .attr(
              'transform',
              function(d) {
                if (d.employees !== null) {
                  return translation(0, -(empScale(d.employees)));
                } else {
                  return translation(0, -7);
                }
              }
            );
        }

        if (document.getElementById("cb_numtwit").checked) {
          node
            .transition()
            .duration(350)
            .delay(0)
            .attr(
              "r",
              function(d) {
                if (d.followers !== null) {
                  if (d.followers > 1000000) {
                    return "50";
                  } else {
                    return twitScale(d.followers);
                  }
                } else {
                  return "7";
                }
              }
            );

          textElement
            .attr(
              'transform',
              function(d) {
                if (d.followers !== null) {
                  return translation(0, -(twitScale(d.followers)));
                } else {
                  return translation(0, -7);
                }
              }
            );
        }
      }
    );

    d3
      .select('svg')
      .on(
        'click',
        function() {
          var m = d3.mouse(this);

          if (clearResetFlag === 1) {
            d3.event.preventDefault();

            offNode();

            d3.selectAll('g').classed(
              "fixed",
              function(d) { d.fixed = false; }
            );

            d3.selectAll('g').call(drag);

            centeredNode = jQuery.extend(true, {}, {});

            var force = d3
              .layout
              .force()
              .nodes(allNodes)
              .size([width, height])
              .links(connections)
              .linkStrength(0)
              .charge(
                function(d) {
                  if (d.render === 1) {
                    if (d.employees !== null)
                      return -6 * empScale(d.employees);
                    else {
                      return -25;
                    }
                  } else {
                    return 0;
                  }
                }
              )
              .linkDistance(50)

            .on("tick", tick)
            .start();
          }

          clearResetFlag = 1;
        }
      );
  });
}
