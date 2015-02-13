var express = require('express');
var router = express.Router();

//  GET home page. 
// router.get('/', function(req, res) {
//   res.render('index', { title: 'Athena' });
// });

exports.render = function(request, response){
  request.getConnection(function(err, connection){
    if(err) throw err;
      connection.query("SET @count = -1;", function(err) {
            if (err) throw err;
            connection.query("UPDATE `Entities` SET `ID` = @count := @count + 1;", function(err) {
                if (err) throw err;
                connection.query("ALTER TABLE `Entities` AUTO_INCREMENT = 1;", function(err) {
                    if (err) throw err;
                  });
              });
          });
  });
  response.render('index', {title: 'Athena'});
};

module.exports = router;
