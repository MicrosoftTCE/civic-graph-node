function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

function translateSVG(x, y) {
  return 'translate(' + x + ',' + y + ')';
}

function numCommas(numberStr) {
  numberStr += '';
  x = numberStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;

  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

function getSVG(svg) {
  return svg;
}

var dblclickobject;

var centerNodeFundLink = [];
var centerNodeInvestLink = [];
var centerNodePorucsLink = [];
var centerNodeDataLink = [];

var color = d3.scale.category20();
var width = 960;
var height = 960;

var testNode;

var organizations = {};
var filteredNodes = {};
var porucsCon = {};
var dataCon = {};
var fundingCon = {};
var investingCon = {};
var fundLink = {};
var investLink = {};
var porucsLink = {};
var dataLink = {};

var newCenterFundLink = [];
var newCenterPorucsLink = [];
var newCenterInvestLink = [];
var newCenterDataLink = [];

var nodeInit;

var controlForce = {
  init: true,
  dblclick: false
};
var centeredNode = {};

var fundLinkX1 = [];
var fundLinkX2 = [];

var investLinkX1 = [];
var investLinkX2 = [];

var porucsLinkX1 = [];
var porucsLinkX2 = [];

var dataLinkX1 = [];
var dataLinkX2 = [];

var fundLinkY1 = [];
var fundLinkY2 = [];

var investLinkY1 = [];
var investLinkY2 = [];

var porucsLinkY1 = [];
var porucsLinkY2 = [];

var dataLinkY1 = [];
var dataLinkY2 = [];

var nodeX = [];
var nodeY = [];

var node;

var flag = 1;

var didDBLClick = 0;

// var svg = d3.select(".content").append("svg").attr("id", "network").attr("height", height).attr("width", width).attr("viewBox", "0 0 800 800").attr("preserveAspectRatio", "xMidYMid");
//.attr("viewBox", '0 0 800 800')
var svg = d3.select('.content').append('svg').attr("xmlns", 'http://www.w3.org/2000/svg').attr("id", 'network').attr("height", height).attr("width", width).style("position", "fixed");
// d3.select("svg").on("dblclick.zoom", null);


//  document.createElement('svg')

var aspect = width / height,
  network = $('#network'),
  container = network.parent();
$(window).on('resize', function() {
  var targetWidth = container.width();
  network.attr("width", targetWidth);
  network.attr("height", Math.round(targetWidth / aspect));
}).trigger("resize");

var viewBoxParameters = '0 0 ' + width + ' ' + height;

svg.attr("viewBox", viewBoxParameters).attr("preserveAspectRatio", 'xMidYMid');

//  Static Scale
//  Improve by dynamically obtaining min and max values
var empScale = d3.scale.sqrt().domain([10, 130000]).range([10, 50]);
var twitScale = d3.scale.sqrt().domain([10, 1000000]).range([10, 50]);

d3.json("data/final_data.json", function(error, graph) {
  filteredNodes = graph.nodes;
  fundingCon = graph.fundingR;
  investingCon = graph.investingR;
  porucsCon = graph.porucs;
  dataCon = graph.data;

  var force = d3.layout.force()
    .nodes(filteredNodes)
    .size([width, height])
    .links(fundingCon.concat(investingCon).concat(porucsCon).concat(dataCon))
    .linkStrength(0)
    .charge(function(d) {
      if (d.numemp !== null)
        return -5 * empScale(parseInt(d.numemp));
      else
        return -50;

    })
    .on("tick", tick)
    .start();

  var drag = force.drag()
    .on("dragstart", drag)
    .on("drag", drag)
    .on("dragend", dragend);

  //  FUNDINGS
  fundLink = svg.selectAll(".fund")
    .data(fundingCon)
    .enter().append("line")
    .attr("class", "fund")
    // .classed("visfund", true)
    .style("stroke", "rgb(111,93,168)")
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  //  INVESTMENTS
  investLink = svg.selectAll(".invest")
    .data(investingCon)
    .enter().append("line")
    .attr("class", "invest")
    // .classed("visinvest", true)
    .style("stroke", "rgb(38,114,114)")
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  //  COLLABORATIONS
  porucsLink = svg.selectAll(".porucs")
    .data(porucsCon)
    .enter().append("line")
    .attr("class", "porucs")
    // .classed("visporucs", true)
    .style("stroke", "rgb(235,232,38)")
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  //  data
  dataLink = svg.selectAll(".data")
    .data(dataCon)
    .enter().append("line")
    .attr("class", "data")
    // .classed("visdata", true)
    .style("stroke", "rgb(191,72,150)")
    .style("stroke-width", "1")
    .style("opacity", "0.2")
    .style("visibility", "visible");

  nodeInit = svg.selectAll(".node")
    .data(filteredNodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .style("visibility", "visible")
    .on('dblclick', dblclick)
    .call(drag);

  node = nodeInit.append("circle")
    .attr("r", function(d) {
      if (d.numemp !== null)
        return empScale(parseInt(d.numemp));
      else
        return "7";
    })
    .style("fill", function(d) {
      if (d.type !== null) {
        if (d.type === "Individual")
          return "rgb(255,185,0)";
        if (d.type === "Non-Profit")
          return "rgb(0,164,239)";
        if (d.type === "For-Profit")
          return "rgb(127,186,0)";
        if (d.type === "Government")
          return "rgb(242,80,34)";
      }
    })
    .attr("cx", function(d) {
      return d.x;
    })
    .attr("cy", function(d) {
      return d.y;
    })
    .style("stroke-width", '1.5px')
    .style("stroke", 'white')
    .on('mouseover', handleNodeHover)
    .on('mouseout', offNode)
    .on('click', sinclick);

  // data section
  // combine collaboration and data

  var textElement = svg.selectAll('.node')
    .append('text')
    .text(function(d) {
      return d.nickname;
    })
    .attr("x", -8)
    .attr("y", ".31em")
    .style('font', '14px sans-serif')
    .style('pointer-events', 'none')
    .style('text-shadow', '0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff');

  //d3.selectAll('g').on("dblclick", dblclick);
  while (force.alpha() > 0.025) { // You'll want to try out different, "small" values for this
    force.tick();
    // if(safety++ > 500) {
    //   break;// Avoids infinite looping in case this solution was a bad idea
    // }
  }

  // Must adjust the force parameters...

  function dblclick(d) {
    d3.select(this).classed("fixed", function(d) {
      d.fixed = false;
    });
    d3.select(this).on('mousedown.drag', null);

    dblclickobject = (d3.select(this).data())[0];

    var svgWidth = parseInt(svg.style("width").substring(0, ((svg.style("width")).length + 1) / 2));
    var svgHeight = parseInt(svg.style("height").substring(0, ((svg.style("height")).length + 1) / 2));
    var halfSVGWidth = parseInt(svgWidth / 2);
    var halfSVGHeight = parseInt(svgHeight / 2);
    // console.log("Half Width: " + halfSVGWidth);
    // console.log("Half Height" + halfSVGHeight)
    multiplierX = svgWidth / width;
    multiplierY = svgHeight / height;

    scaledDX = multiplierX * d.x;
    scaledDY = multiplierY * d.y;
    // console.log("Before X: " + d.x);
    //     console.log("Before Y: " + d.y);
    centeredNode = jQuery.extend(true, {}, d);

    // Half viewbox...
    centeredNode.x = width / 2 - 10;
    centeredNode.y = height / 2 - 60;

    // console.log("After X: " + centeredNode.x);
    // console.log("After Y: " + centeredNode.y);
    // console.log(centeredNode);

    var force = d3.layout.force()
      .nodes(filteredNodes)
      .size([width, height])
      .links(fundingCon.concat(investingCon).concat(porucsCon).concat(dataCon))
      .linkStrength(0)
      .charge(function(d) {
        if (d.numemp !== null)
          return -5 * empScale(parseInt(d.numemp));
        else
          return -50;

      })
      .on("tick", tick)
      .start();
    // for (var i = 0; i < 1; ++i) {
    //                    force.tick();
    //                }
    //                force.stop();
  }

  function handleClickNodeHover(d) {
    s = textDisplay(d);

    webform = editDisplay(d);

    // For editing the data displayed within the side panel.
    d3.select('#edit')
      .html(webform);

    //  Printing to side panel within web application.
    d3.select('#info')
      .html(s)
      .style('list-style', 'square');
  }

  function editDisplay(d) {
    var webform = "";

    webform += '<h1 id="edit-add-info">' + '<i class="icon-pencil on-left"></i>' + 'Edit or Add Information' + '</h1>';

    return webform;
  }

  function textDisplay(d) {
    var s = "";

    //  General Information
    s += '<h1>' + "<a href=" + '"' + d.weblink + '" target="_blank">' + d.name + '</a></h1>';
    s += '<h6>' + 'Type of Entity: ' + '</h6>' + ' <h5>' + d.type + '</h5>';

    if (d.location !== null) {
      s += '<br/>' + '<h6> ' + 'Location:  ' + '</h6>';
      var locationArr = [];
      var locationtemp = [];

      if ((d.location).indexOf("; ") !== -1) {
        s += '<br/> <h5><ul>';
        locationArr = (d.location).split("; ");
        for (var count = 0; count < locationArr.length; count++) {
          s += '<li style="display:block;">' + '<h5><a class="click-location" style="cursor:pointer;">' + locationArr[count] + '</h5></a>' + '</li>';
        }
      } else {
        s += '<h5><ul>'
        s += '<li style="display:inline-block;">' + '<h5><a class="click-location" style="cursor:pointer;">' + d.location + '</h5></a>' + '</li>';
      }
      s += '</h5></ul><br/>';

    } else {
      s += '<br/>' + '<h6> ' + 'Location:  ' + '</h6>' + ' <h5>' + 'N/A' + '</h5>' + '<br/>';
    }

    if (d.type !== 'Individual') {
      if (d.numemp !== null) {
        s += '<h6>' + 'Employees: ' + '</h6> <h5>' + numCommas(d.numemp) + '</h5><br/>';
      } else {
        s += '<h6>' + 'Employees: ' + '</h6> <h5>' + 'N/A' + '</h5><br/>';
      }
    }

    if (d.twitterH === null) {
      s += '<h6>' + 'Twitter:  ' + '</h6> <h5>' + 'N/A' + '</h5><br/>';
      s += '<h6>' + 'Twitter Followers: ' + '</h6> <h5>' + 'N/A' + '</h5><br/>';
    } else {
      var twitterLink = (d.twitterH).replace('@', '');


      twitterLink = 'https://twitter.com/' + twitterLink;
      s += '<h6>' + 'Twitter:  ' + '</h6> <h5>' + "<a href=" + '"' + twitterLink + '">' + d.twitterH + '</h5></a><br/>';
      s += '<h6>' + 'Twitter Followers:  ' + '</h6> <h5>' + numCommas(d.followers) + '</h5><br/>';
    }

    //  KEY PEOPLE
    var keyPeopleArr = [];

    if (d.people !== null) {
      s += '<br/><h6>' + 'Key People:' + '</h6>' + '<ul><h5>';
      keyPeopleArr = (d.people).split(", ");
      for (var count = 0; count < keyPeopleArr.length; count++) {
        s += '<li>' + '<a href="http://www.bing.com/search?q=' + (keyPeopleArr[count]).replace(" ", "%20") + '%20' + (d.nickname).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + keyPeopleArr[count] + '</a>' + '</li>';
      }
      s += '</h5></ul>';
    }

    //  FUNDING
    var fundOrgArr = [];
    var fundAmtArr = [];

    if (d.fundingR === null) {
      s += '<br/> <h6>' + 'No known funding.' + '</h6><br/>';
    } else {
      var counter = 0;
      var fundArr = [];
      var fundtemp = [];
      var holdTotalF;
      var holdIndividsF;

      //  If there's more than one funding contributor...
      if ((d.fundingR).indexOf("; ") !== -1) {
        fundArr = (d.fundingR).split("; ");
        for (var count = 0; count < fundArr.length; count++) {
          fundtemp = fundArr[count].split(":");
          fundOrgArr.push(fundtemp[0]);
          fundAmtArr.push(fundtemp[1]);

          if (fundOrgArr[count] === "Total") {
            holdTotalF = fundAmtArr[count];
            continue;
          }

          if (fundOrgArr[count] === "Individuals") {
            holdIndividsF = fundAmtArr[count];
            continue;
          }

          if (fundAmtArr[count] === 'null') {
            if (counter === 0) {
              s += '<br/>' + '<h6>' + ' Received funding from:' + '</h6><ul>';
              counter++;
            }

            s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (fundOrgArr[count]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + fundOrgArr[count] + '</a></h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
          } else {
            if (counter === 0) {
              s += '<br/>' + '<h6>' + ' Received funding from:' + '</h6><ul>';
              counter++;
            }

            s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (fundOrgArr[count]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + fundOrgArr[count] + '</a></h5>' + ': $' + '<strong style="color:rgb(127,186,0);">' + numCommas(fundAmtArr[count]) + '</strong>' + '</li>';
          }
        }
      } else {
        fundArr = (d.fundingR).split(":");

        if (fundArr[0] === "Total") {
          s += '<br/>';
          holdTotalF = fundArr[1];
        } else if (fundArr[0] === "Individuals") {
          s += '<br/>';
          holdIndividsF = fundArr[1];
        } else {
          s += '<br/>' + '<h6>' + ' Received funding from:' + '</h6><ul>';

          s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (fundArr[0]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + fundArr[0] + '</a></h5>';

          if (fundArr[1] === 'null') {
            s += ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
          } else {
            s += ': $' + '<strong style="color:rgb(127,186,0);">' + numCommas(fundArr[1]) + '</strong>' + '</li>';
          }
        }
      }

      s += '</ul>';

      if (!isNaN(holdIndividsF)) {
        s += '<h6>' + 'Individuals provided ' + '</h6>' + ' $' + '<strong style="color:rgb(127,186,0);">' + numCommas(holdIndividsF) + '</strong></h5><h6> in fundings.</h6><br/>';
      }

      if (!isNaN(holdTotalF)) {
        s += '<h6>' + 'Total funding received: ' + '</h6>' + ' $' + '<strong style="color:rgb(127,186,0);">' + numCommas(holdTotalF) + '</strong></h5><br/>';
      }
    }

    //  INVESTING
    var investOrgArr = [];
    var investAmtArr = [];
    var holdTotalI;
    var holdIndividsI

    if (d.investmentR === null) {
      s += '<br/> <h6>' + 'No known investments.' + '</h6> <br/>';
    } else {
      var counter = 0;
      var investArr = [];
      var investtemp = [];

      //  If there's more than one funding contributor...
      if ((d.investmentR).indexOf("; ") !== -1) {
        investArr = (d.investmentR).split("; ");

        for (var count = 0; count < investArr.length; count++) {
          investtemp = investArr[count].split(":");
          investOrgArr.push(investtemp[0]);
          investAmtArr.push(investtemp[1]);

          if (investOrgArr[count] === "Total") {
            holdTotalI = investAmtArr[count];
            continue;
          }

          if (investOrgArr[count] === "Individuals") {
            holdIndividsI = investAmtArr[count];
            continue;
          }

          if (investAmtArr[count] === 'null') {
            if (counter === 0) {
              s += '<br/>' + '<h6>' + ' Received investments from:' + '</h6>' + '<ul>';
              counter++;
            }

            s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (investOrgArr[count]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + investOrgArr[count] + '</a></h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
          } else {
            if (counter === 0) {
              s += '<br/>' + '<h6>' + ' Received investments from:' + '</h6>' + '<ul>';
              counter++;
            }

            s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (investOrgArr[count]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + investOrgArr[count] + '</a></h5>' + ': $' + '<strong style="color:rgb(127,186,0);">' + numCommas(investAmtArr[count]) + '</strong>' + '</li>';
          }
        }
      } else {
        investArr = (d.investmentR).split(":");

        if (investArr[0] === "Total") {
          s += '<br/>';
          holdTotalI = investAmtArr[1];
        } else if (investArr[0] === "Individuals") {
          s += '<br/>';
          holdIndividsI = investAmtArr[1];
        } else {
          s += '<br/>' + '<h6>' + ' Received investments from:' + '</h6><ul>';

          s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (investArr[0]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + investArr[0] + '</a></h5>';

          if (investArr[1] === 'null') {
            s += ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
          } else {
            s += ': $' + '<strong style="color:rgb(127,186,0);">' + numCommas(investArr[1]) + '</strong>' + '</li>';
          }
        }
      }

      s += '</ul>';

      if (!isNaN(holdIndividsI)) {
        s += '<h6>' + 'Individuals provided ' + '</h6>' + ' $' + '<strong style="color:rgb(127,186,0);">' + numCommas(holdIndividsI) + '</strong> in investments.<br/>';
      }

      if (!isNaN(holdTotalI)) {
        s += '<h6>' + 'Total investments received: ' + '</h6>' + ' $' + '<strong style="color:rgb(127,186,0);">' + numCommas(holdTotalI) + '</strong>.<br/>';
      }
    }

    //RELATED TO
    if (d.relatedto === null) {
      s += '<br/><h6>' + 'No known relations.' + '</h6><br/>';
    } else {
      s += '<br/>' + '<h6>' + 'Related To:  ' + '</h6> <ul>';
      var relatedtoArr = [];
      var relatedtotemp = [];

      //  If there's more than one data...
      if ((d.relatedto).indexOf(", ") !== -1) {
        relatedtoArr = (d.relatedto).split(", ");
        for (var count = 0; count < relatedtoArr.length; count++) {
          s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (relatedtoArr[count]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + relatedtoArr[count] + '</a>' + '</h5></li>';
        }
      } else {
        s += '<li><h5> ' + '<a href="http://www.bing.com/search?q=' + (d.relatedto).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.relatedto + '</a>' + '</h5></li>';
      }
      s += '</ul>';
    }

    displayFormA(d);

    return s;
  }



  // Form A has the required items + basic items
  // Also, the user has the options of going directly to form B or C
  // Form B - click submit button
  // Form C - click on hyperlink below the submission button
  d3.selectAll('#edit').on('click', editForm);

  function editForm() {
    d3.select('#edit-add-info').html('<i class=" icon-file on-left"></i>' + 'Reset Form').on('click', editForm);

    sa = displayFormA();

    // Render the string into HTML
    d3.select('#info')
      .html(sa);

    d3.select('#key-people-0 input[name="kpeople"]').on('keyup', function() {
      add_input_kp(0);
    });
    d3.select('#funding-0 input[name="fund"]').on('keyup', function() {
      add_input_fund(0);
    });
    d3.select('#investing-0 input[name="invest"]').on('keyup', function() {
      add_input_invest(0);
    });
    d3.select('#data-0 input[name="data"]').on('keyup', function() {
      add_input_data(0);
    });

    d3.select("#toFormC").on('click', function() {
      displayFormC();
    });

    d3.selectAll('#submit-A').on('click', function() {
      d3.select('#name').style("border-color", "#d9d9d9");
      d3.select('#location').style("border-color", "#d9d9d9");
      displayFormB();
      // if(!_.isEmpty(sb))

    });
  }

  function processFormA() {

    var formObj = {
      type: null,
      categories: null,
      name: null,
      nickname: null,
      location: null,
      weblink: null,
      numemp: null,
      people: null,
      twitterH: null,
      followers: null,
      data: null,
      relatedto: null,
      poruc: null,
      fundingR: null,
      yearFR: null,
      investmentR: null,
      yearIR: null,
      rande: null,
      randeY: null,
      grantsG: null,
      yearG: null,
      golr: null
    };

    // Scrape the web form for pertinent information and store into the object data structure.
    if ($('input[name="name"]').val() === "" && $('input[name="location"]').val() === "") {
      console.log("The entity name and location have not been filled out.");
      return {
        name: "empty",
        location: "empty",
        errorMessage: "The entity name and location have not been filled out."
      };
    } else if ($('input[name="name"]').val() === "") {
      console.log("The entity name has not been filled out.");
      return {
        name: "empty",
        errorMessage: "The entity name has not been filled out."
      };
    } else if ($('input[name="location"]').val() === "") {
      console.log("The location has not been filled out.");
      return {
        location: "empty",
        errorMessage: "The location has not been filled out."
      };
    } else {
      // Set the entity type.
      if ($('input#rb_forpro').is(":checked"))
        formObj.type = "For-Profit";
      else if ($('input#rb_nonpro').is(":checked"))
        formObj.type = "Non-Profit";
      else if ($('input#rb_gov').is(":checked"))
        formObj.type = "Government";
      else
        formObj.type = "Individual";

      // Set the entity name.
      formObj.name = d3.select(".webform-content input[name='name']")[0][0].value;

      // Grab the categories.
      formObj.categories = "";
      d3.selectAll('.webform-categories input').filter(function(d) {
        if (this.checked === true) {
          if (formObj.categories !== "") {
            formObj.categories += ", ";
          }
          switch (this.value) {
            case 'General':
              formObj.categories += "General";
              break;
            case 'DataTrans':
              formObj.categories += "Data Transparency";
              break;
            case 'CJobsOpp':
              formObj.categories += "21st Century Jobs and Opportunities";
              break;
            case 'SRCities':
              formObj.categories += "Smart and Resilient Cities";
              break;
            default:
              break;
          }
        }
      });
      if (formObj.categories === "") {
        formObj.categories = null;
      }

      // Obtain the location
      formObj.location = d3.select("input[name='location']")[0][0].value;

      // Obtain the URL
      formObj.weblink = "";
      if (formObj.weblink === "") {
        formObj.weblink = null;
      } else {
        formObj.weblink = d3.select("input[name='website']")[0][0].value;
      }

      // Obtain the number of employees.
      formObj.numemp = "";
      if (formObj.numemp === "") {
        formObj.numemp = null;
      } else {
        formObj.numemp = d3.select("input[name='employees']")[0][0].value;
      }

      // Obtain the key people (.kpeople)
      formObj.people = "";
      d3.selectAll('.kpeople').filter(function(d) {
        if (this.value !== "") {
          if (formObj.people !== "") {
            formObj.people += ", ";
          }
          formObj.people += this.value;
        }
      });
      if (formObj.people === "") {
        formObj.people = null;
      }

      // Obtain funding information (Don't forget to add total feature later on...)
      formObj.fundingR = "";
      formObj.yearFR = "";
      d3.selectAll('.fund-input .funder').filter(function(d, i) {
        if (this.value !== "") {
          if (formObj.fundingR !== "") {
            formObj.fundingR += "; ";
          }

          if (d3.selectAll('.fund_amt')[0][i].value === "") {
            formObj.fundingR += this.value + ":null";
          } else {
            formObj.fundingR += this.value + ":" + d3.selectAll('.fund_amt')[0][i].value;
          }
        }
      });
      d3.selectAll('.fund-input .fund_year').filter(function(d, i) {
        if (formObj.yearFR !== "" && i !== d3.selectAll('.fund-input .fund_year')[0].length - 1) {
          formObj.yearFR += ", ";
        }

        if (this.value === "" && i !== d3.selectAll('.fund-input .fund_year')[0].length - 1) {
          formObj.yearFR += "null";
        } else {
          formObj.yearFR += this.value;
        }
      });
      if (formObj.fundingR === "") {
        formObj.fundingR = null;
      }
      if (formObj.yearFR === "") {
        formObj.yearFR = null;
      }

      // Obtain investment information (Don't forget to add total feature later on...)
      formObj.investmentR = "";
      formObj.yearIR = "";
      d3.selectAll('.invest-input .investor').filter(function(d, i) {
        if (this.value !== "") {
          if (formObj.investmentR !== "") {
            formObj.investmentR += "; ";
          }

          if (d3.selectAll('.invest_amt')[0][i].value === "") {
            formObj.investmentR += this.value + ":null";
          } else {
            formObj.investmentR += this.value + ":" + d3.selectAll('.invest_amt')[0][i].value;
          }
        }
      });
      d3.selectAll('.invest-input .invest_year').filter(function(d, i) {
        if (formObj.yearIR !== "" && i !== d3.selectAll('.invest-input .invest_year')[0].length - 1) {
          formObj.yearIR += ", ";
        }

        if (this.value === "" && i !== d3.selectAll('.invest-input .invest_year')[0].length - 1) {
          formObj.yearIR += "null";
        } else {
          formObj.yearIR += this.value;
        }
      });
      if (formObj.investmentR === "") {
        formObj.investmentR = null;
      }
      if (formObj.yearIR === "") {
        formObj.yearIR = null;
      }

      // Obtain data
      formObj.data = "";
      d3.selectAll('.data-entity').filter(function(d, i) {
        if (formObj.data !== "") {
          formObj.data += ', ';
        }
        formObj.data += this.value;
      });
      if (formObj.data === "") {
        formObj.data = null;
      }
    }

    return formObj;
  }

  function processFormB(obj) {
    //var formObj = {type:null,categories:null,name:null,nickname:null,location:null,weblink:null,numemp:null,people:null,twitterH:null,followers:null,data:null,relatedto:null,poruc:null,fundingR:null,yearFR:null,investmentR:null,yearIR:null,rande:null,randeY:null,grantsG:null,yearG:null,golr:null};

    // Set the entity name.
    obj.nickname = d3.select(".webform-content input[name='nickname']")[0][0].value;
    if (obj.nickname === "") {
      obj.nickname = obj.name;
    }

    obj.twitterH = d3.select(".webform-content input[name='twitterhandle']")[0][0].value;
    if (obj.twitterH === "") {
      obj.twitterH = null;
    }

    // Set the entity type.
    if ($('.webform-influence input#rb_local').is(":checked"))
      obj.golr = "0";
    else
      obj.golr = "1";

    // Obtain the key people (.kpeople)
    obj.poruc = "";
    d3.selectAll('.collaborator').filter(function(d) {
      if (this.value !== "") {
        if (obj.poruc !== "") {
          obj.poruc += "; ";
        }
        obj.poruc += this.value;
      }
    });
    if (obj.poruc === "") {
      obj.poruc = null;
    }

    // Obtain funding information (Don't forget to add total feature later on...)
    obj.rande = "";
    obj.randeY = "";
    d3.selectAll('.revenue-input .revenue_amt').filter(function(d, i) {
      if (this.value !== "") {
        if (obj.rande !== "") {
          obj.rande += "; ";
        }

        if (d3.selectAll('.revenue_amt')[0][i].value === "") {
          obj.rande += "Revenue" + ":null";
        } else {
          obj.rande += "Revenue" + ":" + this.value;
        }
      }
    });
    d3.selectAll('.revenue-input .revenue_year').filter(function(d, i) {
      if (obj.randeY !== "" && i !== d3.selectAll('.revenue-input .revenue_year')[0].length - 1) {
        obj.randeY += ", ";
      }

      if (this.value === "" && i !== d3.selectAll('.revenue-input .revenue_year')[0].length - 1) {
        obj.randeY += "null";
      } else {
        obj.randeY += this.value;
      }
    });
    if (obj.rande === "" || obj.rande === "null") {
      obj.rande = null;
    }
    if (obj.randeY === "" || obj.randeY === "null") {
      obj.randeY = null;
    }


    // Fix this - expenses...
    var expense_rande = "; ";
    var expense_randeY = ", ";
    d3.selectAll('.expense-input .expense_amt').filter(function(d, i) {
      if (this.value !== "") {
        if (expense_rande !== "; ") {
          expense_rande += "; ";
        }

        if (d3.selectAll('.expense_amt')[0][i].value === "") {
          expense_rande += "Expense" + ":null";
        } else {
          expense_rande += "Expense" + ":" + this.value;
        }
      }
    });
    d3.selectAll('.expense-input .expense_year').filter(function(d, i) {
      if (expense_randeY !== ", " && i !== d3.selectAll('.expense-input .expense_year')[0].length - 1) {
        expense_randeY += ", ";
      }

      if (this.value === "" && i !== d3.selectAll('.expense-input .expense_year')[0].length - 1) {
        expense_randeY += "null";
      } else {
        expense_randeY += this.value;
      }
    });
    if (expense_rande === "; ") {
      expense_rande = "";
    }
    if (expense_randeY === ", ") {
      expense_randeY = "";
    }
    obj.rande += expense_rande;
    obj.randeY += expense_randeY;

    if (obj.rande === "null")
      obj.rande = null;
    if (obj.randeY === "null")
      obj.randeY = null;

    // Obtain funding information (Don't forget to add total feature later on...)
    obj.grantsG = "";
    obj.yearG = "";
    d3.selectAll('.grant-input .grant_amt').filter(function(d, i) {
      if (this.value !== "") {
        if (obj.grantsG !== "") {
          obj.grantsG += ", ";
        }

        if (d3.selectAll('.grant_amt')[0][i].value === "") {
          obj.grantsG += "null";
        } else {
          obj.grantsG += this.value;
        }
      }
    });
    d3.selectAll('.grant-input .grant_year').filter(function(d, i) {
      if (obj.yearG !== "" && i !== d3.selectAll('.grant-input .grant_year')[0].length - 1) {
        obj.yearG += ", ";
      }

      if (this.value === "" && i !== d3.selectAll('.grant-input .grant_year')[0].length - 1) {
        obj.yearG += "null";
      } else {
        obj.yearG += this.value;
      }
    });
    if (obj.grantsG === "") {
      obj.grantsG = null;
    }
    if (obj.yearG === "") {
      obj.yearG = null;
    }

    console.log(obj);

    return obj;

  }

  // Form B has the required items, which are already filled out, and the advanced items.
  // This form takes the user directly to form C if the user submits the data via clicking the submit button.
  function displayFormB() {
    // Now we have a perfectly structured JSON object that contains the information given by the user and inputted into the webform.
    // Send this object as a parameter to form B, and render form B accordingly.

    var formObj = processFormA();

    if (formObj.location !== "empty" && formObj.name !== "empty") {
      // Reinitialize Form A items.

      counterKey = 0;
      counterK = 0;

      counterFund = 0;
      counterF = 0;

      // Render form B.

      s = "";
      s += '<h2 id="webform-head">Information</h2><hr/>\
            <div class="webform-content">\
            <div class="input-control text" data-role="input-control">\
              <input type="text" name="name" id="name" placeholder="Name of Entity"/>\
            </div>\
            <h3 class="form-header">Entity Type</h3>\
            <div class="webform-entities">\
              <div data-role="input-control" class="input-control radio default-style webform">\
                <label>\
                  <input id="rb_forpro" type="radio" name="entitytype" value="For-Profit" checked="checked"/><span class="check"></span>\
                  <h4 class="webform-labels">For-Profit</h4>\
                </label>\
              </div>\
              <div data-role="input-control" class="input-control radio default-style webform">\
                <label>\
                  <input id="rb_nonpro" type="radio" name="entitytype" value="Non-Profit"/><span class="check"></span>\
                  <h4 class="webform-labels">Non-Profit</h4>\
                </label>\
              </div>\
              <div data-role="input-control" class="input-control radio default-style webform">\
                <label>\
                  <input id="rb_gov" type="radio" name="entitytype" value="Government"/><span class="check"></span>\
                  <h4 class="webform-labels">Government</h4>\
                </label>\
              </div>\
             <div data-role="input-control" class="input-control radio default-style webform">\
                <label>\
                  <input id="rb_individs" type="radio" name="entitytype" value="Individual"/><span class="check"></span>\
                  <h4 class="webform-labels">Individual</h4>\
                </label>\
              </div>\
            </div>\
            <div class="input-control text" data-role="input-control">\
              <input type="text" name="location" id="location" placeholder="City, State"/>\
            </div>\
            ';

      // Time to render the nickname, twitter handle fields
      // Also circle of influence, collaboration, revenue, revenue and grant...
      s += '<hr/>\
          <div class = "input-control text" data-role="input-control">\
            <input type="text" name="nickname" id="nickname" placeholder="Nickname/Abbr."/>\
          </div>\
          <div class = "input-control text" data-role="input-control">\
            <input type="text" name="twitterhandle" id="twitterhandle" placeholder="Twitter Handle"/>\
          </div>\
          <h3 class="form-header" style="display:inline-block;">Circle of Influence: </h3>\
          <div class="webform-influence">\
            <div data-role="input-control" class="input-control radio default-style webform">\
              <label>\
                <input id="rb_local" type="radio" name="influence-type" value="Local Influence" checked="checked"/><span class="check"></span>\
                <h4 class="webform-labels">Local Influence</h4>\
              </label>\
            </div>\
            <div data-role="input-control" class="input-control radio default-style webform">\
              <label>\
                <input id="rb_global" type="radio" name="influence-type" value="Global Influence" checked="checked"/><span class="check"></span>\
                <h4 class="webform-labels">Global Influence</h4>\
              </label>\
            </div>\
          </div>\
          <h3 class="form-header">Collaboration</h3>\
          <div id="collaboration-0" class="input-control text" data-role="input-control">\
          <input type="text" name="collaboration" class="collaborator" placeholder="Collaborator"/>\
          </div>\
          <h3 class="form-header">Revenue</h3>\
          <div id="revenue-0">\
          <div class="revenue-input input-control text" data-role="input-control">\
          <input type="text" name="revenue_amt" class="revenue_amt" placeholder="Amount" style="display:inline-block; width: 57%;"/>\
          <input type="text" name="revenue_year" class="revenue_year" placeholder="Year" style="display:inline-block; width: 20%;"/>\
          </div>\
          </div>\
          <h3 class="form-header">Expenses</h3>\
          <div id="expense-0">\
          <div class="expense-input input-control text" data-role="input-control">\
          <input type="text" name="expense_amt" class="expense_amt" placeholder="Amount" style="display:inline-block; width: 57%;"/>\
          <input type="text" name="expense_year" class="expense_year" placeholder="Year" style="display:inline-block; width: 20%;"/>\
          </div>\
          </div>\
          <h3 class="form-header">Grants</h3>\
          <div id="grant-0">\
          <div class="grant-input input-control text" data-role="input-control">\
          <input type="text" name="grant_amt" class="grant_amt" placeholder="Amount" style="display:inline-block; width: 57%;"/>\
          <input type="text" name="grant_year" class="grant_year" placeholder="Year" style="display:inline-block; width: 20%;"/>\
          </div>\
          </div>\
          <button type="button" id="submit-B" href="javascript: check_empty()">Submit</button>\
          </div>';

      d3.select('#info')
        .html(s);

      // Time to prefill the form...
      d3.selectAll('#name').text(function(d) {
        console.log(formObj.name);
        this.value = formObj.name;
      }).attr("disabled", true);
      d3.selectAll('#location').text(function(d) {
        this.value = formObj.location;
      }).attr("disabled", true).style("margin-top", "10px");
      d3.selectAll('input[name="entitytype"]').filter(function(d, i) {
        if (this.value === formObj.type)
          this.checked = true;
        else
          this.checked = false;
        this.disabled = true;
      });

      // Add action listeners
      d3.selectAll('input[name="collaboration"]').on('keyup', function() {
        add_input_collab(0);
      });
      d3.selectAll('input[name="revenue_amt"]').on('keyup', function() {
        add_input_rev(0);
      });
      d3.selectAll('input[name="expense_amt"]').on('keyup', function() {
        add_input_exp(0);
      });
      d3.selectAll('input[name="grant_amt"]').on('keyup', function() {
        add_input_grant(0);
      });

      d3.selectAll('#submit-B').on('click', function() {
        displayFormCSendJSON(formObj);
        // if(!_.isEmpty(sb))
      });
    } else {
      if (formObj.name === "empty" && formObj.location === "empty") {
        d3.select('#name').style("border-color", "#e51400");
        d3.select('#location').style("border-color", "#e51400");
      } else {
        if (formObj.name === "empty")
          d3.select('#name').style("border-color", "#e51400");
        else
          d3.select('#location').style("border-color", "#e51400");
      }
    }
  }


  function add_input_kp(counterK) {
    if ($('#key-people-' + counterK + ' input[name="kpeople"]').val() !== "") {
      d3.select('#key-people-' + counterK + ' input[name="kpeople"]').on('keyup', null);
      counterK++; // counter -> 2

      console.log(counterK);
      $("#key-people-" + (counterK - 1)).after('<div id="key-people-' + counterK + '" class="input-control text" data-role="input-control"><input type="text" name="kpeople" class="kpeople" placeholder="Key Person\'s Name"/></div>');
      d3.select("#key-people-" + counterK + " input[name='kpeople']").on("keyup", function() {
        add_input_kp(counterK);
      });
    }
  }

  function add_input_fund(counterF) {
    if ($('#funding-' + counterF + ' input[name="fund"]').val() !== "") {
      d3.select('#funding-' + counterF + ' input[name="fund"]').on('keyup', null);
      counterF++; // counter -> 2

      console.log(counterF);
      $("#funding-" + (counterF - 1)).after('<div id="funding-' + counterF + '"><div class="fund-input input-control text" data-role="input-control">\
          <input type="text" name="fund" class="funder" placeholder="Funder" style="display:inline-block; width:50%;"/>\
          <input type="text" name="fund_amt" class="fund_amt" placeholder="Amount" style="display:inline-block; width: 27%;"/>\
          <input type="text" name="fund_year" class="fund_year" placeholder="Year" style="display:inline-block; width: 20%;"/>\
      </div></div>');
      d3.select("#funding-" + counterF + " input[name='fund']").on("keyup", function() {
        add_input_fund(counterF);
      });
    }
  }

  function add_input_invest(counterI) {
    if ($('#investing-' + counterI + ' input[name="invest"]').val() !== "") {
      d3.select('#investing-' + counterI + ' input[name="invest"]').on('keyup', null);
      counterI++; // counter -> 2

      console.log(counterI);
      $("#investing-" + (counterI - 1)).after('<div id="investing-' + counterI + '"><div class="invest-input input-control text" data-role="input-control">\
          <input type="text" name="invest" class="investor" placeholder="Investor" style="display:inline-block; width:50%;"/>\
          <input type="text" name="invest_amt" class="invest_amt" placeholder="Amount" style="display:inline-block; width: 27%;"/>\
          <input type="text" name="invest_year" class="invest_year" placeholder="Year" style="display:inline-block; width: 20%;"/>\
      </div></div>');
      d3.select("#investing-" + counterI + " input[name='invest']").on("keyup", function() {
        add_input_invest(counterI);
      });
    }
  }

  function add_input_data(counterD) {
    if ($('#data-' + counterD + ' input[name="data"]').val() !== "") {
      d3.select('#data-' + counterD + ' input[name="data"]').on('keyup', null);
      counterD++; // counter -> 2

      console.log(counterD);
      $("#data-" + (counterD - 1)).after('<div id="data-' + counterD + '" class="input-control text" data-role="input-control"><input type="text" name="data" class="data" placeholder="Data Resource"/></div>');
      d3.select("#data-" + counterD + " input[name='data']").on("keyup", function() {
        add_input_data(counterD);
      });
    }
  }

  function add_input_collab(counterC) {
    if ($('#collaboration-' + counterC + ' input[name="collaboration"]').val() !== "") {
      d3.select('#collaboration-' + counterC + ' input[name="collaboration"]').on('keyup', null);
      counterC++; // counter -> 2

      console.log(counterC);
      $("#collaboration-" + (counterC - 1)).after('<div id="collaboration-' + counterC + '" class="input-control text" data-role="input-control"><input type="text" name="collaboration" class="collaborator" placeholder="Collaborator"/></div>');
      d3.select("#collaboration-" + counterC + " input[name='collaboration']").on("keyup", function() {
        add_input_collab(counterC);
      });
    }
  }

  function add_input_rev(counterR) {
    if ($('#revenue-' + counterR + ' input[name="revenue_amt"]').val() !== "") {
      d3.select('#revenue-' + counterR + ' input[name="revenue_amt"]').on('keyup', null);
      counterR++; // counter -> 2

      console.log(counterR);
      $("#revenue-" + (counterR - 1)).after('<div id="revenue-' + counterR + '"><div class="revenue-input input-control text" data-role="input-control">\
          <input type="text" name="revenue_amt" class="revenue_amt" placeholder="Amount" style="display:inline-block; width: 57%;"/>\
        <input type="text" name="revenue_year" class="revenue_year" placeholder="Year" style="display:inline-block; width: 20%;"/>\
      </div></div>');
      d3.select("#revenue-" + counterR + " input[name=revenue_amt]").on("keyup", function() {
        add_input_rev(counterR);
      });
    }
  }

  function add_input_exp(counterE) {
    if ($('#expense-' + counterE + ' input[name="expense_amt"]').val() !== "") {
      d3.select('#expense-' + counterE + ' input[name="expense_amt"]').on('keyup', null);
      counterE++; // counter -> 2

      console.log(counterE);
      $("#expense-" + (counterE - 1)).after('<div id="expense-' + counterE + '"><div class="expense-input input-control text" data-role="input-control">\
         <input type="text" name="expense_amt" class="expense_amt" placeholder="Amount" style="display:inline-block; width: 57%;"/>\
        <input type="text" name="expense_year" class="expense_year" placeholder="Year" style="display:inline-block; width: 20%;"/>\
      </div></div>');
      d3.select("#expense-" + counterE + " input[name=expense_amt]").on("keyup", function() {
        add_input_exp(counterE);
      });
    }
  }

  function add_input_grant(counterG) {
    if ($('#grant-' + counterG + ' input[name="grant_amt"]').val() !== "") {
      d3.select('#grant-' + counterG + ' input[name="grant_amt"]').on('keyup', null);
      counterG++; // counter -> 2

      console.log(counterG);
      $("#grant-" + (counterG - 1)).after('<div id="grant-' + counterG + '"><div class="grant-input input-control text" data-role="input-control">\
         <input type="text" name="grant_amt" class="grant_amt" placeholder="Amount" style="display:inline-block; width: 57%;"/>\
        <input type="text" name="grant_year" class="grant_year" placeholder="Year" style="display:inline-block; width: 20%;"/>\
      </div></div>');
      d3.select("#grant-" + counterG + " input[name=grant_amt]").on("keyup", function() {
        add_input_grant(counterG);
      });
    }
  }

  function displayFormA() {
    // Test if jQuery works within d3...
    //var elementCount = $( "*" ).css( "border", "3px solid red" ).length;
    s = "";
    s += '<h2 id="webform-head">Information</h2><hr/>\
          <div class="webform-content">\
          <div class="input-control text" data-role="input-control">\
          <input type="text" name="name" id="name" placeholder="Name of Entity"/>\
          </div>\
          <h3 class="form-header">What type of entity?</h3>\
          <div class="webform-entities">\
          <div data-role="input-control" class="input-control radio default-style webform">\
            <label>\
              <input id="rb_forpro" type="radio" name="entitytype" value="For-Profit" checked="checked"/><span class="check"></span>\
              <h4 class="webform-labels">For-Profit</h4>\
            </label>\
          </div>\
          <div data-role="input-control" class="input-control radio default-style webform">\
            <label>\
              <input id="rb_nonpro" type="radio" name="entitytype" value="Non-Profit"/><span class="check"></span>\
              <h4 class="webform-labels">Non-Profit</h4>\
            </label>\
          </div>\
          <div data-role="input-control" class="input-control radio default-style webform">\
            <label>\
              <input id="rb_gov" type="radio" name="entitytype" value="Government"/><span class="check"></span>\
              <h4 class="webform-labels">Government</h4>\
            </label>\
          </div>\
          <div data-role="input-control" class="input-control radio default-style webform">\
            <label>\
              <input id="rb_individs" type="radio" name="entitytype" value="Individual"/><span class="check"></span>\
              <h4 class="webform-labels">Individual</h4>\
            </label>\
          </div>\
          </div>\
          <h3 class="form-header">What type(s) of work do they do?</h3><h4>(Select All That Apply)</h4>\
          <div class="webform-categories">\
          <div data-role="input-control" class="input-control checkbox webform">\
            <label>\
              <input id="cb_gen" type="checkbox" name="gen" data-show="general" value="General"/><span class="check"></span>\
              <h4 class="webform-labels">General</h4>\
            </label>\
          </div>\
          <div data-role="input-control" class="input-control checkbox webform">\
            <label>\
              <input id="cb_datat" type="checkbox" name="datat" data-show="datatrans" value="DataTrans"/><span class="check"></span>\
              <h4 class="webform-labels">Data Transparency</h4>\
            </label>\
          </div>\
          <div data-role="input-control" class="input-control checkbox webform">\
            <label>\
              <input id="cb_cjao" type="checkbox" name="cjao" data-show="cjobsopp" value="CJobsOpp"/><span class="check"></span>\
              <h4 class="webform-labels">21st Century Jobs and Opportunities</h4>\
            </label>\
          </div>\
          <div data-role="input-control" class="input-control checkbox webform">\
            <label>\
              <input id="cb_src" type="checkbox" name="src" data-show="srcities" value="SRCities"/><span class="check"></span>\
              <h4 class="webform-labels">Smart and Resilient Cities</h4>\
            </label>\
          </div>\
          </div>\
          <div class="input-control text" data-role="input-control">\
            <input type="text" name="location" id="location" placeholder="City, State"/>\
          </div>\
          <div class="input-control text" data-role="input-control">\
          <input type="text" name="website" id="website" placeholder="Website"/>\
          </div>\
          <h3 class="form-header">Number of Employees?</h3>\
          <div class="input-control text" data-role="input-control">\
            <input type="text" name="employees" id="employee" maxlength="6" style="width:30% !important;"/>\
          </div>\
          <h3 class="form-header">Key People?</h3>\
          <div id="key-people-0" class="input-control text" data-role="input-control">\
            <input type="text" name="kpeople" class="kpeople" placeholder="Key Person\'s Name"/>\
          </div>\
          <h3 class="form-header">Who funds them via grants?</h3>\
          <div id="funding-0">\
          <div class="fund-input input-control text" data-role="input-control">\
          <input type="text" name="fund" class="funder" placeholder="Funder" style="display:inline-block; width:50%;"/>\
          <input type="text" name="fund_amt" class="fund_amt" placeholder="Amount" style="display:inline-block; width: 27%;"/>\
          <input type="text" name="fund_year" class="fund_year" placeholder="Year" style="display:inline-block; width: 20%;"/>\
          </div>\
          </div>\
          <h3 class="form-header">Who invests in them via equity stakes (stock)?</h3>\
          <div id="investing-0">\
          <div class="invest-input input-control text" data-role="input-control">\
          <input type="text" name="invest" class="investor" placeholder="Investor" style="display:inline-block; width:50%;"/>\
          <input type="text" name="invest_amt" class="invest_amt" placeholder="Amount" style="display:inline-block; width: 27%;"/>\
          <input type="text" name="invest_year" class="invest_year" placeholder="Year" style="display:inline-block; width: 20%;"/>\
          </div>\
          </div>\
          <h3 class="form-header">Who provides them with data?</h3>\
          <div id="data-0" class="input-control text" data-role="input-control">\
          <input type="text" name="data" class="data-entity" placeholder="Data Resource"/>\
          </div>\
          <button type="button" id="submit-A" href="javascript: check_empty()">Submit</button>\
          </div>\
          <hr/>\
          <div class="webform-footer">\
          <span id="">Some entities lack adequate information. Would you like to help?</span><br/><span id="toFormC">Click here!</span>\
          </div>';

    return s;

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

    //  We know which nodes have how null fields...
    filteredNodes.forEach(function(d) {
      var objValue = _.object(_.map(d, function(value, key) {
        if (value === null)
          nullFieldCount++;
        return [key, value];
      }));
      // Individuals do not have numemp, people, rande, randeY 
      // Not a fair comparison of null fields.
      if (d.type === 'Individual')
        nullFieldCount -= 4;

      nullFieldArr.push({
        name: d.name,
        nullFields: nullFieldCount
      });
      nullFieldCount = 0;
    });

    //  Let's determine the nodes with the most null fields.
    var maxNullObj = _.max(nullFieldArr, function(d) {
      return d.nullFields
    });

    var potentialSuggestions = [];

    nullFieldArr.forEach(function(d) {
      if (d.nullFields <= maxNullObj.nullFields && d.nullFields >= maxNullObj.nullFields - 3) {
        var nodeObj = _.find(filteredNodes, function(e) {
          return d.name === e.name;
        });
        potentialSuggestions.push(nodeObj);
        // countFive++;
      }
    });
    console.log(potentialSuggestions.length);
    var fiveSuggestions = [];

    while (fiveSuggestions.length < 5) {
      var indexValue = Math.floor(Math.random() * potentialSuggestions.length);
      console.log(indexValue);
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

    var s = "";
    s += '<h2 id="webform-head">Information</h2><hr/>\
            <div style="text-align:center;" class="webform-content">\
            <p>Thanks for submitting information to Athena!</p>\
            <p>Might you be interested in helping with other entities?</p>';
    s += '<ul id="suggestions">';

    var suggestions = determineNullFields();
    console.log(suggestions);

    suggestions.forEach(function(d) {
      s += '<li><a style="cursor:pointer;">' + d.name + '</a></li>';
    });

    s += '</ul>\
        </div>';

    // Render the string into HTML
    d3.select('#info')
      .html(s);

    d3.selectAll('#info ul a').on('click', function(d, i) {
      sinclick(suggestions[i]);
      editForm();
      preFillFormA(suggestions[i]);
    });


    var data = {};
    data.title = "title";
    data.message = "message";

    $.ajax({
      type: 'POST',
      data: $.param(data),
      url: '/handleData',
          crossDomain: true
    }).done(function(returnData){
      alert('cool');
    });

    // Still trying to resolve AJAX / ExpressJS routing issue.
    //   $.ajax({
    //     url: "http://localhost:3000/endpoint",

    //     // The name of the callback parameter, as specified by the YQL service
    //     jsonp: "callback",

    //     // Tell jQuery we're expecting JSONP
    //     dataType: "jsonp",

    //     // Tell YQL what we want and that we want JSON
    //     data: JSON.stringify(data),

    //     // Work with the response
    //     success: function( data ) {
    //         console.log( data ); // server response
    //     }
     	// });

    //   $.ajax
    // ({
    //   type: "POST",
    //   url: "/ajax",
    //   cache: false, 
    //   dataType: "json",
    //   data:{name: "Dennis", address: {city: "Dub", country: "IE"}},
    //   success: function(data){
    //     alert('Success!')
    //   },
    //   error: function(jqXHR, textStatus, err){
    //     alert('text status' + textStatus + ', err ' + err)
    //   }

    //  });

  }

  // Prefilling the form for editing...
  function preFillFormA(obj) {
    testNode = obj;
    // Time to prefill the form...
    d3.selectAll('#name').text(function(d) {
      this.value = obj.name;
    });
    d3.selectAll('#location').text(function(d) {
      this.value = obj.location;
    });
    d3.selectAll('input[name="entitytype"]').filter(function(d, i) {
      if (this.value === obj.type)
        this.checked = true;
      else
        this.checked = false;
    });

    if (obj.categories !== null) {
      var categories = (obj.categories).split(', ');
      d3.selectAll('.webform-categories input').filter(function(d, i) {
        if (categories.indexOf(d3.selectAll('.webform-categories h4')[0][i].textContent) > -1)
          this.checked = true;
        else
          this.checked = false;
      });
    }

    d3.selectAll('#website').text(function(d) {
      this.value = obj.weblink;
    });
    d3.selectAll('#employee').text(function(d) {
      this.value = obj.numemp;
    });

    if (obj.people !== null) {
      var keypeople = (obj.people).split(", ");
      keypeople.forEach(function(d, i) {
        // typeIntoFields(d, 0, d3.selectAll('#keypeople input')[0][i]);
        $("#key-people-" + i).after('<div id="key-people-' + (i + 1) + '" class="input-control text" data-role="input-control"><input type="text" name="kpeople" class="kpeople" placeholder="Key Person\'s Name""/></div>');
        d3.select('#key-people-' + i + ' input[name="kpeople"]').on('keyup', null);
        d3.select('#key-people-' + i + ' input[name="kpeople"]').text(function(e) {
          this.value = d;
        });
        // d3.select('#key-people-' + i + " input[name='kpeople']").text(function(e){console.log(d.value); d.value = e});
      });
      d3.select('#key-people-' + keypeople.length + ' input[name="kpeople"]').on('keyup', function() {
        add_input_kp(keypeople.length);
      });
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
      this.value = obj.twitterH;
    });

    d3.selectAll('input[name="influence-type"]').filter(function(d, i) {
      if (obj.golr === "0" && this.value === "Local Influence")
        this.checked = true;
      else if (obj.golr === "1" && this.value === "Global Influence")
        this.checked = true;
      else
        this.checked = false;
    });

    if (obj.poruc !== null) {
      var collaboration = (obj.poruc).split("; ");
      collaboration.forEach(function(d, i) {
        // typeIntoFields(d, 0, d3.selectAll('#keypeople input')[0][i]);
        $("#collaboration-" + i).after('<div id="collaboration-' + (i + 1) + '" class="input-control text" data-role="input-control"><input type="text" name="collaboration" class="collaborator" placeholder="Collaborator"/></div>');
        d3.select('#collaboration-' + i + ' input[name="collaboration"]').on('keyup', null);
        d3.select('#collaboration-' + i + ' input[name="collaboration"]').text(function(e) {
          this.value = d;
        });
        // d3.select('#key-people-' + i + " input[name='kpeople']").text(function(e){console.log(d.value); d.value = e});
      });
      d3.select('#collaboration-' + collaboration.length + ' input[name="collaboration"]').on('keyup', function() {
        add_input_collab(collaboration.length);
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
    var s = "";

    var countTypes = [0, 0, 0, 0];

    var forProfitsArray = [];
    var nonProfitsArray = [];
    var governmentArray = [];
    var individualArray = [];

    for (var x = 0; x < filteredNodes.length; x++) {
      if (filteredNodes[x].type === "Individual") {
        individualArray.push(filteredNodes[x].name);
        individualObjects.push(filteredNodes[x]);
        countTypes[3] ++;
      }
      if (filteredNodes[x].type === "Non-Profit") {
        nonProfitsArray.push(filteredNodes[x].name);
        nonProfitObjects.push(filteredNodes[x]);
        countTypes[1] ++;
      }
      if (filteredNodes[x].type === "For-Profit") {
        forProfitsArray.push(filteredNodes[x].name);
        forProfitObjects.push(filteredNodes[x]);
        countTypes[0] ++;
      }
      if (filteredNodes[x].type === "Government") {
        governmentArray.push(filteredNodes[x].name);
        governmentObjects.push(filteredNodes[x]);
        countTypes[2] ++;
      }
    }


    s += "<h3 style='padding-bottom:10px;'>The Data</h3>";


    //  Printing to side panel within web application.
    d3.select('#info')
      .html(s)
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
      .style("width", function(d) {
        return x(d) / 5 + "%";
      })
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
        if (typesText === 0) {
          typesText++;
          return;
        }
        if (typesText === 1) {
          typesText++;
          return;
        }
        if (typesText === 2) {
          typesText++;
          return;
        }
        if (typesText === 3) {
          typesText++;
          return;
        }
      });

    var t = "";

    t += "<h3 style='padding-top:15px; color:rgb(127,186,0);'>For-Profit (" + countTypes[0] + "):</h3> ";
    for (var x = 0; x < forProfitsArray.length; x++) {
      if (x === forProfitsArray.length - 1) {
        t += "<a class='for-profit-entity' style='font-size:16px; cursor:pointer;'>" + forProfitsArray[x] + "</a>";
      } else {
        t += "<a class='for-profit-entity' style='font-size:16px; cursor:pointer;'>" + forProfitsArray[x] + ", </a>";
      }
    }
    t += "<h3 style='padding-top:15px; color:rgb(0,164,239);'>Non-Profit (" + countTypes[1] + "):</h3> ";
    for (var x = 0; x < nonProfitsArray.length; x++) {
      if (x === nonProfitsArray.length - 1) {
        t += "<a class='non-profit-entity' style='font-size:16px; cursor:pointer;'>" + nonProfitsArray[x] + "</a>";
      } else {
        t += "<a class='non-profit-entity' style='font-size:16px; cursor:pointer;'>" + nonProfitsArray[x] + ", </a>";
      }
    }
    t += "<h3 style='padding-top:15px; color:rgb(242,80,34);'>Government (" + countTypes[2] + "):</h3> ";
    for (var x = 0; x < governmentArray.length; x++) {
      if (x === governmentArray.length - 1) {
        t += "<a class='government-entity' style='font-size:16px; cursor:pointer;'>" + governmentArray[x] + "</a>";
      } else {
        t += "<a class='government-entity' style='font-size:16px; cursor:pointer;'>" + governmentArray[x] + ", </a>";
      }
    }
    t += "<h3 style='padding-top:15px; color:rgb(255,185,0);'>Individual (" + countTypes[3] + "):</h3> ";
    for (var x = 0; x < individualArray.length; x++) {
      if (x === individualArray.length - 1) {
        t += "<a  class='individual-entity' style='font-size:16px; cursor:pointer;'>" + individualArray[x] + "</a>";
      } else {
        t += "<a  class='individual-entity' style='font-size:16px; cursor:pointer;'>" + individualArray[x] + ", </a>";
      }
    }

    d3.select('#info')
      .append('text')
      .style('padding-bottom', '20px')
      .html(t);

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
    //console.log(r);
    handleQuery(this.innerHTML);
  });

  var nameOfEntities = [];
  var nameOfLocations = [];
  var uniqueNames = [];
  var uniqueLocations = [];
  var masterList = [];

  searchAutoComplete();

  function searchAutoComplete() {
    var s = "";

    filteredNodes.forEach(function(d) {
      nameOfEntities.push(d.name);
      nameOfLocations.push(d.location);

      if (uniqueNames.indexOf(d.name) === -1 && d.name !== null) {
        uniqueNames.push(d.name);
      }
      if (uniqueLocations.indexOf(d.location) === -1 && d.location !== null) {
        var splitLocations = (d.location).split("; ");
        splitLocations.forEach(function(location) {
          if (uniqueLocations.indexOf(location) === -1) {
            uniqueLocations.push(location);
          }
        });
      }
    });

    masterList = masterList.concat(uniqueLocations);
    masterList = masterList.concat(uniqueNames);
    masterList = masterList.sort();

    for (var count = 0; count < masterList.length; count++) {
      s += '<option value="' + masterList[count] + '">';
    }

    d3.select('.filter-name-location datalist')
      .html(s);

  }

  d3.selectAll('#search-text').on('keydown', function() {
    if (d3.event.keyCode === 13) {
      var query = document.getElementById('search-text').value;
      handleQuery(query);
    }
  });

  d3.selectAll('option').on('click', function(n, i) {
    var query = (d3.selectAll('option'))[0][i].value;
    handleQuery(query);
  });

  function handleQuery(query) {
    var posLocation = [];
    var count = 0;

    if (nameOfEntities.indexOf(query) !== -1) {
      nameOfEntities.forEach(function(name) {
        if (name === query && name.length === query.length) {
          var posName = nameOfEntities.indexOf(query);
          //console.log(query);
          nodeInit.filter(function(l, i) {
            if (i === posName) {
              //console.log(l);
              // handleNodeHover(l);
              sinclick(l);
            }
          });
        }
      });
    } else {
      nameOfLocations.forEach(function(location) {

        if (location !== null) {

          var splitLocation = location.split("; ");
          if (splitLocation.indexOf(query) !== -1) {
            posLocation.push(count);
          }

        }
        count++;
      });
      var counter = 0;

      fundLink.style("opacity", function(l) {
        if ((l.source).location === query && (l.target).location === query) {
          //console.log((l.source).location);
          return "1";
        } else
          return "0.05";
      });

      investLink.style("opacity", function(l) {
        if ((l.source).location === query && (l.target).location === query) {
          return "1";
        } else
          return "0.05";
      });

      porucsLink.style("opacity", function(l) {
        if ((l.source).location === query && (l.target).location === query) {
          return "1";
        } else
          return "0.05";
      });

      dataLink.style("opacity", function(l) {
        if ((l.source).location === query && (l.target).location === query) {
          return "1";
        } else
          return "0.05";
      });

      d3.selectAll('.node').style('opacity', function(n, i) {

        if (posLocation.indexOf(i) === -1) {
          return 0.05;
        } else
          return 1;

      }).on('mouseover', null);

      node
        .on('mouseout', null)
        .on('mouseover', null)
        .on('click', null);

      node.filter(function(n, i) {
          if (nodeInit[0][i].style.opacity == 1)
            return n;

        })
        .on('mouseout', null)
        .on('mouseover', handleClickNodeHover)
        .on('click', null);

    }

  }

  function handleNodeHover(d) {
    var s = textDisplay(d);

    //  Printing to side panel within web application.
    webform = editDisplay(d);

    // For editing the data displayed within the side panel.
    d3.select('#edit')
      .html(webform);

    d3.select('#info')
      .html(s)
      .style('list-style', 'square');

    fundLink.transition()
      .duration(350)
      .delay(0).style("opacity", function(l) {
        if (d === l.source || d === l.target) {
          return "1";
        } else
          return "0.05";
      });

    investLink.transition()
      .duration(350)
      .delay(0).style("opacity", function(l) {
        if (d === l.source || d === l.target) {

          return "1";
        } else
          return "0.05";
      });

    porucsLink.transition()
      .duration(350)
      .delay(0).style("opacity", function(l) {
        if (d === l.source || d === l.target) {
          return "1";
        } else
          return "0.05";
      });

    dataLink.transition()
      .duration(350)
      .delay(0).style("opacity", function(l) {
        if (d === l.source || d === l.target) {
          return "1";
        } else
          return "0.05";
      });

    var neighborFund = graph.fundingR.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    var neighborInvest = graph.investingR.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    var neighborPorucs = graph.porucs.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    var neighborData = graph.data.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    d3.select(this).style("stroke", "black");

    svg.selectAll('.node')
      .transition()
      .duration(350)
      .delay(0)
      .style("opacity", function(l) {
        if (neighborFund.indexOf(l.index) > -1 || neighborInvest.indexOf(l.index) > -1 || neighborPorucs.indexOf(l.index) > -1 || neighborData.indexOf(l.index) > -1 || l === d)
          return "1";
        else
          return "0.05";
      });
  }

  function handleAdjNodeClick(d) {
    fundLink.style("opacity", function(l) {
      if (d === l.source || d === l.target) {
        return "1";
      } else
        return "0.05";
    });

    investLink.style("opacity", function(l) {
      if (d === l.source || d === l.target) {

        return "1";
      } else
        return "0.05";
    });

    porucsLink.style("opacity", function(l) {
      if (d === l.source || d === l.target) {
        return "1";
      } else
        return "0.05";
    });

    dataLink.style("opacity", function(l) {
      if (d === l.source || d === l.target) {
        return "1";
      } else
        return "0.05";
    });

    //http://stackoverflow.com/questions/16857806/apply-several-mouseover-events-to-neighboring-connected-nodes
    var neighborFund = graph.fundingR.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    //http://stackoverflow.com/questions/16857806/apply-several-mouseover-events-to-neighboring-connected-nodes
    var neighborInvest = graph.investingR.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    //http://stackoverflow.com/questions/16857806/apply-several-mouseover-events-to-neighboring-connected-nodes
    var neighborPorucs = graph.porucs.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    //http://stackoverflow.com/questions/16857806/apply-several-mouseover-events-to-neighboring-connected-nodes
    var neighborData = graph.data.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    svg.selectAll('.node').style("opacity", function(l) {
      if (neighborFund.indexOf(l.index) > -1 || neighborInvest.indexOf(l.index) > -1 || neighborPorucs.indexOf(l.index) > -1 || neighborData.indexOf(l.index) > -1 || l === d)
        return "1";
      else
        return "0.05";
    });

    d3.select(this).style("stroke", "black").on('mouseout', null);

    node.filter(function(singleNode) {
        if (singleNode !== d) {
          return singleNode;
        }
      }).style("stroke", "white")
      .on('mouseover', null)
      .on('mouseout', null)
      .on('click', null);

    node.filter(function(l) {
        return (neighborFund.indexOf(l.index) > -1 || neighborInvest.indexOf(l.index) > -1 || neighborPorucs.indexOf(l.index) > -1 || neighborData.indexOf(l.index) > -1 || l === d);
      }).on('mouseover', handleClickNodeHover)
      .on('click', sinclick);

  }

  function offNode() {
    node
      .style("stroke", "white")
      .on('mouseover', handleNodeHover)
      .on('mouseout', offNode)
      .on('click', sinclick);
    //.on("dblclick", dblclick);

    fundLink
      .transition()
      .duration(350)
      .delay(0)
      .style("stroke", "rgb(111,93,168)")
      .style("opacity", "0.2")
      .style("stroke-width", "1px").style("z-index", "0");
    // .each(function(){this.parentNode.insertBefore(this, this);});

    investLink
      .transition()
      .duration(350)
      .delay(0)
      .style("stroke", "rgb(38,114,114)")
      .style("opacity", "0.2")
      .style("stroke-width", "1px").style("z-index", "0");
    // .each(function(){this.parentNode.insertBefore(this, this);});

    porucsLink
      .transition()
      .duration(350)
      .delay(0)
      .style("stroke", "rgb(235,232,38)")
      .style("opacity", "0.2")
      .style("stroke-width", "1px").style("z-index", "0");
    // .each(function(){this.parentNode.insertBefore(this, this);});

    dataLink
      .transition()
      .duration(350)
      .delay(0)
      .style("stroke", "rgb(191,72,150)")
      .style("opacity", "0.2")
      .style("stroke-width", "1px").style("z-index", "0");
    // .each(function(){this.parentNode.insertBefore(this, this);});

    // svg.selectAll('.node text').style('opacity', 1); 
    d3.selectAll('.node').transition()
      .duration(350)
      .delay(0)

    .style("opacity", "1");
  }

  function sinclick(d) {

    handleClickNodeHover(d);

    fundLink.transition()
      .duration(350)
      .delay(0).style("opacity", function(l) {
        if (d === l.source || d === l.target) {
          return "1";
        } else
          return "0.05";
      });

    investLink.transition()
      .duration(350)
      .delay(0).style("opacity", function(l) {
        if (d === l.source || d === l.target) {

          return "1";
        } else
          return "0.05";
      });

    porucsLink.transition()
      .duration(350)
      .delay(0).style("opacity", function(l) {
        if (d === l.source || d === l.target) {
          return "1";
        } else
          return "0.05";
      });

    dataLink.transition()
      .duration(350)
      .delay(0).style("opacity", function(l) {
        if (d === l.source || d === l.target) {
          return "1";
        } else
          return "0.05";
      });

    node.style("stroke", function(singleNode) {
      if (singleNode !== d) {
        return "white";
      } else
        return "black";
    }).on('mouseout', null);

    node.filter(function(singleNode) {
      if (singleNode !== d) {
        // d3.select(singleNode).on('click', null);
        return singleNode;
      }
    }).on('mouseover', null);

    var neighborFund = graph.fundingR.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    var neighborInvest = graph.investingR.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    var neighborPorucs = graph.porucs.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    var neighborData = graph.data.filter(function(link) {
      return link.source.index === d.index || link.target.index === d.index;
    }).map(function(link) {
      return link.source.index === d.index ? link.target.index : link.source.index;
    });

    svg.selectAll('.node').transition()
      .duration(350)
      .delay(0).style("opacity", function(l) {
        if (neighborFund.indexOf(l.index) > -1 || neighborInvest.indexOf(l.index) > -1 || neighborPorucs.indexOf(l.index) > -1 || neighborData.indexOf(l.index) > -1 || l === d)
          return "1";
        else
          return "0.05";
      });


    node.filter(function(l) {
        return (neighborFund.indexOf(l.index) > -1 || neighborInvest.indexOf(l.index) > -1 || neighborPorucs.indexOf(l.index) > -1 || neighborData.indexOf(l.index) > -1 || l === d);
      }).on('mouseover', handleClickNodeHover)
      .on('click', function(l) {});

  }

  function dragstart(d) {
    // d3.select(this).classed("fixed", function(d){if(d !== centeredNode){d.fixed = true;} else d.fixed = false;});
    d3.select(this).classed("fixed", function(d) {
      d.fixed = false;
    });

    node.on('mouseover', null)
      .on('mouseout', null)
      .on('click', null);
  }

  function drag(d) {
    node.on('mouseover', null)
      .on('mouseout', null)
      .on('click', null);
  }

  function dragend(d) {
    d3.select(this).classed("fixed", function(d) {
      d.fixed = true;
    });


    node.on('mouseover', handleNodeHover)
      .on('mouseout', offNode)
      .on('click', sinclick);
  }



  function tick(e) {
    // Push different nodes in different directions for clustering.
    var k = 8 * e.alpha;

    /* Four quandrant separation */
    filteredNodes.forEach(function(o, i) {
      if (o.type !== null) {
        if (o.type === "Individual") {
					//o.x += k;
					//o.y += k;
          o.x += (k + k);
          o.y += (k + k);
        }
        if (o.type === "Non-Profit") {
					//o.x += -k;
					//o.y += k;
          o.x += (-k - k);
          o.y += (k + k);
        }
        if (o.type === "For-Profit") {
					//o.x += k;
					//o.y += -k;
          o.x += (k + k);
          o.y += (-k - k);
        }
        if (o.type === "Government") {
					//o.x += -k;
					//o.y += -k;
          o.x += (-k - k);
          o.y += (-k - k);
        }
      }
    });

    if (_.isEmpty(centeredNode)) {
      fundLink.attr("x1", function(d) {
          return d.source.x;
        })
        .attr("y1", function(d) {
          return d.source.y;
        })
        .attr("x2", function(d) {
          return d.target.x;
        })
        .attr("y2", function(d) {
          return d.target.y;
        });
      //console.log("Inside 2") 
      investLink.attr("x1", function(d) {
          return d.source.x;
        })
        .attr("y1", function(d) {
          return d.source.y;
        })
        .attr("x2", function(d) {
          return d.target.x;
        })
        .attr("y2", function(d) {
          return d.target.y;
        });
      //console.log("Inside 3")
      porucsLink.attr("x1", function(d) {
          return d.source.x;
        })
        .attr("y1", function(d) {
          return d.source.y;
        })
        .attr("x2", function(d) {
          return d.target.x;
        })
        .attr("y2", function(d) {
          return d.target.y;
        });
      //console.log("Inside 4")
      dataLink.attr("x1", function(d) {
          return d.source.x;
        })
        .attr("y1", function(d) {
          return d.source.y;
        })
        .attr("x2", function(d) {
          return d.target.x;
        })
        .attr("y2", function(d) {
          return d.target.y;
        });

      node.attr("cx", function(d) {
          return d.x = d.x;
        })
        .attr("cy", function(d) {
          return d.y = d.y;
        });

      textElement.attr("transform", transform);

    } else {
      fundLink.attr("x1", function(d) {
          if (d.source === centeredNode) {
            d.source.x = centeredNode.x;
            console.log("Test");
            return d.source.x;
          } else return d.source.x;
        })
        .attr("y1", function(d) {
          if (d.source === centeredNode) {
            d.source.y = centeredNode.y;
            console.log("Test");
            return d.source.y;
          } else return d.source.y;
        })
        .attr("x2", function(d) {
          if (d.target === centeredNode) {
            d.target.x = centeredNode.x;
            console.log("Test");
            return d.target.x;
          } else return d.target.x;
        })
        .attr("y2", function(d) {
          if (d.target === centeredNode) {
            d.target.y = centeredNode.y;
            console.log("Test");
            return d.target.y;
          } else return d.target.y;
        });
      //console.log("Inside 2") 
      investLink.attr("x1", function(d) {
          if (d.source === centeredNode) {
            d.source.x = centeredNode.x;
            console.log("Test");
            return d.source.x;
          } else return d.source.x;
        })
        .attr("y1", function(d) {
          if (d.source === centeredNode) {
            d.source.y = centeredNode.y;
            console.log("Test");
            return d.source.y;
          } else return d.source.y;
        })
        .attr("x2", function(d) {
          if (d.target === centeredNode) {
            d.target.x = centeredNode.x;
            console.log("Test");
            return d.target.x;
          } else return d.target.x;
        })
        .attr("y2", function(d) {
          if (d.target === centeredNode) {
            d.target.y = centeredNode.y;
            console.log("Test");
            return d.target.y;
          } else return d.target.y;
        });
      //console.log("Inside 3")
      porucsLink.attr("x1", function(d) {
          if (d.source === centeredNode) {
            d.source.x = centeredNode.x;
            console.log("Test");
            return d.source.x;
          } else return d.source.x;
        })
        .attr("y1", function(d) {
          if (d.source === centeredNode) {
            d.source.y = centeredNode.y;
            console.log("Test");
            return d.source.y;
          } else return d.source.y;
        })
        .attr("x2", function(d) {
          if (d.target === centeredNode) {
            d.target.x = centeredNode.x;
            console.log("Test");
            return d.target.x;
          } else return d.target.x;
        })
        .attr("y2", function(d) {
          if (d.target === centeredNode) {
            d.target.y = centeredNode.y;
            console.log("Test");
            return d.target.y;
          } else return d.target.y;
        });
      //console.log("Inside 4")
      dataLink.attr("x1", function(d) {
          if (d.source === centeredNode) {
            d.source.x = centeredNode.x;
            console.log("Test");
            return d.source.x;
          } else return d.source.x;
        })
        .attr("y1", function(d) {
          if (d.source === centeredNode) {
            d.source.y = centeredNode.y;
            console.log("Test");
            return d.source.y;
          } else return d.source.y;
        })
        .attr("x2", function(d) {
          if (d.target === centeredNode) {
            d.target.x = centeredNode.x;
            console.log("Test");
            return d.target.x;
          } else return d.target.x;
        })
        .attr("y2", function(d) {
          if (d.target === centeredNode) {
            d.target.y = centeredNode.y;
            console.log("Test");
            return d.target.y;
          } else return d.target.y;
        });


      // fundLink.attr("x1", function(d) { return d.source.x;  })
      // .attr("y1", function(d) { return d.source.y;  })
      // .attr("x2", function(d) { return d.target.x;  })
      // .attr("y2", function(d) { return d.target.y;  });
      // } 

      node.attr("cx", function(d, i) {
          if ((d3.select(node)[0][0].data())[i].name === centeredNode.name) {
            d.x = centeredNode.x;
            return d.x;
          } else return d.x = d.x;
        })
        .attr("cy", function(d, i) {
          if ((d3.select(node)[0][0].data())[i].name === centeredNode.name) {
            d.y = centeredNode.y;
            return d.y;
          } else return d.y = d.y;
        });

      textElement.attr("transform", transform);

    }

  }

  function determineVisibleNodes() {
    var visibleNodesIndices = [];
    for (var x = 0; x < nodeInit[0].length; x++) {
      if (nodeInit[0][x].style.visibility === "visible") {
        visibleNodesIndices.push(x);
      }
    }

    var visibleNodes = [];
    nodeInit.filter(function(d, i) {
      if (visibleNodesIndices.indexOf(i) > -1)
        visibleNodes.push(d);
    });

    return visibleNodes;
  }

  d3.selectAll('#cb_fund').on('click', function() {
    var visibleNodes = determineVisibleNodes();
    //  Form links for funds.

    if (document.getElementById("cb_fund").checked) {


      var count = 0;
      // drawFundLink();
      d3.selectAll('.fund').style("visibility", function(l) {
        if (visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "hidden") {
          count++;
          return "visible";
        } else
          return "hidden";
      });
      //console.log(count);
      // .classed("visfund", true); 
    }

    if (!document.getElementById("cb_fund").checked) {
      // d3.selectAll(".fund").remove();
      d3.selectAll('.fund').style("visibility", function(l) {
        // if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "visible")
        // {
        return "hidden";
        // }
      });

      // .classed("visfund", false);
    }

    if (visibleNodes.length === 0 || (!document.getElementById("cb_individ").checked && !document.getElementById("cb_forpro").checked && !document.getElementById("cb_nonpro").checked && !document.getElementById("cb_gov").checked)) {
      document.getElementById("cb_fund").checked = false;
    }

  });

  d3.selectAll('#cb_invest').on('click', function() {
    var visibleNodes = determineVisibleNodes();

    //  Form links for investments.
    if (document.getElementById("cb_invest").checked) {



      // //console.log(visibleNodes);

      // drawInvestLink();
      d3.selectAll('.invest').style("visibility", function(l) {
        if (visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "hidden") {
          return "visible";
        } else
          return "hidden";
      });
      // //console.log("inside invest" + visibleNodes.length);
      // .classed("visinvest", true);

    }

    if (!document.getElementById("cb_invest").checked) {
      // d3.selectAll(".invest").remove();
      d3.selectAll('.invest').style("visibility", function(l) {
        // if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "visible")
        return "hidden";
      });
      // .classed("visinvest", false);

    }

    if (visibleNodes.length === 0 || (!document.getElementById("cb_individ").checked && !document.getElementById("cb_forpro").checked && !document.getElementById("cb_nonpro").checked && !document.getElementById("cb_gov").checked)) {
      document.getElementById("cb_invest").checked = false;
    }
  });

  d3.selectAll('#cb_porucs').on('click', function() {
    var visibleNodes = determineVisibleNodes();

    //  Form links for partnerships or unidentified collaborations.
    if (document.getElementById("cb_porucs").checked) {


      // drawInvestLink();
      d3.selectAll('.porucs').style("visibility", function(l) {
        if (visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "hidden")
          return "visible";
        else
          return "hidden";
      });
      // .classed("visporucs", true);

    }

    if (!document.getElementById("cb_porucs").checked) {
      // d3.selectAll(".porucs").remove();
      d3.selectAll('.porucs').style("visibility", function(l) {
        // if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "visible")
        return "hidden";
      });
      // .classed("visporucs", false);

    }

    if (visibleNodes.length === 0 || (!document.getElementById("cb_individ").checked && !document.getElementById("cb_forpro").checked && !document.getElementById("cb_nonpro").checked && !document.getElementById("cb_gov").checked)) {
      document.getElementById("cb_porucs").checked = false;
    }
  });

  d3.selectAll('#cb_data').on('click', function() {
    var visibleNodes = determineVisibleNodes();

    //  Form links for data.
    if (document.getElementById("cb_data").checked) {


      // drawInvestLink();
      d3.selectAll('.data').style("visibility", function(l) {
        if (visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "hidden")
          return "visible";
        else
          return "hidden";
      });
      // .classed("visdata", true);

    }

    if (!document.getElementById("cb_data").checked) {
      // d3.selectAll(".porucs").remove();
      d3.selectAll('.data').style("visibility", function(l) {
        // //console.log(l.source);
        //console.log(this.style.visibility);
        // if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "visible")
        return "hidden";

      });
      // .classed("visdata", false);

    }

    if (visibleNodes.length === 0 || (!document.getElementById("cb_individ").checked && !document.getElementById("cb_forpro").checked && !document.getElementById("cb_nonpro").checked && !document.getElementById("cb_gov").checked)) {
      document.getElementById("cb_data").checked = false;
    }

  });

  d3.selectAll('#cb_individ, #cb_nonpro, #cb_forpro, #cb_gov').on('click', function() {

    //  Variables for visible.

    var fNCArray0v = [];
    var iNCArray0v = [];
    var pcNCArray0v = [];
    var aNCArray0v = [];
    var countIndex0v = [];

    var fNCArray1v = [];
    var iNCArray1v = [];
    var pcNCArray1v = [];
    var aNCArray1v = [];
    var countIndex1v = [];

    var fNCArray2v = [];
    var iNCArray2v = [];
    var pcNCArray2v = [];
    var aNCArray2v = [];
    var countIndex2v = [];

    var fNCArray3v = [];
    var iNCArray3v = [];
    var pcNCArray3v = [];
    var aNCArray3v = [];
    var countIndex3v = [];

    //  Variables for hidden.

    var fNCArray0h = [];
    var iNCArray0h = [];
    var pcNCArray0h = [];
    var aNCArray0h = [];
    var countIndex0h = [];

    var fNCArray1h = [];
    var iNCArray1h = [];
    var pcNCArray1h = [];
    var aNCArray1h = [];
    var countIndex1h = [];

    var fNCArray2h = [];
    var iNCArray2h = [];
    var pcNCArray2h = [];
    var aNCArray2h = [];
    var countIndex2h = [];

    var fNCArray3h = [];
    var iNCArray3h = [];
    var pcNCArray3h = [];
    var aNCArray3h = [];
    var countIndex3h = [];


    if (document.getElementById("cb_individ").checked) {

      d3.selectAll(".node").filter(function(d) {
        if (d.type === "Individual") return this;
      }).style("visibility", "visible");
      //  For funding connections

      countIndex0v = 0;

      filteredNodes.forEach(function(node0v) {
        if (node0v.type === 'Individual') {
          fundingCon.forEach(function(fundNodeCon0v) {
            if (node0v === fundNodeCon0v.source || node0v === fundNodeCon0v.target) {
              fNCArray0v.push(countIndex0v); //  store positions inside of array...
            }
            countIndex0v++;
          });
          countIndex0v = 0;
        }
      });

      //  For investing connections

      countIndex0v = 0;

      filteredNodes.forEach(function(node0v) {
        if (node0v.type === 'Individual') {
          investingCon.forEach(function(investNodeCon0v) {
            if (node0v === investNodeCon0v.source || node0v === investNodeCon0v.target) {
              iNCArray0v.push(countIndex0v); //  store positions inside of array...
            }
            countIndex0v++;
          });
          countIndex0v = 0;
        }
      });

      //  For partnerships/collaborations connections

      countIndex0v = 0;

      filteredNodes.forEach(function(node0v) {
        if (node0v.type === 'Individual') {
          porucsCon.forEach(function(porucsNodeCon0v) {
            if (node0v === porucsNodeCon0v.source || node0v === porucsNodeCon0v.target) {
              pcNCArray0v.push(countIndex0v); //  store positions inside of array...
            }
            countIndex0v++;
          });
          countIndex0v = 0;
        }
      });

      //  For data connections

      countIndex0 = 0;

      filteredNodes.forEach(function(node0) {
        if (node0.type === 'Individual') {
          dataCon.forEach(function(dataNodeCon0) {
            if (node0 === dataNodeCon0.source || node0 === dataNodeCon0.target) {
              aNCArray0v.push(countIndex0); //  store positions inside of array...
            }
            countIndex0++;
          });
          countIndex0 = 0;
        }
      });

    }
    if (!document.getElementById("cb_individ").checked)

    {

      d3.selectAll(".node").filter(function(d) {
        if (d.type === "Individual") return this;
      }).style("visibility", "hidden");

      //  For funding connections

      countIndex0h = 0;

      filteredNodes.forEach(function(node0h) {
        if (node0h.type === 'Individual') {
          fundingCon.forEach(function(fundNodeCon0h) {
            if (node0h === fundNodeCon0h.source || node0h === fundNodeCon0h.target) {
              fNCArray0h.push(countIndex0h); //  store positions inside of array...
            }
            countIndex0h++;
          });
          countIndex0h = 0;
        }
      });

      //  For investing connections

      countIndex0h = 0;

      filteredNodes.forEach(function(node0h) {
        if (node0h.type === 'Individual') {
          investingCon.forEach(function(investNodeCon0h) {
            if (node0h === investNodeCon0h.source || node0h === investNodeCon0h.target) {
              iNCArray0h.push(countIndex0h); //  store positions inside of array...
            }
            countIndex0h++;
          });
          countIndex0h = 0;
        }
      });

      //  For partnerships/collaborations connections

      countIndex0h = 0;

      filteredNodes.forEach(function(node0h) {
        if (node0h.type === 'Individual') {
          porucsCon.forEach(function(porucsNodeCon0h) {
            if (node0h === porucsNodeCon0h.source || node0h === porucsNodeCon0h.target) {
              pcNCArray0h.push(countIndex0h); //  store positions inside of array...
            }
            countIndex0h++;
          });
          countIndex0h = 0;
        }
      });

      //  For data connections

      countIndex0h = 0;

      filteredNodes.forEach(function(node0h) {
        if (node0h.type === 'Individual') {
          dataCon.forEach(function(dataNodeCon0h) {
            if (node0h === dataNodeCon0h.source || node0h === dataNodeCon0h.target) {
              aNCArray0h.push(countIndex0h); //  store positions inside of array...
            }
            countIndex0h++;
          });
          countIndex0h = 0;
        }
      });
    }

    if (document.getElementById("cb_nonpro").checked) {
      d3.selectAll(".node").filter(function(d) {
        if (d.type === "Non-Profit") return this;
      }).style("visibility", "visible");

      //  For funding connections

      countIndex1v = 0;

      filteredNodes.forEach(function(node1v) {
        if (node1v.type === 'Non-Profit') {
          fundingCon.forEach(function(fundNodeCon1v) {
            if ((node1v === fundNodeCon1v.source || node1v === fundNodeCon1v.target) && fNCArray1v.indexOf(countIndex1v) === -1) {
              fNCArray1v.push(countIndex1v); //  store positions inside of array...
            }
            countIndex1v++;
          });
          countIndex1v = 0;
        }
      });

      //  For investing connections

      countIndex1v = 0;

      filteredNodes.forEach(function(node1v) {
        if (node1v.type === 'Non-Profit') {
          investingCon.forEach(function(investNodeCon1v) {
            if ((node1v === investNodeCon1v.source || node1v === investNodeCon1v.target) && iNCArray1v.indexOf(countIndex1v) === -1) {
              iNCArray1v.push(countIndex1v); //  store positions inside of array...
            }
            countIndex1v++;
          });
          countIndex1v = 0;
        }
      });

      //  For partnerships/collaborations connections

      countIndex1v = 0;

      filteredNodes.forEach(function(node1v) {
        if (node1v.type === 'Non-Profit') {
          porucsCon.forEach(function(porucsNodeCon1v) {
            if ((node1v === porucsNodeCon1v.source || node1v === porucsNodeCon1v.target) && pcNCArray1v.indexOf(countIndex1v) === -1) {
              pcNCArray1v.push(countIndex1v); //  store positions inside of array...
            }
            countIndex1v++;
          });
          countIndex1v = 0;
        }
      });

      //  For data connections

      countIndex1v = 0;

      filteredNodes.forEach(function(node1v) {
        if (node1v.type === 'Non-Profit') {
          dataCon.forEach(function(dataNodeCon1v) {
            if ((node1v === dataNodeCon1v.source || node1v === dataNodeCon1v.target) && aNCArray1v.indexOf(countIndex1v) === -1) {
              aNCArray1v.push(countIndex1v); //  store positions inside of array...
            }
            countIndex1v++;
          });
          countIndex1v = 0;
        }
      });


    }
    if (!document.getElementById("cb_nonpro").checked) {
      d3.selectAll(".node").filter(function(d) {
        if (d.type === "Non-Profit") return this;
      }).style("visibility", "hidden");


      //  For funding connections

      countIndex1h = 0;

      filteredNodes.forEach(function(node1h) {
        if (node1h.type === 'Non-Profit') {
          fundingCon.forEach(function(fundNodeCon1h) {
            if ((node1h === fundNodeCon1h.source || node1h === fundNodeCon1h.target) && fNCArray1h.indexOf(countIndex1h) === -1) {
              fNCArray1h.push(countIndex1h); //  store positions inside of array...
            }
            countIndex1h++;
          });
          countIndex1h = 0;
        }
      });

      //  For investing connections

      countIndex1h = 0;

      filteredNodes.forEach(function(node1h) {
        if (node1h.type === 'Non-Profit') {
          investingCon.forEach(function(investNodeCon1h) {
            if ((node1h === investNodeCon1h.source || node1h === investNodeCon1h.target) && iNCArray1h.indexOf(countIndex1h) === -1) {
              iNCArray1h.push(countIndex1h); //  store positions inside of array...
            }
            countIndex1h++;
          });
          countIndex1h = 0;
        }
      });

      //  For partnerships/collaborations connections

      countIndex1h = 0;

      filteredNodes.forEach(function(node1h) {
        if (node1h.type === 'Non-Profit') {
          porucsCon.forEach(function(porucsNodeCon1h) {
            if ((node1h === porucsNodeCon1h.source || node1h === porucsNodeCon1h.target) && pcNCArray1h.indexOf(countIndex1h) === -1) {
              pcNCArray1h.push(countIndex1h); //  store positions inside of array...
            }
            countIndex1h++;
          });
          countIndex1h = 0;
        }
      });

      //  For data connections

      countIndex1h = 0;

      filteredNodes.forEach(function(node1h) {
        if (node1h.type === 'Non-Profit') {
          dataCon.forEach(function(dataNodeCon1h) {
            if ((node1h === dataNodeCon1h.source || node1h === dataNodeCon1h.target) && aNCArray1h.indexOf(countIndex1h) === -1) {
              aNCArray1h.push(countIndex1h); //  store positions inside of array...
            }
            countIndex1h++;
          });
          countIndex1h = 0;
        }
      });



    }


    if (document.getElementById("cb_forpro").checked) {
      d3.selectAll(".node").filter(function(d) {
        if (d.type === "For-Profit") return this;
      }).style("visibility", "visible");


      //  For funding connections

      countIndex2v = 0;

      filteredNodes.forEach(function(node2v) {
        if (node2v.type === 'For-Profit') {
          fundingCon.forEach(function(fundNodeCon2v) {
            if ((node2v === fundNodeCon2v.source || node2v === fundNodeCon2v.target) && fNCArray2v.indexOf(countIndex2v) === -1) {
              fNCArray2v.push(countIndex2v); //  store positions inside of array...
            }
            countIndex2v++;
          });
          countIndex2v = 0;
        }
      });

      //  For investing connections

      countIndex2v = 0;

      filteredNodes.forEach(function(node2v) {
        if (node2v.type === 'For-Profit') {
          investingCon.forEach(function(investNodeCon2v) {
            if ((node2v === investNodeCon2v.source || node2v === investNodeCon2v.target) && iNCArray2v.indexOf(countIndex2v) === -1) {
              iNCArray2v.push(countIndex2v); //  store positions inside of array...
            }
            countIndex2v++;
          });
          countIndex2v = 0;
        }
      });

      //  For partnerships/collaborations connections

      countIndex2v = 0;

      filteredNodes.forEach(function(node2v) {
        if (node2v.type === 'For-Profit') {
          porucsCon.forEach(function(porucsNodeCon2v) {
            if ((node2v === porucsNodeCon2v.source || node2v === porucsNodeCon2v.target) && pcNCArray2v.indexOf(countIndex2v) === -1) {
              pcNCArray2v.push(countIndex2v); //  store positions inside of array...
            }
            countIndex2v++;
          });
          countIndex2v = 0;
        }
      });

      //  For data connections

      countIndex2v = 0;

      filteredNodes.forEach(function(node2v) {
        if (node2v.type === 'For-Profit') {
          dataCon.forEach(function(dataNodeCon2v) {
            if ((node2v === dataNodeCon2v.source || node2v === dataNodeCon2v.target) && aNCArray2v.indexOf(countIndex2v) === -1) {
              aNCArray2v.push(countIndex2v); //  store positions inside of array...
            }
            countIndex2v++;
          });
          countIndex2v = 0;
        }
      });

    }
    if (!document.getElementById("cb_forpro").checked)

    {
      d3.selectAll(".node").filter(function(d) {
        if (d.type === "For-Profit") return this;
      }).style("visibility", "hidden");

      //  For funding connections

      countIndex2h = 0;

      filteredNodes.forEach(function(node2h) {
        if (node2h.type === 'For-Profit') {
          fundingCon.forEach(function(fundNodeCon2h) {
            if ((node2h === fundNodeCon2h.source || node2h === fundNodeCon2h.target) && fNCArray2h.indexOf(countIndex2h) === -1) {
              fNCArray2h.push(countIndex2h); //  store positions inside of array...
            }
            countIndex2h++;
          });
          countIndex2h = 0;
        }
      });

      //  For investing connections

      countIndex2h = 0;

      filteredNodes.forEach(function(node2h) {
        if (node2h.type === 'For-Profit') {
          investingCon.forEach(function(investNodeCon2h) {
            if ((node2h === investNodeCon2h.source || node2h === investNodeCon2h.target) && iNCArray2h.indexOf(countIndex2h) === -1) {
              iNCArray2h.push(countIndex2h); //  store positions inside of array...
            }
            countIndex2h++;
          });
          countIndex2h = 0;
        }
      });



      //  For partnerships/collaborations connections

      countIndex2h = 0;

      filteredNodes.forEach(function(node2h) {
        if (node2h.type === 'For-Profit') {
          porucsCon.forEach(function(porucsNodeCon2h) {
            if ((node2h === porucsNodeCon2h.source || node2h === porucsNodeCon2h.target) && pcNCArray2h.indexOf(countIndex2h) === -1) {
              pcNCArray2h.push(countIndex2h); //  store positions inside of array...
            }
            countIndex2h++;
          });
          countIndex2h = 0;
        }
      });

      //  For data connections

      countIndex2h = 0;

      filteredNodes.forEach(function(node2h) {
        if (node2h.type === 'For-Profit') {
          dataCon.forEach(function(dataNodeCon2h) {
            if ((node2h === dataNodeCon2h.source || node2h === dataNodeCon2h.target) && aNCArray2h.indexOf(countIndex2h) === -1) {
              aNCArray2h.push(countIndex2h); //  store positions inside of array...
            }
            countIndex2h++;
          });
          countIndex2h = 0;
        }
      });


    }

    if (document.getElementById("cb_gov").checked) {
      d3.selectAll(".node").filter(function(d) {
        if (d.type === "Government") return this;
      }).style("visibility", "visible");

      // For funding connections

      countIndex3v = 0;

      filteredNodes.forEach(function(node3v) {
        if (node3v.type === 'Government') {
          fundingCon.forEach(function(fundNodeCon3v) {
            if ((node3v === fundNodeCon3v.source || node3v === fundNodeCon3v.target) && fNCArray3v.indexOf(countIndex3v) === -1) {
              fNCArray3v.push(countIndex3v); //  store positions inside of array...
            }
            countIndex3v++;
          });
          countIndex3v = 0;
        }
      });




      //  For investing connections

      countIndex3v = 0;

      filteredNodes.forEach(function(node3v) {
        if (node3v.type === 'Government') {
          investingCon.forEach(function(investNodeCon3v) {
            if ((node3v === investNodeCon3v.source || node3v === investNodeCon3v.target) && iNCArray3v.indexOf(countIndex3v) === -1) {
              iNCArray3v.push(countIndex3v); //  store positions inside of array...
            }
            countIndex3v++;
          });
          countIndex3v = 0;
        }
      });



      //  For partnerships/collaborations connections

      countIndex3v = 0;

      filteredNodes.forEach(function(node3v) {
        if (node3v.type === 'Government') {
          porucsCon.forEach(function(porucsNodeCon3v) {
            if ((node3v === porucsNodeCon3v.source || node3v === porucsNodeCon3v.target) && pcNCArray3v.indexOf(countIndex3v) === -1) {
              pcNCArray3v.push(countIndex3v); //  store positions inside of array...
            }
            countIndex3v++;
          });
          countIndex3v = 0;
        }
      });



      //  For data connections

      countIndex3v = 0;

      filteredNodes.forEach(function(node3v) {
        if (node3v.type === 'Government') {
          dataCon.forEach(function(dataNodeCon3v) {
            if ((node3v === dataNodeCon3v.source || node3v === dataNodeCon3v.target) && aNCArray3v.indexOf(countIndex3v) === -1) {
              aNCArray3v.push(countIndex3v); //  store positions inside of array...
            }
            countIndex3v++;
          });
          countIndex3v = 0;
        }
      });

    }
    if (!document.getElementById("cb_gov").checked) {
      d3.selectAll(".node").filter(function(d) {
        if (d.type === "Government") return this;
      }).style("visibility", "hidden");
      //  For funding connections

      countIndex3h = 0;

      filteredNodes.forEach(function(node3h) {
        if (node3h.type === 'Government') {
          fundingCon.forEach(function(fundNodeCon3h) {
            if ((node3h === fundNodeCon3h.source || node3h === fundNodeCon3h.target) && fNCArray3h.indexOf(countIndex3h) === -1) {
              fNCArray3h.push(countIndex3h); //  store positions inside of array...
            }
            countIndex3h++;
          });
          countIndex3h = 0;
        }
      });

      //  For investing connections

      countIndex3h = 0;

      filteredNodes.forEach(function(node3h) {
        if (node3h.type === 'Government') {
          investingCon.forEach(function(investNodeCon3h) {
            if ((node3h === investNodeCon3h.source || node3h === investNodeCon3h.target) && iNCArray3h.indexOf(countIndex3h) === -1) {
              iNCArray3h.push(countIndex3h); //  store positions inside of array...
            }
            countIndex3h++;
          });
          countIndex3h = 0;
        }
      });

      //  For partnerships/collaborations connections

      countIndex3h = 0;

      filteredNodes.forEach(function(node3h) {
        if (node3h.type === 'Government') {
          porucsCon.forEach(function(porucsNodeCon3h) {
            if ((node3h === porucsNodeCon3h.source || node3h === porucsNodeCon3h.target) && pcNCArray3h.indexOf(countIndex3h) === -1) {
              pcNCArray3h.push(countIndex3h); //  store positions inside of array...
            }
            countIndex3h++;
          });
          countIndex3h = 0;
        }
      });

      //  For data connections

      countIndex3h = 0;

      filteredNodes.forEach(function(node3h) {
        if (node3h.type === 'Government') {
          dataCon.forEach(function(dataNodeCon3h) {
            if ((node3h === dataNodeCon3h.source || node3h === dataNodeCon3h.target) && aNCArray3h.indexOf(countIndex3h) === -1) {
              aNCArray3h.push(countIndex3h); //  store positions inside of array...
            }
            countIndex3h++;
          });
          countIndex3h = 0;
        }
      });

      // return;
    }
    //  Merge and eliminate dupllicate elements

    function merge() {
      var args = arguments;
      var hash = {};
      var arr = [];
      for (var i = 0; i < args.length; i++) {
        for (var j = 0; j < args[i].length; j++) {
          if (hash[args[i][j]] !== true) {
            arr[arr.length] = args[i][j];
            hash[args[i][j]] = true;
          }
        }
      }
      return arr;
    }

    var fNCArrayV = [];
    var iNCArrayV = [];
    var pcNCArrayV = [];
    var aNCArrayV = [];

    if (fNCArray0v.length !== 0)
      fNCArrayV = merge(fNCArrayV, fNCArray0v);
    if (fNCArray1v.length !== 0)
      fNCArrayV = fNCArrayV = merge(fNCArrayV, fNCArray1v);
    if (fNCArray2v.length !== 0)
      fNCArrayV = merge(fNCArrayV, fNCArray2v);
    if (fNCArray3v.length !== 0)
      fNCArrayV = merge(fNCArrayV, fNCArray3v);

    if (iNCArray0v.length !== 0)
      iNCArrayV = merge(iNCArrayV, iNCArray0v);
    if (iNCArray1v.length !== 0)
      iNCArrayV = merge(iNCArrayV, iNCArray1v);
    if (iNCArray2v.length !== 0)
      iNCArrayV = merge(iNCArrayV, iNCArray2v);
    if (iNCArray3v.length !== 0)
      iNCArrayV = merge(iNCArrayV, iNCArray3v);

    if (pcNCArray0v.length !== 0)
      pcNCArrayV = merge(pcNCArrayV, pcNCArray0v);
    if (pcNCArray1v.length !== 0)
      pcNCArrayV = merge(pcNCArrayV, pcNCArray1v);
    if (pcNCArray2v.length !== 0)
      pcNCArrayV = merge(pcNCArrayV, pcNCArray2v);
    if (pcNCArray3v.length !== 0)
      pcNCArrayV = merge(pcNCArrayV, pcNCArray3v);

    if (aNCArray0v.length !== 0)
      aNCArrayV = merge(aNCArrayV, aNCArray0v);
    if (aNCArray1v.length !== 0)
      aNCArrayV = merge(aNCArrayV, aNCArray1v);
    if (aNCArray2v.length !== 0)
      aNCArrayV = merge(aNCArrayV, aNCArray2v);
    if (aNCArray3v.length !== 0)
      aNCArrayV = merge(aNCArrayV, aNCArray3v);

    //  hidden

    var fNCArrayH = [];
    var iNCArrayH = [];
    var pcNCArrayH = [];
    var aNCArrayH = [];

    if (fNCArray0h.length !== 0)
      fNCArrayH = merge(fNCArrayH, fNCArray0h);
    if (fNCArray1h.length !== 0)
      fNCArrayH = merge(fNCArrayH, fNCArray1h);
    if (fNCArray2h.length !== 0)
      fNCArrayH = merge(fNCArrayH, fNCArray2h);
    if (fNCArray3h.length !== 0)
      fNCArrayH = merge(fNCArrayH, fNCArray3h);

    if (iNCArray0h.length !== 0)
      iNCArrayH = merge(iNCArrayH, iNCArray0h);
    if (iNCArray1h.length !== 0)
      iNCArrayH = merge(iNCArrayH, iNCArray1h);
    if (iNCArray2h.length !== 0)
      iNCArrayH = merge(iNCArrayH, iNCArray2h);
    if (iNCArray3h.length !== 0)
      iNCArrayH = merge(iNCArrayH, iNCArray3h);

    if (pcNCArray0h.length !== 0)
      pcNCArrayH = merge(pcNCArrayH, pcNCArray0h);
    if (pcNCArray1h.length !== 0)
      pcNCArrayH = merge(pcNCArrayH, pcNCArray1h);
    if (pcNCArray2h.length !== 0)
      pcNCArrayH = merge(pcNCArrayH, pcNCArray2h);
    if (pcNCArray3h.length !== 0)
      pcNCArrayH = merge(pcNCArrayH, pcNCArray3h);

    if (aNCArray0h.length !== 0)
      aNCArrayH = merge(aNCArrayH, aNCArray0h);
    if (aNCArray1h.length !== 0)
      aNCArrayH = merge(aNCArrayH, aNCArray1h);
    if (aNCArray2h.length !== 0)
      aNCArrayH = merge(aNCArrayH, aNCArray2h);
    if (aNCArray3h.length !== 0)
      aNCArrayH = merge(aNCArrayH, aNCArray3h);

    var alreadyHFundLinks = [];
    var alreadyHInvestLinks = [];
    var alreadyHPorucsLinks = [];
    var alreadyHDataLinks = [];

    if (!document.getElementById("cb_fund").checked) {
      fundLink.filter(function(d, i) {
        if (fundLink[0][i].style.visibility === "hidden") {
          alreadyHFundLinks.push(i);
        }
      });

      //console.log(alreadyHFundLinks);
    }

    if (!document.getElementById("cb_invest").checked) {
      investLink.filter(function(d, i) {
        if (investLink[0][i].style.visibility === "hidden") {
          alreadyHInvestLinks.push(i);
        }
      });

      //console.log(alreadyHInvestLinks);
    }

    if (!document.getElementById("cb_porucs").checked) {
      porucsLink.filter(function(d, i) {
        if (porucsLink[0][i].style.visibility === "hidden") {
          alreadyHPorucsLinks.push(i);
        }
      });

      //console.log(alreadyHPorucsLinks);
    }

    if (!document.getElementById("cb_data").checked) {
      dataLink.filter(function(d, i) {
        if (dataLink[0][i].style.visibility === "hidden") {
          alreadyHDataLinks.push(i);
        }
      });

      //console.log(alreadyHDataLinks);
    }

    d3.selectAll('.fund').style('visibility', function(l, i) {
      //  If the index of the funding line equals to the funding connection index...
      if (fNCArrayV.indexOf(i) > -1) {
        return "visible";
      } else {
        return "hidden";
      }

    });

    d3.selectAll('.invest').style('visibility', function(l, i) {
      //  If the index of the funding line equals to the funding connection index...
      if (iNCArrayV.indexOf(i) > -1) {

        return "visible";
      } else {
        return "hidden";
      }
    });


    d3.selectAll('.porucs').style('visibility', function(l, i) {
      //  If the index of the funding line equals to the funding connection index...
      if (pcNCArrayV.indexOf(i) > -1) {

        return "visible";
      } else {
        return "hidden";
      }

    });


    d3.selectAll('.data').style('visibility', function(l, i) {
      //  If the index of the funding line equals to the funding connection index...
      if (aNCArrayV.indexOf(i) > -1) {
        return "visible";
      } else {
        return "hidden";
      }
    });

    d3.selectAll('.fund').style('visibility', function(l, i) {
      //  If the index of the funding line equals to the funding connection index...
      if (fNCArrayH.indexOf(i) > -1 || alreadyHFundLinks.indexOf(i) > -1) {
        return "hidden";
      } else {
        return "visible";
      }

    });

    d3.selectAll('.invest').style('visibility', function(l, i) {
      //  If the index of the funding line equals to the funding connection index...
      if (iNCArrayH.indexOf(i) > -1 || alreadyHInvestLinks.indexOf(i) > -1) {

        return "hidden";
      } else {
        return "visible";
      }
    });

    d3.selectAll('.porucs').style('visibility', function(l, i) {
      //  If the index of the funding line equals to the funding connection index...
      if (pcNCArrayH.indexOf(i) > -1 || alreadyHPorucsLinks.indexOf(i) > -1) {

        return "hidden";
      } else {
        return "visible";
      }
    });

    d3.selectAll('.data').style('visibility', function(l, i) {
      //  If the index of the funding line equals to the funding connection index...
      if (aNCArrayH.indexOf(i) > -1 || alreadyHDataLinks.indexOf(i) > -1) {
        return "hidden";
      } else {
        return "visible";
      }
    });

    var countFund = 0;
    for (var x = 0; x < fundLink[0].length; x++) {
      if (fundLink[0][x].style.visibility === "hidden") {
        countFund++;
      }
    }

    var countInvest = 0;
    for (var x = 0; x < investLink[0].length; x++) {
      if (investLink[0][x].style.visibility === "hidden") {
        countInvest++;
      }
    }

    var countPorucs = 0;
    for (var x = 0; x < porucsLink[0].length; x++) {
      if (porucsLink[0][x].style.visibility === "hidden") {
        countPorucs++;
      }
    }

    var countData = 0;
    for (var x = 0; x < dataLink[0].length; x++) {
      if (dataLink[0][x].style.visibility === "hidden") {
        countData++;
      }
    }

    //console.log("counting fund: " + countFund);
    //console.log("counting invest: " + countInvest);
    //console.log("counting porucs: " + countPorucs);
    //console.log("counting data: " + countData);

    // If all funding connections are hidden
    if (countFund === fundLink[0].length)
      if (document.getElementById("cb_fund").checked) {
        document.getElementById("cb_fund").checked = false;
        // document.getElementById("cb_fund").disabled = true;
      }
      //  If some or all funding connections are shown
    if (countFund !== fundLink[0].length)
      if (!document.getElementById("cb_fund").checked) {
        document.getElementById("cb_fund").checked = true;
        // document.getElementById("cb_fund").disabled = false;
      }
      // If all investing connections are hidden
    if (countInvest === investLink[0].length)
      if (document.getElementById("cb_invest").checked) {
        document.getElementById("cb_invest").checked = false;
        // document.getElementById("cb_invest").disabled = true;
      }
      //  If some or all investing connections are shown
    if (countInvest !== investLink[0].length)
      if (!document.getElementById("cb_invest").checked) {
        document.getElementById("cb_invest").checked = true;
        // document.getElementById("cb_invest").disabled = false;
      }
      // If all collaboration connections are hidden
    if (countPorucs === porucsLink[0].length)
      if (document.getElementById("cb_porucs").checked) {
        document.getElementById("cb_porucs").checked = false;
        // document.getElementById("cb_porucs").disabled = true;
      }
      //  If some or all collaboration connections are shown
    if (countPorucs !== porucsLink[0].length)
      if (!document.getElementById("cb_porucs").checked) {
        document.getElementById("cb_porucs").checked = true;
        // document.getElementById("cb_porucs").disabled = false;
      }
      // If all data connections are hidden
    if (countData === dataLink[0].length)
      if (document.getElementById("cb_data").checked) {
        document.getElementById("cb_data").checked = false;
        // document.getElementById("cb_data").disabled = true;
      }
      //  If some or all data connections are shown
    if (countData !== dataLink[0].length)
      if (!document.getElementById("cb_data").checked) {
        document.getElementById("cb_data").checked = true;
        // document.getElementById("cb_data").disabled = false;
      }



  });

  d3.selectAll('#cb_emp, #cb_numtwit').on('click', function() {
    if (document.getElementById("cb_emp").checked) {
      node.transition()
        .duration(350)
        .delay(0).attr("r", function(d) {
          if (d.numemp !== null) return empScale(parseInt(d.numemp));
          else return "7";
        });
      textElement.attr('transform', function(d) {
        if (d.numemp !== null) return translateSVG(0, -(empScale(parseInt(d.numemp)) + 2));
        else return translateSVG(0, -(empScale(parseInt(7)) + 2));
      });
    }

    if (document.getElementById("cb_numtwit").checked) {
      node.transition()
        .duration(350)
        .delay(0).attr("r", function(d) {
          if (d.followers !== null) {
            if (parseInt(d.followers) > 1000000) {
              return "50";
            } else {
              return twitScale(parseInt(d.followers));
            }
          } else
            return "7";
        });
      textElement.attr('transform', function(d) {
        if (d.followers !== null) {
          if (parseInt(d.followers) > 1000000) {
            return translateSVG(0, -52);
          } else {
            return translateSVG(0, -(twitScale(parseInt(d.followers)) + 2));
          }
        } else
          return translateSVG(0, -(twitScale(parseInt(7)) + 2));
      });
    }
  });



  // Right-click solution to returning to original state
  d3.select('svg').on('contextmenu', function() {
    d3.event.preventDefault();
    offNode();
    d3.selectAll('g').classed("fixed", function(d) {
      d.fixed = false;
    });
    d3.selectAll('g').call(drag);
    centeredNode = jQuery.extend(true, {}, {});

    var force = d3.layout.force()
      .nodes(filteredNodes)
      .size([width, height])
      .links(fundingCon.concat(investingCon).concat(porucsCon).concat(dataCon))
      .linkStrength(0)
      .charge(function(d) {
        if (d.numemp !== null)
          return -5 * empScale(parseInt(d.numemp));
        else
          return -50;
      })
      .on("tick", tick)
      .start();

  });


  d3.select('svg').on('click', function() {
    var m = d3.mouse(this);
    console.log(m);
  });


});
