var app          = require('express')();
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon      = require('static-favicon');
var logger       = require('morgan');
var path         = require('path');

app.use('/cities', require('./rest/city'));
app.use('/entities', require('./rest/entity'));
app.use('/locations', require('./rest/location'));
app.use('/', require('./rest/old'));

app.listen(3000, function() {
  console.log("Civic Graph listening on port 3000.");
});
