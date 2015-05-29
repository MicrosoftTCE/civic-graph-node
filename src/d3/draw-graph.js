var $ = require("jquery");
var _ = require("lodash");

var utils                 = require('../utilities');

var connectionCboxActions = require('./connection-cbox-actions');
var dblClickCb            = require('./dbl-click-cb');
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
var tickCb                = require('./tick-cb');
var translation           = require('./translation');
var typesCboxActions      = require('./types-cbox-actions');
var weightSorter          = require('./weight-sorter');
var wrap                  = require('./wrap');

var drawGraph = function () {
  console.log("Running drawGraph");

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

  var centeredNode = {};

  var locationsHash = {};

  console.log("locationsHash", locationsHash)

  var sortedSearchList = [];

  var dataListSortedNames;
  var dataListSortedLocations;

  window.d3RootElem = d3
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
    .style('color', '#2e92cf'); // cyanish

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

  var viewBoxParameters = '0 0 ' + width + ' ' + height;

  window.d3RootElem
    .attr("viewBox", viewBoxParameters)
    .attr("preserveAspectRatio", 'xMidYMid');

  //  Static Scale
  //  Improve by dynamically obtaining min and max values
  var empScale = d3.scale.sqrt().domain([10, 130000]).range([10, 50]);
  var twitScale = d3.scale.sqrt().domain([10, 1000000]).range([10, 50]);

  console.log("Running AJAX call to /athena");
  console.log("civicStore", window.civicStore);

  var allNodes = _.values(window.civicStore.vertices);

  var connections =
    [].concat(window.civicStore.edges.funding)
      .concat(window.civicStore.edges.investment)
      .concat(window.civicStore.edges.collaboration)
      .concat(window.civicStore.edges.data)

  console.log("allNodes =", allNodes.length);
  console.log("connections =", connections.length);

  var force = d3
    .layout
    .force()
    .nodes(allNodes)
    .size([width, height])
    .links(connections)
    .linkStrength(0)
    .charge(function(target) {
      if (target.render === 1) {
        if (target.employees !== null) {
          return -6 * empScale(target.employees);
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
    .style("stroke", "rgb(111,93,168)") // lavender
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
    .style("stroke", "rgb(38,114,114)") // teal
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
    .style("stroke", "rgb(235,232,38)") // yellow
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
    .style("stroke", "rgb(191,72,150)") // pink
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  console.log("Set data links =", window.civicStore.lines.data);

  var textElement = window.d3RootElem
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
  console.log("Set textElement =", textElement);

  var nodeInit = window.d3RootElem
    .selectAll(".node")
    .data(allNodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .style("visibility", "visible")
    .on(
      'dblclick',
      dblClickCb(
        connections,
        tickCb(
          centeredNode,
          window.d3Node,                   // FIXME
          textElement
        )
      )
    )
    // .call(drag);

  console.log("Set nodeInit =", nodeInit);

  window.d3Node = nodeInit
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
  // console.log("Set node =", node);

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
    .on(
      "tick",
      tickCb(
        centeredNode,
        window.d3Node, // FIXME
        textElement
      )
    )
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

  textElement.call(wrap, 80);

  while (force.alpha() > 0.025) {
    // console.log("force.tick()");
    force.tick();
  }

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

  var forProfitObjects = [];
  var nonProfitObjects = [];
  var governmentObjects = [];
  var individualObjects = [];

  initialInfo(allNodes);

  d3.selectAll('.for-profit-entity').on(
    'click',
    function(n, i) {
      console.log("Running onClick for .for-profit-entity with n, i =", n, i);

      sinclick(forProfitObjects[i]);
    }
  );

  d3.selectAll('.non-profit-entity').on(
    'click',
    function(n, i) {
      console.log("Running onClick for .non-profit-entity with n, i =", n, i);

      sinclick(nonProfitObjects[i]);
    }
  );

  d3.selectAll('.individual-entity').on(
    'click',
    function(n, i) {
      console.log("Running onClick for .Individuali-entity with n, i =", n, i);

      sinclick(individualObjects[i]);
    }
  );

  d3.selectAll('.government-entity').on(
    'click',
    function(n, i) {
      console.log("Running onClick for .government-entity with n, i =", n, i);

      sinclick(governmentObjects[i]);
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
      lookup: utils.getSortedList(),
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

  dataListSortedNames = window.civicStore.names;
  dataListSortedLocations = window.civicStore.locations;

  connectionCboxActions(nodeInit);

  typesCboxActions(nodeInit);

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

          .on(
            "tick",
            tickCb(
              centeredNode,
              window.d3Node,
              textElement
            )
          )
          .start();
        }

        clearResetFlag = 1;
      }
    );

}

module.exports = drawGraph;

