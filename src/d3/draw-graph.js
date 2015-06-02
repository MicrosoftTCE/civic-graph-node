var $            = require("jquery");
var _            = require("lodash");

require('devbridge-autocomplete');

var u                     = require('../utilities');

var connectionCboxActions = require('./connection-cbox-actions');
var dblClick              = require('./dbl-click');
var drag                  = require('./drag');
var dragEnd               = require('./drag-end');
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
  window.width = 1000;
  window.height = 1000;

  window.forProfitNodes;
  window.nonProfitNodes;
  window.individualNodes;
  window.governmentNodes;

  window.fiveMostConnectedForProfit = {};
  window.fiveMostConnectedNonProfit = {};
  window.fiveMostConnectedIndividuals = {};
  window.fiveMostConnectedGovernment = {};

  var clearResetFlag = 1;

  window.centeredNode = {};

  window.svg = d3
    .select('.content')
    .append('svg')
    .attr("xmlns", 'http://www.w3.org/2000/svg')
    .attr("id", 'network')
    .attr("height", height)
    .attr("width", width)
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
      var targetWidth = container.width();

      network.attr("width", targetWidth);
      network.attr("height", Math.round(targetWidth / aspect));
    }
  ).trigger("resize");

  var viewBoxParameters = '0 0 ' + width + ' ' + height;

  svg
    .attr("viewBox", viewBoxParameters)
    .attr("preserveAspectRatio", 'xMidYMid');

  var rawNodes = _.values(civicStore.vertices);

  window.rawConnections =
    [].concat(civicStore.edges.funding)
      .concat(civicStore.edges.investment)
      .concat(civicStore.edges.collaboration)
      .concat(civicStore.edges.data)

  var force = d3
    .layout
    .force()
    .nodes(rawNodes)
    .size([width, height])
    .links(rawConnections)
    .linkStrength(0)
    .charge(
      function(d) {
        return d.render ||
          (d.employees !== null ? -6 * u.employeeScale(d.employees) : -25);
      }
    )
    .linkDistance(50);

  var drag = force
    .drag()
    .on("dragstart", drag)
    .on("drag", drag)
    .on("dragend", dragEnd);

  window.civicStore.lines = {};

  //  FUNDINGS
  window.civicStore.lines.funding = svg
    .selectAll(".fund")
    .data(civicStore.edges.funding.filter(function(n) { return n.render === 1; }))
    .enter()
    .append("line")
    .attr("class", "fund")
    .style("stroke", u.colors.purple)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  //  INVESTMENTS
  window.civicStore.lines.investment = svg
    .selectAll(".invest")
    .data(civicStore.edges.investment.filter(function(n) { return n.render === 1; }))
    .enter()
    .append("line")
    .attr("class", "invest")
    .style("stroke", u.colors.teal)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  //  COLLABORATIONS
  window.civicStore.lines.collaboration = svg
    .selectAll(".collaboration")
    .data(civicStore.edges.collaboration.filter(function(n) { return n.render === 1; }))
    .enter()
    .append("line")
    .attr("class", "collaboration")
    .style("stroke", u.colors.yellow)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  //  data
  window.civicStore.lines.data = svg
    .selectAll(".data")
    .data(civicStore.edges.data.filter(function(n) { return n.render === 1; }))
    .enter()
    .append("line")
    .attr("class", "data")
    .style("stroke", u.colors.pink)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  window.nodeInit = svg
    .selectAll(".node")
    .data(rawNodes.filter(function(n) { return n.render === 1; }))
    .enter()
    .append("g")
    .attr("class", "node")
    .style("visibility", "visible")
    .on('dblclick', dblClick)
    .call(drag);

  force
    .on("tick", tick)
    .start();

  window.forProfitNodes = svg
    .selectAll('.node')
    .filter(function(d) { return d.entity_type === "For-Profit"; })
    .sort(weightSorter);

  window.nonProfitNodes = svg
    .selectAll('.node')
    .filter(function(d) { return d.entity_type === "Non-Profit"; })
    .sort(weightSorter);

  window.individualNodes = svg
    .selectAll('.node')
    .filter(function(d) { return d.entity_type === "Individual"; })
    .sort(weightSorter);

  window.governmentNodes = svg
    .selectAll('.node')
    .filter(function(d) { return d.entity_type === "Government"; })
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

  window.textElement = svg
    .selectAll('.node')
    .append('text')
    .text(function(d) { return d.nickname; })
    .attr("x", 0)
    .attr("dy", "0.1em")
    .attr("y",
      function(d) {
        return d.render ||
          (d.employees !== null ? u.employeeScale(d.employees) + 10 : 17);
      }
    )
    .style('opacity',
      function(d) {
        var textOpacity;

        if (d.entity_type === "For-Profit") {
          textOpacity =
            (window.fiveMostConnectedForProfit.hasOwnProperty(d.name)) ? 1 : 0;
        }

        if (d.entity_type === "Non-Profit") {
          textOpacity =
            (window.fiveMostConnectedNonProfit.hasOwnProperty(d.name)) ? 1 : 0;
        }

        if (d.entity_type === "Individual") {
          textOpacity =
            (window.fiveMostConnectedIndividuals.hasOwnProperty(d.name)) ? 1 : 0;
        }

        if (d.entity_type === "Government") {
          textOpacity =
            (window.fiveMostConnectedGovernment.hasOwnProperty(d.name)) ? 1 : 0;
        }

        return textOpacity;
      })
    .style('font-size', '14px')
    .style('color', '#FFFFFF')
    .style('pointer-events', 'none');


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
        if (d.entity_type !== null) {
          if (d.entity_type === "For-Profit") { return u.colors.lime; }
          if (d.entity_type === "Non-Profit") { return u.colors.blue; }
          if (d.entity_type === "Government") { return u.colors.orange; }
          if (d.entity_type === "Individual") { return u.colors.gold; }
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

  while (force.alpha() > 0.025) { force.tick(); }


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
  var displayFormB = require('./display-b-form');
  var addDataList = require('./add-data-list');

  window.forProfitObjects = [];
  window.nonProfitObjects = [];
  window.governmentObjects = [];
  window.individualObjects = [];

  initialInfo();

  d3.selectAll('.for-profit-entity').on(
    'click',
    function(n, i) {
      sinclick(window.forProfitObjects[i]);
    }
  );

  d3.selectAll('.non-profit-entity').on(
    'click',
    function(n, i) {
      sinclick(window.nonProfitObjects[i]);
    }
  );

  d3.selectAll('.individual-entity').on(
    'click',
    function(n, i) {
      sinclick(window.individualObjects[i]);
    }
  );

  d3.selectAll('.government-entity').on(
    'click',
    function(n, i) {
      sinclick(window.governmentObjects[i]);
    }
  );

  //click-location works here...
  d3.selectAll('.click-location').on(
    'click',
    function(r) {
      handleQuery(this.innerHTML);
    }
  );

  try {
    //filter the sortedSearchList on keyup
    $('#search-text').autocomplete({
      lookup: u.getSortedList(),
      appendTo: $('.filter-name-location'),
      onSelect: function (suggestion) {
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
            .nodes(rawNodes)
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

