var mysql = require('mysql');
var fs = require('fs');
var http = require('http');

var request = require('request');

var file = __dirname + '/public/data/civic.json';

var db_config = require('./configuration/credentials.js');
var connection = mysql.createConnection(db_config.cred.cleardb);
var async = require('async');
connection.connect();

fs.readFile(file, 'utf8', function(err, data){
  if(err){
      console.log('Error: ' + err);
  }

  data = JSON.parse(data);
  async.series([
    function(callback){
      // do some stuff ...
      console.log('first call');
      populateCityTable(data, function(){
      	callback(null, 'one');
      });
    },
    function(callback){
      // do some more stuff ...
      console.log('second call');
      populateLocationTable(function(){
      	callback(null, 'two');
      });
    }
	],
	// optional callback
	function(err, results){
	    // results is now equal to ['one', 'two']
	});
});

function arrays_equal(a, b) { 
	return !!a && !!b && !(a<b || b<a);
}

Array.prototype.unique = function() {
  var a = [];
  for (var i = 0, l = this.length; i<l; i++) {
      for (var j = i + 1; j < l; j++) if (arrays_equal(this[i], this[j])) j = ++i;
      a.push(this[i]);
  }
  return a;
};

var trimArrayString = function(array) {
	for (var i = 0; i < array.length; i++) {
    array[i] = array[i].trim();
	}
	return array;
}

var removeDuplicateNewYork = function(item) {
	for (var i = 0; i < item.length; i++) {
		if(item[i].toString() ===  'New York, New York' || item[i].toString() === 'NY, NY' ) {
			item.splice(i, 1);
		}
	}
}

var populateLocationTable = function(done) {
	var tmpData = {};
	var queryString = 'SELECT Entities.ID AS Entity_ID, Cities.ID AS City_ID FROM Entities JOIN Cities ON Entities.Location REGEXP CONCAT(Cities.City_Name, \',[ ]?\', Cities.State_Code)';
	connection.query(queryString, function(err, rows, fields) {
		if(err) throw err;
			tmpData = rows;
			for (var i = 0; i < tmpData.length; i++) {
				// console.log(tmpData[i]);
				var query = connection.query('INSERT INTO Locations SET ?', tmpData[i], function(err, result) {
					if (err) throw err;
				});
				console.log(query.sql);
			}
		done();
	});
};

var populateCityTable = function(data, done) {
	var uniqueLocation = [];
	unknownLocationsArray = [];
	for(var i = 0; i < (data.nodes).length; i++) {
		var Locations = data.nodes[i].location;
		var EntityId = data.nodes[i].ID;

		// for known locations
		if (Locations !== 'Unknown'){

			//parse by semicolon
			var semicolonChecks = Locations.match(/([^;])+/g);

			// console.log('Returned Array: ' + semicolonChecks);

			trimArrayString(semicolonChecks); 
			if (semicolonChecks.length > 1) {
				while(semicolonChecks.length > 0) {
				var commaSplit = semicolonChecks.splice(0, 1);
				uniqueLocation.push(commaSplit);
				}
			}
			else{
				uniqueLocation.push(semicolonChecks);
			}
		}

		// when location is unknown
		else {
			var unknownLocations = data.nodes[i].ID;
			unknownLocationsArray.push(unknownLocations);
		}
	}
	uniqueLocation = uniqueLocation.unique()
	removeDuplicateNewYork(uniqueLocation);


	async.forEach(uniqueLocation, function(semicolonCheck, callback){
		splitLocation(semicolonCheck[0], function(splitResult) {
			var values = {
				City_Name: !!splitResult.City_Name ? splitResult.City_Name : null,
				State_Code: !!splitResult.State_Code && splitResult.State_Code.length < 5 ? splitResult.State_Code : null,
				State_Name: !!splitResult.State_Name ? splitResult.State_Name : null,
				Country_Code: !!splitResult.Country_Code ? splitResult.Country_Code : null,
				Country_Name: !!splitResult.Country_Name ? splitResult.Country_Name : null,
				City_Lat: !!splitResult.City_Lat ? splitResult.City_Lat : null,
				City_Long: !!splitResult.City_Long ? splitResult.City_Long : null
			};
			// console.log(values);
			callback();
			var query = connection.query('INSERT INTO Cities SET ?', values, function(err, result){
				if (err) throw err;
	    });
	    console.log(query.sql);
		});
	}, function (err){
		console.log('City is populated');
		done();
	});
};

var splitLocation = function(data, callback) {
	var result = {};
	getCityCoordinates(data.trim(), function(cityCoordinates){
		result.City_Lat = cityCoordinates.latitude;
		result.City_Long = cityCoordinates.longitude;
		result.Country_Code = cityCoordinates.countryCode;
		result.Country_Name = cityCoordinates.countryName;
		result.State_Code = cityCoordinates.stateCode;
		result.City_Name = cityCoordinates.cityName;
		callback(result);
	}, function(returnedValues){
		var result1;
		var splitString = returnedValues.split(',');
		result1 = locationFilter(splitString);
		result1.City_Lat = returnedValues.latitude;
		result1.City_Long = returnedValues.longitude;
		callback(result1);
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
			// special case for Minnesota
			if (data[1] === ' Minnesota') {
				result = {
					City_Name: data[0],
					State_Name: data[1]
				};
			}
			else if(data[1].length > 3) {
				result = {
					City_Name: data[0],
					Country_Name: data[1]
				};
			} else {
				result = {
					City_Name: data[0],
					State_Code: data[1]
				};
			}
		}
		else if(data.length === 3) {
			result = {
				City_Name: data[0],
				State_Name: data[1],
				Country_Name: data[2]
			};
		}
	}
	return result;
};


var getCityCoordinates = function(loc, callback, errorCallback){
	http.get('http://dev.virtualearth.net/REST/v1/Locations?query=' + encodeURI(loc) + '&key=Ah_CBBU6s6tupk_v45WVz46zMfevFT5Lkt9vpmwqV5LedzE221Kfridd7khQxD8M', function(res) {
		var data = '';
		res.on('data', function(chunk) {
			data += chunk;
		}).on('end', function() {
			var location = JSON.parse(data);
			if (location && location.resourceSets && location.resourceSets.length > 0 && location.resourceSets[0].resources && location.resourceSets[0].resources.length > 0) {
					http.get('http://restcountries.eu/rest/v1/name/' + location.resourceSets[0].resources[0].address.countryRegion + '?fullText=true', function(res) {
						var result = '';
						res.on('data', function(chunk) {
							result += chunk;
						}).on('end', function() {
							var countryDetail = JSON.parse(result);
							var cityDetails = {
								cityName: location.resourceSets[0].resources[0].address.locality,
								countryCode: countryDetail[0].alpha3Code,
								countryName: location.resourceSets[0].resources[0].address.countryRegion,
								stateCode: location.resourceSets[0].resources[0].address.adminDistrict,
								latitude: location.resourceSets[0].resources[0].point.coordinates[0],
								longitude: location.resourceSets[0].resources[0].point.coordinates[1]
							};
							callback(cityDetails);
						});
					});		
			} else {
				// secondApiCall(loc);
				errorCallback(loc);
			}
		}).on('error', function(err) {
		});
	});

};






