var sinclick             = require('./sinclick');
var handleClickNodeHover = require('./handle-click-node-hover');

var utils = require('../utilities');

var handleQuery = function (query) {
  console.log(query);
  query = query.toLowerCase();

  var entitiesHash = utils.getNicknameHash();
  console.log(entitiesHash, "hash");

  if (query in entitiesHash) {
    sinclick(entitiesHash[query][0]);
  }

  if (query in utils.getLocationHash()) {
    window.civicStore.lines.funding.style("opacity", function(l) {
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

    window.civicStore.lines.investment.style("opacity", function(l) {
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

    window.civicStore.lines.collaboration.style("opacity", function(l) {
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

    window.civicStore.lines.data.style("opacity", function(l) {
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
      .filter(function(n, i) { return window.nodeInit[0][i].style.opacity == 1; })
      .on('mouseover', handleClickNodeHover);
  }
};

module.exports = handleQuery;
