var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var fs = require('fs');
var geoip = require('geoip-lite');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.use(function(req, res, next) {
  console.log('['+ new Date() +'] ', req.path);
  next();
});

//  Store the IP address...
var ipAddr = null;
//  Store the IP JSON data...
var geo = null;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
})

// app.use(function(req, res, next){
    
//   next();
// });


app.use('/', routes);
app.use('/users', users);



// app.use(getIPInformation);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  //testing...
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.use(function(req, res){
  console.log("Testing");
});


  // console.log("Hello from inside...");
  //   ipAddr = req.headers["x-forwarded-for"];

  //   if (ipAddr){
  //   var list = ipAddr.split(",");
  //   ipAddr = list[list.length-1];
  // } else {
  //   ipAddr = req.connection.remoteAddress;
  // }

  // var ipSeparation = ipAddr.split(":");

  // geo = geoip.lookup(ipSeparation[0]);

  // console.log("IPAddress: " + ipAddr);

  // (ipAddr !== undefined) ? ipAddr = '"' + ipAddr + '"' : ipAddr = null;
  // (geo !== undefined) ? geo = '"' + JSON.stringify(geo) + '"' : geo = null;

//  Database credentials - Azure via ClearDB
var connection = mysql.createConnection(
    {
      port: 3306,
      host: 'us-cdbr-azure-east-b.cloudapp.net',
      user: 'b5a370a8f6d91a',
      password: 'e928dad7',
      database: 'athena'
    });

connection.connect();
 
console.log("Successful connection!");

    //  Creating Database and performing insertions...
// * Side note: SQL Injections can be performed on query statements associated with text fields
//              where the query statements are created via string concatenation. Since these queries
//              are only for database creation and filling databases with initial data, new queries 
//              with placeholder question marks should be used to prevent SQL injections.
// connection.query('CREATE DATABASE IF NOT EXISTS athena', function (err) {
//     if (err) throw err;
//     connection.query('USE athena', function (err) {
//         if (err) throw err;

//         connection.query('CREATE TABLE IF NOT EXISTS Entities('
//             + 'ID INT NOT NULL AUTO_INCREMENT UNIQUE,'
//             + 'Name VARCHAR(100) NOT NULL UNIQUE,'                  // Entity Name
//             + 'Nickname VARCHAR(100) NOT NULL UNIQUE,'              // Nickname        
//             + 'Type VARCHAR(30) NOT NULL,'                          // Type of Entity
//             + 'Categories VARCHAR(100),'                            // Category
//             + 'Location VARCHAR(100) NOT NULL,'                     // Location
//             + 'Website VARCHAR(100),'                               // Website
//             + 'TwitterHandle VARCHAR(50),'                          // Twitter Handle
//             + 'Followers INT,'                                      // Number of Twitter Followers
//             + 'Employees INT,'                                      // Number of Employees
//             + 'Influence VARCHAR(8),'    
//             + 'Relations VARCHAR(1000),'                            // Related To
//             + 'KeyPeople VARCHAR(1000),'                            // Key People   
//             + 'IPAddress VARCHAR(100),' 
//             + 'IPGeolocation VARCHAR(100),'
//             + 'TimeStamp DATETIME,'           
//             + 'PRIMARY KEY(ID)'
//             +  ')', function (err) {
//                 if (err) throw err;
//             });

//         connection.query('CREATE TABLE IF NOT EXISTS Bridges('
//             + 'ID INT NOT NULL AUTO_INCREMENT UNIQUE,'
//             + 'Entity1ID INT NOT NULL,'
//             + 'Entity2ID INT NOT NULL,'
//             + 'Connection VARCHAR(30),'
//             + 'ConnectionYear INT,'
//             + 'Amount INT,'
//             + 'PRIMARY KEY (ID),'
//             + 'FOREIGN KEY (Entity1ID) REFERENCES Entities(ID) ON UPDATE CASCADE,'
//             + 'FOREIGN KEY (Entity2ID) REFERENCES Entities(ID) ON UPDATE CASCADE'
//             + ')', function (err) {
//                 if(err) throw err;
//             });

//         connection.query('CREATE TABLE IF NOT EXISTS Operations('
//             + 'ID INT NOT NULL AUTO_INCREMENT UNIQUE,'
//             + 'EntityID INT NOT NULL,'
//             + 'Finance VARCHAR(10) NOT NULL,'
//             + 'Amount INT,'
//             + 'Year INT,'
//             + 'FOREIGN KEY (EntityID) REFERENCES Entities(ID) ON UPDATE CASCADE'
//             + ')', function (err) {
//                 if(err) throw err;
//             });

//         connection.query('SET @@auto_increment_increment=1;', function(err){
//             if(err) throw err;
//         });

//         connection.query('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";', function(err){
//             if(err) throw err;
//         });

//         //  If most recent entries are deleted, set to the next lowest available one.
//         connection.query('ALTER TABLE Entities AUTO_INCREMENT=1;', function(err){
//           if(err) throw err;
//         })

//         console.log("Good");
//         // TAke JSON file and fill in the database...
//         var file = __dirname + '/public/data/final_data_neat.json';

//         fs.readFile(file, 'utf8', function(err, data){
//             if(err){
//                 console.log('Error: ' + err)
//             }
//             testdata = JSON.parse(data);

//             //  Local variables for accounting for either the property contains a null or literal value.
//             var followers, employees, categories, url,
//                 handle, followers, employees, influence,
//                 relations, keypeople;
//             var rev_exp = [], name_and_amt, rev_exp_years, first_op_insertion = 0;

//             for(var i = 0; i < (testdata.nodes).length; i++)
//             {console.log((testdata.nodes)[i].name);
//                 ((testdata.nodes)[i].categories !== null) ? categories = '"' + (testdata.nodes)[i].categories + '"' : categories = null;
//                 ((testdata.nodes)[i].weblink !== null) ? url = '"' + (testdata.nodes)[i].weblink + '"' : url = null;
//                 ((testdata.nodes)[i].twitterH !== null) ? handle = '"' + (testdata.nodes)[i].twitterH + '"' : handle = null;
//                 ((testdata.nodes)[i].followers !== null) ? followers = parseInt((testdata.nodes)[i].followers) : followers = null;
//                 ((testdata.nodes)[i].numemp !== null) ? employees = parseInt((testdata.nodes)[i].numemp) : employees = null;
//                 ((testdata.nodes)[i].golr !== null) ? influence = '"' + (testdata.nodes)[i].golr + '"' : influence = null;
//                 ((testdata.nodes)[i].relatedto !== null) ? relations = '"' + (testdata.nodes)[i].relatedto + '"' : relations = null;
//                 ((testdata.nodes)[i].people !== null) ? keypeople = '"' + (testdata.nodes)[i].people + '"' : keypeople = null;
                

//                 //   Must manually insert the first row with the ID of zero to avoid foreign key constraint errors with bridges table.
//                 if(i == 0)
//                 {
//                     connection.query('INSERT INTO Entities ('
//                     + 'ID, Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, '
//                     + 'Employees, Influence, Relations, KeyPeople, IPAddress, IPGeolocation, TimeStamp) VALUES (' 
//                     + i + ',"'
//                     + (testdata.nodes)[i].name + '","' 
//                     + (testdata.nodes)[i].nickname + '","'
//                     + (testdata.nodes)[i].type + '",'
//                     + categories + ',"'
//                     + (testdata.nodes)[i].location + '",'
//                     + url + ','
//                     + handle + ','
//                     + followers + ','
//                     + employees + ','
//                     + influence + ',' 
//                     + relations + ','
//                     + keypeople + ','
//                     + ipAddr + ','
//                     + geo + ','
//                     + 'NOW());', function (err) {
//                          if (err) throw err;
//                     });
//                 }
//                 else
//                 {
//                     connection.query('INSERT INTO Entities ('
//                     + 'Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, '
//                     + 'Employees, Influence, Relations, KeyPeople, IPAddress, IPGeolocation, TimeStamp) VALUES (' 
//                     + '"'
//                     + (testdata.nodes)[i].name + '","' 
//                     + (testdata.nodes)[i].nickname + '","'
//                     + (testdata.nodes)[i].type + '",'
//                     + categories + ',"'
//                     + (testdata.nodes)[i].location + '",'
//                     + url + ','
//                     + handle + ','
//                     + followers + ','
//                     + employees + ','
//                     + influence + ',' 
//                     + relations + ','
//                     + keypeople + ','
//                     + ipAddr + ','
//                     + geo + ','
//                     + 'NOW());', function (err) {
//                          if (err) throw err;
//                     });
//                 }

//                 if((testdata.nodes)[i].rande !== null)
//                 {
//                     rev_exp = ((testdata.nodes)[i].rande).split('; ');

//                     if((testdata.nodes)[i].randeY !== null)
//                     {
//                         rev_exp_years = ((testdata.nodes)[i].randeY).split(', ');
//                     }
//                     else
//                     {
//                         for(var j = 0; j < rev_exp.length; j++)
//                         {
//                             rev_exp_years[j] = null;
//                         }
//                     }

//                     for(var k = 0; k < rev_exp.length; k++)
//                     {
//                         name_and_amt = rev_exp[k].split(':');
//                         //  Insert into the operations table.
//                         if(first_op_insertion === 0)
//                         {
//                             connection.query('INSERT INTO Operations ('
//                                 + 'ID, EntityID, Finance, Amount, Year) VALUES ('
//                                 + 0 + ', ' + i + ',"'
//                                 + name_and_amt[0] + '",'
//                                 + name_and_amt[1] + ','
//                                 + rev_exp_years[k]
//                                 + ');', function(err) {
//                                     if(err) throw err;
//                                 });
//                             //  Set this flag...
//                             first_op_insertion = 1;
//                         }
//                         else
//                         {
//                             connection.query('INSERT INTO Operations ('
//                                 + 'EntityID, Finance, Amount, Year) VALUES ('
//                                 + i + ',"'
//                                 + name_and_amt[0] + '",'
//                                 + name_and_amt[1] + ','
//                                 + rev_exp_years[k]
//                                 + ');', function(err) {
//                                     if(err) throw err;
//                                 });
//                         }
//                     }
//                 }
//             }

//             console.log('Finished');

//             //  ****** Must account for the grantsG / investmentG via the funding and investment connections
                    
//             for(var k = 0; k < (testdata.data).length; k++)
//             {
//                 if(k = 0)
//                 {
//                     connection.query('INSERT INTO Bridges ('
//                     + 'ID, Entity1ID, Entity2ID, Connection) VALUES (' 
//                     + k + ','
//                     + (testdata.data)[k].source + ',' 
//                     + (testdata.data)[k].target + ',"'
//                     +  'Data' + '");', function (err) {
//                          if (err) throw err;
//                     });
//                 }
//                 else
//                 {
//                     connection.query('INSERT INTO Bridges ('
//                     + 'Entity1ID, Entity2ID, Connection) VALUES (' 
//                     + (testdata.data)[k].source + ',' 
//                     + (testdata.data)[k].target + ',"'
//                     +  'Data' + '");', function (err) {
//                          if (err) throw err;
//                     });
//                 }  
//             }

//             for(var l = 0; l < (testdata.investingR).length; l++)
//             {
//                 connection.query('INSERT INTO Bridges ('
//                     + 'Entity1ID, Entity2ID, Connection, Amount) VALUES ('
//                     + (testdata.investingR)[l].source + ',' 
//                     + (testdata.investingR)[l].target + ',"'
//                     +  'Investment Received' + '",'
//                     +  (testdata.investingR)[l].amount
//                     + ');', function (err) {
//                          if (err) throw err;
//                     });
//             }

//             for(var m = 0; m < (testdata.fundingR).length; m++)
//             {
//                 connection.query('INSERT INTO Bridges ('
//                     + 'Entity1ID, Entity2ID, Connection, Amount) VALUES (' 
//                     + (testdata.fundingR)[m].source + ',' 
//                     + (testdata.fundingR)[m].target + ',"'
//                     +  'Funding Received' + '",'
//                     +  (testdata.fundingR)[m].amount
//                     + ');', function (err) {
//                          if (err) throw err;
//                     });
//             }

//             for(var n = 0; n < (testdata.porucs).length; n++)
//             {
//                  connection.query('INSERT INTO Bridges ('
//                     + 'Entity1ID, Entity2ID, Connection) VALUES ('  
//                     + (testdata.porucs)[n].source + ',' 
//                     + (testdata.porucs)[n].target + ',"'
//                     +  'Collaboration' + '");', function (err) {
//                          if (err) throw err;
//                     });
//             }

//             connection.end();
//         });
//     });
// });




// Delete Tables from database...
// connection.query('CREATE DATABASE IF NOT EXISTS athena', function(err){
//     if(err) throw err;
//     connection.query('USE athena', function(err){
//         if(err) throw err;
//         connection.query('DROP TABLE Operations', function(err){
//             if(err) throw err;
//         });
//         connection.query('DROP TABLE Bridges', function(err){
//             if(err) throw err;
//         });
//         connection.query('DROP TABLE Entities', function(err){
//             if(err) throw err;
//         });
//     });
// });





//  For exporting the data...
var getObjectFromRawData = function(data, name)
{
    for(var i = 0; i < (data.nodes).length; i++)
    {
        if((data.nodes)[i].name === name)
        {
            return (data.nodes)[i];
        }
    }
}

var exportData = function()
{
    var file = __dirname + '/public/data/final_data_neat.json';
    fs.readFile(file, 'utf8', function(err, data){

        if(err)
        {
            console.log('Error: ' + err)
        }
        
        var rawData = JSON.parse(data);

        console.log(JSON.stringify(rawData));

        var entities, connections, operations;

        //  Grab the data from the MYSQL database and export into a JSON file.
        connection.query('SELECT * FROM Entities', function(err, result){
            entities = result;
            // console.log(entities);

            connection.query('SELECT * FROM Bridges', function(err, result){
                connections = result;
                // console.log(connections);

                connection.query('SELECT * FROM Operations', function(err, result){
                    operations = result;
                    // console.log(operations);

                    //  Let's add the data to the necessary JSON
                    var content = {nodes:[], data_connections:[], funding_connections:[], investment_connections:[], collaboration_connections:[]};

                    content.nodes = entities.map(function(d){
                        var object = {};

                        object['ID'] = d.ID;
                        object['type'] = d.Type;
                        (d.Categories !== null) ? object['categories'] = (d.Categories).split(", ") : object['categories'] = null;
                        object['name'] = d.Name;
                        object['nickname'] = d.Nickname;
                        object['location'] = d.Location;
                        (d.Website !== null) ? object['url']  = d.Website : object['url'] = null;
                        (d.Employees !== null) ? object['employees']  = d.Employees : object['employees'] = null;
                        (d.KeyPeople !== null) ? object['key_people'] = d.KeyPeople.split(", ") : object['key_people'] = null;
                        (d.TwitterHandle !== null) ? object['twitter_handle'] = d.TwitterHandle : object['twitter_handle'] = null;
                        (d.Followers !== null) ? object['followers'] = d.Followers : object['followers'] = null;
                        (d.Relations !== null) ? object['relations'] = (d.Relations).split(", ") : object['relations'] = null;

                        var objectForConnectionData = getObjectFromRawData(rawData, d.Name);

                        if(objectForConnectionData.fundingR !== null)
                        {
                            object['funding_received'] = [];
                            var fundingInfo = (objectForConnectionData.fundingR).split("; ");
                            fundingInfo.forEach(function(d){
                                var entityAndAmount = d.split(':');
                                object['funding_received'].push({entity: entityAndAmount[0], amount: entityAndAmount[1], year: null});
                            });
                        }
                        else
                            object['funding_received'] = null;
                        
                        if(objectForConnectionData.investmentR !== null)
                        {
                            object['investments_received'] = [];
                            var investmentInfo = (objectForConnectionData.investmentR).split("; ");
                            investmentInfo.forEach(function(d){
                                var entityAndAmount = d.split(':');
                                object['investments_received'].push({entity: entityAndAmount[0], amount: entityAndAmount[1], year: null});
                            });
                        }
                        else
                            object['investments_received'] = null;

                        object['funding_given'] = null;
                        object['investments_made'] = null;

                        if(objectForConnectionData.poruc !== null)
                        {
                            object['collaborations'] = [];
                            var collaborationInfo = (objectForConnectionData.poruc).split("; ");
                            collaborationInfo.forEach(function(d){
                                object['collaborations'].push({entity: d});
                            });
                        }
                        else
                            object['collaborations'] = null;

                        if(objectForConnectionData.data !== null)
                        {
                            object['data'] = [];
                            var dataInfo = (objectForConnectionData.data).split("; ");
                            dataInfo.forEach(function(d){
                                object['data'].push({entity: d});
                            });
                        }
                        else
                            object['data'] = null;

                        object['revenue'] = null;
                        object['expenses'] = null;

                        (d.Influence !== null) ? object['influence'] = d.Influence : object['influence'] = null;

                        return object;
                    });

                    connections.filter(function(d){
                        return d.Connection === "Funding Received"
                    }).forEach(function(d){
                        (content.funding_connections).push({source: d.Entity1ID, target: d.Entity2ID, year: d.ConnectionYear, amount: d.Amount});
                    });

                    connections.filter(function(d){
                        return d.Connection === "Investment Received"
                    }).forEach(function(d){
                        (content.investment_connections).push({source: d.Entity1ID, target: d.Entity2ID, year: d.ConnectionYear, amount: d.Amount});
                    });

                    connections.filter(function(d){
                        return d.Connection === "Collaboration"
                    }).forEach(function(d){
                        (content.collaboration_connections).push({source: d.Entity1ID, target: d.Entity2ID});
                    });

                    connections.filter(function(d){
                        return d.Connection === "Data"
                    }).forEach(function(d){
                        (content.data_connections).push({source: d.Entity1ID, target: d.Entity2ID});
                    });

                    console.log(JSON.stringify(content.nodes, null, "\t"));

                    //  Let's add this data to an external file.
                    var file = __dirname + '/public/data/data.json';
                    fs.writeFile(file, JSON.stringify(content), function(err)
                    {
                        if(err) 
                        {
                            console.log(err);
                        } 
                        else 
                        {
                            console.log("The file was saved!");
                        }
                    });
                });
            });
        }); 
    });
};

exportData();


// connection.end();
module.exports = app;