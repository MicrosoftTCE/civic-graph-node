var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');

var parseUrlencoded = bodyParser.urlencoded({ extended: false });

 router.route('/').post(parseUrlencoded, function (request, response) {
    alert('sweet');
  });

 module.exports = router;