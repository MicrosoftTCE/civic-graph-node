// We need this to build our post string

var request = require('request');
var fs = require('fs');
var async = require('async');
var file = __dirname + '/routes/data.json';

// fs.readFile(file, 'utf8', function (err,data) {
//     if (err) {
//         console.log(err);
//     } else {
//         data = JSON.parse(data);
//         data.push({});
//         fs.writeFile(file, data, function (err) {
//           if (err) return console.log(err);
//           console.log('File saved.');
//         });
//     }
// });

// This is an async file read
fs.readFile(__dirname + '/civicold.json', 'utf-8', function (err, data) {
  if (err) throw err;
  // Make sure there's data before we post it
  if(data) {
    data = JSON.parse(data);
    // console.log(data.nodes);
    var asyncTasks = [];
    asyncTasks.push(function(callback){
      data.nodes.forEach(function(d, x){
        console.log(x, "first x");
        // (data.nodes[x])['coordinates'] = null;
        if(d.location !== null && d.location !== "Unknown" && d.location !== "null" && d.location !== undefined)
        {
          var locations = d.location.split("; ");
          console.log(locations, 'jfssdnojln');
          for(var i = 0; i < locations.length; i++){
             request({
                url: "http://www.datasciencetoolkit.org/street2coordinates/",
                method: "POST",
                json: true,   // <--Very important!!!
                body: [locations[i]]
              }, (function(j, x){
                return function (error, response, body){
                  console.log(x, "second x");
                  (data.nodes[x])['coordinates'] = [];
                  if(body[locations[j]] == null)
                    (data.nodes[x])['coordinates'] = null;
                  else{
                    console.log([body[locations[j]].latitude, body[locations[j]].longitude]);
                    (data.nodes[x])['coordinates'].push([body[locations[j]].latitude, body[locations[j]].longitude]);
                  } 
                    if(x === data.nodes.length - 1)
                    {
                      callback();
                    }
                  
                };
              })(i, x)
            );
          }
        }
      });
    });

    async.parallel(asyncTasks, function(){
      fs.writeFile(__dirname + '/civicgeo.json', JSON.stringify(data), function (err, data) {
        // console.log(data.nodes);
        if(err) throw err;
        else console.log("Saved!");
          process.exit(1);

        });
      });

      }
      else {
        console.log("No data to post");
        process.exit(-1);
      }
});
