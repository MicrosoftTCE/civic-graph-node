var mysql = require('mysql');
var fs = require('fs');
var http = require('https');

var file = __dirname + '/public/data/civic.json';

var db_config = require('./configuration/credentials.js');
var connection = mysql.createConnection(db_config.cred.localhost);
var async = require('async');
// connection.connect();

fs.readFile(file, 'utf8', function(err, data){
  if(err){
      console.log('Error: ' + err);
  }

  data = JSON.parse(data);

  extractLocationFromEntities(data);
});

var extractLocationFromEntities = function(data) {
	var locationArray = [];
	console.log(locationArray, 'gsdugsg');
	for(var i = 0; i < (data.nodes).length; i++) {
		var Locations = data.nodes[i].location;
		if (Locations !== 'Unknown'){
			var semicolonChecks = Locations.match(/([^;])+/g);
			locationArray.push(semicolonChecks);


			// async.forEach(semicolonChecks, function(semicolonCheck, callback){
			// 	splitLocation(semicolonCheck, function(splitResult) {
			// 		var values = {
			// 			City_Name: !!splitResult.City_Name ? splitResult.City_Name : null,
			// 			State_Code: !!splitResult.State_Code ? splitResult.State_Code : null,
			// 			State_Name: !!splitResult.State_Name ? splitResult.State_Name : null,
			// 			Country_Code: !!splitResult.Country_Code ? splitResult.Country_Code : null,
			// 			Country_Name: !!splitResult.Country_Name ? splitResult.Country_Name : null,
			// 			City_Lat: !!splitResult.City_Lat ? splitResult.City_Lat : null,
			// 			City_Long: !!splitResult.City_Long ? splitResult.City_Long : null
			// 		};
			// 		console.log(semicolonCheck, 'semicolonCheck');
			// 		console.log(values, 'values');
			// 		callback();
			// 	// var query = connection.query('INSERT INTO Cities SET ?', values, function(err, result){

		 //  //   });
			// 	});
			// }, function (err){

			// });
		}
	}
			for(var i=0; i < locationArray.length; i++){
				if(locationArray.length > 1) {
					var final = [];
					while(locationArray.length > 1) {
					    final.push(locationArray.splice(0, 1))
					}
					console.log(final, 'final');
					// for(var i=0; i<final.length; i++){
					// 	var locationArray1 = final[i];
					// 	loopJ: for(var j=0; j<final.length; j++){
					// 		var locationArray2 = final[j];
					// 		// console.log(locationArray2);
					// 		if(locationArray1 === locationArray2) continue;

					// 		for(var k=locationArray2.length; k>=0; k--){
					// 			if (locationArray2[k] !== locationArray1[k]) continue loopJ;
					// 		}
					// 		locationArray.splice(j, 1);
					// 	}
					// }
				}
			}
	// console.log(locationArray, 'locationArray');

};

var splitLocation = function(data, callback, errorCallback) {
	var result;
	var splitString = data.split(',');
	getCityCoordinates(data.trim(), function(cityCoordinates){
		splitString;
		result = locationFilter(splitString);
		result.City_Lat = cityCoordinates.latitude;
		result.City_Long = cityCoordinates.longitude;
		result.Country_Code = cityCoordinates.countryCode;
		result.Country_Name = cityCoordinates.countryName;
		result.State_Code = cityCoordinates.stateCode;
		callback(result);
	}, function(errorCallback) {
		splitString;
		result = locationFilter(splitString);
		result.City_Lat = errorCallback.latitude;
		result.City_Long = errorCallback.longitude;
		result.Country_Code = errorCallback.countryCode;
		result.Country_Name = errorCallback.countryName;
		result.State_Code = errorCallback.stateCode;
		callback(result);
		console.log(errorCallback);
	});
};

var locationFilter = function(data) {
	var result;
	for (var i = 0; i < data.length; i++) {
		if(data.length === 1) {
			result = {
				Country_Name: data[0]
			};
		}
		else if(data.length === 2) {
			result = {
				City_Name: data[0],
				State_Code: data[1]
			};
		}
		else if(data.length === 3) {
			result = {
				City_Name: data[0],
				State_Code: data[1],
				Country_Name: data[2]
			};
		}
	}
	return result;
};

var getCityCoordinates = function(data, callback, errorCallback){
http.get('https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyAi3_QO-1ri4zNJm70fwhhluQgstPlymBk', function(res) {
	  res.on('data', function(chunk) {
	  	var location = JSON.parse(chunk);
	  	console.log(location);
		 //  if(location[data] !== 'Unknown' && location[data] !== null) {
		 //  	var cityCooordinates = {
		 //  		countryCode: location[data].country_code,
		 //  		countryName: location[data].country_name,
		 //  		stateCode: location[data].region,
		 //  		latitude: location[data].latitude,
		 //  		longitude: location[data].longitude
		 //  	};
		 //  	callback(cityCooordinates);
		 //  } else {
		 //  	console.log(data, 'data');
		 //  	errorCallback(data);
		 //  }
	  // }).on('error', function(err) {
	  // 	console.log(err, 'err');
	  });
	});


};



