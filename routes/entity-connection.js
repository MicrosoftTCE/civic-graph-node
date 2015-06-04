var express = require('express');
var mysql   = require('mysql');
var sql     = require('sql-bricks');
var wrap    = require('mysql-wrap');
var _       = require('lodash');

var select = sql.select;

var router  = express.Router();

var config  = require('../config');
var pool    = mysql.createPool(config.db.localhost);
var db      = wrap(pool);

router.get('/', function(req, res) {
var qry = "SELECT a.name AS source_name," +
        "b.entity_1_id AS source_id," +
        "c.name AS target_name," +
        "b.entity_2_id AS target_id," +
        "b.connection AS connection " +
        "FROM bridges_view b JOIN entities a ON (b.entity_1_id = a.id) " +
        "JOIN entities c ON (b.entity_2_id = c.id) " +
        "WHERE (a.entity_type <> ? AND c.entity_type <> ?)";


  db.query(qry, ['Individual', 'Individual']).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /entityconn", err);
    res.sendStatus(400);
  });
});

module.exports = router;
