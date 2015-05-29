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


// var locations = {
  //   city: [
  //     {
  //       id: null,
  //       cityname: 'Bariga, Lagos, Nigeria',
  //       addresses: [
  //         {
  //           id: null,
  //           address: '1, Microsoft Way'
  //         }
  //       ]
  //     },
  //     {
  //       id:null,
  //       cityname: 'Shomolu, Lagos, Nigeria',
  //       addresses: [
  //         {
  //           id: null,
  //           address: '27, New Zealand Street'
  //         }
  //       ]
  //     }
  //   ]
  // }


router.post('/', function(req, res) {
// var cities = req.body.locations;
  var cities = req.body.city;

  _.each(cities, function(city) {
    if(city.id === null) {
      http.get('http://dev.virtualearth.net/REST/v1/Locations?query=' + encodeURI(city.cityName) + '&key=Ah_CBBU6s6tupk_v45WVz46zMfevFT5Lkt9vpmwqV5LedzE221Kfridd7khQxD8M', function(res) {
        var data = '';
        res.on('data', function(chunk) {
          data += chunk;
        }).on('end', function() {
          var location = JSON.parse(data);
          if(location){
            if (location.resourceSets && location.resourceSets.length > 0 && location.resourceSets[0].resources && location.resourceSets[0].resources.length > 0) {
              http.get('http://restcountries.eu/rest/v1/name/' + location.resourceSets[0].resources[0].address.countryRegion + '?fullText=true', function(res) {
                var result = '';
                res.on('data', function(chunk) {
                  result += chunk;
                }).on('end', function() {
                  var countryDetail = JSON.parse(result);
                  var cityDetails = {
                    city_name: location.resourceSets[0].resources[0].address.locality || null,
                    state_code: location.resourceSets[0].resources[0].address.adminDistrict || null,
                    state_name: null,
                    country_code: countryDetail[0].alpha3Code || null,
                    country_name: location.resourceSets[0].resources[0].address.countryRegion || null,
                    city_lat: location.resourceSets[0].resources[0].point.coordinates[0] || null,
                    city_long: location.resourceSets[0].resources[0].point.coordinates[1] || null,
                    deleted_at: null
                  };

                  var qry = insert("cities", cityDetails);
                  db.query(qry.toString()).then(function(result){

                    var CityAddresses = city.addresses;
                    _.each(CityAddresses, function(CityAddress) {
                      if(address.id === null) {
                        http.get('http://dev.virtualearth.net/REST/v1/Locations?q=' + encodeURI(CityAddress.address) + '&key=Ah_CBBU6s6tupk_v45WVz46zMfevFT5Lkt9vpmwqV5LedzE221Kfridd7khQxD8M', function(res) {
                          var address = '';
                          res.on('data', function(chunk) {
                            address += chunk;
                          }).on('end', function() {
                            if (address){

                              address = JSON.parse(address);
                              console.log(address, 'adddjhhhfhf');
                              if (address.resourceSets && address.resourceSets.length > 0 && address.resourceSets[0].resources && address.resourceSets[0].resources.length > 0) {
                                var locationsObj= {
                                  entity_id: req.body.id,
                                  city_id: result.insertId,
                                  address: CityAddresses.address,
                                  address_lat: address.resourceSets[0].resources[0].geocodePoints[0].coordinates[0],
                                  address_long: address.resourceSets[0].resources[0].geocodePoints[0].coordinates[1],
                                  deleted_at: null
                                };

                                console.log(locationsObj);

                                var qry = insert("locations", locationsObj);
                                db.query(qry.toString(), function(result) {
                                  console.log(result, 'hhhdhhd');
                                  res.json(result);
                                });
                              }
                            }
                          });
                        });
                      }
                    });
                  });
                });
              });
            }
          }
          else {
            console.log('could not get city location');
          }
        }).on('error', function(err) {
        });
      });
    }
  });


// "id": 1,
//             "city_name": "Menlo Park",
//             "state_code": "CA",
//             "state_name": "California",
//             "country_code": "USA",
//             "country_name": "United States",
//             "city_lat": 37.4553184509277,
//             "city_long": -122.178558349609,
//             "deleted_at": null
  //get city fields,
  //if id exists, update the table
  //if not, insert a new row and get the insertid
  //use the insertID to update the location's table
  // check if it exists,
     // if it does, update the locations table with the new additions
     // if it doesn't, insert into the new row.


//
//

});

module.exports = router;
