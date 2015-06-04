var express = require('express');
var mysql   = require('mysql');
var sql     = require('sql-bricks');
var wrap    = require('mysql-wrap');
var _       = require('lodash');
var http    = require('http');

var select = sql.select;
var insert = sql.insert;

var router  = express.Router();

var config  = require('../config');
var pool    = mysql.createPool(config.db);
var db      = wrap(pool);

router.get('/', function(req, res) {
  pool.getConnection(function(err, connection) {
    if (err) {
      console.log("Can't get connection to DB: ", err);
    } else {
      connection.query("SELECT * FROM cities", function(err, results) {
        if (err) {
          res.sendStatus(400);
        } else {
          res.json({ cities: results });
        }
      });
    }
  });
});

module.exports = router;
