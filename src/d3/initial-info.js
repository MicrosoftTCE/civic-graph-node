var initialInfo = function (allNodes) {
  console.log("Calling initialInfo");

  var countTypes = [0, 0, 0, 0];

  var forProfitsArray = [];
  var nonProfitsArray = [];
  var individualArray = [];
  var governmentArray = [];

  for (var x = 0; x < allNodes.length; x++) {
    if (allNodes[x].type === "For-Profit") {
      forProfitsArray.push(allNodes[x].name);
      forProfitObjects.push(allNodes[x]);
      countTypes[0]++;
    }

    if (allNodes[x].type === "Non-Profit") {
      nonProfitsArray.push(allNodes[x].name);
      nonProfitObjects.push(allNodes[x]);
      countTypes[1]++;
    }

    if (allNodes[x].type === "Individual") {
      individualArray.push(allNodes[x].name);
      individualObjects.push(allNodes[x]);
      countTypes[3]++;
    }

    if (allNodes[x].type === "Government") {
      governmentArray.push(allNodes[x].name);
      governmentObjects.push(allNodes[x]);
      countTypes[2]++;
    }
  }
  console.log("Set forProfitsArray =", forProfitsArray);
  console.log("Set nonProfitsArray =", nonProfitsArray);
  console.log("Set governmentArray =", governmentArray);
  console.log("Set individualArray =", individualArray);

  //  Printing to side panel within web application.
  console.log("Printing to the side panel")
  d3
    .select('#info')
    .html("<h3 style='padding-bottom:10px;'>The Data</h3>")
    .style('list-style', 'square');

  d3
    .select('#info')
    .append('div')
    .attr('id', 'breakdown')
    .style('width', '100%');

  var x = d3
    .scale
    .linear()
    .domain([0, d3.max(countTypes)])
    .range([0, $('#breakdown').width()]);
  console.log("Set x =", x);

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
        return "rgb(127,186,0)"; // lime green
      }

      if (typesColor === 1) {
        typesColor++;
        return "rgb(0,164,239)";  // cyanish
      }

      if (typesColor === 2) {
        typesColor++;
        return "rgb(242,80,34)";  // orange
      }

      if (typesColor === 3) {
        typesColor++;
        return "rgb(255,185,0)";  // gold
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

    console.log("Set typesColor =", typesColor);
    console.log("Set typesText =", typesText);

  d3.select('#info')
    .append('text')
    .style('padding-bottom', '20px')
    .html(entityNamesTmpl({
      forProfits: forProfitsArray,
      nonProfits: nonProfitsArray,
      governments: governmentArray,
      individuals: individualArray
    }));
};

module.exports = initialInfo;
