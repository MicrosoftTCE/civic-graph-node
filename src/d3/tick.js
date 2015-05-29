var transformText = require('./transform-text');

var tick = function (event) {
  // console.log("Running tick(e)");

  // Push different nodes in different directions for clustering.
  var k = 8 * event.alpha;

  /* Four quandrant separation */
  _.values(window.civicStore.vertices).forEach(
    function(entity, idx) {
      if (entity.type !== null) {
        if (entity.type === "Individual") {
          entity.x += (k + k);
          entity.y += (k + k);
        }
        if (entity.type === "Non-Profit") {
          entity.x += (-k - k);
          entity.y += (k + k);
        }
        if (entity.type === "For-Profit") {
          entity.x += (k + k);
          entity.y += (-k - k);
        }
        if (entity.type === "Government") {
          entity.x += (-k - k);
          entity.y += (-k - k);
        }
      }
    }
  );

  // console.log("Setting x1, y1 and x2, y2");
  if (_.isEmpty(window.centeredNode)) {
    window.civicStore.lines.funding
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    window.civicStore.lines.investment
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    window.civicStore.lines.collaboration
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    window.civicStore.lines.data
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    window.d3Node
      .attr("cx", function(d) { return d.x = d.x; })
      .attr("cy", function(d) { return d.y = d.y; });

    window.textElement.attr("transform", transformText);

  } else {
    window.civicStore.lines.funding
      .attr(
        "x1",
        function(d) {
          if (d.source === window.centeredNode) { d.source.x = window.centeredNode.x; }
          return d.source.x;
        }
      )
      .attr(
        "y1",
        function(d) {
          if (d.source === window.centeredNode) { d.source.y = window.centeredNode.y; }
          return d.source.y;
        }
      )
      .attr(
        "x2",
        function(d) {
          if (d.target === window.centeredNode) { d.target.x = window.centeredNode.x; }
          return d.target.x;
        }
      )
      .attr(
        "y2",
        function(d) {
          if (d.target === window.centeredNode) { d.target.y = window.centeredNode.y; }
          return d.target.y;
        }
      );

    window.civicStore.lines.investment
      .attr(
        "x1",
        function(d) {
          if (d.source === window.centeredNode) { d.source.x = window.centeredNode.x; }
          return d.source.x;
        }
      )
      .attr(
        "y1",
        function(d) {
          if (d.source === window.centeredNode) { d.source.y = window.centeredNode.y; }
          return d.source.y;
        }
      )
      .attr(
        "x2",
        function(d) {
          if (d.target === window.centeredNode) { d.target.x = window.centeredNode.x; }
          return d.target.x;
        }
      )
      .attr(
        "y2",
        function(d) {
          if (d.target === window.centeredNode) { d.target.y = window.centeredNode.y; }
          return d.target.y;
        }
      );

    window.civicStore.lines.collaboration
      .attr(
        "x1",
        function(d) {
          if (d.source === window.centeredNode) { d.source.x = window.centeredNode.x; }
          return d.source.x;
        }
      )
      .attr(
        "y1",
        function(d) {
          if (d.source === window.centeredNode) { d.source.y = window.centeredNode.y; }
          return d.source.y;
        }
      )
      .attr(
        "x2",
        function(d) {
          if (d.target === window.centeredNode) { d.target.x = window.centeredNode.x; }
          return d.target.x;
        }
      )
      .attr(
        "y2",
        function(d) {
          if (d.target === window.centeredNode) { d.target.y = window.centeredNode.y; }
          return d.target.y;
        }
      );

    window.civicStore.lines.data
      .attr(
        "x1",
        function(d) {
          if (d.source === window.centeredNode) { d.source.x = window.centeredNode.x; }
          return d.source.x;
        }
      )
      .attr(
        "y1",
        function(d) {
          if (d.source === window.centeredNode) { d.source.y = window.centeredNode.y; }
          return d.source.y;
        }
      )
      .attr(
        "x2",
        function(d) {
          if (d.target === window.centeredNode) { d.target.x = window.centeredNode.x; }
          return d.target.x;
        }
      )
      .attr(
        "y2",
        function(d) {
          if (d.target === window.centeredNode) { d.target.y = window.centeredNode.y; }
          return d.target.y;
        }
      );

    window.d3Node
      .attr(
        "cx",
        function(d, i) {
          if ((d3.select(window.d3Node)[0][0].data())[i].name === window.centeredNode.name) {
            d.x = window.centeredNode.x;
          }
          return d.x;
        }
      )
      .attr(
        "cy",
        function(d, i) {
          if ((d3.select(window.d3Node)[0][0].data())[i].name === window.centeredNode.name) {
            d.y = window.centeredNode.y;
          }
          return d.y;
        }
      );

    window.textElement.attr("transform", transformText);
  }
};

module.exports = tick;
