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
connection.query('CREATE DATABASE IF NOT EXISTS athena', function (err) {
    if (err) throw err;
    connection.query('USE athena', function (err) {
        if (err) throw err;
        connection.query('CREATE TABLE IF NOT EXISTS Entities('
            + 'ID INT NOT NULL,'
            + 'Name VARCHAR(100) NOT NULL UNIQUE,'                  // Entity Name
            + 'Nickname VARCHAR(100),'                              // Nickname        
            + 'Type CHAR(30) NOT NULL,'                             // Type of Entity
            + 'Category VARCHAR(100),'                              // Category
            + 'Location VARCHAR(100),'                              // Location
            + 'Website VARCHAR(100),'                               // Website
            + 'TwitterHandle VARCHAR(100),'                         // Twitter Handle
            + 'TwitterFollowers VARCHAR(12),'                               // Number of Twitter Followers
            + 'Employees VARCHAR(12),'                                      // Number of Employees
            + 'TotalFunding INT,'                                   // In JSON
            + 'TotalInvestment INT,'                                // In JSON
            + 'GlobalLocal VARCHAR(8),'    
            + 'RelatedOrganizations VARCHAR(1000),'                  // Related To
            + 'KeyPeople VARCHAR(1000),'                             // Key People                
            + 'PRIMARY KEY(ID)'
            +  ')', function (err) {
                if (err) throw err;
            });

        connection.query('CREATE TABLE IF NOT EXISTS Bridges('
            + 'ID INT NOT NULL UNIQUE,'
            + 'Object1ID INT NOT NULL,'
            + 'Object2ID INT NOT NULL,'
            + 'Connection CHAR(30),'
            + 'ConnectionYear CHAR(4),'
            + 'Amount INT,'
            + 'PRIMARY KEY (ID),'
            + 'FOREIGN KEY (Object1ID) REFERENCES Entities(ID),'
            + 'FOREIGN KEY (Object2ID) REFERENCES Entities(ID)'
            + ')', function (err) {
                if(err) throw err;
            });

        connection.query('CREATE TABLE IF NOT EXISTS Monetary('
            + 'ID INT NOT NULL UNIQUE,'
            + 'ObjectID INT NOT NULL,'
            + 'MonetaryCategory CHAR(7) NOT NULL,'
            + 'Amount INT,'
            + 'Year CHAR(4),'
            + 'FOREIGN KEY (ObjectID) REFERENCES Entities(ID),'
            + '', function (err) {
                if(err) throw err;
            });

        // TAke JSON file and fill in the database...
        var fs = require('fs');
        var file = __dirname + '/final_data.json';

        fs.readFile(file, 'utf8', function(err, data){
            if(err){
                console.log('Error: ' + err)
            }
            testdata = JSON.parse(data);

             for(var i = 0; i < (testdata.nodes).length; i++)
            {
                connection.query('INSERT INTO Entities ('
                    + 'ID, Name, Nickname, Type, Category, Location, Website, TwitterHandle, TwitterFollowers, '
                    + 'Employees, GlobalLocal, RelatedOrganizations, KeyPeople) VALUES (' 
                    + '"' + i + '","' 
                    + (testdata.nodes)[i].name + '","' 
                    + (testdata.nodes)[i].nickname + '","'
                    + (testdata.nodes)[i].type + '","'
                    + (testdata.nodes)[i].categories + '","'
                    + (testdata.nodes)[i].location + '","'
                    + (testdata.nodes)[i].weblink + '","'
                    + (testdata.nodes)[i].twitterH + '","'
                    + (testdata.nodes)[i].followers + '","'
                    + (testdata.nodes)[i].numemp + '","'
                    + (testdata.nodes)[i].golr + '","' 
                    + (testdata.nodes)[i].relatedto + '","'
                    + (testdata.nodes)[i].people + '");', function (err) {
                         if (err) throw err;
                    });

                    for(var j = 0; j < (testdata.totalFR).length; j++)
                    {
                        if((testdata.nodes)[i].name === (testdata.totalFR)[j].name)
                            connection.query('UPDATE Entities SET '
                                    + 'TotalFunding = '
                                    + (testdata.totalFR).total 
                                    + ' WHERE ID = '
                                    + i
                                    + ';'  
                                    + ')', function (err){

                            });
                    }
            }
                    
            for(var k = 0; k < (testdata.affiliations).length; k++)
            {
                connection.query('INSERT INTO Bridges ('
                    + 'ID, Object1ID, Object2ID, Connection) VALUES (' 
                    + '"' + k + '","' 
                    + (testdata.affiliations)[k].source + '","' 
                    + (testdata.affiliations)[k].target + '","'
                    +  'Affiliation' + '");', function (err) {
                         if (err) throw err;
                    });
            }

            for(var l = 0; l < (testdata.investingR).length; l++)
            {
                connection.query('INSERT INTO Bridges ('
                    + 'ID, Object1ID, Object2ID, Connection, Amount) VALUES (' 
                    + '"' + (l + (testdata.affiliations).length) + '","' 
                    + (testdata.investingR)[l].source + '","' 
                    + (testdata.investingR)[l].target + '","'
                    +  'Investment' + '","'
                    +  (testdata.investingR)[l].amount
                    + '");', function (err) {
                         if (err) throw err;
                    });
            }

            for(var m = 0; m < (testdata.fundingR).length; m++)
            {
                connection.query('INSERT INTO Bridges ('
                    + 'ID, Object1ID, Object2ID, Connection, Amount) VALUES (' 
                    + '"' + (m + (testdata.investingR).length + (testdata.affiliations).length) + '","' 
                    + (testdata.fundingR)[m].source + '","' 
                    + (testdata.fundingR)[m].target + '","'
                    +  'Funding' + '","'
                    +  (testdata.fundingR)[m].amount
                    + '");', function (err) {
                         if (err) throw err;
                    });
            }

            for(var n = 0; n < (testdata.porucs).length; n++)
            {
                 connection.query('INSERT INTO Bridges ('
                    + 'ID, Object1ID, Object2ID, Connection) VALUES (' 
                    + '"' + (n + (testdata.fundingR).length + (testdata.investingR).length + (testdata.affiliations).length) + '","' 
                    + (testdata.porucs)[n].source + '","' 
                    + (testdata.porucs)[n].target + '","'
                    +  'Collaborations' + '");', function (err) {
                         if (err) throw err;
                    });
            }
        });
        
    });
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
