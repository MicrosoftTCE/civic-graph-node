var express = require('express');
var mysql   = require('mysql');
var sql     = require('sql-bricks');
var _       = require('lodash');

var select = sql.select;

var router  = express.Router();

var config  = require('../config');
var pool    = mysql.createPool(config.db);

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

router.post('/', function(req, res) {

  var cities = req.body.locations;
  var address = req.body.locations.address;

  _.each(cities, function(city) {
    var cityObj = city.split(",");
  });
  //get city fields,
  //if id exists, update the table
  //if not, insert a new row and get the insertid
  //use the insertID to update the location's table
  // check if it exists,
     // if it does, update the locations table with the new additions
     // if it doesn't, insert into the new row.
});

module.exports = router;
