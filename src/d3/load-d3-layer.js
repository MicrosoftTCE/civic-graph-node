// var D3OverlayManager = require("./scripts/D3OverlayManager");

var queue = require('queue-async');
var d3tip = require('d3-tip');

var tipTmpl      = require("jade!../templates/d3-tip.jade");
var donutTipTmpl = require("jade!../templates/d3-donut-tip.jade");
var routeTipTmpl = require("jade!../templates/d3-route-tip.jade");

var d3Layers = {};
d3Layers.ready = false;

function loadD3Layer(map) {
    //Create an instance of the D3 Overlay Manager
    // console.log(map);

  console.log("Running loadD3Layer");
  console.log(map);
  console.log(d3);


  d3MapTools = new D3OverlayManager(map);

  var radius = 80;

  var cityData = [];
  
  var circleTip = d3tip(d3)
      .attr('class', 'd3-tip')
      .html(function(d){
        console.log("Returning tip template with d =", d);
          return tipTmpl(d);
          
  });


  var donutTip = d3tip(d3)
            .attr("class", "d3-tip")
            .offset([0, 0])
            .html(function(d) {
                return donutTipTmpl(d);
            });



  var routeTip = d3tip(d3)
                    .attr("class", "d3-tip")
                    .offset([0, 0])
                    .html(function(d) {
                        return routeTipTmpl(d);

                    });
  
  // var newTip = d3.helper.tooltip(function(d, i) {
  //   return d.cityA + " - " + d.cityB + ", <br/>" + d.count + " connections, <br/>" +  parseFloat((d.count/d.totalCount) * 100).toFixed(2) + "% of total connections";
  // });
  var locations = {};

  var Links = [];
  // var collabLinks = [];
  // var dataLinks = [];
  // var invstLinks = [];

  // var topology;
  // var connData;
  // var locData;

  queue()
      .defer(d3.json, "/athena")
      .defer(d3.json, "/geoloc")
      .await(analyze);


  function analyze(error, connData, locData) {


    if (error) {
        throw error;
        console.log(error);
    }

    var connData = connData;
    var locData = locData;
    console.log(locData);
    console.log(connData);



    locationData = [];
    var totalEntityCount = null;
    locData.forEach(function (d) {
      if (d.city_lat == null || d.city_long == null)
        return;
      key = d.city_lat + ":" + d.city_long;
      if (key in locations) {
        locations[key] += d.entitycount
      }
      else {
        locations[key] = d.entitycount
      }
      totalEntityCount += d.entitycount;
    });
    // console.log(totalEntityCount, "totalEntityCount");

    var maxVal = 0;
    // console.log(locations)
    for (var loc in locations) {
        // console.log(loc);
      var d = {};
      coor = loc.split(":");
      d.val = locations[loc];
      d.lat = coor[0];
      d.lon = coor[1];
      locData.forEach(function(place) {
        var name = "Unknown";
        if (place.city_lat == d.lat && place.city_long == d.lon) {
            d.id = place.city_id;
          if (place.city_name != null && place.state_code != null) {
            name = place.city_name + ", " + place.state_code + ", " + place.country_name;
            return d.name = name;
          }
          else if(place.city_name != null && place.country_name != (null || "United States")) {
            name = place.city_name + ", " + place.country_name;
            return d.name = name;
          }
          else {
            name = place.country_name;
            return d.name = name
          }
          // console.log("place: " + name);
          return d.name = name;
        }
      });
      d.totalCount = totalEntityCount;
      locationData[locationData.length] = d;

      if (d.val > maxVal) {
        maxVal = d.val;
      }
    }

    // console.log(topology);
    // console.log(connData);
    // console.log(locData);
    console.log(locationData);

    Object.keys(connData).forEach(function(key) {
      if (key === "entities")
        return;

      connData[key].forEach(function(d) {
          var nodeA, nodeB;
          nodeA = _.find(locData, function(x) {
              return x.entity_list.indexOf("." + d.source +".") >= 0;
          });
          nodeB = _.find(locData, function(y) {
              return y.entity_list.indexOf("." + d.target +".") >= 0;
          });
          if (nodeA == null || nodeB == null || (nodeA.city_lat == null) || (nodeB.city_lat == null))
              return
          else {    
              Links.push({
                  type: "LineString",
                  coordinates: [
                      [nodeA.city_long, nodeA.city_lat],
                      [nodeB.city_long, nodeB.city_lat]
                  ],
                  category: key,
                  cityA: nodeA.city_name,
                  cityB: nodeB.city_name,
                  id_A: nodeA.city_id,
                  id_B: nodeB.city_id
              });
          }
      });
    });

    var totalConnCount = _.chain(connData).map(function(d, i) {
        if (i === "entities")
            return 0;
        return d.length;
    }).reduce(function(a, b) { return a + b; }).value();
    // console.log(totalConnCount, "totalConnCount");

    // console.log(Links, "before");
    Links = _.chain(Links)
        .groupBy(function(d) {
            return d.category + d.coordinates.toString();
        })
        .map(function(subArray, key){
            var link = subArray[0];
            link.count = subArray.length;
            link.totalCount = totalConnCount;
            return link;
        })
        .value();
    console.log(Links, "after");

    // demoData.stationBeanList.forEach(function(station) {
    //     if (station.availableDocks <= 10) {
    //         station.category = "Non-Profit";
    //     }
    //     else if(station.category <= 25) {
    //         station.category = "Government";
    //     }
    //     else
    //         station.category = "For-Profit";
    // });


    // d3Layers.d3Topology = d3MapTools.addLayer({
    //   loaded: function (svg, projection) {
    //     // console.log(Links, " the links ");


    //     svg.selectAll(".topology")
    //         .data(topojson.feature(topology, topology.objects.countries).features)
    //         .enter()
    //         .append("path")
    //         .attr("d", projection)
    //         .attr("opacity", 0)
    //         .attr("class", "topology");



    //     },

    //    viewChanged: function(svg, projection) {
    //    } 
    
    // });
    
    d3Layers.d3Routes = d3MapTools.addLayer({

        pinpoints: null, 
        routes: null,
        clickFlag: false,
        tipObj: null,
        ready: false,

        opacityLevel: function(a, b) {
            var bool = true;
            if (a.id === b.id) return false;
            Links.forEach(function(link) {
                if((link.id_A === a.id && link.id_B === b.id) || (link.id_A === b.id && link.id_B === a.id)) {
                    bool = false;
                }
            });
            return bool;
        },

        highlight:  function(a) {
            circleTip.show(a);
            d3Layers.d3Routes.svg.selectAll(".pinpoint")
                .classed("hidden", function(b) {
                    return d3Layers.d3Routes.options.opacityLevel(a, b);
            });
            d3Layers.d3Routes.svg.selectAll(".routes")
                .classed("hidden", function(b) {
                    return (b.id_A != a.id && b.id_B != a.id);
            });
        },

        highlightHover: function(a) {
            if (!d3Layers.d3Routes.options.clickFlag) {
                d3Layers.d3Routes.options.highlight(a);
            }
        },

        highlightClick: function(a) {
            d3Layers.d3Routes.options.tipObj = a;
            d3Layers.d3Routes.options.clickFlag = true;
            d3Layers.d3Routes.options.highlight(a);
        },

        reset: function() {
            d3Layers.d3Routes.svg.selectAll(".pinpoint")
                    .classed("hidden", false);

            d3Layers.d3Routes.svg.selectAll(".routes")
                .classed("hidden", false);
            circleTip.hide();
        },

        resetHover: function() {
            if (!d3Layers.d3Routes.options.clickFlag) {
                d3Layers.d3Routes.options.reset();
            }
        },

        resetClick: function() {
            d3Layers.d3Routes.options.reset();
            d3Layers.d3Routes.options.clickFlag = false;
            d3Layers.d3Routes.options.tipObj = null;
        },

        loaded: function(svg, projection) {
          console.log("Running loaded to d3Routes with svg, projection =", svg, projection);

            svg.call(routeTip);

            strokeScale = d3.scale.log().domain([1, 100]).range([3, 15]);

             svg.append("rect")
                .attr("class", "rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("opacity", 0);

            this.routes = svg.selectAll(".routes")
                .data(Links)
                .enter()
                .append("path")
                .attr("class", function(d){
                  return "routes " + d.category;
                })
                .attr("d", projection)
                .attr("fill-opacity", 0)
                .attr("opacity", 0)
                .attr("visibility", "visible")
                .style("stroke-width", function(d) {
                  return strokeScale(d.count) + "px";
                })
                // .call(newTip);
                .on('mouseover', routeTip.show)
                .on('mouseout', routeTip.hide);


            svg.call(circleTip);
            // console.log(locationData);
            radiusScale = d3.scale.linear().domain([0, maxVal]).range([5, 55]);

            // console.log(maxVal)
            this.pinpoints = svg.selectAll(".pinpoint")
                 .data(locationData)
                 .enter()
                 .append("circle")
                 .attr("transform", function(d) {
                    return "translate(" + projection.projection()([d.lon, d.lat]) + ")";
                 })
                 .attr("r", function(d){
                    return radiusScale(d.val);
                })
                .style({
                    fill: "grey",
                    stroke: "black",
                })
                .attr("class", "pinpoint")
                .attr("opacity", 0)
                .attr("stroke-opacity", 0)
                .on('mouseout', function() {d3Layers.d3Routes.options.resetHover();})
                .on('mouseover', function(d) {d3Layers.d3Routes.options.highlightHover(d);})
                .on("click", function(d) {d3Layers.d3Routes.options.highlightClick(d);});

            svg.select(".rect").on("click", function() {
                d3Layers.d3Routes.options.resetClick();
            });

            d3Layers.ready = true;

        },

        viewChanged: function(svg, projection) {
          console.log("Running viewChanged to d3Circles with svg, projection =", svg, projection);
            // svg.attr("visibility", map.getTargetZoom() < 10 ? "visible":"hidden");

            svg.selectAll("circle")
                .attr("transform", function(d) {
                    return "translate(" + projection.projection()([d.lon, d.lat]) + ")" ;
                });

            svg.attr("visibility", map.getTargetZoom() < 9 ? "visible":"hidden");

            // svg.selectAll(".routes")
            //     .attr("visibility", function(d) {
            //         return this.getTotalLength() > 900 ? "hidden" : "visible";
            //     });

        }
    });

            d3Layers.d3Donuts = d3MapTools.addLayer({
                
                radius: 0.2,

                loaded: function(svg, projection) {
                   console.log("Running loaded to d3Donuts with svg, projection =", svg, projection);
                    var arc = d3.svg.arc();
                    var list = [];
                    var subtotal = 0;
                    var lasCityId = null;


                    svg.attr("visibility", "hidden");
                    svg.call(donutTip);

        
                    function sum(arr) {
                        return _.reduce(arr, function(a, b) {
                            return a + b;
                        }, 0);
                    };

                    var totalCountList = _.chain(locData)
                        .groupBy("city_id")
                        .map(function(subArray, key){
                        return {
                            Id: key,
                            total: sum(_.pluck(subArray, "entitycount"))
                        }
                    })
                    .value();

                    // console.log(totalCountList);

                    locData.forEach(function(node) {
                        var etotal = _.find(totalCountList, function(x) {
                            return x.Id == node.city_id ? x.total : 0
                        });
                        if (lasCityId !== node.city_id) {
                            subtotal = 0;
                        }
                        if(node.city_lat === null || node.city_long === null) {
                          return;
                        }
                        list.push({
                            Id: node.city_id,
                            cityName: node.city_name,
                            lat: node.city_lat,
                            lon: node.city_long,
                            type: node.entity_type,
                            count: node.entitycount,
                            totalCount: etotal.total,
                            start: subtotal
                        });
                        subtotal += node.entitycount;
                        lasCityId = node.city_id;
                    });
                    console.log(list);
                    
                    svg.selectAll(".arc")
                        .data(list)
                        .enter()
                        .append("path")
                        .attr("cityId", function(d) {
                            return d.Id;
                        })
                        .attr("class", "arc")
                        .attr( "d", function(d) {
                            var sliceAngle = 2 * Math.PI / d.totalCount;
                            return arc({
                              // outerRadius: sf * (1 + 2 * Math.log(1 + d.totalCount)),
                              outerRadius: radius,
                              innerRadius: radius - 45,
                              startAngle: d.start * sliceAngle,
                              endAngle: (d.start + d.count) * sliceAngle
                            });
                        })
                        .attr("lat", function(d){ return d.lat;})
                        .attr("lon", function(d){ return d.lon;})
                        .attr("transform", function(d) {
                            return "translate(" + projection.projection()([d.lon, d.lat]) + ")";
                        })
                        .style("fill", function(d) {
                            if (d.type === "For-Profit")
                                return "#7cbd42";
                            if (d.type === "Non-Profit")
                                return "#269fd9";
                            if (d.type === "Individual")
                                return "#fbb717";
                            if (d.type === "Government")
                                return "#f05026";

                            return "#FFFFFF";

                        })
                        .style("stroke", "white")
                        .on('mouseover', function(d) {
                            donutTip.show(d);
                            svg.selectAll(".arc").transition().attr("opacity", function(x) {
                                return x.Id === d.Id ? 1 : 0.4;
                            });
                        })
                        .on('mouseout', function(d){
                            donutTip.hide();
                            svg.selectAll(".arc").transition().attr("opacity", 1);
                        });


                },

                viewChanged: function(svg, projection) {
                  console.log("Running viewChanged to d3Donuts with svg, projection =", svg, projection);

                    var arc = d3.svg.arc();

                    svg.selectAll(".arc")
                        .attr( "d", function(d) {
                            var sliceAngle = 2 * Math.PI / d.totalCount;
                            var outrad = 17 + (radius * Math.log(d.totalCount)/5 * map.getTargetZoom()/10);
                            return arc({
                              // outerRadius: sf * (1 + 2 * Math.log(1 + d.totalCount)),
                              outerRadius: outrad,
                              innerRadius: outrad - (0.4 * outrad),
                              startAngle: d.start * sliceAngle,
                              endAngle: (d.start + d.count) * sliceAngle
                            });
                        })
                        .attr("transform", function(d) {
                          if(this.getAttribute("lon") && this.getAttribute("lat")) {
                            return "translate(" + projection.projection()([this.getAttribute("lon"), this.getAttribute("lat")]) + ")";
                          }
                        }); 

                    svg.attr("visibility", map.getTargetZoom() < 9 || map.getTargetZoom() > 12 ? "hidden" : "visible");

                }
            });


        // d3Layers.d3Entities = d3MapTools.addLayer({
        //     loaded: function(svg, projection) {

        //         // svg.call(tip);
        //         // console.log(locationData);
        //         radiusScale = d3.scale.linear().domain([0, 65]).range([2, 10]);

        //         // console.log(maxVal)

        //         svg.attr("visibility", "hidden");

        //         svg.selectAll(".entities")
        //              .data(demoData.stationBeanList)
        //              .enter()
        //              .append("circle")
        //              .attr("transform", function(d) {
        //                 return "translate(" + projection.projection()([d.longitude, d.latitude]) + ")";
        //              })
        //              .attr("r", function(d){
        //                 return radiusScale(d.availableDocks);
        //             })
        //             .style({
        //                 stroke: "black"
        //             })
        //             .attr("class", function(d) {
        //                 return "entities " + d.category;
        //             });

        //     },

        //     viewChanged: function(svg, projection) {

        //          svg.selectAll(".entities")
        //             .attr("transform", function(d) {
        //                 return "translate(" + projection.projection()([d.longitude, d.latitude]) + ")" ;
        //             });

        //         svg.attr("visibility", map.getTargetZoom() < 13 ? "hidden":"visible");

        //     }
        // });
    };

    var loadAll = function() {
        if(d3Layers && d3Layers.d3Routes && d3Layers.ready) {

            Microsoft.Maps.Events.invoke(map, 'viewchangeend');
            var t = d3Layers.d3Routes.svg.transition().duration(1000);

            t.selectAll(".pinpoint")
                    .attr("opacity", 0.8)
                    .attr("stroke-opacity", 1);

            t.transition().selectAll(".routes")
                    .attr("opacity", 1);
        }
        else {
            console.log("not ready yet");
            setTimeout(loadAll, 100);
        }
    }

    loadAll();

        // console.log(currentZoom, "before");
    Microsoft.Maps.Events.addHandler(map, "dblclick", function(e) {
        // var zoomLevel = map.getTargetZoom();
        console.log(map.getTargetZoom(), "b4");
        console.log(e);
        // console.log(zoomLevel, "before");
        // var zoomLevel = map.getTargetZoom();
        map.setView({zoom:map.getTargetZoom() + 1});
        console.log(map.getTargetZoom(), "new");
        // currentZoom = map.getTargetZoom();
    });

    map.getZoomRange = function () {
      return {
        max: 19,
        min: 2
      };
    };

    // Attach a handler to the event that gets fired whenever the map's view is about to change
    Microsoft.Maps.Events.addHandler(map,'viewchangestart',restrictZoom);

    // Forcibly set the zoom to our min/max whenever the view starts to change beyond them 
    var restrictZoom = function () {
      if (map.getZoom() <= map.getZoomRange().min) 
      {
        map.setView({
          'zoom':       map.getZoomRange().min,
          'animate':    false
        });
      }
      else if (map.getZoom() >= map.getZoomRange().max) 
      {
        map.setView({
          'zoom':       map.getZoomRange().max,
          'animate':    false
        });
      }
    };

}

module.exports = loadD3Layer;