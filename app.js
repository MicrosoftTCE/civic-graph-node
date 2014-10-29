var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var routes = require('./routes/index');
var users = require('./routes/users');
var dbactions = require('./routes/dbactions');
var staticaction = require('./routes/staticaction');

var app = express();

var port = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/dbview', dbactions);
app.use('/static', staticaction);

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

// Configuration
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); 
app.use(express.static(path.join(__dirname, 'public')));

// Main route sends our HTML file
 
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
 
// Update MySQL database
app.post('/dbview', function (req, res) {
    console.log((req.body).name);
    connection.query('INSERT INTO users (name) VALUES (?)', (req.body).name, 
        function (err, result) {
            if (err) throw err;
            // res.send('User added to database with ID: ' + result.insertId);
        }
    );
});

app.post('/dbview', function (req, res) {
    console.log((req.body));
    temp = (req.body).name;
    connection.query('DELETE FROM users WHERE name = (?)', (req.body).name, 
        function (err, result) {
            if (err) throw err;
            console.log(result);
            res.send('User deleted from database.');
        }
    );
});
 
// connection.end();
module.exports = app;

app.listen(app.get('port'));
