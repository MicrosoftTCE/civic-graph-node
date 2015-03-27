var express = require('express');
var router = express.Router();

exports.render = function(request, response){
  response.render('api', {title: 'Civic Graph'});
};
