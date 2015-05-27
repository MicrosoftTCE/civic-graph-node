var express = require('express');
var mysql   = require('mysql');
var sql     = require('sql-bricks');
var wrap    = require('mysql-wrap');
var _       = require('lodash');

var select = sql.select;

var router  = express.Router();

var data  = require('../data');

var config  = require('../config');
var pool    = mysql.createPool(config.db);
var db      = wrap(pool);

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
      operations = results;
      qry = select().from("locations_with_city").toString()

      return db.query(qry)
    })
    .then(function(results) {
      res.json(config.processVertices(entities, bridges, operations, results));
    })
    .catch(function(err) {
      console.log("ERROR on /entities", err);
      res.sendStatus(400);
    });
});

router.get('/top', function(req, res) {
  data.getTopEntities(function(err, obj) {
    if (err) {
      console.log("ERROR on /entities/top", err);
      res.sendStatus(400);
    } else {
      res.json(obj);
    }
  })
})

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
});

module.exports = router;
