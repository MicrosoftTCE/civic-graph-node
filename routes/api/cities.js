var fs = require('fs');
var path = require("path");
var file = path.join(__dirname, '..', '..', 'public', 'data', 'civic.json');


exports.retrieve_locations = function(request, response){

  // pool.getConnection(function (err, connection) {
  //   if (err) throw err;
  //   connection.query('SELECT Cities.City_Name AS city_name, Cities.State_Name AS state_name, Cities.Country_Name AS country_name', function(err, rows){
  //     if (err) throw err;
  //     connection.release();
  //     response.json(rows);
  //   });
  // });
};
