var D3OverlayManager = require("./scripts/D3OverlayManager");

var tipTmpl      = require("../templates/d3-tip.jade");
var donutTipTmpl = require("../templates/d3-donut-tip.jade");
var routeTipTmpl = require("../templates/d3-route-tip.jade");

var d3Layers = {};

function loadD3Layer() {
  var d3MapTools = new D3OverlayManager(map);
  var radius     = 80;
  var cityData   = [];

  var tip = d3
    .tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .html(function(d) {
      return tipTmpl(d);
    });

  var donutTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([0, 0])
    .html(function(d) {
      return donutTipTmpl(d);
    });


  var routeTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([0, 0])
    .html(function(d) {
      return routeTipTmpl(d);
    });

  var locations = {};

  var Links = [];

  queue()
    .defer(d3.json, "data/world-110m.json")  // TODO: change to REST route
    .defer(d3.json, "data/civicgeo.json")    // TODO: change to REST route
    .defer(d3.json, "data/civicgeoloc.json") // TODO: change to REST route
    .await(analyze);

  function analyze(error, topology, connData, locData) {
    if (error) { console.log(error); throw error; }

    var locationData     = [];
    var totalEntityCount = null;

    locData.nodes.forEach(
      function (d) {
        if (d.City_Lat == null || d.City_Long == null) {
          return;
        }

        var key = d.City_Lat + ":" + d.City_Long;

        if (key in locations) {
          locations[key] += d.entityCount;
        } else {
          locations[key] = d.entityCount;
        }

        totalEntityCount += d.entityCount;
      }
    );

    var maxVal = 0;

    for (var loc in locations) {
      var coords = loc.split(":");
      var d      = {};

      d.val = locations[loc];
      d.lat = coords[0];
      d.lon = coords[1];

      locData.nodes.forEach(
        function(place) {
          var name;

          if (place.cityLat === d.lat && place.cityLong === d.lon) {

            if (place.cityName !== null && place.stateCode !== null) {
              name = place.cityName + ", " + place.stateCode;
              return d.name = name;
            }

            return d.name = name;
          }
        }
      );

      d.totalCount = totalEntityCount;

      locationData[locationData.length] = d;

      if (d.val > maxVal) { maxVal = d.val; }
    }

    Object.keys(connData).forEach(function(key) {
      if (key === "nodes") { return; }

      connData[key].forEach(
        function(d) {
          var nodeA, nodeB;

          nodeA = _.find(locData.nodes,
            function(x) {
              return x.Entity_List.indexOf("." + d.source +".") >= 0;
            }
          );

          nodeB = _.find(locData.nodes,
            function(y) {
              return y.Entity_List.indexOf("." + d.target +".") >= 0;
            }
          );

          if ( !nodeA || !nodeB || !nodeA.cityLat || !nodeB.cityLat) {
            return;
          } else {
            Links.push({
              type: "LineString",
              coordinates: [
                [nodeA.cityLong, nodeA.cityLat],
                [nodeB.cityLong, nodeB.cityLat]
              ],
              category: key,
              cityA: nodeA.cityName,
              cityB: nodeB.cityName
            });
          }
        }
      );
    });

    var totalConnCount = _.chain(connData)
        .map(function(d, i) { return (i === "nodes" ? 0 : d.length); })
        .reduce(function(a, b) { return a + b; })
        .value();

    Links = _.chain(Links)
      .groupBy(function(d) { return d.category + d.coordinates.toString(); })
      .map(function(subArray, key){
        var link = subArray[0];
        link.count = subArray.length;
        link.totalCount = totalConnCount;
        return link;
      })
      .value();


    d3Layers.d3Topology = d3MapTools.addLayer({
      loaded: function (svg, projection) {
        svg.selectAll(".topology")
          .data( topojson.feature(topology, topology.objects.countries).features )
          .enter()
          .append("path")
          .attr("d", projection)
          .attr("opacity", 0)
          .attr("class", "topology");
      },

      viewChanged: function(svg, projection) {}
    });

    d3Layers.d3Routes = d3MapTools.addLayer({
      loaded: function(svg, projection) {
        svg.call(routeTip);
        strokeScale = d3.scale.log().domain([1, 100]).range([3, 15]);
        svg
          .selectAll(".routes")
          .data(Links)
          .enter()
          .append("path")
          .attr("class", function(d) { return "routes " + d.category; })
          .attr("d", projection)
          .attr("fill-opacity", 0)
          .style("stroke-width", function(d) { return strokeScale(d.count) + "px"; })
          .on('mouseover', routeTip.show)
          .on('mousemove', routeTip.show)
          .on('mouseout', routeTip.hide);
      },

      viewChanged: function(svg, projection) {
        svg.attr("visibility", map.getTargetZoom() < 10 ? "visible":"hidden");
      }
    });

    d3Layers.d3Circles = d3MapTools.addLayer({
      loaded: function (svg, projection) {
        svg.call(tip);
        radiusScale = d3.scale.linear().domain([0, maxVal]).range([5, 55]);
        svg
          .selectAll("circle")
          .data(locationData)
          .enter()
          .append("circle")
          .attr("transform",
            function(d) {
              return "translate(" + projection.projection()([d.lon, d.lat]) + ")";
            }
          )
          .attr("r", function(d){ return radiusScale(d.val); })
          .style({ fill: "grey", stroke: "black" })
          .attr("class", "pinpoint")
          .attr("opacity", 0.8)
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
      },

      viewChanged: function(svg, projection) {
        svg
          .selectAll("circle")
          .attr("transform",
            function(d) {
              return "translate(" + projection.projection()([d.lon, d.lat]) + ")" ;
            }
          );

        svg.attr("visibility", map.getTargetZoom() < 10 ? "visible":"hidden");
      }
    });

    d3Layers.d3Donuts = d3MapTools.addLayer({
      radius: 0.2,
      loaded: function(svg, projection) {
        var arc       = d3.svg.arc();
        var list      = [];
        var subtotal  = 0;
        var lasCityId = null;

        svg.attr("visibility", "hidden");
        svg.call(donutTip);

        function sum(arr) {
          return _.reduce(arr, function(a, b) { return a + b; }, 0);
        };

        var totalCountList = _.chain(locData.nodes)
          .groupBy("City_ID")
          .map(
            function(subArray, key) {
              return {
                Id: key,
                total: sum(_.pluck(subArray, "entityCount"))
              }
            }
          )
          .value();

        locData.nodes.forEach(
          function(node) {
            var etotal = _.find(totalCountList,
              function(x) {
                return x.Id == node.City_ID ? x.total : 0
              }
            );

            if (lasCityId !== node.City_ID) { subtotal = 0; }

            list.push({
              cityName: node.City_Name,
              lat: node.City_Lat,
              lon: node.City_Long,
              type: node.Type,
              count: node.entityCount,
              totalCount: etotal.total,
              start: subtotal
            });

            subtotal += node.entityCount;
            lasCityId = node.City_ID;
          }
        );

        svg
          .selectAll(".arc")
          .data(list)
          .enter()
          .append("path")
          .attr("cityName", function(d) { return d.cityName; })
          .attr("class", "arc")
          .attr( "d",
            function(d) {
              var sliceAngle = 2 * Math.PI / d.totalCount;

              return arc({
                outerRadius: radius,
                innerRadius: radius - 45,
                startAngle: d.start * sliceAngle,
                endAngle: (d.start + d.count) * sliceAngle
              });
            }
          )
          .attr("lat", function(d){ return d.lat;})
          .attr("lon", function(d){ return d.lon;})
          .attr("transform", function(d) {
            return "translate(" + projection.projection()([d.lon, d.lat]) + ")";
          })
          .style("fill", function(d) {
            if (d.entity_type === "For-Profit")
              return "#7cbd42";
            if (d.entity_type === "Non-Profit")
              return "#269fd9";
            if (d.entity_type === "Individual")
              return "#fbb717";
            if (d.entity_type === "Government")
              return "#f05026";

            return "#FFFFFF";
          })
          .on('mouseover', donutTip.show)
          .on('mouseout', donutTip.hide);
      },

      viewChanged: function(svg, projection) {
        var arc = d3.svg.arc();

        svg
          .selectAll(".arc")
          .attr( "d",
            function(d) {
              var sliceAngle = 2 * Math.PI / d.totalCount;
              var outrad     = 20 + (radius * Math.log(d.totalCount)/5 * map.getTargetZoom()/10);

              return arc({
                outerRadius: outrad,
                innerRadius: outrad - (0.75 * outrad),
                startAngle: d.start * sliceAngle,
                endAngle: (d.start + d.count) * sliceAngle
              });
            }
          )
          .attr("transform", function(d) {
            return "translate(" +
              projection.projection()(
                [this.getAttribute("lon"), this.getAttribute("lat")]
              ) +
              ")";
          });

        svg.attr("visibility", map.getTargetZoom() < 10 ? "hidden":"visible");
      }
    });
  };
}
