var express = require('express');
var mysql   = require('mysql');
var sql     = require('sql-bricks');
var wrap    = require('mysql-wrap');
var _       = require('lodash');

var select = sql.select;

var router  = express.Router();

var config  = require('../../config');
var pool    = mysql.createPool(config.db);
var db      = wrap(pool);

var processResults = function(entities, bridges, operations) {
  var out = {};

  _.each(entities, function(entity) {
    out[entity.id] = _.merge({
      funding: [],
      collaboration: [],
      employment: [],
      data: [],
      revenue: [],
      expenses: [],
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

  return { entities: out };
};

router.get('/', function(req, res) {
  var entities, bridges;

  var qry = select("id, name, nickname, followers, employees, entity_type")
    .from("entities_view").where({render: 1}).toString()

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
      res.json(processResults(entities, bridges, results));
    })
    .catch(function(err) {
      console.log("ERROR on /entities", err);
      res.sendStatus(400);
    });
});

router.get('/:id', function(req, res) {
  var qry = select("id, categories, website, twitter_handle, influence, relations, key_people")
    .from("entities_view").where({id: req.params.id, render: 1}).toString()

  db.query(qry).then(function(result) {
    var out = result[0];

    if (out.key_people) {
      out.key_people = _.map(out.key_people.split("|"), function(p) {
        return { name: p };
      });
    } else {
      out.key_people = [];
    }

    res.json({ entity: out });
  })
  .catch(function(err) {
    console.log("ERROR on /entities/" + req.params.id, err);
    res.sendStatus(400);
  });
})

module.exports = router;
