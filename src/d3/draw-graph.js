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
      var targetWidth = container.width();

      network.attr("width", targetWidth);
      network.attr("height", Math.round(targetWidth / aspect));
    }
  ).trigger("resize");

  var viewBoxParameters = '0 0 ' + window.width + ' ' + window.height;

  window.svg
    .attr("viewBox", viewBoxParameters)
    .attr("preserveAspectRatio", 'xMidYMid');

  var allNodes = _.values(window.civicStore.vertices);

  window.connections =
    [].concat(window.civicStore.edges.funding)
      .concat(window.civicStore.edges.investment)
      .concat(window.civicStore.edges.collaboration)
      .concat(window.civicStore.edges.data)

  var force = d3
    .layout
    .force()
    .nodes(allNodes)
    .size([window.width, window.height])
    .links(window.connections)
    .linkStrength(0)
    .charge(function(d) {
      return d.employees !== null ? -6 * u.employeeScale(d.employees) : -25;
    })
    .linkDistance(50);

  window.civicStore.lines = {};

  //  FUNDINGS
  window.civicStore.lines.funding = window.svg
    .selectAll(".fund")
    .data(window.civicStore.edges.funding)
    .enter()
    .append("line")
    .attr("class", "fund")
    .style("stroke", u.colors.purple)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  //  INVESTMENTS
  window.civicStore.lines.investment = window.svg
    .selectAll(".invest")
    .data(window.civicStore.edges.investment)
    .enter()
    .append("line")
    .attr("class", "invest")
    .style("stroke", u.colors.teal)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  //  COLLABORATIONS
  window.civicStore.lines.collaboration = window.svg
    .selectAll(".collaboration")
    .data(window.civicStore.edges.collaboration)
    .enter()
    .append("line")
    .attr("class", "collaboration")
    .style("stroke", u.colors.yellow)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  //  data
  window.civicStore.lines.data = window.svg
    .selectAll(".data")
    .data(window.civicStore.edges.data)
    .enter()
    .append("line")
    .attr("class", "data")
    .style("stroke", u.colors.pink)
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  window.nodeInit = window.svg
    .selectAll(".node")
    .data(allNodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .style("visibility", "visible")
    .on('dblclick', dblClick)
    // .call(drag);

  window.textElement = window.svg
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
// <<<<<<< HEAD
//       .linkDistance(50);
//     console.log("Set force d3 layout =", force);

//     //  FUNDINGS
//     var fundLink = svg
//       .selectAll(".fund")
//       .data(fundingConnections)
//       .enter()
//       .append("line")
//       .attr("class", "fund")
//       .style("stroke", "rgb(111,93,168)") // lavender
//       .style("stroke-width", "1")
//       .style("opacity", "0.2")
//       .style("visibility", "visible");

//     console.log("Set fundLink =", fundLink);

//     var investLink = svg
//       .selectAll(".invest")
//       .data(investmentConnections)
//       .enter()
//       .append("line")
//       .attr("class", "invest")
//       .style("stroke", "rgb(111,93,168)") // lavender
//       .style("stroke-width", "1")
//       .style("opacity", "0.2")
//       .style("visibility", "visible");

//     console.log("Set investLink =", investLink);

//     //   OLD INVESTMENTS
//     // var investLink = svg
//     //   .selectAll(".invest")
//     //   .data(investmentConnections)
//     //   .enter()
//     //   .append("line")
//     //   .attr("class", "invest")
//     //   .style("stroke", "rgb(38,114,114)") // teal
//     //   .style("stroke-width", "1")
//     //   .style("opacity", "0.2")
//     //   .style("visibility", "visible");
//     // console.log("Set investLink =", investLink);

//     // EMPLOYMENTS
//     // var employLink = svg
//     //   .selectAll(".employ")
//     //   .data(employmentConnections)
//     //   .enter()
//     //   .append("line")
//     //   .attr("class", "invest")
//     //   .style("stroke", "rgb(38,114,114)") // teal
//     //   .style("stroke-width", "1")
//     //   .style("opacity", "0.2")
//     //   .style("visibility", "visible");
//     // console.log("Set employLink =", employLink);

//     //  COLLABORATIONS
//     var porucsLink = svg
//       .selectAll(".porucs")
//       .data(collaborationConnections)
//       .enter()
//       .append("line")
//       .attr("class", "porucs")
//       .style("stroke", "rgb(235,232,38)") // yellow
//       .style("stroke-width", "1")
//       .style("opacity", "0.2")
//       .style("visibility", "visible");

//     console.log("Set porucsLink =", porucsLink);

//     //  data
//     var dataLink = svg
//       .selectAll(".data")
//       .data(dataConnections)
//       .enter()
//       .append("line")
//       .attr("class", "data")
//       .style("stroke", "rgb(191,72,150)") // pink
//       .style("stroke-width", "1")
//       .style("opacity", "0.2")
//       .style("visibility", "visible");

//     console.log("Set dataLink =", dataLink);

//     var textElement = svg
//       .selectAll('.node')
//       .append('text')
//       .text(function(d) { return d.nickname; })
//       .attr("x", 0)
//       .attr("dy", "0.1em")
//       .attr("y",
//         function(d) {
//           if (d.employees !== null) {
//             return empScale(d.employees) + 10;
//           } else {
//             return 7 + 10;
//           }
//         })
//       .style('opacity',
//         function(d) {
//           var textOpacity;

//           if (d.type === "For-Profit") {
//             textOpacity =
//               (fiveMostConnectedForProfit.hasOwnProperty(d.name)) ? 1 : 0;
//           }

//           if (d.type === "Non-Profit") {
//             textOpacity =
//               (fiveMostConnectedNonProfit.hasOwnProperty(d.name)) ? 1 : 0;
//           }

//           if (d.type === "Individual") {
//             textOpacity =
//               (fiveMostConnectedIndividuals.hasOwnProperty(d.name)) ? 1 : 0;
//           }

//           if (d.type === "Government") {
//             textOpacity =
//               (fiveMostConnectedGovernment.hasOwnProperty(d.name)) ? 1 : 0;
//           }

//           return textOpacity;
//         })
//       .style('font-size', '14px')
//       .style('color', '#FFFFFF')
//       .style('pointer-events', 'none');
//     console.log("Set textElement =", textElement);

//     var nodeInit = svg
//       .selectAll(".node")
//       .data(allNodes)
//       .enter()
//       .append("g")
//       .attr("class", "node")
//       .style("visibility", "visible")
//       .on(
//         'dblclick',
//         dblClickCb(
//           allNodes,
//           connections,
//           tickCb(
//             allNodes,
//             centeredNode,
//             fundLink,
//             investLink,
//             porucsLink,
//             dataLink,
//             node,
//             textElement
//           )
//         )
//       )
//       // .call(drag);

//     console.log("Set nodeInit =", nodeInit);

//     var node = nodeInit
//       .append("circle")
//       .attr("r",
//         function(d) {
//           if (d.employees !== null) {
//             return empScale(d.employees);
//           } else {
//             return "7";
//           }
//         })
//       .style("fill",
//         function(d) {
//           if (d.type !== null) {
//             if (d.type === "Individual") { return "rgb(255,185,0)"; }
//             if (d.type === "Non-Profit") { return "rgb(0,164,239)"; }
//             if (d.type === "For-Profit") { return "rgb(127,186,0)"; }
//             if (d.type === "Government") { return "rgb(242,80,34)"; }
//           }
//         })
//       .attr("cx",
//         function(d) {
//           return d.x;
//         })
//       .attr("cy",
//         function(d) {
//           return d.y;
//         })
//       .style("stroke-width", '1.5px')
//       .style("stroke", 'white')
//       .on(
//         'mouseover',
//         handleNodeHoverCb(
//           fundLink,
//           investLink,
//           porucsLink,
//           dataLink,
//           fundingConnections,
//           investmentConnections,
//           collaborationConnections,
//           dataConnections
//         )
//       )
//       .on(
//         'mouseout',
//         offNodeCb(
//           fundLink,
//           investLink,
//           porucsLink,
//           dataLink,
//           fundingConnections,
//           investmentConnections,
//           collaborationConnections,
//           dataConnections,
//           graph
//         )
//       )
//       .on('click', sinclickCb(
//         fundLink,
//         investLink,
//         porucsLink,
//         dataLink,
//         graph
//       ));
//     console.log("Set node =", node);

//     var drag = force
//       .drag()
//       .on("dragstart", drag)
//       .on("drag", drag)
//       .on(
//         "dragend",
//         dragEndCb(
//           node,
//           fundLink,
//           investLink,
//           porucsLink,
//           dataLink,
//           fundingConnections,
//           investmentConnections,
//           collaborationConnections,
//           dataConnections,
//           graph
//         )
//       );
//     console.log("Set drag =", drag);
// =======
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

  while (force.alpha() > 0.025) {
    // console.log("force.tick()");
    force.tick();
  }

  var drag = force
    .drag()
    .on("dragstart", drag)
    .on("drag", drag)
    .on("dragend", dragEnd);

  force
    .on("tick", tick)
    .start();

  window.forProfitNodes = window.svg
    .selectAll('.node')
    .filter(function(d) { return d.entity_type === "For-Profit"; })
    .sort(weightSorter);

  window.nonProfitNodes = window.svg
    .selectAll('.node')
    .filter(function(d) { return d.entity_type === "Non-Profit"; })
    .sort(weightSorter);

  window.individualNodes = window.svg
    .selectAll('.node')
    .filter(function(d) { return d.entity_type === "Individual"; })
    .sort(weightSorter);

  window.governmentNodes = window.svg
    .selectAll('.node')
    .filter(function(d) { return d.entity_type === "Government"; })
    .sort(weightSorter);

  // Select the nodes to choose for highlighting nickname
  // on visualization (TOP 5)
  window.forProfitNodes.each(function(d, i) {
    if (i >= window.forProfitNodes[0].length - 5) {
      window.fiveMostConnectedForProfit[d.name] = d.weight;
    }
  });

  window.nonProfitNodes.each(function(d, i) {
    if (i >= window.nonProfitNodes[0].length - 5) {
      window.fiveMostConnectedNonProfit[d.name] = d.weight;
    }
  });

  window.individualNodes.each(function(d, i) {
    if (i >= window.individualNodes[0].length - 5) {
      window.fiveMostConnectedIndividuals[d.name] = d.weight;
    }
  });

  window.governmentNodes.each(function(d, i) {
    if (i >= window.governmentNodes[0].length - 5) {
      window.fiveMostConnectedGovernment[d.name] = d.weight;
    }
  });


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

