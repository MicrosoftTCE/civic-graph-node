var investingTmpl          = require("jade!../templates/investing.jade");
var collaborationTmpl      = require("jade!../templates/collaboration.jade");
var revenueTmpl            = require("jade!../templates/revenue.jade");
var expensesTmpl           = require("jade!../templates/expenses.jade");
var entityNamesTmpl        = require("jade!../templates/entity-names.jade");

var $ = require("jquery");
var _ = require("lodash");

var drawGraph = function () {
  console.log("Running drawGraph");

  var wrap = require('./wrap');
  var transformText = require('./transform-text');
  var translation = require('./translation');
  var numCommas = require('./num-commas');
  var weightSorter = require('./weight-sorter');
  var preFillName = require('./pre-fill-name');
  var preParseForm = require('./pre-parse-form');
  var preFillLocation = require('./pre-fill-location');
  var iterateThroughObj = require('./iterate-through-obj');
  var determineNullFields = require('./determine-null-fields');
  var displayFormCSendJson = require('./display-form-c-send-json');
  var searchAutoComplete = require('./search-auto-complete');
  var handleQuery = require('./handle-query');
  var generateNamesDataList = require('./generate-names-data-list');
  var handleNodeHoverCb = require('./handle-node-hover-cb');
  var sinclickCb = require('./sinclick-cb');
  var offNodeCb = require('./off-node-cb');
  var dragstart = require('./dragstart');

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

  var svg = d3
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

  svg
    .attr("viewBox", viewBoxParameters)
    .attr("preserveAspectRatio", 'xMidYMid');

  //  Static Scale
  //  Improve by dynamically obtaining min and max values
  var empScale = d3.scale.sqrt().domain([10, 130000]).range([10, 50]);
  var twitScale = d3.scale.sqrt().domain([10, 1000000]).range([10, 50]);


  d3.json("/athena", function(error, graph) {
    console.log("Running AJAX call to /athena");
    console.log("graph", graph);

    var allNodes                 = graph.entities;
    var fundingConnections       = graph.funding_connections;
    var investmentConnections    = graph.investment_connections;
    var collaborationConnections = graph.collaboration_connections;
    var dataConnections          = graph.data_connections;

    var connections = fundingConnections
      .concat(investmentConnections)
      .concat(collaborationConnections)
      .concat(dataConnections);

    console.log("allNodes =", allNodes.length);
    console.log("fundingConnections =", fundingConnections.length);
    console.log("investmentConnections =", investmentConnections.length);
    console.log("collaborationConnections =", collaborationConnections.length);
    console.log("dataConnections =", dataConnections.length);

    console.log("connections =", connections.length);

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
      .linkDistance(50);
    console.log("Set force d3 layout =", force);

    var drag = force
      .drag()
      .on("dragstart", drag)
      .on("drag", drag)
      .on("dragend", dragend);
    console.log("Set drag =", drag);

    //  FUNDINGS
    var fundLink = svg
      .selectAll(".fund")
      .data(fundingConnections)
      .enter()
      .append("line")
      .attr("class", "fund")
      .style("stroke", "rgb(111,93,168)") // lavender
      .style("stroke-width", "1")
      .style("opacity", "0.2")
      .style("visibility", "visible");
    console.log("Set fundLink =", fundLink);

    //  INVESTMENTS
    var investLink = svg
      .selectAll(".invest")
      .data(investmentConnections)
      .enter()
      .append("line")
      .attr("class", "invest")
      .style("stroke", "rgb(38,114,114)") // teal
      .style("stroke-width", "1")
      .style("opacity", "0.2")
      .style("visibility", "visible");
    console.log("Set investLink =", investLink);

    //  COLLABORATIONS
    var porucsLink = svg
      .selectAll(".porucs")
      .data(collaborationConnections)
      .enter()
      .append("line")
      .attr("class", "porucs")
      .style("stroke", "rgb(235,232,38)") // yellow
      .style("stroke-width", "1")
      .style("opacity", "0.2")
      .style("visibility", "visible");
    console.log("Set porucsLink =", porucsLink);

    //  data
    var dataLink = svg
      .selectAll(".data")
      .data(dataConnections)
      .enter()
      .append("line")
      .attr("class", "data")
      .style("stroke", "rgb(191,72,150)") // pink
      .style("stroke-width", "1")
      .style("opacity", "0.2")
      .style("visibility", "visible");
    console.log("Set dataLink =", dataLink);

    var nodeInit = svg
      .selectAll(".node")
      .data(allNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("visibility", "visible")
      .on('dblclick', dblclick)
      .call(drag);
    console.log("Set nodeInit =", nodeInit);

    console.log("Running force.start()");
    force
      .on("tick", tick)
      .start();

    forProfitNodes = svg
      .selectAll('.node')
      .filter(function(d) { return d.type === "For-Profit"; })
      .sort(weightSorter);
    console.log("Set forProfitNodes =", forProfitNodes);

    nonProfitNodes = svg
      .selectAll('.node')
      .filter(function(d) { return d.type === "Non-Profit"; })
      .sort(weightSorter);
    console.log("Set nonProfitNodes =", nonProfitNodes);

    individualNodes = svg
      .selectAll('.node')
      .filter(function(d) { return d.type === "Individual"; })
      .sort(weightSorter);
    console.log("Set individualNodes =", individualNodes);

    governmentNodes = svg
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
    console.log("Set textElement =", textElement);

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
      .on(
        'mouseover',
        handleNodeHoverCb(
          fundLink,
          investLink,
          porucsLink,
          dataLink,
          fundingConnections,
          investmentConnections,
          collaborationConnections,
          dataConnections
        )
      )
      .on(
        'mouseout',
        offNodeCb(
          fundLink,
          investLink,
          porucsLink,
          dataLink,
          fundingConnections,
          investmentConnections,
          collaborationConnections,
          dataConnections,
          graph
        )
      )
      .on('click', sinclickCb(
        fundLink,
        investLink,
        porucsLink,
        dataLink,
        graph
      ));
    console.log("Set node =", node);

    textElement.call(wrap, 80);

    while (force.alpha() > 0.025) {
      // console.log("force.tick()");
      force.tick();
    }

    // Must adjust the force parameters...

    var dblclick = require('./dblclick');
    var handleClickNodeHover = require('./handle-click-node-hover');
    var prefillCurrent = require('./prefill-current');
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

    var forProfitObjects = [];
    var nonProfitObjects = [];
    var governmentObjects = [];
    var individualObjects = [];

    initialInfo(allNodes);

    d3.selectAll('.for-profit-entity').on(
      'click',
      function(n, i) {
        console.log("Running onClick for .for-profit-entity with n, i =", n, i);
        sinclickCb(
          fundLink,
          investLink,
          porucsLink,
          dataLink,
          graph
        )(forProfitObjects[i]);
      }
    );

    d3.selectAll('.non-profit-entity').on(
      'click',
      function(n, i) {
        console.log("Running onClick for .non-profit-entity with n, i =", n, i);
        sinclickCb(
          fundLink,
          investLink,
          porucsLink,
          dataLink,
          graph
        )(nonProfitObjects[i]);
      }
    );

    d3.selectAll('.individual-entity').on(
      'click',
      function(n, i) {
        console.log("Running onClick for .Individuali-entity with n, i =", n, i);
        sinclickCb(
          fundLink,
          investLink,
          porucsLink,
          dataLink,
          graph
        )(individualObjects[i]);
      }
    );

    d3.selectAll('.government-entity').on(
      'click',
      function(n, i) {
        console.log("Running onClick for .government-entity with n, i =", n, i);
        sinclickCb(
          fundLink,
          investLink,
          porucsLink,
          dataLink,
          graph
        )(governmentObjects[i]);
      }
    );

    //click-location works here...
    d3.selectAll('.click-location').on(
      'click',
      function(r) {
        console.log("Running onClick for .click-location with r =", r);
        handleQuery(
          this.innerHTML, fundLink, investLink, porucsLink, dataLink, graph
        );
      }
    );

    searchAutoComplete(allNodes, entitiesHash, sortedNamesList, sortedLocationsList);

    try {
      //filter the sortedSearchList on keyup
      $('#search-text').autocomplete({
        lookup: sortedSearchList,
        appendTo: $('.filter-name-location'),
        onSelect: function (suggestion) {
          console.log("Running autocomplete and calling handleQuery with value = " + suggestion.value);
          handleQuery(
            suggestion.value, fundLink, investLink, porucsLink, dataLink, graph
          );
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
          handleQuery(
            query, fundLink, investLink, porucsLink, dataLink, graph
          );
        }
      }
    );

    dataListSortedNames = generateNamesDataList(sortedNamesList);
    dataListSortedLocations = generateNamesDataList(sortedLocationsList);



    function drag(d) {
      console.log("Running drag with d = " + d);
      node
        .on('mouseover', null)
        .on('mouseout', null)
        .on('click', null);
    }

    function dragend(d) {
      console.log("Running dragend with d = " + d);
      d3
        .select(this)
        .classed(
          "fixed",
          function(d) { d.fixed = true; }
        );

      node
        .on(
          'mouseover',
          handleNodeHoverCb(
            fundLink,
            investLink,
            porucsLink,
            dataLink,
            fundingConnections,
            investmentConnections,
            collaborationConnections,
            dataConnections
          )
        )
        .on(
          'mouseout',
          offNodeCb(
            fundLink,
            investLink,
            porucsLink,
            dataLink,
            fundingConnections,
            investmentConnections,
            collaborationConnections,
            dataConnections,
            graph
          )
        )
        .on('click', sinclickCb(
          fundLink,
          investLink,
          porucsLink,
          dataLink,
          graph
        ));
    }

    function tick(e) {
      // console.log("Running tick(e)");
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

      // console.log("Setting x1, y1 and x2, y2");
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
      console.log("Running determineVisibleNodes");
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
      console.log("Running connectionsCheckboxActions");
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
      console.log("Running revealConnections with selector, visibleNodes =", selector, visibleNodes);
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
      console.log("Running hideConnections with selector = ", selector);
      d3.selectAll(selector).style(
        "visibility",
        function(l) { return "hidden"; }
      );
    };


    // If none of the type's nodes are visible, then the connections should not be visible as well (no nodes = no connections).
    var shouldCheckboxRemainUnchecked = function(selector, visibleNodes) {
      console.log("Running shouldCheckboxRemainUnchecked with selector, visibleNodes =", selector, visibleNodes);
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
      console.log("Running typesCheckboxActions");

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
      console.log("Running nodeVisibility with type, visibility =", type, visibility);

      d3
        .selectAll(".node").filter(
          function(d) { if (d.type === type) { return this; } }
        )
        .style("visibility", visibility);
    };

    var setVisibility = function(link, linkData, visibleNodes, connectionType) {
      console.log("Running setVisibility with link, linkData, visibleNodes, connectionType = ",
        link, linkData, visibleNodes, connectionType);

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
      console.log("Running toggleLinks with visibleNodes =", visibleNodes);

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
      console.log("Running reflectConnectionChanges");
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
        console.log("Running onClick handler for #cb_emp, #cb_numtwit");
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
          console.log("Running onClick handler for svg");

          var m = d3.mouse(this);

          if (clearResetFlag === 1) {
            d3.event.preventDefault();

            offNodeCb(
              fundLink,
              investLink,
              porucsLink,
              dataLink,
              fundingConnections,
              investmentConnections,
              collaborationConnections,
              dataConnections,
              graph
            )();

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

module.exports = drawGraph;

