var d3 = require('d3');

var reflectConnectionChanges = function(
  fundLink,
  investLink,
  porucsLink,
  dataLink
) {
  console.log("Running reflectConnectionChanges");

  var visibleFundingConnections = fundLink.filter(
    function(link) {
      return d3.select(this).style('visibility') === 'visible';
    }
  );

  var visibleInvestmentConnections = investLink.filter(
    function(link) {
      return d3.select(this).style('visibility') === 'visible';
    }
  );

  var visibleCollaborationsConnections = porucsLink.filter(
    function(link) {
      return d3.select(this).style('visibility') === 'visible';
    }
  );

  var visibleDataConnections = dataLink.filter(
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
    $('#cb_porucs').attr('checked', false);
  }

  if (visibleDataConnections[0].length === 0) {
    $('#cb_data').attr('checked', false);
  }
};

module.exports = reflectConnectionChanges;
