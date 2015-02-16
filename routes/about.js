var express = require('express');
var router = express.Router();

//  GET home page. 
// router.get('/', function(req, res) {
//   res.render('index', { title: 'Athena' });
// });

exports.render = function(request, response){
  console.log(request)
  console.log(response)
  request.getConnection(function(err, connection){
  });
  response.render('about', {title: 'About'});
};

// module.exports = router;
