var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var connection = require('express-myconnection');

    // myConnection = require('express-myconnection');

var routes = require('./routes/index');
var users = require('./routes/users');
var dbactions = require('./routes/dbactions');
var staticaction = require('./routes/staticaction');
var ajaxaction = require('./routes/ajax');

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

app.use('/', routes);
app.use('/users', users);
app.use('/dbview', dbactions);
app.use('/static', staticaction);
app.use('/ajax', ajaxaction);

//  For debugging purposes
var logger = require('./logger');
app.use(logger);

app.use(connection(mysql, {
    host: 'us-cdbr-azure-east-b.cloudapp.net',
    user: 'b5a370a8f6d91a',
    password: 'e928dad7',
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
app.set('json spaces', 40);

var entities = require('./routes/entities'); 
app.get('/entities', entities.list);
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

var database = require('./routes/database');
app.post('/database/save', parseUrlencoded, database.save);

app.get('/', function(req, res) {
res.sendFile(__dirname + '/index.html');
});

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

// Update MySQL database
app.post('/dbview', function(req, res) {
console.log((req.body).name);
});

app.post('/ajax', function(req, res) {
console.log('processing');
res.send('processing the login form');
});

// connection.end();
module.exports = app;