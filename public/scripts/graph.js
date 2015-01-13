function transform(d) 
{
    return "translate(" + d.x + "," + d.y + ")";
}

function translateSVG(x, y) 
{
  return 'translate('+x+','+y+')';
}

function numCommas(numberStr)
{
  numberStr += '';
  x = numberStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  
  while(rgx.test(x1)) 
  {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

function getSVG(svg)
{
  return svg;
}

var color = d3.scale.category20();
var width = 800;
var height = 800;
var force = d3.layout.force()
              .charge(-70)
              .linkDistance(60)
              .size([width, height]);

var organizations = {};
var filteredNodes = {};
var porucsCon = {};
var affilCon = {};
var fundingCon = {};
var investingCon = {};
var fundLink = {};
var investLink = {};
var porucsLink = {};
var affilLink = {};

var nodeInit;

// var svg = d3.select(".content").append("svg").attr("id", "network").attr("height", height).attr("width", width).attr("viewBox", "0 0 800 800").attr("preserveAspectRatio", "xMidYMid");

var svg = d3.select('.content').append('svg').attr("xmlns", 'http://www.w3.org/2000/svg').attr("id", 'network').attr("height", height).attr("width", width).attr("viewBox", '0 0 800 800').attr("preserveAspectRatio", 'xMidYMid');


//  document.createElement('svg')

var aspect = width / height,
    network = $('#network'),
    container = network.parent();
$(window).on('resize', function(){
  var targetWidth = container.width();
  network.attr("width", targetWidth);
  network.attr("height", Math.round(targetWidth / aspect));
}).trigger("resize");

//  Static Scale
//  Improve by dynamically obtaining min and max values
var empScale = d3.scale.sqrt().domain([10, 130000]).range([10, 50]);
var twitScale = d3.scale.sqrt().domain([10, 1000000]).range([10,50]);

d3.json("data/final_data.json", function(error, graph) {
  filteredNodes = graph.nodes;
  fundingCon = graph.fundingR;
  investingCon = graph.investingR;
  porucsCon = graph.porucs;
  affilCon = graph.affiliations;

var drag = force.drag()
                .on("dragstart", drag)
                .on("drag", drag)
                .on("dragend", dragend);

  force
      .nodes(filteredNodes)
      .links(fundingCon)
      .start();

  force 
      .nodes(filteredNodes)
      .links(investingCon)
      .start(); 

  force
      .nodes(filteredNodes)
      .links(porucsCon)
      .start();

  force
      .nodes(filteredNodes)
      .links(affilCon)
      .start();

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

  //  AFFILIATIONS
  affilLink = svg.selectAll(".affil")
                 .data(affilCon)
                 .enter().append("line")
                 .attr("class", "affil")
                 // .classed("visaffil", true)
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
                .call(drag);
  
  var node = nodeInit.append("circle")
                     .attr("r", function(d){
                                  if(d.numemp !== null) 
                                    return empScale(parseInt(d.numemp)); 
                                  else 
                                    return "7";
                     })
                     .style("fill", function(d){
                                      if(d.type !== null)
                                      {
                                        if(d.type === "Individual")
                                          return "rgb(255,185,0)";
                                        if(d.type === "Non-Profit")
                                          return "rgb(0,164,239)";
                                        if(d.type === "For-Profit")
                                          return "rgb(127,186,0)";
                                        if(d.type === "Government")
                                          return "rgb(242,80,34)";
                                      } 
                     })
                     .style("stroke-width", '1.5px')
                     .style("stroke", 'white')
                     .on('mouseover', handleNodeHover)
                     .on('mouseout', offNode)
                     .on('click', sinclick);

  var textElement = svg.selectAll('.node')
                       .append('text')
                       .text(function(d){return d.nickname;})
                       .attr('transform', function(d){
                                            if(d.numemp !== null)
                                            {
                                              return translateSVG(0, -(empScale(parseInt(d.numemp)) + 2));
                                            }
                                            else
                                            { 
                                              return translateSVG(0, -(empScale(parseInt(7)) + 2));
                                            }
                       })
                       .style('font', '10px sans-serif')
                       .style('pointer-events', 'none')
                       .style('text-shadow', '0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff');

                       //d3.selectAll('g').on("dblclick", dblclick);

function handleClickNodeHover(d) 
{
  s = textDisplay(d);
 
  //  Printing to side panel within web application.
  d3.select('#info')
    .html(s)
    .style('list-style', 'square');
}

function textDisplay(d)
{
  var s = "";
 
  //  General Information
   s += '<h1>' + "<a href=" + '"' + d.weblink + '" target="_blank">' + d.name + '</a></h1>';
   s += '<h6>' + 'Type of Entity: ' + '</h6>' + ' <h5>' + d.type + '</h5>';
 
  if(d.location !== null)
  { 
     s += '<br/>' + '<h6> '+ 'Location:  ' + '</h6>';
     var locationArr = [];
    var locationtemp = [];
 
      if((d.location).indexOf("; ") !== -1)
      {
        s += '<br/> <h5><ul>';
         locationArr = (d.location).split("; ");
        for(var count = 0; count < locationArr.length; count++)
        {
          s += '<li style="display:block;">' + '<h5><a class="click-location" style="cursor:pointer;">' + locationArr[count] + '</h5></a>' + '</li>';
        }
      }
      else
      {
          s += '<h5><ul>'
          s += '<li style="display:inline-block;">' + '<h5><a class="click-location" style="cursor:pointer;">' + d.location + '</h5></a>' + '</li>';
      }
      s += '</h5></ul><br/>'; 
 
  }
  else
  {s += '<br/>' + '<h6> '+ 'Location:  ' + '</h6>' + ' <h5>' + 'N/A' + '</h5>' + '<br/>';
  }
 
  if(d.type !== 'Individual')
  {
    if(d.numemp !== null)
    { 
       s += '<h6>' + 'Employees: ' + '</h6> <h5>' + numCommas(d.numemp) + '</h5><br/>';
    }
    else
    {
      s += '<h6>' + 'Employees: ' + '</h6> <h5>' + 'N/A' + '</h5><br/>';
    }
  }
 
  if(d.twitterH === null)
  {
       s += '<h6>' + 'Twitter:  ' + '</h6> <h5>' + 'N/A' + '</h5><br/>';
      s += '<h6>' + 'Twitter Followers: '  + '</h6> <h5>' + 'N/A' + '</h5><br/>';
  }
  else
  {
    var twitterLink = (d.twitterH).replace('@', '');
 
   
    twitterLink = 'https://twitter.com/' + twitterLink;
    s += '<h6>' + 'Twitter:  ' + '</h6> <h5>' + "<a href=" + '"' + twitterLink + '">' + d.twitterH + '</h5></a><br/>';
    s +='<h6>' + 'Twitter Followers:  '  + '</h6> <h5>' + numCommas(d.followers) + '</h5><br/>';
  }
 
  //  KEY PEOPLE
  var keyPeopleArr = [];
 
  if(d.people !== null)
  {     
    s += '<br/><h6>' + 'Key People:' + '</h6>' + '<ul><h5>';
    keyPeopleArr = (d.people).split(", ");
    for(var count = 0; count < keyPeopleArr.length; count++)
    {
      s += '<li>' + '<a href="http://www.bing.com/search?q=' + (keyPeopleArr[count]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + keyPeopleArr[count] + '</a>' + '</li>'; 
    }
    s+= '</h5></ul>';
  }
 
  //  FUNDING
  var fundOrgArr = [];
  var fundAmtArr = [];
   
  if(d.fundingR === null)
  {
    s += '<br/> <h6>' + 'No known funding.' + '</h6><br/>';
  }
  else
  {
    var counter = 0;
    var fundArr = [];
    var fundtemp = [];
    var holdTotalF;
    var holdIndividsF;
 
    //  If there's more than one funding contributor...
    if((d.fundingR).indexOf("; ") !== -1)
    {
      fundArr = (d.fundingR).split("; ");
      for(var count = 0; count < fundArr.length; count++)
      {
        fundtemp = fundArr[count].split(":");
        fundOrgArr.push(fundtemp[0]);
        fundAmtArr.push(fundtemp[1]);
 
        if(fundOrgArr[count] === "Total")
        {
          holdTotalF = fundAmtArr[count];
          continue;
        }
         
        if(fundOrgArr[count] === "Individuals")
        {
          holdIndividsF = fundAmtArr[count];
          continue;
        }
         
        if(fundAmtArr[count] === 'null')
        {
          if(counter === 0)
          {
            s += '<br/>' + '<h6>' + ' Received funding from:' + '</h6><ul>';
            counter++;
          }
           
          s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (fundOrgArr[count]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + fundOrgArr[count] + '</a></h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>'; 
        }
        else
        {
          if(counter === 0)
          {
            s += '<br/>' + '<h6>' +' Received funding from:' +  '</h6><ul>';
            counter++;
          }
           
          s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (fundOrgArr[count]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + fundOrgArr[count] + '</a></h5>' + ': $' + '<strong style="color:rgb(127,186,0);">' + numCommas(fundAmtArr[count]) + '</strong>' + '</li>';
        }
      }
    }
    else
    {
      fundArr = (d.fundingR).split(":");
       
      if(fundArr[0] === "Total")
      {
        s += '<br/>';
        holdTotalF = fundArr[1];
      }
      else if(fundArr[0] === "Individuals")
      {
        s += '<br/>';
        holdIndividsF = fundArr[1];
      }
      else
      {
        s += '<br/>' + '<h6>' +' Received funding from:' +  '</h6><ul>';

        s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (fundArr[0]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + fundArr[0] + '</a></h5>';

        if(fundArr[1] === 'null')
        {
          s += ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
        }

        else
        {
          s += ': $' + '<strong style="color:rgb(127,186,0);">' + numCommas(fundArr[1]) + '</strong>' + '</li>';
        }
      }
    }
 
    s += '</ul>';
     
    if(!isNaN(holdIndividsF)) 
    {
      s += '<h6>' + 'Individuals provided ' +'</h6>' + ' $' + '<strong style="color:rgb(127,186,0);">' + numCommas(holdIndividsF) + '</strong></h5><h6> in fundings.</h6><br/>';
    }
     
    if(!isNaN(holdTotalF)) 
    {
      s += '<h6>' + 'Total funding received: ' + '</h6>' + ' $' + '<strong style="color:rgb(127,186,0);">' + numCommas(holdTotalF) + '</strong></h5><br/>';
    }
  }
 
  //  INVESTING
  var investOrgArr = [];
  var investAmtArr = [];
  var holdTotalI;
  var holdIndividsI
 
  if(d.investmentR === null)
  {
    s += '<br/> <h6>' + 'No known investments.' + '</h6> <br/>';
  }
  else
  {    
    var counter = 0;    
    var investArr = [];
    var investtemp = [];
 
    //  If there's more than one funding contributor...
    if((d.investmentR).indexOf("; ") !== -1)
    {
      investArr = (d.investmentR).split("; ");
 
      for(var count = 0; count < investArr.length; count++)
      {
        investtemp = investArr[count].split(":");
        investOrgArr.push(investtemp[0]);
        investAmtArr.push(investtemp[1]);
         
        if(investOrgArr[count] === "Total")
        {
          holdTotalI = investAmtArr[count]; 
          continue;
        }
     
        if(investOrgArr[count] === "Individuals")
        {
          holdIndividsI = investAmtArr[count]; 
          continue;
        }
     
        if(investAmtArr[count] === 'null')
        {
          if(counter === 0)
          {
            s += '<br/>' + '<h6>' + ' Received investments from:'+ '</h6>' + '<ul>';
            counter++;
          }
 
          s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (investOrgArr[count]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + investOrgArr[count] + '</a></h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>'; 
        }
        else
        {
          if(counter === 0)
          {
            s += '<br/>' + '<h6>'  + ' Received investments from:' + '</h6>' + '<ul>';
            counter++;
          }
 
          s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (investOrgArr[count]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + investOrgArr[count] + '</a></h5>' + ': $' + '<strong style="color:rgb(127,186,0);">' + numCommas(investAmtArr[count]) + '</strong>' + '</li>'; 
        }
      }
    }
    else
    {
      investArr = (d.investmentR).split(":");
 
      if(investArr[0] === "Total")
      {
        s += '<br/>';
          holdTotalI = investAmtArr[1];
      }
      else if(investArr[0] === "Individuals")
      {
        s += '<br/>';
          holdIndividsI = investAmtArr[1];
      }
      else
      {
          s += '<br/>' + '<h6>' +' Received investments from:' +  '</h6><ul>';

        s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (investArr[0]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + investArr[0] + '</a></h5>';

        if(investArr[1] === 'null')
        {
          s += ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
        }
        else
        {
          s += ': $' + '<strong style="color:rgb(127,186,0);">' + numCommas(investArr[1]) + '</strong>' + '</li>';
        }
      }
    }
 
    s += '</ul>'; 
 
    if(!isNaN(holdIndividsI)) 
    {
      s +=  '<h6>' + 'Individuals provided ' + '</h6>' + ' $' + '<strong style="color:rgb(127,186,0);">' + numCommas(holdIndividsI) + '</strong> in investments.<br/>';
    }
     
    if(!isNaN(holdTotalI)) 
    {
      s += '<h6>' + 'Total investments received: ' + '</h6>' + ' $' + '<strong style="color:rgb(127,186,0);">' + numCommas(holdTotalI) + '</strong>.<br/>';
    }
  }
 
   //RELATED TO
  if(d.relatedto === null)
  {
    s += '<br/><h6>' +'No known relations.' + '</h6><br/>'; 
  }
  else
  {
     s += '<br/>' + '<h6>'+ 'Related To:  ' + '</h6> <ul>';
    var relatedtoArr = [];
    var relatedtotemp = [];
 
    //  If there's more than one affiliation...
    if((d.relatedto).indexOf(", ") !== -1)
    {
      relatedtoArr = (d.relatedto).split(", ");
      for(var count = 0; count < relatedtoArr.length; count++)
      {
        s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (relatedtoArr[count]).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + relatedtoArr[count] + '</a>' + '</h5></li>';
      }
    }
    else
    {
      s += '<li><h5> ' + '<a href="http://www.bing.com/search?q=' + (d.relatedto).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.relatedto + '</a>' + '</h5></li>';
    }
    s += '</ul>'; 
  }

  return s;
}

var forProfitObjects = [];
var nonProfitObjects = [];
var governmentObjects = [];
var individualObjects = [];

initialInfo();

// Initial display on sidebar
function initialInfo()
{
  var s = "";
 
  var countTypes = [0,0,0,0];

  var forProfitsArray = [];
  var nonProfitsArray = [];
  var governmentArray = [];
  var individualArray = [];
 
  for(var x = 0; x < filteredNodes.length; x++)
  {
    if(filteredNodes[x].type === "Individual")
    {
      individualArray.push(filteredNodes[x].name);
      individualObjects.push(filteredNodes[x]);
      countTypes[3]++;
    }
    if(filteredNodes[x].type === "Non-Profit")
    {      
      nonProfitsArray.push(filteredNodes[x].name);
      nonProfitObjects.push(filteredNodes[x]);
      countTypes[1]++;
    }
    if(filteredNodes[x].type === "For-Profit")
    {      
      forProfitsArray.push(filteredNodes[x].name);
      forProfitObjects.push(filteredNodes[x]);
      countTypes[0]++;
    }
    if(filteredNodes[x].type === "Government")
    {      
      governmentArray.push(filteredNodes[x].name);
      governmentObjects.push(filteredNodes[x]);
      countTypes[2]++;
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
      .style("width", function(d){
                          return x(d) / 5 + "%";
                      })
      .style("height", "20px")
      .style("font","8px sans-serif")
      .style("background-color",function(d){
                        if(typesColor === 0)
                        {
                          typesColor++;
                          return "rgb(127,186,0)";
                        }
                         if(typesColor === 1)
                        {
                          typesColor++;
                          return "rgb(0,164,239)";
                        }
                        if(typesColor === 2)
                        {
                          typesColor++;
                          return "rgb(242,80,34)";
                        }
                        if(typesColor === 3)
                        {
                          typesColor++;
                          return "rgb(255,185,0)";
                        } 
                      })
      .style("text-align","right")
      .style("padding","3px")
      .style("margin","1px")
      .style("color","white")
      .text(function(d){if(typesText === 0)
                        {
                          typesText++;
                          return;
                        }
                         if(typesText === 1)
                        {
                          typesText++;
                          return;
                        }
                        if(typesText === 2)
                        {
                          typesText++;
                          return;
                        }
                        if(typesText === 3)
                        {
                          typesText++;
                          return;
                        } 
                       });
 
      var t = "";
 
      t += "<h3 style='padding-top:15px; color:rgb(127,186,0);'>For-Profit (" + countTypes[0] + "):</h3> ";
      for(var x = 0; x < forProfitsArray.length; x++)
      {
        if(x === forProfitsArray.length - 1)
        {
          t += "<a class='for-profit-entity' style='font-size:16px; cursor:pointer;'>" + forProfitsArray[x] + "</a>";
        }
        else
        {
          t += "<a class='for-profit-entity' style='font-size:16px; cursor:pointer;'>" + forProfitsArray[x] + ", </a>";
        }
      }
      t += "<h3 style='padding-top:15px; color:rgb(0,164,239);'>Non-Profit (" + countTypes[1] + "):</h3> ";
      for(var x = 0; x < nonProfitsArray.length; x++)
      {
        if(x === nonProfitsArray.length - 1)
        {
          t += "<a class='non-profit-entity' style='font-size:16px; cursor:pointer;'>" + nonProfitsArray[x] + "</a>";
        }
        else
        {
          t += "<a class='non-profit-entity' style='font-size:16px; cursor:pointer;'>" + nonProfitsArray[x] + ", </a>";
        }
      }
      t += "<h3 style='padding-top:15px; color:rgb(242,80,34);'>Government (" + countTypes[2] + "):</h3> ";
      for(var x = 0; x < governmentArray.length; x++)
      {
        if(x === governmentArray.length - 1)
        {
          t += "<a class='government-entity' style='font-size:16px; cursor:pointer;'>" + governmentArray[x] + "</a>";
        }
        else
        {
          t += "<a class='government-entity' style='font-size:16px; cursor:pointer;'>" + governmentArray[x] + ", </a>";
        }
      }
      t += "<h3 style='padding-top:15px; color:rgb(255,185,0);'>Individual (" + countTypes[3] + "):</h3> ";
      for(var x = 0; x < individualArray.length; x++)
      {
        if(x === individualArray.length - 1)
        {
          t += "<a  class='individual-entity' style='font-size:16px; cursor:pointer;'>" + individualArray[x] + "</a>";
        }
        else
        {
          t += "<a  class='individual-entity' style='font-size:16px; cursor:pointer;'>" + individualArray[x] + ", </a>";
        }
      }
 
      d3.select('#info')
        .append('text')
        .style('padding-bottom', '20px')
        .html(t);
 
}

d3.selectAll('.for-profit-entity').on('click', function(n, i){

  sinclick(forProfitObjects[i]);

});

d3.selectAll('.non-profit-entity').on('click', function(n, i){

  sinclick(nonProfitObjects[i]);

});

d3.selectAll('.individual-entity').on('click', function(n, i){

  sinclick(individualObjects[i]);

});

d3.selectAll('.government-entity').on('click', function(n, i){

  sinclick(governmentObjects[i]);

});

//click-location works here...
  d3.selectAll('.click-location').on('click', function(r){
      console.log(r);
      handleQuery(this.innerHTML);
  });

var nameOfEntities = []; 
var nameOfLocations = [];
var uniqueNames = [];
var uniqueLocations = [];
var masterList = [];

searchAutoComplete();

function searchAutoComplete()
{
  var s = "";

  filteredNodes.forEach(function(d){
    nameOfEntities.push(d.name);
    nameOfLocations.push(d.location);

    if(uniqueNames.indexOf(d.name) === -1 && d.name !== null)
    {
      uniqueNames.push(d.name);
    }
    if(uniqueLocations.indexOf(d.location) === -1 && d.location !== null)
    {
      var splitLocations = (d.location).split("; ");
      splitLocations.forEach(function(location)
      {
        if(uniqueLocations.indexOf(location) === -1)
        {
          uniqueLocations.push(location); 
        }
      }); 
    }
  });

  masterList = masterList.concat(uniqueLocations);
  masterList = masterList.concat(uniqueNames);
  masterList = masterList.sort();

  for(var count = 0; count < masterList.length; count++)
  {
    s += '<option value="' + masterList[count] + '">';
  }

  d3.select('.filter-name-location datalist')
      .html(s);

}




d3.selectAll('#search-text').on('keydown', function() 
{
  if(d3.event.keyCode === 13)
  {
      var query = document.getElementById('search-text').value;
      handleQuery(query);
  } 
});

 d3.selectAll('option').on('click', function(n,i){
    var query = (d3.selectAll('option'))[0][i].value;
    handleQuery(query);
 });

function handleQuery(query)
{
  var posLocation = [];
  var count = 0;

      if(nameOfEntities.indexOf(query) !== -1)
      {
        nameOfEntities.forEach(function(name){
          if(name === query && name.length === query.length)
          {
            var posName = nameOfEntities.indexOf(query); 
            console.log(query);
            nodeInit.filter(function(l, i){
                if(i === posName)
                {
                  console.log(l);
                  // handleNodeHover(l);
                  sinclick(l);
                }
            }); 
          }
        });
      }
      else
      {
        nameOfLocations.forEach(function(location){

          if(location !== null)
          {
            
              var splitLocation = location.split("; ");
              if(splitLocation.indexOf(query) !== -1)
              {
               posLocation.push(count); 
              }
            
          }
          count++;
        });
        var counter = 0;

         fundLink.style("opacity", function(l){
                    if((l.source).location === query && (l.target).location === query)
                    {
                      console.log((l.source).location);
                      return "1";
                    }
                     else
                      return "0.05";
                  });
 
            investLink.style("opacity", function(l){
                    if((l.source).location === query && (l.target).location === query)
                    {
                      return "1";
                    }
                     else
                      return "0.05";
                  });
           
            porucsLink.style("opacity", function(l){
                    if((l.source).location === query && (l.target).location === query)
                    {
                      return "1";
                    }
                     else
                      return "0.05";
                  });
           
            affilLink.style("opacity", function(l){
                    if((l.source).location === query && (l.target).location === query)
                    {
                      return "1";
                    }
                     else
                      return "0.05";
                  });

  d3.selectAll('.node').style('opacity', function(n, i){

    if(posLocation.indexOf(i) === -1)
          {  
            return 0.05;
          }
          else
            return 1;

  }).on('mouseover', null);

  node
      .on('mouseout', null)
      .on('mouseover', null)
      .on('click', null);

  node.filter(function(n, i){
            if(nodeInit[0][i].style.opacity == 1)
              return n;

            })
    .on('mouseout', null)
    .on('mouseover', handleClickNodeHover)
    .on('click', null);

      }

}

function handleNodeHover(d) 
{
  var s = textDisplay(d);

  //  Printing to side panel within web application.
  d3.select('#info')
    .html(s)
    .style('list-style', 'square');
 
  fundLink.transition()
                 .duration(350)
                 .delay(0).style("opacity", function(l){
              if(d === l.source || d === l.target)
              {
                return "1";
              }
               else
                return "0.05";
            });
 
  investLink.transition()
                 .duration(350)
                 .delay(0).style("opacity", function(l){
              if(d === l.source || d === l.target)
                {
                
                return "1";
              }
               else
                return "0.05";
            });
 
  porucsLink.transition()
                 .duration(350)
                 .delay(0).style("opacity", function(l){
              if(d === l.source || d === l.target)
               {
                return "1";
              }
               else
                return "0.05";
            });
 
  affilLink.transition()
                 .duration(350)
                 .delay(0).style("opacity", function(l){
              if(d === l.source || d === l.target)
               {
                return "1";
              }
               else
                return "0.05";
            });

            var neighborFund = graph.fundingR.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });
 
            var neighborInvest = graph.investingR.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });
 
            var neighborPorucs = graph.porucs.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });
 
            var neighborAffil = graph.affiliations.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });

              d3.select(this).style("stroke", "black");
 
              svg.selectAll('.node')
                 .transition()
                 .duration(350)
                 .delay(0)
                  .style("opacity", function(l){
                if(neighborFund.indexOf(l.index) > -1 || neighborInvest.indexOf(l.index) > -1 || neighborPorucs.indexOf(l.index) > -1 || neighborAffil.indexOf(l.index) > -1 || l === d)
                  return "1";
                else
                  return "0.05";
              }); 
}


function handleAdjNodeClick(d) 
{

   
   fundLink.style("opacity", function(l){
              if(d === l.source || d === l.target)
              {
                return "1";
              }
               else
                return "0.05";
            });
 
  investLink.style("opacity", function(l){
              if(d === l.source || d === l.target)
                {
                
                return "1";
              }
               else
                return "0.05";
            });
 
  porucsLink.style("opacity", function(l){
              if(d === l.source || d === l.target)
               {
                return "1";
              }
               else
                return "0.05";
            });
 
  affilLink.style("opacity", function(l){
              if(d === l.source || d === l.target)
               {
                return "1";
              }
               else
                return "0.05";
            });

            //http://stackoverflow.com/questions/16857806/apply-several-mouseover-events-to-neighboring-connected-nodes
            var neighborFund = graph.fundingR.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });
 
              //http://stackoverflow.com/questions/16857806/apply-several-mouseover-events-to-neighboring-connected-nodes
            var neighborInvest = graph.investingR.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });
 
              //http://stackoverflow.com/questions/16857806/apply-several-mouseover-events-to-neighboring-connected-nodes
            var neighborPorucs = graph.porucs.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });
 
              //http://stackoverflow.com/questions/16857806/apply-several-mouseover-events-to-neighboring-connected-nodes
            var neighborAffil = graph.affiliations.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });
 
              svg.selectAll('.node').style("opacity", function(l){
                if(neighborFund.indexOf(l.index) > -1 || neighborInvest.indexOf(l.index) > -1 || neighborPorucs.indexOf(l.index) > -1 || neighborAffil.indexOf(l.index) > -1 || l === d)
                  return "1";
                else
                  return "0.05";
              }); 

      d3.select(this).style("stroke", "black").on('mouseout', null);

      node.filter(function(singleNode){
        if(singleNode !== d)
        {
          return singleNode;
        }
      }).style("stroke", "white")  
        .on('mouseover', null)
        .on('mouseout', null)
        .on('click', null);

              node.filter(function(l){
                  return (neighborFund.indexOf(l.index) > -1 || neighborInvest.indexOf(l.index) > -1 || neighborPorucs.indexOf(l.index) > -1 || neighborAffil.indexOf(l.index) > -1 || l === d);
              }).on('mouseover', handleClickNodeHover)
              .on('click', sinclick); 

}
  

function offNode()
{


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
          .style("stroke-width", "1px" ).style("z-index", "0")
          .each(function(){this.parentNode.insertBefore(this, this);});

  investLink
  .transition()
                 .duration(350)
                 .delay(0)
            .style("stroke", "rgb(38,114,114)")
            .style("opacity", "0.2")
            .style("stroke-width", "1px" ).style("z-index", "0")
            .each(function(){this.parentNode.insertBefore(this, this);});
      
  porucsLink
  .transition()
                 .duration(350)
                 .delay(0)
            .style("stroke", "rgb(235,232,38)")
            .style("opacity", "0.2")
            .style("stroke-width", "1px" ).style("z-index", "0")
            .each(function(){this.parentNode.insertBefore(this, this);});
      
  affilLink
  .transition()
                 .duration(350)
                 .delay(0)
           .style("stroke", "rgb(191,72,150)")
           .style("opacity", "0.2")
           .style("stroke-width", "1px" ).style("z-index", "0")
           .each(function(){this.parentNode.insertBefore(this, this);});

  // svg.selectAll('.node text').style('opacity', 1); 
  d3.selectAll('.node').transition()
                 .duration(350)
                 .delay(0)
                 
                 .style("opacity", "1");
}



// var toggleCount = 0;

function sinclick(d) {

  handleClickNodeHover(d);
   
  fundLink.transition()
                 .duration(350)
                 .delay(0).style("opacity", function(l){
              if(d === l.source || d === l.target)
              {
                return "1";
              }
               else
                return "0.05";
            });
 
  investLink.transition()
                 .duration(350)
                 .delay(0).style("opacity", function(l){
              if(d === l.source || d === l.target)
                {
                
                return "1";
              }
               else
                return "0.05";
            });
 
  porucsLink.transition()
                 .duration(350)
                 .delay(0).style("opacity", function(l){
              if(d === l.source || d === l.target)
               {
                return "1";
              }
               else
                return "0.05";
            });
 
  affilLink.transition()
                 .duration(350)
                 .delay(0).style("opacity", function(l){
              if(d === l.source || d === l.target)
               {
                return "1";
              }
               else
                return "0.05";
            });

  node.style("stroke", function(singleNode){
    if(singleNode !== d)
    {
      return "white";
    }
    else 
      return "black";
  }).on('mouseout', null);

  node.filter(function(singleNode){
    if(singleNode !== d)
    {
      // d3.select(singleNode).on('click', null);
      return singleNode;
    }
  }).on('mouseover', null);

            var neighborFund = graph.fundingR.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });
 
            var neighborInvest = graph.investingR.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });
 
            var neighborPorucs = graph.porucs.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });
 
            var neighborAffil = graph.affiliations.filter(function(link){
              return link.source.index === d.index || link.target.index === d.index;}).map(function(link){
                return link.source.index === d.index ? link.target.index : link.source.index;
            });
 
              svg.selectAll('.node').transition()
                 .duration(350)
                 .delay(0).style("opacity", function(l){
                if(neighborFund.indexOf(l.index) > -1 || neighborInvest.indexOf(l.index) > -1 || neighborPorucs.indexOf(l.index) > -1 || neighborAffil.indexOf(l.index) > -1 || l === d)
                  return "1";
                else
                  return "0.05";
              });


              node.filter(function(l){
                  return (neighborFund.indexOf(l.index) > -1 || neighborInvest.indexOf(l.index) > -1 || neighborPorucs.indexOf(l.index) > -1 || neighborAffil.indexOf(l.index) > -1 || l === d);
              }).on('mouseover', handleClickNodeHover)
              .on('click', function(l){});
                
}

/*
function dblclick(d) {       
  console.log(this);
    console.log(this.parentNode);
    d3.select(this).classed("fixed", d.fixed = false);

    // var dblFund = fundLink.filter(function(f){
    //   if(f.attr("x1") === d.attr("x") && f.attr("y1") === d.attr("y"))
    //     f.attr("x1", function(d) { return d.source.x = Math.max(50, Math.min(width - 50, d.source.x)); })
    //       .attr("y1", function(d) { return d.source.y = Math.max(50, Math.min(height - 50, d.source.y)); });
    //   if(f.attr("x2") === d.attr("x") && f.attr("y2") === d.attr("y"))
    //     f.attr("x2", function(d) { return d.x = svg.style("width").substring(0,(svg.style("width")).length - 2) / 2 - d.x -50; })
    //       .attr("y2", function(d) { return d.y = svg.style("height").substring(0,(svg.style("height")).length - 2) / 2 - d.y -50; });
    // });

    d3.select(this).attr("x", function(d) { return d.x = svg.style("width").substring(0,(svg.style("width")).length - 2) / 2 - d.x -50; })
        .attr("y", function(d) { return d.y = svg.style("height").substring(0,(svg.style("height")).length - 2) / 2 - d.y -50; });

// fundLinkNode.attr("cx", function(d){return d.x = (d.source.x + d.target.x) * 0.5;})
        //         .attr("cy", function(d){return d.y = (d.source.y + d.target.y) * 0.5;});
        // investLinkNode.attr("cx", function(d){return d.x = (d.source.x + d.target.x) * 0.5;})
        //         .attr("cy", function(d){return d.y = (d.source.y + d.target.y) * 0.5;});
        // porucsLinkNode.attr("cx", function(d){return d.x = (d.source.x + d.target.x) * 0.5;})
        //         .attr("cy", function(d){return d.y = (d.source.y + d.target.y) * 0.5;});
        // affilLinkNode.attr("cx", function(d){return d.x = (d.source.x + d.target.x) * 0.5;})
        //         .attr("cy", function(d){return d.y = (d.source.y + d.target.y) * 0.5;});
          d3.select(this).attr('transform', function(d) {return translateSVG(d.x, d.y);});
            d3.select(this).classed("fixed", d.fixed = true);


}
*/
function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = false);

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

  d3.select(this).classed("fixed", d.fixed = true);

  node.on('mouseover', handleNodeHover)
    .on('mouseout', offNode)
    .on('click', sinclick);
}

  force.on("tick", function() {

    fundLink.attr("x1", function(d) { return d.source.x = Math.max(50, Math.min(width - 50, d.source.x)); })
        .attr("y1", function(d) { return d.source.y = Math.max(50, Math.min(height - 50, d.source.y)); })
        .attr("x2", function(d) { return d.target.x = Math.max(50, Math.min(width - 50, d.target.x)); })
        .attr("y2", function(d) { return d.target.y= Math.max(50, Math.min(height - 50, d.target.y)); })
        .each(function() {this.parentNode.insertBefore(this, this); });;

    investLink.attr("x1", function(d) { return d.source.x = Math.max(50, Math.min(width - 50, d.source.x)); })
        .attr("y1", function(d) { return d.source.y = Math.max(50, Math.min(height - 50, d.source.y)); })
        .attr("x2", function(d) { return d.target.x = Math.max(50, Math.min(width - 50, d.target.x)); })
        .attr("y2", function(d) { return d.target.y= Math.max(50, Math.min(height - 50, d.target.y)); })
        .each(function() {this.parentNode.insertBefore(this, this); });;

    porucsLink.attr("x1", function(d) { return d.source.x = Math.max(50, Math.min(width - 50, d.source.x)); })
        .attr("y1", function(d) { return d.source.y = Math.max(50, Math.min(height - 50, d.source.y)); })
        .attr("x2", function(d) { return d.target.x = Math.max(50, Math.min(width - 50, d.target.x)); })
        .attr("y2", function(d) { return d.target.y= Math.max(50, Math.min(height - 50, d.target.y)); })
        .each(function() {this.parentNode.insertBefore(this, this); });;

    affilLink.attr("x1", function(d) { return d.source.x = Math.max(50, Math.min(width - 50, d.source.x)); })
        .attr("y1", function(d) { return d.source.y = Math.max(50, Math.min(height - 50, d.source.y)); })
        .attr("x2", function(d) { return d.target.x = Math.max(50, Math.min(width - 50, d.target.x)); })
        .attr("y2", function(d) { return d.target.y= Math.max(50, Math.min(height - 50, d.target.y)); })
        .each(function() {this.parentNode.insertBefore(this, this); });;

    nodeInit.attr("x", function(d) { return d.x = Math.max(50, Math.min(width - 50, d.x)); })
        .attr("y", function(d) { return d.y = Math.max(50, Math.min(height - 50, d.y)); });

          nodeInit
          .attr('transform', function(d) {return translateSVG(d.x, d.y);});

  });

function determineVisibleNodes()
{
  var visibleNodesIndices = [];
  for(var x = 0; x < nodeInit[0].length; x++)
  {
    if(nodeInit[0][x].style.visibility === "visible")
    {
      visibleNodesIndices.push(x);
    }
  }

  var visibleNodes = [];
  nodeInit.filter(function(d, i){
    if(visibleNodesIndices.indexOf(i) > -1)
      visibleNodes.push(d);
  });

  return visibleNodes;
}

d3.selectAll('#cb_fund').on('click', function()
{
  var visibleNodes = determineVisibleNodes();
    //  Form links for funds.

  if(document.getElementById("cb_fund").checked)
  {
    

    var count = 0;
    // drawFundLink();
    d3.selectAll('.fund').style("visibility", function(l){
      if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "hidden")
        {
          count++;
          return "visible";
        }
        else 
          return "hidden";
    });
    console.log(count);
    // .classed("visfund", true); 
  }
  
  if(!document.getElementById("cb_fund").checked)
  {
    // d3.selectAll(".fund").remove();
    d3.selectAll('.fund').style("visibility", function(l){
      // if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "visible")
      // {
        return "hidden";
      // }
    });

    // .classed("visfund", false);
  }

  if(visibleNodes.length === 0 || (!document.getElementById("cb_individ").checked && !document.getElementById("cb_forpro").checked && !document.getElementById("cb_nonpro").checked && !document.getElementById("cb_gov").checked))
    {
      document.getElementById("cb_fund").checked = false;
    }

});
  
d3.selectAll('#cb_invest').on('click', function()
{
  var visibleNodes = determineVisibleNodes();

  //  Form links for investments.
  if(document.getElementById("cb_invest").checked)
  {

    

    // console.log(visibleNodes);

    // drawInvestLink();
    d3.selectAll('.invest').style("visibility", function(l){
      if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "hidden")
      {
        return "visible";
      }
      else 
          return "hidden";
    });
    // console.log("inside invest" + visibleNodes.length);
    // .classed("visinvest", true);
    
  }
  
  if(!document.getElementById("cb_invest").checked)
  {
    // d3.selectAll(".invest").remove();
    d3.selectAll('.invest').style("visibility", function(l){
      // if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "visible")
        return "hidden";
    });
    // .classed("visinvest", false);
    
  }

  if(visibleNodes.length === 0 || (!document.getElementById("cb_individ").checked && !document.getElementById("cb_forpro").checked && !document.getElementById("cb_nonpro").checked && !document.getElementById("cb_gov").checked))
    {
      document.getElementById("cb_invest").checked = false;
    }
});

d3.selectAll('#cb_porucs').on('click', function()
{
  var visibleNodes = determineVisibleNodes();

  //  Form links for partnerships or unidentified collaborations.
  if(document.getElementById("cb_porucs").checked)
  {
    

    // drawInvestLink();
    d3.selectAll('.porucs').style("visibility", function(l){
      if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "hidden")
        return "visible";
      else 
          return "hidden";
    });
    // .classed("visporucs", true);
   
  }
  
  if(!document.getElementById("cb_porucs").checked)
  {
    // d3.selectAll(".porucs").remove();
    d3.selectAll('.porucs').style("visibility", function(l){
      // if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "visible")
        return "hidden";
    });
    // .classed("visporucs", false);
 
  }

  if(visibleNodes.length === 0 || (!document.getElementById("cb_individ").checked && !document.getElementById("cb_forpro").checked && !document.getElementById("cb_nonpro").checked && !document.getElementById("cb_gov").checked))
    {
      document.getElementById("cb_porucs").checked = false;
    }
});

d3.selectAll('#cb_affil').on('click', function()
{
  var visibleNodes = determineVisibleNodes();

  //  Form links for affiliations.
  if(document.getElementById("cb_affil").checked)
  {
    

    // drawInvestLink();
    d3.selectAll('.affil').style("visibility", function(l){
      if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "hidden")
        return "visible";
      else 
          return "hidden";
    });
    // .classed("visaffil", true);
    
  }
  
  if(!document.getElementById("cb_affil").checked)
  {
    // d3.selectAll(".porucs").remove();
    d3.selectAll('.affil').style("visibility", function(l){
      // console.log(l.source);
      console.log(this.style.visibility);
      // if(visibleNodes.indexOf(l.source) > -1 && visibleNodes.indexOf(l.target) > -1 && this.style.visibility === "visible")
        return "hidden";
     
    });
    // .classed("visaffil", false);
  
  }

  if(visibleNodes.length === 0 || (!document.getElementById("cb_individ").checked && !document.getElementById("cb_forpro").checked && !document.getElementById("cb_nonpro").checked && !document.getElementById("cb_gov").checked))
    {
      document.getElementById("cb_affil").checked = false;
    }

});

d3.selectAll('#cb_individ, #cb_nonpro, #cb_forpro, #cb_gov').on('click', function() 
{

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


    if(document.getElementById("cb_individ").checked)
    {

      d3.selectAll(".node").filter(function(d) { if (d.type === "Individual") return this;}).style("visibility", "visible");
           //  For funding connections

                  countIndex0v = 0;

                  filteredNodes.forEach(function(node0v){
                    if(node0v.type === 'Individual')
                    {
                      fundingCon.forEach(function(fundNodeCon0v){
                        if(node0v === fundNodeCon0v.source || node0v === fundNodeCon0v.target){
                          fNCArray0v.push(countIndex0v);//  store positions inside of array...
                        }
                        countIndex0v++;
                      });
                      countIndex0v = 0;
                    }
                  });

                  //  For investing connections

                  countIndex0v = 0;

                  filteredNodes.forEach(function(node0v){
                    if(node0v.type === 'Individual')
                    {
                      investingCon.forEach(function(investNodeCon0v){
                        if(node0v === investNodeCon0v.source || node0v === investNodeCon0v.target){
                          iNCArray0v.push(countIndex0v);//  store positions inside of array...
                        }
                        countIndex0v++;
                      });
                      countIndex0v = 0;
                    }
                  });

                  //  For partnerships/collaborations connections

                  countIndex0v = 0;

                  filteredNodes.forEach(function(node0v){
                    if(node0v.type === 'Individual')
                    {
                      porucsCon.forEach(function(porucsNodeCon0v){
                        if(node0v === porucsNodeCon0v.source || node0v === porucsNodeCon0v.target){
                          pcNCArray0v.push(countIndex0v);//  store positions inside of array...
                        }
                        countIndex0v++;
                      });
                      countIndex0v = 0;
                    }
                  });

                  //  For affiliations connections

                  countIndex0 = 0;

                  filteredNodes.forEach(function(node0){
                    if(node0.type === 'Individual')
                    {
                      affilCon.forEach(function(affilNodeCon0){
                        if(node0 === affilNodeCon0.source || node0 === affilNodeCon0.target){
                          aNCArray0v.push(countIndex0);//  store positions inside of array...
                        }
                        countIndex0++;
                      });
                      countIndex0 = 0;
                    }
                  });
                
    }
       if(!document.getElementById("cb_individ").checked)

    {

      d3.selectAll(".node").filter(function(d) { if (d.type === "Individual") return this;}).style("visibility", "hidden");
        
               //  For funding connections

                countIndex0h = 0;

                  filteredNodes.forEach(function(node0h){
                    if(node0h.type === 'Individual')
                    {
                      fundingCon.forEach(function(fundNodeCon0h){
                        if(node0h === fundNodeCon0h.source || node0h === fundNodeCon0h.target){
                          fNCArray0h.push(countIndex0h);//  store positions inside of array...
                        }
                        countIndex0h++;
                      });
                      countIndex0h = 0;
                    }
                  });

                  //  For investing connections

                  countIndex0h = 0;

                  filteredNodes.forEach(function(node0h){
                    if(node0h.type === 'Individual')
                    {
                      investingCon.forEach(function(investNodeCon0h){
                        if(node0h === investNodeCon0h.source || node0h === investNodeCon0h.target){
                          iNCArray0h.push(countIndex0h);//  store positions inside of array...
                        }
                        countIndex0h++;
                      });
                      countIndex0h = 0;
                    }
                  });

                  //  For partnerships/collaborations connections

                  countIndex0h = 0;

                  filteredNodes.forEach(function(node0h){
                    if(node0h.type === 'Individual')
                    {
                      porucsCon.forEach(function(porucsNodeCon0h){
                        if(node0h === porucsNodeCon0h.source || node0h === porucsNodeCon0h.target){
                          pcNCArray0h.push(countIndex0h);//  store positions inside of array...
                        }
                        countIndex0h++;
                      });
                      countIndex0h = 0;
                    }
                  });

                  //  For affiliations connections

                  countIndex0h = 0;

                  filteredNodes.forEach(function(node0h){
                    if(node0h.type === 'Individual')
                    {
                      affilCon.forEach(function(affilNodeCon0h){
                        if(node0h === affilNodeCon0h.source || node0h === affilNodeCon0h.target){
                          aNCArray0h.push(countIndex0h);//  store positions inside of array...
                        }
                        countIndex0h++;
                      });
                      countIndex0h = 0;
                    }
                  });
    }
  
       if(document.getElementById("cb_nonpro").checked)
    {
      d3.selectAll(".node").filter(function(d) { if (d.type === "Non-Profit") return this;}).style("visibility", "visible");

                 //  For funding connections

                  countIndex1v = 0;

                  filteredNodes.forEach(function(node1v){
                    if(node1v.type === 'Non-Profit')
                    {
                      fundingCon.forEach(function(fundNodeCon1v){
                        if((node1v === fundNodeCon1v.source || node1v === fundNodeCon1v.target) && fNCArray1v.indexOf(countIndex1v) === -1){
                          fNCArray1v.push(countIndex1v);//  store positions inside of array...
                        }
                        countIndex1v++;
                      });
                      countIndex1v = 0;
                    }
                  });

                  //  For investing connections

                  countIndex1v = 0;

                  filteredNodes.forEach(function(node1v){
                    if(node1v.type === 'Non-Profit')
                    {
                      investingCon.forEach(function(investNodeCon1v){
                        if((node1v === investNodeCon1v.source || node1v === investNodeCon1v.target) && iNCArray1v.indexOf(countIndex1v) === -1){
                          iNCArray1v.push(countIndex1v);//  store positions inside of array...
                        }
                        countIndex1v++;
                      });
                      countIndex1v = 0;
                    }
                  });

                  //  For partnerships/collaborations connections

                  countIndex1v = 0;

                  filteredNodes.forEach(function(node1v){
                    if(node1v.type === 'Non-Profit')
                    {
                      porucsCon.forEach(function(porucsNodeCon1v){
                        if((node1v === porucsNodeCon1v.source || node1v === porucsNodeCon1v.target)&& pcNCArray1v.indexOf(countIndex1v) === -1){
                          pcNCArray1v.push(countIndex1v);//  store positions inside of array...
                        }
                        countIndex1v++;
                      });
                      countIndex1v = 0;
                    }
                  });

                  //  For affiliations connections

                  countIndex1v = 0;

                  filteredNodes.forEach(function(node1v){
                    if(node1v.type === 'Non-Profit')
                    {
                      affilCon.forEach(function(affilNodeCon1v){
                        if((node1v === affilNodeCon1v.source || node1v === affilNodeCon1v.target)&& aNCArray1v.indexOf(countIndex1v) === -1){
                          aNCArray1v.push(countIndex1v);//  store positions inside of array...
                        }
                        countIndex1v++;
                      });
                      countIndex1v = 0;
                    }
                  });

          
    }
    if(!document.getElementById("cb_nonpro").checked)
    {
      d3.selectAll(".node").filter(function(d) { if (d.type === "Non-Profit") return this;}).style("visibility", "hidden");


                 //  For funding connections

                  countIndex1h = 0;

                  filteredNodes.forEach(function(node1h){
                    if(node1h.type === 'Non-Profit')
                    {
                      fundingCon.forEach(function(fundNodeCon1h){
                        if((node1h === fundNodeCon1h.source || node1h === fundNodeCon1h.target)&& fNCArray1h.indexOf(countIndex1h) === -1){
                          fNCArray1h.push(countIndex1h);//  store positions inside of array...
                        }
                        countIndex1h++;
                      });
                      countIndex1h = 0;
                    }
                  });

                  //  For investing connections

                  countIndex1h = 0;

                  filteredNodes.forEach(function(node1h){
                    if(node1h.type === 'Non-Profit')
                    {
                      investingCon.forEach(function(investNodeCon1h){
                        if((node1h === investNodeCon1h.source || node1h === investNodeCon1h.target)&& iNCArray1h.indexOf(countIndex1h) === -1){
                          iNCArray1h.push(countIndex1h);//  store positions inside of array...
                        }
                        countIndex1h++;
                      });
                      countIndex1h = 0;
                    }
                  });

                  //  For partnerships/collaborations connections

                  countIndex1h = 0;

                  filteredNodes.forEach(function(node1h){
                    if(node1h.type === 'Non-Profit')
                    {
                      porucsCon.forEach(function(porucsNodeCon1h){
                        if((node1h === porucsNodeCon1h.source || node1h === porucsNodeCon1h.target)&& pcNCArray1h.indexOf(countIndex1h) === -1){
                          pcNCArray1h.push(countIndex1h);//  store positions inside of array...
                        }
                        countIndex1h++;
                      });
                      countIndex1h = 0;
                    }
                  });

                  //  For affiliations connections

                  countIndex1h = 0;

                  filteredNodes.forEach(function(node1h){
                    if(node1h.type === 'Non-Profit')
                    {
                      affilCon.forEach(function(affilNodeCon1h){
                        if((node1h === affilNodeCon1h.source || node1h === affilNodeCon1h.target)&& aNCArray1h.indexOf(countIndex1h) === -1){
                          aNCArray1h.push(countIndex1h);//  store positions inside of array...
                        }
                        countIndex1h++;
                      });
                      countIndex1h = 0;
                    }
                  });


                  
    }


    if(document.getElementById("cb_forpro").checked)
    {
      d3.selectAll(".node").filter(function(d) { if (d.type === "For-Profit") return this;}).style("visibility", "visible");


            //  For funding connections

                  countIndex2v = 0;

                  filteredNodes.forEach(function(node2v){
                    if(node2v.type === 'For-Profit')
                    {
                      fundingCon.forEach(function(fundNodeCon2v){
                        if((node2v === fundNodeCon2v.source || node2v === fundNodeCon2v.target) && fNCArray2v.indexOf(countIndex2v) === -1){
                          fNCArray2v.push(countIndex2v);//  store positions inside of array...
                        }
                        countIndex2v++;
                      });
                      countIndex2v = 0;
                    }
                  });

                  //  For investing connections

                  countIndex2v = 0;

                  filteredNodes.forEach(function(node2v){
                    if(node2v.type === 'For-Profit')
                    {
                      investingCon.forEach(function(investNodeCon2v){
                        if((node2v === investNodeCon2v.source || node2v === investNodeCon2v.target) && iNCArray2v.indexOf(countIndex2v) === -1){
                          iNCArray2v.push(countIndex2v);//  store positions inside of array...
                        }
                        countIndex2v++;
                      });
                      countIndex2v = 0;
                    }
                  });

                  //  For partnerships/collaborations connections

                  countIndex2v = 0;

                  filteredNodes.forEach(function(node2v){
                    if(node2v.type === 'For-Profit')
                    {
                      porucsCon.forEach(function(porucsNodeCon2v){
                        if((node2v === porucsNodeCon2v.source || node2v === porucsNodeCon2v.target)&& pcNCArray2v.indexOf(countIndex2v) === -1){
                          pcNCArray2v.push(countIndex2v);//  store positions inside of array...
                        }
                        countIndex2v++;
                      });
                      countIndex2v = 0;
                    }
                  });

                  //  For affiliations connections

                  countIndex2v = 0;

                  filteredNodes.forEach(function(node2v){
                    if(node2v.type === 'For-Profit')
                    {
                      affilCon.forEach(function(affilNodeCon2v){
                        if((node2v === affilNodeCon2v.source || node2v === affilNodeCon2v.target)&& aNCArray2v.indexOf(countIndex2v) === -1){
                          aNCArray2v.push(countIndex2v);//  store positions inside of array...
                        }
                        countIndex2v++;
                      });
                      countIndex2v = 0;
                    }
                  });
      
    }
        if(!document.getElementById("cb_forpro").checked)

    {
      d3.selectAll(".node").filter(function(d) { if (d.type === "For-Profit") return this;}).style("visibility", "hidden");

                  //  For funding connections

                  countIndex2h = 0;

                  filteredNodes.forEach(function(node2h){
                    if(node2h.type === 'For-Profit')
                    {
                      fundingCon.forEach(function(fundNodeCon2h){
                        if((node2h === fundNodeCon2h.source || node2h === fundNodeCon2h.target)&& fNCArray2h.indexOf(countIndex2h) === -1){
                          fNCArray2h.push(countIndex2h);//  store positions inside of array...
                        }
                        countIndex2h++;
                      });
                      countIndex2h = 0;
                    }
                  });

                  //  For investing connections

                  countIndex2h = 0;

                  filteredNodes.forEach(function(node2h){
                    if(node2h.type === 'For-Profit')
                    {
                      investingCon.forEach(function(investNodeCon2h){
                        if((node2h === investNodeCon2h.source || node2h === investNodeCon2h.target)&& iNCArray2h.indexOf(countIndex2h) === -1){
                          iNCArray2h.push(countIndex2h);//  store positions inside of array...
                        }
                        countIndex2h++;
                      });
                      countIndex2h = 0;
                    }
                  });



                  //  For partnerships/collaborations connections

                  countIndex2h = 0;

                  filteredNodes.forEach(function(node2h){
                    if(node2h.type === 'For-Profit')
                    {
                      porucsCon.forEach(function(porucsNodeCon2h){
                        if((node2h === porucsNodeCon2h.source || node2h === porucsNodeCon2h.target)&& pcNCArray2h.indexOf(countIndex2h) === -1){
                          pcNCArray2h.push(countIndex2h);//  store positions inside of array...
                        }
                        countIndex2h++;
                      });
                      countIndex2h = 0;
                    }
                  });

                  //  For affiliations connections

                  countIndex2h = 0;

                  filteredNodes.forEach(function(node2h){
                    if(node2h.type === 'For-Profit')
                    {
                      affilCon.forEach(function(affilNodeCon2h){
                        if((node2h === affilNodeCon2h.source || node2h === affilNodeCon2h.target)&& aNCArray2h.indexOf(countIndex2h) === -1){
                          aNCArray2h.push(countIndex2h);//  store positions inside of array...
                        }
                        countIndex2h++;
                      });
                      countIndex2h = 0;
                    }
                  });


    }
    
if(document.getElementById("cb_gov").checked)
    {
      d3.selectAll(".node").filter(function(d) { if (d.type === "Government") return this;}).style("visibility", "visible");

           // For funding connections

                  countIndex3v = 0;

                  filteredNodes.forEach(function(node3v){
                    if(node3v.type === 'Government')
                    {
                      fundingCon.forEach(function(fundNodeCon3v){
                        if((node3v === fundNodeCon3v.source || node3v === fundNodeCon3v.target) && fNCArray3v.indexOf(countIndex3v) === -1){
                          fNCArray3v.push(countIndex3v);//  store positions inside of array...
                        }
                        countIndex3v++;
                      });
                      countIndex3v = 0;
                    }
                  });




                  //  For investing connections

                  countIndex3v = 0;

                  filteredNodes.forEach(function(node3v){
                    if(node3v.type === 'Government')
                    {
                      investingCon.forEach(function(investNodeCon3v){
                        if((node3v === investNodeCon3v.source || node3v === investNodeCon3v.target) && iNCArray3v.indexOf(countIndex3v) === -1){
                          iNCArray3v.push(countIndex3v);//  store positions inside of array...
                        }
                        countIndex3v++;
                      });
                      countIndex3v = 0;
                    }
                  });

  

                  //  For partnerships/collaborations connections

                  countIndex3v = 0;

                  filteredNodes.forEach(function(node3v){
                    if(node3v.type === 'Government')
                    {
                      porucsCon.forEach(function(porucsNodeCon3v){
                        if((node3v === porucsNodeCon3v.source || node3v === porucsNodeCon3v.target)&& pcNCArray3v.indexOf(countIndex3v) === -1){
                          pcNCArray3v.push(countIndex3v);//  store positions inside of array...
                        }
                        countIndex3v++;
                      });
                      countIndex3v = 0;
                    }
                  });



                  //  For affiliations connections

                  countIndex3v = 0;

                  filteredNodes.forEach(function(node3v){
                    if(node3v.type === 'Government')
                    {
                      affilCon.forEach(function(affilNodeCon3v){
                        if((node3v === affilNodeCon3v.source || node3v === affilNodeCon3v.target)&& aNCArray3v.indexOf(countIndex3v) === -1){
                          aNCArray3v.push(countIndex3v);//  store positions inside of array...
                        }
                        countIndex3v++;
                      });
                      countIndex3v = 0;
                    }
                  });

    }
        if(!document.getElementById("cb_gov").checked)
    {
      d3.selectAll(".node").filter(function(d) { if (d.type === "Government") return this;}).style("visibility", "hidden");
          //  For funding connections

                  countIndex3h = 0;

                  filteredNodes.forEach(function(node3h){
                    if(node3h.type === 'Government')
                    {
                      fundingCon.forEach(function(fundNodeCon3h){
                        if((node3h === fundNodeCon3h.source || node3h === fundNodeCon3h.target)&& fNCArray3h.indexOf(countIndex3h) === -1){
                          fNCArray3h.push(countIndex3h);//  store positions inside of array...
                        }
                        countIndex3h++;
                      });
                      countIndex3h = 0;
                    }
                  });

                  //  For investing connections

                  countIndex3h = 0;

                  filteredNodes.forEach(function(node3h){
                    if(node3h.type === 'Government')
                    {
                      investingCon.forEach(function(investNodeCon3h){
                        if((node3h === investNodeCon3h.source || node3h === investNodeCon3h.target)&& iNCArray3h.indexOf(countIndex3h) === -1){
                          iNCArray3h.push(countIndex3h);//  store positions inside of array...
                        }
                        countIndex3h++;
                      });
                      countIndex3h = 0;
                    }
                  });

                  //  For partnerships/collaborations connections

                  countIndex3h = 0;

                  filteredNodes.forEach(function(node3h){
                    if(node3h.type === 'Government')
                    {
                      porucsCon.forEach(function(porucsNodeCon3h){
                        if((node3h === porucsNodeCon3h.source || node3h === porucsNodeCon3h.target)&& pcNCArray3h.indexOf(countIndex3h) === -1){
                          pcNCArray3h.push(countIndex3h);//  store positions inside of array...
                        }
                        countIndex3h++;
                      });
                      countIndex3h = 0;
                    }
                  });

                  //  For affiliations connections

                  countIndex3h = 0;

                  filteredNodes.forEach(function(node3h){
                    if(node3h.type === 'Government')
                    {
                      affilCon.forEach(function(affilNodeCon3h){
                        if((node3h === affilNodeCon3h.source || node3h === affilNodeCon3h.target)&& aNCArray3h.indexOf(countIndex3h) === -1){
                          aNCArray3h.push(countIndex3h);//  store positions inside of array...
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

          if(fNCArray0v.length !== 0)
            fNCArrayV = merge(fNCArrayV, fNCArray0v);
          if(fNCArray1v.length !== 0)
            fNCArrayV = fNCArrayV = merge(fNCArrayV, fNCArray1v);
          if(fNCArray2v.length !== 0)
            fNCArrayV = merge(fNCArrayV, fNCArray2v);
          if(fNCArray3v.length !== 0)
            fNCArrayV = merge(fNCArrayV, fNCArray3v);

            if(iNCArray0v.length !== 0)
            iNCArrayV = merge(iNCArrayV,iNCArray0v);
          if(iNCArray1v.length !== 0)
            iNCArrayV = merge(iNCArrayV,iNCArray1v);
          if(iNCArray2v.length !== 0)
            iNCArrayV = merge(iNCArrayV,iNCArray2v);
          if(iNCArray3v.length !== 0)
            iNCArrayV = merge(iNCArrayV,iNCArray3v);

           if(pcNCArray0v.length !== 0)
            pcNCArrayV = merge(pcNCArrayV,pcNCArray0v);
          if(pcNCArray1v.length !== 0)
            pcNCArrayV = merge(pcNCArrayV,pcNCArray1v);
          if(pcNCArray2v.length !== 0)
            pcNCArrayV = merge(pcNCArrayV,pcNCArray2v);
          if(pcNCArray3v.length !== 0)
            pcNCArrayV = merge(pcNCArrayV,pcNCArray3v);

           if(aNCArray0v.length !== 0)
            aNCArrayV = merge(aNCArrayV,aNCArray0v);
          if(aNCArray1v.length !== 0)
            aNCArrayV = merge(aNCArrayV,aNCArray1v);
          if(aNCArray2v.length !== 0)
            aNCArrayV = merge(aNCArrayV,aNCArray2v);
          if(aNCArray3v.length !== 0)
            aNCArrayV = merge(aNCArrayV,aNCArray3v);

            //  hidden

            var fNCArrayH = [];
          var iNCArrayH = [];
          var pcNCArrayH = [];
          var aNCArrayH = [];

          if(fNCArray0h.length !== 0)
            fNCArrayH = merge(fNCArrayH,fNCArray0h);
          if(fNCArray1h.length !== 0)
            fNCArrayH = merge(fNCArrayH,fNCArray1h);
          if(fNCArray2h.length !== 0)
            fNCArrayH = merge(fNCArrayH,fNCArray2h);
          if(fNCArray3h.length !== 0)
            fNCArrayH = merge(fNCArrayH,fNCArray3h);

            if(iNCArray0h.length !== 0)
             iNCArrayH = merge(iNCArrayH,iNCArray0h);
          if(iNCArray1h.length !== 0)
             iNCArrayH = merge(iNCArrayH,iNCArray1h);
          if(iNCArray2h.length !== 0)
             iNCArrayH = merge(iNCArrayH,iNCArray2h);
          if(iNCArray3h.length !== 0)
             iNCArrayH = merge(iNCArrayH,iNCArray3h);

           if(pcNCArray0h.length !== 0)
             pcNCArrayH = merge(pcNCArrayH,pcNCArray0h);
          if(pcNCArray1h.length !== 0)
             pcNCArrayH = merge(pcNCArrayH,pcNCArray1h);
          if(pcNCArray2h.length !== 0)
             pcNCArrayH = merge(pcNCArrayH,pcNCArray2h);
          if(pcNCArray3h.length !== 0)
             pcNCArrayH = merge(pcNCArrayH,pcNCArray3h);

           if(aNCArray0h.length !== 0)
             aNCArrayH = merge(aNCArrayH,aNCArray0h);
          if(aNCArray1h.length !== 0)
             aNCArrayH = merge(aNCArrayH,aNCArray1h);
          if(aNCArray2h.length !== 0)
             aNCArrayH = merge(aNCArrayH,aNCArray2h);
          if(aNCArray3h.length !== 0)
             aNCArrayH = merge(aNCArrayH,aNCArray3h);

           var alreadyHFundLinks = [];
           var alreadyHInvestLinks = [];
           var alreadyHPorucsLinks = [];
           var alreadyHAffilLinks = [];

          if(!document.getElementById("cb_fund").checked)
          {
           fundLink.filter(function(d,i){
            if(fundLink[0][i].style.visibility === "hidden")
            {
              alreadyHFundLinks.push(i);
            }
           });

           console.log(alreadyHFundLinks);
          }

          if(!document.getElementById("cb_invest").checked)
            {
           investLink.filter(function(d,i){
            if(investLink[0][i].style.visibility === "hidden")
            {
              alreadyHInvestLinks.push(i);
            }
           });

           console.log(alreadyHInvestLinks);
          }

          if(!document.getElementById("cb_porucs").checked)
          {
           porucsLink.filter(function(d,i){
            if(porucsLink[0][i].style.visibility === "hidden")
            {
              alreadyHPorucsLinks.push(i);
            }
           });

           console.log(alreadyHPorucsLinks);
          }

          if(!document.getElementById("cb_affil").checked)
          {
           affilLink.filter(function(d,i){
            if(affilLink[0][i].style.visibility === "hidden")
            {
              alreadyHAffilLinks.push(i);
            }
           });

           console.log(alreadyHAffilLinks);
          }
          
            d3.selectAll('.fund').style('visibility', function(l, i){
                  //  If the index of the funding line equals to the funding connection index...
                    if(fNCArrayV.indexOf(i) > -1)
                    {
                      return "visible";
                    }
                    else
                    {
                      return "hidden";
                    }
                    
                  });
          
              d3.selectAll('.invest').style('visibility', function(l, i){
                  //  If the index of the funding line equals to the funding connection index...
                    if(iNCArrayV.indexOf(i)>-1)
                    {

                      return "visible";
                    }
                    else
                    {
                      return "hidden";
                    }
                  });

          
            d3.selectAll('.porucs').style('visibility', function(l, i){
                  //  If the index of the funding line equals to the funding connection index...
                    if(pcNCArrayV.indexOf(i) > -1)
                    {

                      return "visible";
                    }
                    else
                    {
                      return "hidden";
                    }

                  });

          
            d3.selectAll('.affil').style('visibility', function(l, i){
                  //  If the index of the funding line equals to the funding connection index...
                    if(aNCArrayV.indexOf(i) > -1)
                    {
                      return "visible";
                    }
                    else
                    {
                      return "hidden";
                    }
                  });

            d3.selectAll('.fund').style('visibility', function(l, i){
                  //  If the index of the funding line equals to the funding connection index...
                    if(fNCArrayH.indexOf(i) > -1 || alreadyHFundLinks.indexOf(i) > -1)
                    {
                      return "hidden";
                    }
                    else
                    {
                      return "visible";
                    }
                    
                  });

            d3.selectAll('.invest').style('visibility', function(l, i){
                  //  If the index of the funding line equals to the funding connection index...
                    if(iNCArrayH.indexOf(i)>-1 || alreadyHInvestLinks.indexOf(i) > -1)
                    {

                      return "hidden";
                    }
                    else
                    {
                      return "visible";
                    }
                  });

            d3.selectAll('.porucs').style('visibility', function(l, i){
                  //  If the index of the funding line equals to the funding connection index...
                    if(pcNCArrayH.indexOf(i) > -1 || alreadyHPorucsLinks.indexOf(i) > -1)
                    {

                      return "hidden";
                    }
                    else
                    {
                      return "visible";
                    }
                  });

            d3.selectAll('.affil').style('visibility', function(l, i){
                  //  If the index of the funding line equals to the funding connection index...
                    if(aNCArrayH.indexOf(i) > -1 || alreadyHAffilLinks.indexOf(i) > -1)
                    {
                      return "hidden";
                    }
                    else
                    {
                      return "visible";
                    }
                  });

            var countFund = 0;
            for(var x = 0; x < fundLink[0].length; x++)
            {
              if(fundLink[0][x].style.visibility === "hidden")
              {
                countFund++;
              }
            }

            var countInvest = 0;
            for(var x = 0; x < investLink[0].length; x++)
            {
              if(investLink[0][x].style.visibility === "hidden")
              {
                countInvest++;
              }
            }

            var countPorucs = 0;
            for(var x = 0; x < porucsLink[0].length; x++)
            {
              if(porucsLink[0][x].style.visibility === "hidden")
              {
                countPorucs++;
              }
            }

            var countAffil = 0;
            for(var x = 0; x < affilLink[0].length; x++)
            {
              if(affilLink[0][x].style.visibility === "hidden")
              {
                countAffil++;
              }
            }

            console.log("counting fund: " + countFund);
            console.log("counting invest: " + countInvest);
            console.log("counting porucs: " + countPorucs);
            console.log("counting affil: " + countAffil);

            // If all funding connections are hidden
            if(countFund === fundLink[0].length)
              if(document.getElementById("cb_fund").checked)
              {
                document.getElementById("cb_fund").checked = false;
                // document.getElementById("cb_fund").disabled = true;
              }
              //  If some or all funding connections are shown
            if(countFund !== fundLink[0].length)
              if(!document.getElementById("cb_fund").checked)
              {
                document.getElementById("cb_fund").checked = true;
                // document.getElementById("cb_fund").disabled = false;
              }
            // If all investing connections are hidden
            if(countInvest === investLink[0].length)
              if(document.getElementById("cb_invest").checked)
              {
                document.getElementById("cb_invest").checked = false;
                // document.getElementById("cb_invest").disabled = true;
              }
            //  If some or all investing connections are shown
            if(countInvest !== investLink[0].length)
              if(!document.getElementById("cb_invest").checked)
              {
                document.getElementById("cb_invest").checked = true;
                // document.getElementById("cb_invest").disabled = false;
              }
            // If all collaboration connections are hidden
            if(countPorucs === porucsLink[0].length)
              if(document.getElementById("cb_porucs").checked)
              {
                document.getElementById("cb_porucs").checked = false;
                // document.getElementById("cb_porucs").disabled = true;
              }
            //  If some or all collaboration connections are shown
            if(countPorucs !== porucsLink[0].length)
              if(!document.getElementById("cb_porucs").checked)
              {
                document.getElementById("cb_porucs").checked = true;
                // document.getElementById("cb_porucs").disabled = false;
              }
            // If all affiliation connections are hidden
            if(countAffil === affilLink[0].length)
              if(document.getElementById("cb_affil").checked)
              {  
                document.getElementById("cb_affil").checked = false;
                // document.getElementById("cb_affil").disabled = true;
              }
            //  If some or all affiliation connections are shown
            if(countAffil !== affilLink[0].length)
              if(!document.getElementById("cb_affil").checked)
              {
                document.getElementById("cb_affil").checked = true;
                // document.getElementById("cb_affil").disabled = false;
              }

    

  });

 d3.selectAll('#cb_emp, #cb_numtwit').on('click', function() 
{
      if(document.getElementById("cb_emp").checked)
      {
        node.attr("r", function(d) {if(d.numemp !== null) return empScale(parseInt(d.numemp)); else return "7";});
        textElement.attr('transform', function(d) {if(d.numemp !== null) return translateSVG(0, -(empScale(parseInt(d.numemp)) + 2));
          else return translateSVG(0, -(empScale(parseInt(7)) + 2));});
      }

      if(document.getElementById("cb_numtwit").checked)
      {
        node.attr("r", function(d) {
          if(d.followers !== null)
          {
            if(parseInt(d.followers) > 1000000)
            {
              return "50";
            }
            else
            { 
              return twitScale(parseInt(d.followers));
            }
          } 
          else 
            return "7";});
        textElement.attr('transform', function(d) {
          if(d.followers !== null)
          {
            if(parseInt(d.followers) > 1000000)
            {
              return translateSVG(0, -52);
            }
            else
            { 
              return translateSVG(0, -(twitScale(parseInt(d.followers)) + 2));
            }
          } 
          else 
            return translateSVG(0, -(twitScale(parseInt(7)) + 2));
        });
      }
  });

 // Right-click solution to returning to original state
 d3.select('svg').on('contextmenu', function(){
  d3.event.preventDefault();
    offNode();
 });


});
