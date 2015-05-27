var mysql   = require('mysql');
var sql     = require('sql-bricks');
var wrap    = require('mysql-wrap');
var _       = require('lodash');

var select = sql.select;

var config  = require('../config');
var pool    = mysql.createPool(config.db);
var db      = wrap(pool);

var getVertices = function (callback) {
  var entities, bridges;

  var qry = select().from("entities_view").orderBy('name','nickname').toString()

  db.query(qry)
    .then(function(results) {
      entities = results;
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
      console.log("ERROR on /graph/vertices", err);
      callback(err, null);
    });
};

var getEdges = function (edgeType, callback) {
  var edges;
  var connection;
  var withData;

  switch (edgeType) {
    case 'funding':
      connection = 'Funding Received';
      withData = true;
      break;
    case 'investment':
      connection = 'Funding Received';
      withData = true;
      break;
    case 'collaboration':
      connection = 'Funding Received';
      break;
    case 'data':
      connection = 'Funding Received';
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

exports.getVertices = getVertices;
exports.getEdges = getEdges;
