var mysql = require('mysql');

var connection = mysql.createConnection(
  {
    host: 'us-cdbr-azure-east-b.cloudapp.net',
    user: 'bab063a997d6ce',
    password: 'd5fd92fd',
    database: 'civicteabtdklgiw'
  });

connection.connect();

connection.query('USE civicteabtdklgiw', function(err){
    if(err) throw err;
    connection.query('SELECT * FROM entities WHERE ID=23', function(err, result){
      if(err) throw err;
      console.log(result);
      connection.query('SELECT * FROM bridges WHERE ID=23', function(err, result){
        if(err) throw err;
        console.log(result);
        connection.query('SELECT * FROM operations WHERE ID=23', function(err, result){
          if(err) throw err;
          console.log(result);
          connection.end();
        });
      });
  });
});