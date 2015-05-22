var _ = require('lodash');

exports.db = {
  port: 3306,
  host: '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: 'civic_dev'
}

// export DB_USER=username
// export DB_PW='password'

exports.processResults = function(entities, bridges, operations, locations) {
  var out = {};

  _.each(entities, function(entity) {
    out[entity.id] = _.merge({
      funding: [],
      collaboration: [],
      employment: [],
      data: [],
      revenue: [],
      expenses: [],
      location: [],
      loaded: false
    }, entity);
  })

  _.each(bridges, function(bridge) {

    try {
      switch (bridge.connection) {
        case "Funding":
          out[bridge.entity_1_id].funding.push({
            entity_id: bridge.entity_2_id,
            entity: out[bridge.entity_2_id].name,
            amount: bridge.amount,
            year: bridge.year
          });
          break;
        case "Collaboration":
          out[bridge.entity_1_id].funding.push({
            entity_id: bridge.entity_2_id,
            entity: out[bridge.entity_2_id].name
          });
          break;
        case "Employment":
          out[bridge.entity_1_id].funding.push({
            entity_id: bridge.entity_2_id,
            entity: out[bridge.entity_2_id].name
          });
          break;
        case "Data":
          out[bridge.entity_1_id].funding.push({
            entity_id: bridge.entity_2_id,
            entity: out[bridge.entity_2_id].name
          });
          break;
      }
    } catch (err) {}
  })

  _.each(operations, function(operation) {

    try {
      if (operation.finance === "Revenue") {
        out[operation.entity_id].revenue.push({
          amount: operation.amount,
          year: operation.year
        });
      } else if (operation.finance === "Expenses") {
        out[operation.entity_id].expenses.push({
          amount: operation.amount,
          year: operation.year
        });
      }
    } catch (err) {}
  })

  _.each(locations, function(location) {
    try {
      var id = location.entity_id
      delete location.entity_id
      out[id].location.push(location)
    } catch (err) {}
  })

  return out;
};

exports.processConnections = function(bridges) {
  var fundingConnections = [];
  var investmentConnections = [];
  var collaborationConnections = [];
  var dataConnections = [];

  _.each(bridges, function(row) {
    switch(row.connection) {
      case 'Funding Received':
        fundingConnections.push({
          source: row.entity_2_id,
          target: row.entity_1_id,
          type: 'Received',
          year: row.connection_year,
          amount: row.amount,
          render: row.render
        })
        break;
      case 'Investment Received':
        investmentConnections.push({
          source: row.entity_2_id,
          target: row.entity_1_id,
          type: 'Received',
          year: row.connection_year,
          amount: row.amount,
          render: row.render
        })
        break;
      case 'Collaboration':
        collaborationConnections.push({
          source: row.entity_2_id,
          target: row.entity_1_id,
          render: row.render
        })
        break;
      case 'Data':
        dataConnections.push({
          source: row.entity_2_id,
          target: row.entity_1_id,
          render: row.render
        })
        break;
    }
  })

  return {
    funding_connections: fundingConnections,
    investment_connections: investmentConnections,
    collaboration_connections: collaborationConnections,
    data_connections: dataConnections
  }
};
