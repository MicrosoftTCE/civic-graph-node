var _ = require('lodash');

exports.db = {
  port: 3306,
  host: '127.0.0.1',
  user: 'root',
  password: 'MicrosoftNY',
  database: 'newdb'
}

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

  // _.each(locations, function(location) {
  //   try {
  //     out[location.entity_id].location.push({
  //       location:
  //     })
  //   } catch (err) {}
  // })

  return { entities: out };
}
