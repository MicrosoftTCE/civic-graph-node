var express = require('express');
var mysql   = require('mysql');
var sql     = require('sql-bricks');

var router  = express.Router();

var config  = require('../../config');
var pool    = mysql.createPool(config.db);

router.get('/', function(req, res) {
  pool.getConnection(function(err, connection) {
    if (err) {
      console.log("Can't get connection to DB: ", err);
    } else {
      connection.query("SELECT * FROM locations", function(err, results) {
        if (err) {
          res.sendStatus(400);
        } else {
          res.json({ locations: results });
        }
      })
    }
  })
});

module.exports = router;
