var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

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
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//  Database credentials - Azure via ClearDB
var connection = mysql.createConnection(
    {
      port: 3306,
      host: 'us-cdbr-azure-east-b.cloudapp.net',
      user: 'b5a370a8f6d91a',
      password: 'e928dad7',
      database: 'athena'
    }
);

connection.connect();
 
console.log("Successful connection!");

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
//             + 'Nickname VARCHAR(100) NOT NULL UNIQUE,'                              // Nickname        
//             + 'Type VARCHAR(30) NOT NULL,'                             // Type of Entity
//             + 'Category VARCHAR(100),'                              // Category
//             + 'Location VARCHAR(100) NOT NULL,'                              // Location
//             + 'Website VARCHAR(100),'                               // Website
//             + 'TwitterHandle VARCHAR(50),'                         // Twitter Handle
//             + 'Followers INT,'                               // Number of Twitter Followers
//             + 'Employees INT,'                                      // Number of Employees
//             + 'TotalFunding INT,'                                   // In JSON
//             + 'TotalInvestment INT,'                                // In JSON
//             + 'Influence VARCHAR(8),'    
//             + 'Relations VARCHAR(1000),'                  // Related To
//             + 'KeyPeople VARCHAR(1000),'                             // Key People                
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
//             + 'FOREIGN KEY (Entity1ID) REFERENCES Entities(ID),'
//             + 'FOREIGN KEY (Entity2ID) REFERENCES Entities(ID)'
//             + ')', function (err) {
//                 if(err) throw err;
//             });

//         connection.query('CREATE TABLE IF NOT EXISTS Operations('
//             + 'ID INT NOT NULL AUTO_INCREMENT UNIQUE,'
//             + 'EntityID INT NOT NULL,'
//             + 'Finance VARCHAR(10) NOT NULL,'
//             + 'Amount INT,'
//             + 'Year INT,'
//             + 'FOREIGN KEY (EntityID) REFERENCES Entities(ID)'
//             + ')', function (err) {
//                 if(err) throw err;
//             });

//         connection.query('SET @@auto_increment_increment=1;', function(err){
//             if(err) throw err;
//         });

//         connection.query('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";', function(err){
//             if(err) throw err;
//         });

//         // TAke JSON file and fill in the database...
//         var fs = require('fs');
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
//             {
//                 ((testdata.nodes)[i].categories !== null) ? categories = '"' + (testdata.nodes)[i].categories + '"' : categories = null;
//                 ((testdata.nodes)[i].weblink !== null) ? url = '"' + (testdata.nodes)[i].weblink + '"' : url = null;
//                 ((testdata.nodes)[i].twitterH !== null) ? handle = '"' + (testdata.nodes)[i].twitterH + '"' : handle = null;
//                 ((testdata.nodes)[i].followers !== null) ? followers = parseInt((testdata.nodes)[i].followers) : followers = null;
//                 ((testdata.nodes)[i].numemp !== null) ? employees = parseInt((testdata.nodes)[i].numemp) : employees = null;
//                 ((testdata.nodes)[i].golr !== null) ? influence = '"' + (testdata.nodes)[i].golr + '"' : influence = null;
//                 ((testdata.nodes)[i].relatedto !== null) ? relations = '"' + (testdata.nodes)[i].relatedto + '"' : relations = null;
//                 ((testdata.nodes)[i].people !== null) ? keypeople = '"' + (testdata.nodes)[i].people + '"' : keypeople = null;

//                 // console.log('INSERT INTO Entities ('
//                 //     + 'Name, Nickname, Type, Category, Location, Website, TwitterHandle, Followers, '
//                 //     + 'Employees, Influence, Relations, KeyPeople) VALUES (' 
//                 //     + '"'
//                 //     + (testdata.nodes)[i].name + '","' 
//                 //     + (testdata.nodes)[i].nickname + '","'
//                 //     + (testdata.nodes)[i].type + '",'
//                 //     + categories + ',"'
//                 //     + (testdata.nodes)[i].location + '",'
//                 //     + url + ','
//                 //     + handle + ','
//                 //     + followers + ','
//                 //     + employees + ','
//                 //     + influence + ',' 
//                 //     + relations + ','
//                 //     + keypeople + ');');

//                 //   Must manually insert the first row with the ID of zero to avoid foreign key constraint errors with bridges table.
//                 if(i == 0)
//                 {
//                     connection.query('INSERT INTO Entities ('
//                     + 'ID, Name, Nickname, Type, Category, Location, Website, TwitterHandle, Followers, '
//                     + 'Employees, Influence, Relations, KeyPeople) VALUES (' 
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
//                     + keypeople + ');', function (err) {
//                          if (err) throw err;
//                     });
//                 }
//                 else
//                 {
//                     connection.query('INSERT INTO Entities ('
//                     + 'Name, Nickname, Type, Category, Location, Website, TwitterHandle, Followers, '
//                     + 'Employees, Influence, Relations, KeyPeople) VALUES (' 
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
//                     + keypeople + ');', function (err) {
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
//                     +  'Investment' + '",'
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
//                     +  'Funding' + '",'
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
//                     +  'Collaborations' + '");', function (err) {
//                          if (err) throw err;
//                     });
//             }
//         });
        
//     });
// });

var entities, connections, operations;
//  Grab the data from the MYSQL database and export into a JSON file.
connection.query('SELECT * FROM Entities', function(err, result){
    entities = result;
});
connection.query('SELECT * FROM Connections', function(err, result){
    connections = result;
});
connection.query('SELECT * FROM Operations', function(err, result){
    operations = result;
});




//  Creating the Users table...
// connection.query('CREATE DATABASE IF NOT EXISTS athena', function (err) {
//     if (err) throw err;
//     connection.query('USE athena', function (err) {
//         if (err) throw err;
//         connection.query('CREATE TABLE IF NOT EXISTS users('
//             + 'id INT NOT NULL AUTO_INCREMENT,'
//             + 'PRIMARY KEY(id),'
//             + 'name VARCHAR(30)'
//             +  ')', function (err) {
//                 if (err) throw err;
//             });
//     });
// });

// connection.end();
module.exports = app;