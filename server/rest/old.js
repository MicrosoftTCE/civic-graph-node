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

router.get('/athena', function(req, res) {
  var entities, bridges;

  var qry = select().from("entities").toString()

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
      res.json(config.processResults(entities, bridges, results));
    })
    .catch(function(err) {
      console.log("ERROR on /entities", err);
      res.sendStatus(400);
    });
});

router.get('/entities/:name/categories', function(req, res) {
  var qry = select("categories").from("entities_view")
    .where({ name: req.params.name }).toString();

  db.query(qry).then(function(result) {
    res.json(result[0]);
  })
  .catch(function(err) {
    console.log("ERROR on /entities/" + req.params.name + '/categories', err);
    res.sendStatus(400);
  });
})

module.exports = router;
