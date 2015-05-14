var mysql = require('mysql');
var fs = require('fs');

var startTime = new Date().getTime();

var db_config = require('./configuration/credentials.js');
var connection = mysql.createConnection(db_config.cred.localhost);

// var connection = mysql.createConnection({
//   port: 3306,
//   host: '127.0.0.1',
//   user: 'root',
//   password: 'MicrosoftNY',
//   database: 'civicteA9MEi6nPl'
// });

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

connection.query('SELECT City_ID, COUNT(Entities.ID) as entitycount, CONCAT(".", GROUP_CONCAT(Entity_ID SEPARATOR "."), ".") AS Entity_List, Entities.Type, Cities.City_Name, Cities.State_Code, Cities.Country_Code, Cities.Country_Name, Cities.City_Long, Cities.City_Lat FROM Entities JOIN Locations ON Locations.Entity_ID = Entities.ID JOIN Cities ON Locations.City_ID = Cities.ID GROUP BY City_ID, Entities.Type ORDER BY Cities.ID DESC, FIELD(Entities.Type, "For-Profit","Individual","Non-Profit","Government") ASC', function(err, rows){
  if (err) throw err;
  var object = rows;
  for (var i=0; i < object.length; i++) {
    content.nodes.push(object[i]);
  }
  done();
});
