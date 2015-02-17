fs = require('fs');
var file = __dirname + '../../../public/data/civic.json';

exports.retrieve_all = function(request, response){
  fs.readFile(file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    response.json(JSON.parse(data));
  });
};