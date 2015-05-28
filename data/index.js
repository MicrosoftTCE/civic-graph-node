var mysql   = require('mysql');
var sql     = require('sql-bricks');
var wrap    = require('mysql-wrap');
var _       = require('lodash');

var select = sql.select;
var and    = sql.and;
var $in    = sql.in;

var config  = require('../config');
var pool    = mysql.createPool(config.db);
var db      = wrap(pool);

var getTopEntities = function(callback) {
  var entities, bridges;

  var qry = "SELECT DISTINCT * FROM (" +
    "SELECT e.* FROM (" +
    "SELECT * FROM `entities_view` WHERE render = 1 " +
    "ORDER BY employees DESC LIMIT 10) e " +
    "UNION " +
    "SELECT f.* FROM (" +
    "SELECT * FROM `entities_view` WHERE render = 1 " +
    "ORDER BY followers DESC LIMIT 10) f " +
    ") t ORDER BY t.name";

  db.query(qry)
    .then(function(results) {
      entities = _.map(results, function(row) {
        row.loaded = true;
        return row;
      });

      qry = select().from("bridges_view").where({render: 1}).toString()

      return db.query(qry)
    })
    .then(function(results) {
      bridges = results;
      qry = select().from("operations_view").toString()

      return db.query(qry)
    })
    .then(function(results) {
      callback(null, {
        vertices: _.values(config.processVertices(entities, bridges, results))
      });
    })
    .catch(function(err) {
      callback(err, null);
    });
};

var getOtherEntities = function(idsToAvoid, callback) {
  var qry = "SELECT id, name, nickname, followers, employees, entity_type " +
    "FROM entities_view " +
    "WHERE id NOT IN (" + idsToAvoid.join(",") + ")";

  db.query(qry)
    .then(function(results) {
      entities = _.map(results, function(row) {
        row.loaded = false;
        return row;
      });

      qry = select().from("bridges_view").where({render: 1}).toString()

      return db.query(qry)
    })
    .then(function(results) {
      bridges = results;
      qry = select().from("operations_view").toString()

      return db.query(qry)
    })
    .then(function(results) {
      callback(null, {
        vertices: _.values(config.processVertices(entities, bridges, results))
      });
    })
    .catch(function(err) {
      callback(err, null);
    });
};

var getVertices = function(callback) {
  getTopEntities(function(err, topEntities) {
    if (err) {
      callback(err, null);
    } else {
      var idsToAvoid = _.map(topEntities.vertices, function(entity) {
        return entity.id;
      })

      getOtherEntities(idsToAvoid, function(err, otherEntities) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, {
            vertices: topEntities.vertices.concat(otherEntities.vertices)
          });
        }
      })
    }
  })
};

var getSpecifiedEdges = function(entityIds, callback) {
  var qry = select().from("bridges_view")
    .where(and({render: 1}, $in('entity_1_id', entityIds), $in('entity_2_id', entityIds)))
    .toString()

  db.query(qry)
    .then(function(results) {
      var parsed = {
        funding: [],
        investment: [],
        collaboration: [],
        data: []
      }

      _.each(results, function(edge) {
        switch (edge.connection) {
          case 'Funding Received':
            parsed.funding.push(edge);
            break;
          case 'Investment Received':
            parsed.investment.push(edge);
            break;
          case 'Collaboration':
            parsed.collaboration.push(edge);
            break;
          case 'Data':
            parsed.data.push(edge);
            break;
        }
      })

      callback(null, {
        edges: {
          funding: config.processEdges(parsed.funding, true),
          investment: config.processEdges(parsed.investment, true),
          collaboration: config.processEdges(parsed.collaboration),
          data: config.processEdges(parsed.data),
        }
      });
    })
    .catch(function(err) {
      callback(err, null);
    });
};

var getAllEdges = function(callback) {
  var qry = select().from("bridges_view")
    .where({render: 1}).toString()

  db.query(qry)
    .then(function(results) {
      var parsed = {
        funding: [],
        investment: [],
        collaboration: [],
        data: []
      }

      _.each(results, function(edge) {
        switch (edge.connection) {
          case 'Funding Received':
            parsed.funding.push(edge);
            break;
          case 'Investment Received':
            parsed.investment.push(edge);
            break;
          case 'Collaboration':
            parsed.collaboration.push(edge);
            break;
          case 'Data':
            parsed.data.push(edge);
            break;
        }
      })

      callback(null, {
        edges: {
          funding: config.processEdges(parsed.funding, true),
          investment: config.processEdges(parsed.investment, true),
          collaboration: config.processEdges(parsed.collaboration),
          data: config.processEdges(parsed.data),
        }
      });
    })
    .catch(function(err) {
      callback(err, null);
    });
};

var getEdges = function(edgeType, callback) {
  var edges;
  var connection;
  var withData;

  switch (edgeType) {
    case 'funding':
      connection = 'Funding Received';
      withData = true;
      break;
    case 'investment':
      connection = 'Investment Received';
      withData = true;
      break;
    case 'collaboration':
      connection = 'Collaboration';
      break;
    case 'data':
      connection = 'Data';
      break;
  }

  var qry = select().from("bridges_view")
    .where({render: 1, connection: connection}).toString()

  db.query(qry)
    .then(function(results) {
      callback(null, { edges: config.processEdges(results, withData) });
    })
    .catch(function(err) {
      callback(err, null);
    });
};

var getLocations = function(callback) {
  var qry = select().from("locations_view").toString();

  db.query(qry)
    .then(function(results) {
      var locationHash = {};

      _.each(results, function(location) {
        locationHash[location.id] = location;
      });

      callback(null, { locations: locationHash });
    })
    .catch(function(err) {
      callback(err, null);
    });
};

var getCities = function(callback) {
  var qry = select().from("cities_view").toString();

  db.query(qry)
    .then(function(results) {
      var cityHash = {};

      _.each(results, function(city) {
        cityHash[city.id] = city;
      });

      callback(null, { cities: cityHash });
    })
    .catch(function(err) {
      callback(err, null);
    });
};

var getLocationsWithCities = function(callback) {
  var qry = "SELECT DISTINCT l.entity_id AS entity, l.address, l.address_lat, " +
    "l.address_long, c.city_name, c.state_name, c.state_code, c.country_name, " +
    "c.country_code, c.city_lat, c.city_long FROM `locations_view` l " +
    "LEFT JOIN `cities` c ON l.city_id = c.id ORDER BY entity";

  db.query(qry)
    .then(function(results) {
      callback(null, { locations: results });
    })
    .catch(function(err) {
      callback(err, null);
    });
};

var getStore = function(callback) {
  getVertices(function(err, vertices) {
    var entityHash = {};
    var ids = [];
    // var search = {};

    _.each(vertices.vertices, function(vertex) {
      entityHash[vertex.id] = vertex;
      ids.push(vertex.id);
      // search[vertex.name] = search[vertex.name] || {}
      // search[vertex.name][vertex.id] = true;
      // search[vertex.nickname] = search[vertex.nickname] || {};
      // search[vertex.nickname][vertex.id] = true;
    })

    getSpecifiedEdges(ids, function(err, edges) {
      getLocations(function(err, locations) {
        getCities(function(err, cities) {
        _.each(locations.locations, function(location) {
            if (location.entity) {
              var key = [ location.city_name ];

              if (location.state_name) {
                key.push(location.state_name)
              } else if (location.state_code) {
                key.push(location.state_code)
              }

              if (location.country_name) {
                key.push(location.country_name)
              } else if (location.country_code) {
                key.push(location.country_code)
              }

              key = key.join(", ")

              search[key] = search[key] || [];
              search[key][location.entity] = true;
            }
          })

          var out = {
            vertices: entityHash,
            edges: edges.edges,
            locations: locations.locations,
            cities: cities.cities
          };

          callback(err, out);
        })
      })
    });
  });
};

exports.getAllEdges       = getAllEdges;
exports.getEdges          = getEdges;
exports.getLocations      = getLocations;
exports.getOtherEntities  = getOtherEntities;
exports.getSpecifiedEdges = getSpecifiedEdges;
exports.getStore          = getStore;
exports.getTopEntities    = getTopEntities;
exports.getVertices       = getVertices;
