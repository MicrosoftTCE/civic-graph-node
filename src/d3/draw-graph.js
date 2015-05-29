var $            = require("jquery");
var _            = require("lodash");

require('devbridge-autocomplete');

var u                     = require('../utilities');

var connectionCboxActions = require('./connection-cbox-actions');
var dblClick              = require('./dbl-click');
var drag                  = require('./drag');
var dragEndCb             = require('./drag-end-cb');
var editForm              = require('./edit-form');
var generateNamesDataList = require('./generate-names-data-list');
var handleNodeHover       = require('./handle-node-hover');
var handleQuery           = require('./handle-query');
var initialInfo           = require('./initial-info');
var offNode               = require('./off-node');
var searchAutoComplete    = require('./search-auto-complete');
var sinclick              = require('./sinclick');
var tick                  = require('./tick');
var translation           = require('./translation');
var typesCboxActions      = require('./types-cbox-actions');
var weightSorter          = require('./weight-sorter');
var wrap                  = require('./wrap');

var drawGraph = function () {
  console.log("Running drawGraph");

  window.width = 1000;
  window.height = 1000;

  var forProfitNodes;
  var nonProfitNodes;
  var individualNodes;
  var governmentNodes;

  var fiveMostConnectedForProfit = {};
  var fiveMostConnectedNonProfit = {};
  var fiveMostConnectedIndividuals = {};
  var fiveMostConnectedGovernment = {};

  var clearResetFlag = 1;

  window.centeredNode = {};

  window.d3RootElem = d3
    .select('.content')
    .append('svg')
    .attr("xmlns", 'http://www.w3.org/2000/svg')
    .attr("id", 'network')
    .attr("height", window.height)
    .attr("width", window.width)
    .style("top", "-50px")
    .style("position", "relative");

  d3
    .select('body > nav > nav > div')
    .append('div')
    .attr('id', 'editBox')
    .append('p')
    .text('Edit')
    .style('color', u.colors.cyan); // cyanish

  var aspect = width / height;
  var network = $('#network');
  var container = network.parent();

  $(window).on('resize',
    function() {
      console.log("Running window.onResize handler");

      var targetWidth = container.width();

      network.attr("width", targetWidth);
      network.attr("height", Math.round(targetWidth / aspect));
    }
  ).trigger("resize");

  var viewBoxParameters = '0 0 ' + window.width + ' ' + window.height;

  window.d3RootElem
    .attr("viewBox", viewBoxParameters)
    .attr("preserveAspectRatio", 'xMidYMid');

  console.log("civicStore", window.civicStore);

  var allNodes = _.values(window.civicStore.vertices);

  window.connections =
    [].concat(window.civicStore.edges.funding)
      .concat(window.civicStore.edges.investment)
      .concat(window.civicStore.edges.collaboration)
      .concat(window.civicStore.edges.data)

  console.log("allNodes =", allNodes);
  // console.log("connections =", window.connections);

  console.log("width, window.height", width, window.height);

  var force = d3
    .layout
    .force()
    .nodes(allNodes)
    .size([window.width, window.height])
    .links(window.connections)
    .linkStrength(0)
    .charge(function(target) {
      if (target.render === 1) {
        if (target.employees !== null) {
          return -6 * u.employeeScale(target.employees);
        } else {
          return -25;
        }
      } else {
        return 0;
      }
    })
    .linkDistance(50);
  console.log("Set force d3 layout =", force);

  window.civicStore.lines = {};

  //  FUNDINGS
  window.civicStore.lines.funding = window.d3RootElem
    .selectAll(".fund")
    .data(window.civicStore.edges.funding)
    .enter()
    .append("line")
    .attr("class", "fund")
    .style("stroke", u.colors.purple)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  console.log("Set fundling links =", window.civicStore.lines.funding);

  //  INVESTMENTS
  window.civicStore.lines.investment = window.d3RootElem
    .selectAll(".invest")
    .data(window.civicStore.edges.investment)
    .enter()
    .append("line")
    .attr("class", "invest")
    .style("stroke", u.colors.teal)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  console.log("Set investment links =", window.civicStore.lines.investment);

  //  COLLABORATIONS
  window.civicStore.lines.collaboration = window.d3RootElem
    .selectAll(".collaboration")
    .data(window.civicStore.edges.collaboration)
    .enter()
    .append("line")
    .attr("class", "collaboration")
    .style("stroke", u.colors.yellow)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  console.log("Set collaboration links =", window.civicStore.lines.collaboration);

  //  data
  window.civicStore.lines.data = window.d3RootElem
    .selectAll(".data")
    .data(window.civicStore.edges.data)
    .enter()
    .append("line")
    .attr("class", "data")
    .style("stroke", u.colors.pink)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  console.log("Set data links =", window.civicStore.lines.data);

  window.nodeInit = window.d3RootElem
    .selectAll(".node")
    .data(allNodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .style("visibility", "visible")
    .on('dblclick', dblClick)
    // .call(drag);

  window.textElement = window.d3RootElem
    .selectAll('.node')
    .append('text')
    .text(function(d) { return d.nickname; })
    .attr("x", 0)
    .attr("dy", "0.1em")
    .attr("y",
      function(d) {
        if (d.employees !== null) {
          return u.employeeScale(d.employees) + 10;
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

  console.log("Set textElement =", window.textElement);

  console.log("Set nodeInit =", window.nodeInit);

  window.d3Node = window.nodeInit
    .append("circle")
    .attr("r",
      function(d) {
        if (d.employees !== null) {
          return u.employeeScale(d.employees);
        } else {
          return "7";
        }
      })
    .style("fill",
      function(d) {
        if (d.type !== null) {
          if (d.type === "For-Profit") { return u.colors.lime; }
          if (d.type === "Non-Profit") { return u.colors.blue; }
          if (d.type === "Government") { return u.colors.orange; }
          if (d.type === "Individual") { return u.colors.gold; }
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

  window.textElement.call(wrap, 80);

  while (force.alpha() > 0.025) {
    // console.log("force.tick()");
    force.tick();
  }

  var drag = force
    .drag()
    .on("dragstart", drag)
    .on("drag", drag)
    .on(
      "dragend",
      dragEndCb(
        window.d3Node // FIXME
      )
    );

  console.log("Set drag =", drag);
  console.log("Running force.start()");

  force
    .on("tick", tick)
    .start();

  forProfitNodes = window.d3RootElem
    .selectAll('.node')
    .filter(function(d) { return d.type === "For-Profit"; })
    .sort(weightSorter);
  console.log("Set forProfitNodes =", forProfitNodes);

  nonProfitNodes = window.d3RootElem
    .selectAll('.node')
    .filter(function(d) { return d.type === "Non-Profit"; })
    .sort(weightSorter);
  console.log("Set nonProfitNodes =", nonProfitNodes);

  individualNodes = window.d3RootElem
    .selectAll('.node')
    .filter(function(d) { return d.type === "Individual"; })
    .sort(weightSorter);
  console.log("Set individualNodes =", individualNodes);

  governmentNodes = window.d3RootElem
    .selectAll('.node')
    .filter(function(d) { return d.type === "Government"; })
    .sort(weightSorter);
  console.log("Set governmentNodes =", governmentNodes);

  // Select the nodes to choose for highlighting nickname
  // on visualization (TOP 5)
  forProfitNodes.each(function(d, i) {
    if (i >= forProfitNodes[0].length - 5) {
      fiveMostConnectedForProfit[d.name] = d.weight;
    }
  });
  console.log("Set fiveMostConnectedForProfit =", fiveMostConnectedForProfit);

  nonProfitNodes.each(function(d, i) {
    if (i >= nonProfitNodes[0].length - 5) {
      fiveMostConnectedNonProfit[d.name] = d.weight;
    }
  });
  console.log("Set fiveMostConnectedNonProfit =", fiveMostConnectedNonProfit);

  individualNodes.each(function(d, i) {
    if (i >= individualNodes[0].length - 5) {
      fiveMostConnectedIndividuals[d.name] = d.weight;
    }
  });
  console.log("Set fiveMostConnectedIndividuals =", fiveMostConnectedIndividuals);

  governmentNodes.each(function(d, i) {
    if (i >= governmentNodes[0].length - 5) {
      fiveMostConnectedGovernment[d.name] = d.weight;
    }
  });
  console.log("Set fiveMostConnectedGovernment =", fiveMostConnectedGovernment);


  // Must adjust the force parameters...


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

  window.forProfitObjects = [];
  window.nonProfitObjects = [];
  window.governmentObjects = [];
  window.individualObjects = [];

  initialInfo();

  d3.selectAll('.for-profit-entity').on(
    'click',
    function(n, i) {
      console.log("Running onClick for .for-profit-entity with n, i =", n, i);

      sinclick(window.forProfitObjects[i]);
    }
  );

  d3.selectAll('.non-profit-entity').on(
    'click',
    function(n, i) {
      console.log("Running onClick for .non-profit-entity with n, i =", n, i);

      sinclick(window.nonProfitObjects[i]);
    }
  );

  d3.selectAll('.individual-entity').on(
    'click',
    function(n, i) {
      console.log("Running onClick for .Individuali-entity with n, i =", n, i);

      sinclick(window.individualObjects[i]);
    }
  );

  d3.selectAll('.government-entity').on(
    'click',
    function(n, i) {
      console.log("Running onClick for .government-entity with n, i =", n, i);

      sinclick(window.governmentObjects[i]);
    }
  );

  //click-location works here...
  d3.selectAll('.click-location').on(
    'click',
    function(r) {
      console.log("Running onClick for .click-location with r =", r);

      handleQuery(this.innerHTML);
    }
  );

  try {
    //filter the sortedSearchList on keyup
    $('#search-text').autocomplete({
      lookup: u.getSortedList(),
      appendTo: $('.filter-name-location'),
      onSelect: function (suggestion) {
        console.log("Running autocomplete and calling handleQuery with value = " + suggestion.value);

        handleQuery(suggestion.value);
      }
    }).on('keyup', function() {
      handleQuery(this.value);
    });
  } catch (err) {
    console.log("autocomplete error: ", err);
  }

  d3.selectAll('option').on('keydown',
    function(n, i) {
      console.log("Running onKeydown handler on option with n, i =", n, i);

      if (d3.event.keyCode === 13) {
        var query = (d3.selectAll('option'))[0][i].value;
        handleQuery(query);
      }
    }
  );

  connectionCboxActions();

  typesCboxActions();

  d3.selectAll('#cb_emp, #cb_numtwit').on(
    'click',
    function() {
      console.log("Running onClick handler for #cb_emp, #cb_numtwit");
      if (document.getElementById("cb_emp").checked) {
        window.d3Node
          .transition()
          .duration(350)
          .delay(0)
          .attr(
            "r",
            function(d) {
              if (d.employees !== null) {
                return u.employeeScale(d.employees);
              } else {
                return "7";
              }
            }
          );

        window.textElement
          .attr(
            'transform',
            function(d) {
              if (d.employees !== null) {
                return translation(0, -(u.employeeScale(d.employees)));
              } else {
                return translation(0, -7);
              }
            }
          );
      }

      if (document.getElementById("cb_numtwit").checked) {
        window.d3Node
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
                  return u.twitterScale(d.followers);
                }
              } else {
                return "7";
              }
            }
          );

        window.textElement
          .attr(
            'transform',
            function(d) {
              if (d.followers !== null) {
                return translation(0, -(u.twitterScale(d.followers)));
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
        console.log("Running onClick handler for svg");

        var m = d3.mouse(this);

        if (clearResetFlag === 1) {
          d3.event.preventDefault();

          offNode();

          d3.selectAll('g').classed(
            "fixed",
            function(d) { d.fixed = false; }
          );

          d3
            .selectAll('g')
            .call(drag);

          window.centeredNode = {};

          var force = d3
            .layout
            .force()
            .nodes(allNodes)
            .size([window.width, window.height])
            .links(window.connections)
            .linkStrength(0)
            .charge(
              function(d) {
                if (d.render === 1) {
                  if (d.employees !== null)
                    return -6 * u.employeeScale(d.employees);
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

}

module.exports = drawGraph;

