var mysql = require('mysql');
var db_config = require('./../../configuration/credentials.js');
// var pool = mysql.createPool(db_config.cred.localhost);
var pool = mysql.createPool(db_config.cred.cleardb);



exports.retrieve_locations = function(request, response){

  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT * FROM Cities', function(err, rows){
      if (err) throw err;
      connection.release();
      response.json(rows);
    });
  });
};
