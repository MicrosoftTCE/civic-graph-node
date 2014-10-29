var express = require('express');
var router = express.Router();

var sample = 'Testing';

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('api', { title: 'API' }, { data: sample });
});

module.exports = router;
