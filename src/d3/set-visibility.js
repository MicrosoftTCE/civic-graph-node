var d3 = require('d3');

var setVisibility = function(link, linkData, visibleNodes, connectionType) {
  console.log(
    "Running setVisibility with link, linkData, visibleNodes, connectionType = ",
    link, linkData, visibleNodes, connectionType
  );

  if (linkData.source.ID in visibleNodes && linkData.target.ID in visibleNodes) {
    switch (connectionType) {
      case "Funding":
        ($('#cb_fund').is(':checked')) ?
          d3.select(link).style('visibility', 'visible') :
          d3.select(link).style('visibility', 'hidden');
        break;
      case "Investment":
        ($('#cb_invest').is(':checked')) ?
          d3.select(link).style('visibility', 'visible') :
          d3.select(link).style('visibility', 'hidden');
        break;
      case "Collaboration":
        ($('#cb_porucs').is(':checked')) ?
          d3.select(link).style('visibility', 'visible') :
          d3.select(link).style('visibility', 'hidden');
        break;
      case "Data":
        ($('#cb_data').is(':checked')) ?
          d3.select(link).style('visibility', 'visible') :
          d3.select(link).style('visibility', 'hidden');
        break;
      default:
        break;
    }
  } else {
    d3.select(link).style('visibility', 'hidden');
  }
};

module.exports = setVisibility;
