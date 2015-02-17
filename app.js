var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var connection = require('express-myconnection');

var index = require('./routes/index');

var app = express();

// var port = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
var parseUrlencoded = bodyParser.urlencoded({
  extended: false
});

app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

//  For debugging purposes
var logger = require('./logger');
app.use(logger);

app.use(connection(mysql, {
    host: 'localhost',
    user: 'root',
    password: 'MicrosoftNY',
    port: 3306,
    database: 'athena'
}, 'request'));

// connection.connect(function(err){
// if(!err) {
//     console.log("Database is connected ... \n\n");  
// } else {
//     console.log("Error connecting database ... \n\n");  
// }
// });
app.set('json spaces', 20);


var athena = require('./routes/athena');
app.get('/athena', athena.retrieve_all);

var about = require('./routes/about');
app.get('/about', about.render);

var api = require('./routes/api');
app.get('/api', api.render);

var community = require('./routes/community');
app.get('/community', community.render);

// 
// 
// COMMENT IN TO ADD JOIN ROUTE
// var join = require('./routes/join');
// app.get('/join', join.render);
// 
// 

var athena = require('./routes/athena');
app.get('/athena', athena.retrieve_all);

var entities = require('./routes/entities'); 
app.get('/entities', entities.retrieve_entities);
app.get('/entities/:name', entities.retrieve_entity);
app.get('/entities/:name/categories', entities.retrieve_categories);
app.get('/entities/:name/key_people', entities.retrieve_key_people);
app.get('/entities/:name/relations', entities.retrieve_relations);
app.get('/entities/:name/funding_received', entities.retrieve_funding_received);
app.get('/entities/:name/funding_given', entities.retrieve_funding_given);
app.get('/entities/:name/investments_received', entities.retrieve_investments_received);
app.get('/entities/:name/investments_made', entities.retrieve_investments_made);
app.get('/entities/:name/collaborations', entities.retrieve_collaborations);
app.get('/entities/:name/data', entities.retrieve_data);
app.get('/entities/:name/revenue', entities.retrieve_revenue);
app.get('/entities/:name/expenses', entities.retrieve_expenses);

// var connections = require('./routes/connections');
// app.get('/connections', connections.retrieve_connections);
// app.get('/connections/:name', connections.retrieve_entity_connections);
// app.get('/connections/:name/funding', connections.retrieve_entity_funding);
// app.get('/connections/:name/investments', connections.retrieve_entity_investments);
// app.get('/connections/:name/collaborations', connections.retrieve_ent);
// app.get('/connections/:name/data', connections.retrieve_entity_funding);

// var operations = require('./routes/operations');
// app.get('/operations', operations.retrieve_operations);
// app.get('/operations/revenue/year', operations.retrieve_revenue_year);
// app.get('/operations/expenses/year', operations.retrieve_expenses_year);

// var database = require('./routes/database');
// app.post('/database/save', parseUrlencoded, database.save);

// app.get('/', function(req, res) {
//   res.sendFile(__dirname + '/index.html');
// });
app.get('/', index.render);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
var err = new Error('Not Found');
err.status = 404;
next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
res.status(err.status || 500);
res.render('error', {
  message: err.message,
  error: {}
});
});

// connection.end();
module.exports = app;