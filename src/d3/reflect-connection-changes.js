var d3 = require('d3');

var reflectConnectionChanges = function() {

  var visibleFundingConnections = window.civicStore.lines.funding.filter(
    function(link) {
      return d3.select(this).style('visibility') === 'visible';
    }
  );

  var visibleInvestmentConnections = window.civicStore.lines.investment.filter(
    function(link) {
      return d3.select(this).style('visibility') === 'visible';
    }
  );

  var visibleCollaborationsConnections = window.civicStore.lines.collaboration.filter(
    function(link) {
      return d3.select(this).style('visibility') === 'visible';
    }
  );

  var visibleDataConnections = window.civicStore.lines.data.filter(
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
    $('#cb_collaboration').attr('checked', false);
  }

  if (visibleDataConnections[0].length === 0) {
    $('#cb_data').attr('checked', false);
  }
};

module.exports = reflectConnectionChanges;
