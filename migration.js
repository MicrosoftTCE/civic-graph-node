var mysql = require('mysql');
var fs = require('fs');
// var _ = require('lodash');
// var request = require('request');
var http = require('http');

var file = __dirname + '/public/data/civic.json';

var db_config = require('./configuration/credentials.js');
var connection = mysql.createConnection(db_config.cred.localhost);

// connection.connect();

fs.readFile(file, 'utf8', function(err, data){
    if(err){
        console.log('Error: ' + err)
    }
    
    data = JSON.parse(data);

    extractLocationFromEntities(data);
});

var extractLocationFromEntities = function(data) {
	for(var i = 0; i < (data.nodes).length; i++) {
		var Locations = data.nodes[i].location;
		var splitResult = splitLocation(Locations);
		// var values = {
		// 	City_Name: splitResult.City_Name != null ? splitResult.City_Name : null,
		// 	State_Code: splitResult.State_Code != null ? splitResult.State_Code : null,
		// 	State_Name: splitResult.State_Name !=null ? splitResult.State_Name : null,
		// 	Country_Code: splitResult.Country_Code != null ? splitResult.Country_Code : null,
		// 	Country_Name: splitResult.Country_Name != null ? splitResult.Country_Name : null,
		// 	City_Lat: splitResult.City_Lat != null ? splitResult.City_Lat : null,
		// 	City_Long: splitResult.City_Long != null ? splitResult.City_Long : null
		// }

		// var query = connection.query('INSERT INTO Cities SET ?', values, function(err, result){

  //   });
	}
};

var splitLocation = function(data) {
	var result;
	if (data !== 'Unknown') {
		var entityLocation = data;
		var semicolonCheck = entityLocation.match(/([^;])+/g);
		for (var i = 0; i < semicolonCheck.length; i++) {	
			getCityCoordinates(semicolonCheck[i].trim());
			var splitString = semicolonCheck[i].split(/\s*,\s*/);
			result = locationFilter(splitString);
		}
	}
};

var locationFilter = function(data) {
	var result;
	for (var i = 0; i < data.length; i++) {
		if(data.length === 1) {
			result = {
				Country_Name: data[0]
			}
		} 
		else if(data.length === 2) {
			result = {
				City_Name: data[0],
				State_Code: data[1]
			}
		}
		else if(data.length === 3) {
			result = {
				City_Name: data[0],
				State_Code: data[1],
				Country_Name: data[2]
			}
		}
	}
	return result;
};

var getCityCoordinates = function(data) {
	var options = {
		hostname: 'http://datasciencetoolkit.org',
		path: '/street2coordinates/' + data
	}
// 	http.get("http://www.google.com/index.html", function(res) {
//   console.log("Got response: " + res.statusCode);
// }).on('error', function(e) {
//   console.log("Got error: " + e.message);
// });


	http.get('http://www.datasciencetoolkit.org/street2coordinates/' + data, function(res) {

		var bodyChunks = [];
	  res.on('data', function(chunk) {
	    // You can process streamed parts here...
	    bodyChunks.push(chunk);
	  }).on('end', function() {
	    var body = Buffer.concat(bodyChunks);
	    console.log('BODY: ' + data + body);
	    // ...and/or process the entire body here.
	  }).on('error', function(e) {
		  console.log('ERROR: ' + e.message);
		});
	});
};


