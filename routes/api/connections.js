var mysql = require('mysql');

var db_config = require('./../../configuration/credentials.js');
var pool = mysql.createPool(db_config.cred.cleardb);

exports.retrieve_connections = function(request, response){
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT A.Name AS source_name, B.Entity1ID AS source, C.Name AS target_name, B.Entity2ID AS target, B.Connection AS connection, B.Amount AS amount, B.ConnectionYear AS year, B.Render AS render FROM Bridges B JOIN Entities A ON (B.Entity1ID = A.ID) JOIN Entities C ON (B.Entity2ID = C.ID)', function(err, rows){
      if (err) throw err;
      connection.release();
      response.json(rows);
    });
  });
};

exports.retrieve_entity_connections = function(request, response){
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT A.Name AS source_name, B.Entity1ID AS source, C.Name AS target_name, B.Entity2ID AS target, B.Connection AS connection, B.Amount AS amount, B.ConnectionYear AS year, B.Render AS render FROM Bridges B JOIN Entities A ON (B.Entity1ID = A.ID) JOIN Entities C ON (B.Entity2ID = C.ID) WHERE B.Entity1ID IN (SELECT ID FROM Entities WHERE Name = ? OR Nickname = ?) OR B.Entity2ID IN (SELECT ID FROM Entities WHERE Name = ? OR Nickname = ?)', [request.params.name, request.params.name, request.params.name, request.params.name], function(err, row){
      if (err) throw err;
      connection.release();
      response.json(row);
    });
  });
};

exports.retrieve_entity_funding = function(request, response){
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT A.Name AS source_name, B.Entity1ID AS source, C.Name AS target_name, B.Entity2ID AS target, B.Connection AS connection, B.Amount AS amount, B.ConnectionYear AS year, B.Render AS render FROM Bridges B JOIN Entities A ON (B.Entity1ID = A.ID) JOIN Entities C ON (B.Entity2ID = C.ID) WHERE (B.Entity1ID IN (SELECT ID FROM Entities WHERE Name = ? OR Nickname = ?) OR B.Entity2ID IN (SELECT ID FROM Entities WHERE Name = ? OR Nickname = ?)) AND (B.Connection = ? OR B.Connection = ?)', [request.params.name, request.params.name, request.params.name, request.params.name, "Funding Received", "Funding Given"], function(err, row){
      if (err) throw err;
      connection.release();
      response.json(row);
    });
  });
};

exports.retrieve_entity_investments = function(request, response){
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT A.Name AS source_name, B.Entity1ID AS source, C.Name AS target_name, B.Entity2ID AS target, B.Connection AS connection, B.Amount AS amount, B.ConnectionYear AS year, B.Render AS render FROM Bridges B JOIN Entities A ON (B.Entity1ID = A.ID) JOIN Entities C ON (B.Entity2ID = C.ID) WHERE (B.Entity1ID IN (SELECT ID FROM Entities WHERE Name = ? OR Nickname = ?) OR B.Entity2ID IN (SELECT ID FROM Entities WHERE Name = ? OR Nickname = ?)) AND (B.Connection = ? OR B.Connection = ?)', [request.params.name, request.params.name, request.params.name, request.params.name, "Investment Received", "Investment Given"], function(err, row){
      if (err) throw err;
      connection.release();
      response.json(row);
    });
  });
};

exports.retrieve_entity_collaborations = function(request, response){
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT A.Name AS source_name, B.Entity1ID AS source, C.Name AS target_name, B.Entity2ID AS target, B.Connection AS connection, B.Amount AS amount, B.ConnectionYear AS year, B.Render AS render FROM Bridges B JOIN Entities A ON (B.Entity1ID = A.ID) JOIN Entities C ON (B.Entity2ID = C.ID) WHERE (B.Entity1ID IN (SELECT ID FROM Entities WHERE Name = ? OR Nickname = ?) OR B.Entity2ID IN (SELECT ID FROM Entities WHERE Name = ? OR Nickname = ?)) AND (B.Connection = ?)', [request.params.name, request.params.name, request.params.name, request.params.name, "Collaboration"], function(err, row){
      if (err) throw err;
      connection.release();
      response.json(row);
    });
  });
};

exports.retrieve_entity_data = function(request, response){
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT A.Name AS source_name, B.Entity1ID AS source, C.Name AS target_name, B.Entity2ID AS target, B.Connection AS connection, B.Amount AS amount, B.ConnectionYear AS year, B.Render AS render FROM Bridges B JOIN Entities A ON (B.Entity1ID = A.ID) JOIN Entities C ON (B.Entity2ID = C.ID) WHERE (B.Entity1ID IN (SELECT ID FROM Entities WHERE Name = ?) OR B.Entity2ID IN (SELECT ID FROM Entities WHERE Name = ?)) AND (B.Connection = ?)', [request.params.name, request.params.name, request.params.name, request.params.name, "Data"], function(err, row){
      if (err) throw err;
      connection.release();
      response.json(row);
    });
  });
};

exports.retrieve_funding_connections = function(request, response){
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT A.Name AS source_name, B.Entity1ID AS source, C.Name AS target_name, B.Entity2ID AS target, B.Connection AS connection, B.Amount AS amount, B.ConnectionYear AS year, B.Render AS render FROM Bridges B JOIN Entities A ON (B.Entity1ID = A.ID) JOIN Entities C ON (B.Entity2ID = C.ID) WHERE (B.Connection = ? OR B.Connection = ?)', ["Funding Received", "Funding Given"], function(err, row){
      if (err) throw err;
      connection.release();
      response.json(row);
    });
  });
};

exports.retrieve_investment_connections = function(request, response){
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT A.Name AS source_name, B.Entity1ID AS source, C.Name AS target_name, B.Entity2ID AS target, B.Connection AS connection, B.Amount AS amount, B.ConnectionYear AS year, B.Render AS render FROM Bridges B JOIN Entities A ON (B.Entity1ID = A.ID) JOIN Entities C ON (B.Entity2ID = C.ID) WHERE (B.Connection = ? OR B.Connection = ?)', ["Investment Received", "Investment Given"], function(err, row){
      if (err) throw err;
      connection.release();
      response.json(row);
    });
  });
};

exports.retrieve_collaboration_connections = function(request, response){
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    console.log("Hello");
    var query = connection.query('SELECT A.Name AS source_name, B.Entity1ID AS source, C.Name AS target_name, B.Entity2ID AS target, B.Connection AS connection, B.Amount AS amount, B.ConnectionYear AS year, B.Render AS render FROM (Bridges B JOIN Entities A ON (B.Entity1ID = A.ID) JOIN Entities C ON (B.Entity2ID = C.ID)) WHERE (B.Connection = ?)', ["Collaboration"], function(err, row){
      if (err) throw err;
      connection.release();
      response.json(row);
    });
    console.log(query);
  });
};

exports.retrieve_data_connections = function(request, response){
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query('SELECT A.Name AS source_name, B.Entity1ID AS source, C.Name AS target_name, B.Entity2ID AS target, B.Connection AS connection, B.Amount AS amount, B.ConnectionYear AS year, B.Render AS render FROM Bridges B JOIN Entities A ON (B.Entity1ID = A.ID) JOIN Entities C ON (B.Entity2ID = C.ID) WHERE (B.Connection = ?)', ["Data"], function(err, row){
      if (err) throw err;
      connection.release();
      response.json(row);
    });
  });
};