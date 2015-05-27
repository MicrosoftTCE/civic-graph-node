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

exports.processVertices = function(entities, bridges, operations, locations) {
  var out = {};

  _.each(entities, function(entity) {
    if (entity.key_people) {
      entity.key_people = entity.key_people.split("|");
    }

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

exports.processEdges = function(edges, withData) {
  return _.map(edges, function(edge) {
    return withData ? {
      source: edge.entity_2_id,
      target: edge.entity_1_id,
      type: 'Received',
      year: edge.connection_year,
      amount: edge.amount,
      render: edge.render
    } : {
      source: edge.entity_2_id,
      target: edge.entity_1_id,
      render: edge.render
    }
  })
};
