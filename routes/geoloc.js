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
var qry = "SELECT city_id," +
      "COUNT(entities.id) as entitycount," +
      "CONCAT('.', GROUP_CONCAT(Entity_ID SEPARATOR '.'), '.')" +
      "AS entity_list, entities.entity_type, cities.city_name," +
      "cities.state_code, cities.country_code, cities.country_name, cities.city_long," +
      "cities.city_lat FROM entities JOIN locations ON locations.entity_id = entities.id " +
      "JOIN cities ON locations.city_id = cities.id GROUP BY city_id," +
      "entities.entity_type ORDER BY cities.id DESC," +
      "FIELD(entities.entity_type, 'For-Profit','Individual','Non-Profit','Government') ASC";


  db.query(qry).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /geoloc", err);
    res.sendStatus(400);
  });
});
module.exports = router;
