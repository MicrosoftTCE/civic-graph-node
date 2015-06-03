var express      = require('express');
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var path         = require('path');
var _            = require('lodash');

var data         = require('./data');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/microsoft.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes');
app.get('/api', routes.api);
app.get('/developer', routes.developer);
app.get('/community', routes.community);
app.get('/join', routes.join);

app.use('/cities', require('./routes/city'));
app.use('/entities', require('./routes/entity'));
app.use('/locations', require('./routes/location'));
app.use('/geoloc', require('./routes/geoloc'));
app.use('/entity-conn', require('./routes/entity-connection'));
app.use('/graph', require('./routes/graph'));
app.use('/', require('./routes/old'));

app.get('/', function(req, res) {
  data.getStore(function(err, store) {
    res.render('index', {
      title: 'Civic Graph',
      store: JSON.stringify(store)
    });
  });
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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

module.exports = app;
