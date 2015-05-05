var mysql = require('mysql');
var fs = require('fs');
var http = require('http');

var request = require('request');

// var file = __dirname + '/civicold.json';

var db_config = require('./configuration/credentials.js');
var connection = mysql.createConnection(db_config.cred.localhost);
var async = require('async');
connection.connect();

var getCityData = function() {
  var query = connection.query('SELECT City_ID, COUNT(Entities.ID) as entitycount, Entities.Type, Cities.City_Name, Cities.State_Code, Cities.Country_Code, Cities.City_Long, Cities.City_Lat FROM Entities JOIN Locations ON Locations.Entity_ID = Entities.ID JOIN Cities ON Locations.City_ID = Cities.ID GROUP BY City_ID, Entities.Type ORDER BY entitycount DESC', function(err, result) {
    if (err) throw err;
    console.log(result);
  });
};

getCityData();