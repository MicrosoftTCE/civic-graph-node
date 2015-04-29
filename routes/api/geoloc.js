var fs = require('fs');
var path = require("path");
var file = path.join(__dirname, '..', '..', 'public', 'data', 'civicgeoloc.json');

exports.retrieve_locations = function(request, response){
  fs.readFile(file, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    response.json(JSON.parse(data));
  });
};
