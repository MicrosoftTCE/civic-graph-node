var mysql = require('mysql');
var fs = require('fs');

var startTime = new Date().getTime();

// var connection = mysql.createConnection({
//   connectionLimit: 40,
//   port: 3306,
//   host: 'au-cdbr-azure-east-a.cloudapp.net',
//   user: 'b0c63aecaa6676',
//   password: '8e008947',
//   database: 'cdb_c7da98943c'
// });

var connection = mysql.createConnection({
  port: 3306,
  host: '127.0.0.1',
  user: 'root',
  password: 'MicrosoftNY',
  database: 'civicteA9MEi6nPl'
});

//  Testbench Time: 4.31 min.
//

var start = new Date().getTime();

connection.connect();

var done = function() {
  var file = 'public/data/civicgeoloc.json';
  fs.writeFile(file, JSON.stringify(content), function(err) {
      if (err) {
          console.log(err);
      } else {
          var endTime = new Date().getTime();

          var differenceWithoutConnection = endTime - start;
          var differenceWithConnection = endTime - startTime;
          console.log("Time Differential Without Connection: " + differenceWithoutConnection);
          console.log("Time Differential With Connection: " + differenceWithConnection);
          console.log("The file was saved!");
          connection.end();
          process.exit(1);

      }
  });
};

var content= {
  nodes: []
};

connection.query('SELECT * FROM Cities', function(err, rows){
  if (err) throw err;
  var object = rows;
  for (var i=0; i < object.length; i++) {
    content.nodes.push(object[i]);
  }
  done();
});
