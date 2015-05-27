var transformText = require('./transform-text');

var tickCb = function (
  allNodes,
  centeredNode,
  fundLink,
  investLink,
  porucsLink,
  dataLink,
  node,
  textElement
) {
  return function (event) {
    // console.log("Running tick(e)");

    // Push different nodes in different directions for clustering.
    var k = 8 * event.alpha;

    /* Four quandrant separation */
    allNodes.forEach(
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
  };
};

module.exports = tickCb;
