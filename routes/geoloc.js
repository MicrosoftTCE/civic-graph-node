var express = require('express');
var mysql   = require('mysql');
var sql     = require('sql-bricks');
var wrap    = require('mysql-wrap');
var _       = require('lodash');

var select = sql.select;

var router  = express.Router();

var config  = require('../config');
var pool    = mysql.createPool(config.db);
var db      = wrap(pool);

router.get('/', function(req, res) {
var qry = "SELECT City_ID," +
      "COUNT(Entities.ID) as entitycount," +
      "CONCAT('.', GROUP_CONCAT(Entity_ID SEPARATOR '.'), '.')" +
      "AS Entity_List, Entities.Type, Cities.City_Name," +
      "Cities.State_Code, Cities.Country_Code, Cities.Country_Name, Cities.City_Long," +
      "Cities.City_Lat FROM Entities JOIN Locations ON Locations.Entity_ID = Entities.ID" +
      "JOIN Cities ON Locations.City_ID = Cities.ID GROUP BY City_ID," +
      "Entities.Type ORDER BY Cities.ID DESC," +
      "FIELD(Entities.Type, 'For-Profit','Individual','Non-Profit','Government') ASC";


  db.query(qry).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /geoloc", err);
    res.sendStatus(400);
  });
});
module.exports = router;
