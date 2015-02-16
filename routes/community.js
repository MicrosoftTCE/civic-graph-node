var express = require('express');
var router = express.Router();

exports.render = function(request, response){
  request.getConnection(function(err, connection){
  });
  response.render('community', {title: 'Community'});
};
