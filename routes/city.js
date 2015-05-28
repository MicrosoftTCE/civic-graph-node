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

  });
  //get city fields,
  //if id exists, update the table
  //if not, insert a new row and get the insertid
  //use the insertID to update the location's table
  // check if it exists,
     // if it does, update the locations table with the new additions
     // if it doesn't, insert into the new row.


//  var getCityCoordinates = function(loc, callback, errorCallback){
//   http.get('http://dev.virtualearth.net/REST/v1/Locations?query=' + encodeURI(loc) + '&key=Ah_CBBU6s6tupk_v45WVz46zMfevFT5Lkt9vpmwqV5LedzE221Kfridd7khQxD8M', function(res) {
//     var data = '';
//     res.on('data', function(chunk) {
//       data += chunk;
//     }).on('end', function() {
//       console.log(data);
//       var location = JSON.parse(data);
//       if (location && location.resourceSets && location.resourceSets.length > 0 && location.resourceSets[0].resources && location.resourceSets[0].resources.length > 0) {
//           http.get('http://restcountries.eu/rest/v1/name/' + location.resourceSets[0].resources[0].address.countryRegion + '?fullText=true', function(res) {
//             var result = '';
//             res.on('data', function(chunk) {
//               result += chunk;
//             }).on('end', function() {
//               var countryDetail = JSON.parse(result);
//               var cityDetails = {
//                 cityName: location.resourceSets[0].resources[0].address.locality,
//                 countryCode: countryDetail[0].alpha3Code,
//                 countryName: location.resourceSets[0].resources[0].address.countryRegion,
//                 stateCode: location.resourceSets[0].resources[0].address.adminDistrict,
//                 latitude: location.resourceSets[0].resources[0].point.coordinates[0],
//                 longitude: location.resourceSets[0].resources[0].point.coordinates[1]
//               };
//               callback(cityDetails);
//             });
//           });
//       } else {
//         // secondApiCall(loc);
//         errorCallback(loc);
//       }
//     }).on('error', function(err) {
//     });
//   });
// };
//
//

});

module.exports = router;
