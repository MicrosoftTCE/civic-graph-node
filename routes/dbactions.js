var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('dbview');
});

router.post('/', function(req, res){
	console.log('Good');
	  res.render('dbview');

})

module.exports = router;