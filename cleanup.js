var mysql = require('mysql');

var db_config = require('./configuration/credentials.js');
var connection = mysql.createConnection(db_config.cred.localhost);
connection.connect();

(function() {
	var dropQuery = connection.query('ALTER TABLE Entities DROP Location;', function(err) {
		if(err) throw err;
	});
})();