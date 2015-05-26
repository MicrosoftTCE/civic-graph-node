var sinclickCb           = require('./sinclick-cb');
var handleClickNodeHover = require('./handle-click-node-hover');

var handleQuery = function (query, fundLink, investLink, porucsLink, dataLink, graph) {
  console.log("Calling handleQuery with query = " + query);

  query = query.toLowerCase();

  if (query in entitiesHash) {
    sinclickCb(
      fundLink,
      investLink,
      porucsLink,
      dataLink,
      graph
    )(entitiesHash[query]);
  }

  console.log("Chaging opacities on fundLinks, investLinks, etc.");
  if (query in locationsHash) {
    fundLink.style("opacity", function(l) {
      var locationSource = l.source.location;
      var locationTarget = l.target.location;

      if(locationSource && locationTarget){
        for (var i = 0; i < locationSource.length; i++) {
          for (var j = 0; j < locationTarget.length; j++) {
            return (
              locationSource[i].location.toLowerCase() === query &&
              locationTarget[j].location.toLowerCase() === query
            ) ? 1 : 0.05;
          }
        }
      }
    });

    investLink.style("opacity", function(l) {
      var locationSource = l.source.location;
      var locationTarget = l.target.location;

      if (locationSource && locationTarget){
        for (var i = 0; i < locationSource.length; i++) {
          for (var j = 0; j < locationTarget.length; j++) {
            return (
              locationSource[i].location.toLowerCase() === query &&
              locationTarget[j].location.toLowerCase() === query
            ) ? 1 : 0.05;
          }
        }
      }
    });

    porucsLink.style("opacity", function(l) {
      var locationSource = l.source.location;
      var locationTarget = l.target.location;

      if (locationSource && locationTarget) {
        for (var i = 0; i < locationSource.length; i++) {
          for (var j = 0; j < locationTarget.length; j++) {
            return (
              locationSource[i].location.toLowerCase() === query &&
              locationTarget[j].location.toLowerCase() === query
            ) ? 1 : 0.05;
          }
        }
      }
    });

    dataLink.style("opacity", function(l) {
      var locationSource = l.source.location;
      var locationTarget = l.target.location;

      if (locationSource && locationTarget) {
        for (var i = 0; i < locationSource.length; i++) {
          for (var j = 0; j < locationTarget.length; j++) {
            return (
              locationSource[i].location.toLowerCase() === query &&
              locationTarget[j].location.toLowerCase() === query
            ) ? 1 : 0.05;
          }
        }
      }
    });

    d3.selectAll('circle').style("stroke", "white");

    d3.selectAll('.node').style('opacity', function(n) {
      console.log("Setting opacity on n = ", n);

      var locationSource = n.location;

      if (locationSource) {
        for (var i = 0; i < locationSource.length; i++) {
          return (
            locationSource[i].location.toLowerCase().indexOf(query) === -1
          ) ? 0.05 : 1;
        }
      }
    }).select('text').style('opacity', 1);

    node
      .on('mouseout', null)
      .on('mouseover', null)
      .on('click', null);

    node
      .filter(function(n, i) { return nodeInit[0][i].style.opacity == 1; })
      .on('mouseover', handleClickNodeHover);
  }
};

module.exports = handleQuery;
