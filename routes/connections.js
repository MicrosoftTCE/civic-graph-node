var fs = require('fs');
var file = __dirname + '../../public/data/civic.json';

// var connections = require('./routes/connections');
// app.get('/connections', connections.retrieve_connections);
// app.get('/connections/:name', connections.retrieve_entity_connections);
// app.get('/connections/:name/funding', connections.retrieve_entity_funding);
// app.get('/connections/:name/investments', connections.retrieve_entity_investments);
// app.get('/connections/:name/collaborations', connections.retrieve_entity_collaborations);
// app.get('/connections/:name/data', connections.retrieve_entity_data);

exports.retrieve_connections = function(request, response){
  request.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT Entities.name AS source_name, Entity1ID AS source, Entity2ID AS target, Connection AS connection, Amount AS amount, ConnectionYear AS year FROM Connections INNER JOIN Entities ON Connections.Entity1ID = Entities.ID', function(err, rows){
      response.json(rows);
    });
  });
};

// exports.retrieve_entity_connections = function(request, response){
//   request.getConnection(function (err, connection) {
//     if (err) throw err;
//     request.params.name

//     connection.query('SELECT Entity1ID AS source, Entity2ID AS target, Connection AS connection, Amount AS amount, ConnectionYear AS year FROM Connections WHERE Entity1ID = ', function(err, rows){

//     });
//   });
// });

// exports.retrieve_entity_funding = function(request, response){
//   request.getConnection(function (err, connection) {

//   });
// });

// exports.retrieve_entity_investments = function(request, response){
//   request.getConnection(function (err, connection) {

//   });
// });

// exports.retrieve_collaborations = function(request, response){
//   request.getConnection(function (err, connection) {

//   });
// });

// exports.retrieve_entity_data = function(request, response){
//   request.getConnection(function (err, connection) {

//   });
// });