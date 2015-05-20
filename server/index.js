var app          = require('express')();
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon      = require('static-favicon');
var logger       = require('morgan');
var mysql        = require('mysql');
var path         = require('path');
var sql          = require('sql-bricks');

app.get('/', function(req, res) {
  res.send("Hi!");
});

app.listen(3000, function() {
  console.log("Civic Graph listening on port 3000.");
});
