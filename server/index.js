var app          = require('express')();
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon      = require('static-favicon');
var logger       = require('morgan');
var path         = require('path');

app.use('/cities', require('./routes/city'));
app.use('/entities', require('./routes/entity'));
app.use('/locations', require('./routes/location'));
app.use('/', require('./routes/route'));

app.listen(3000, function() {
  console.log("Civic Graph listening on port 3000.");
});
