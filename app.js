var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var routes = require('./routes/index');
var users = require('./routes/users');
var dbactions = require('./routes/dbactions');
var staticaction = require('./routes/staticaction');
var ajaxaction = require('./routes/ajax');

var app = express();

// var port = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.all('/dbview', function(req, res, next) {
//         // An attempt to handle the CORS issue with post methods to Express routes
//   res.header("Access-Control-Allow-Origin", "*");
//       res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   if (req.method === 'OPTIONS') {
//     res.send(200);
//   }
//   else {
//     next();
//   }
// });

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//     extended: true
// }));
var parseUrlencoded = bodyParser.urlencoded({extended:false});

app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/dbview', dbactions);
app.use('/static', staticaction);
app.use('/ajax', ajaxaction);

//  Database credentials - Azure via ClearDB
// var connection = mysql.createConnection(
//     {
//       port: 3306,
//       host: 'us-cdbr-azure-east-b.cloudapp.net',
//       user: 'b5a370a8f6d91a',
//       password: 'e928dad7',
//       database: 'athena'
//     }
// );

// connection.connect();
 
// console.log("Successful connection!");

//  For debugging purposes
var logger = require('./logger');
app.use(logger);

var handleData = require('./routes/handleData'); 
app.post('/handleData', parseUrlencoded, function(request, response){
    // console.log(request.body);

    var entity = request.body;
    
    //  Convert ALL empty strings to null...
    for(var property in entity)
    {
        if(entity[property] === "")
        {
            entity[property] = null;
        }
    }

    if(entity.funding_received !== null)
    {
        for(var i = 0; i < entity.funding_received.length; i++)
        {
            var funding = entity.funding_received[i];
            if(funding.amount === "")
                funding.amount = null;
            if(funding.year === "")
                funding.year = null;
        }
    }

    if(entity.investments_received !== null)
    {
        for(var i = 0; i < entity.investments_received.length; i++)
        {
            var investment = entity.investments_received[i];
            if(investment.amount === "")
                investment.amount = null;
            if(investment.year === "")
                investment.year = null;
        }
    }

    if(entity.funding_given !== null)
    {
        for(var i = 0; i < entity.funding_given.length; i++)
        {
            var funding = entity.funding_given[i];
            if(funding.amount === "")
                funding.amount = null;
            if(funding.year === "")
                funding.year = null;
        }
    }

    if(entity.investments_made !== null)
    {
        for(var i = 0; i < entity.investments_made.length; i++)
        {
            var investment = entity.investments_made[i];
            if(investment.amount === "")
                investment.amount = null;
            if(investment.year === "")
                investment.year = null;
        }
    }

    if(entity.revenue !== null)
    {
        for(var i = 0; i < entity.revenue.length; i++)
        {
            var revenue_item = entity.revenue[i];
            if(revenue_item.amount === "")
                revenue_item.amount = null;
            if(revenue_item.year === "")
                revenue_item.year = null;
        }
    }

    if(entity.expenses !== null)
    {
        for(var i = 0; i < entity.expenses.length; i++)
        {
            var expense = entity.expenses[i];
            if(expense.amount === "")
                expense.amount = null;
            if(expense.year === "")
                expense.year = null;
        }
    }


    // if(entity.grants !== null)
    // {
    //     for(var i = 0; i < entity.grants.length; i++)
    //     {
    //         var grant = entity.grants[i];
    //         if(grant.amount === "")
    //             grant.amount = null;
    //         if(grant.year === "")
    //             grant.year = null;
    //     }
    // }

    // SELECT LAST(column_name) FROM table_name;

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% This query updates auto_increment to ensure the nodes are and links are properly done.
//     use `Athena`;
// set @count = -1;
// update `Entities` set `ID` = @count := @count + 1;
// ALTER TABLE `Entities` AUTO_INCREMENT = 0;
// SELECT * FROM athena.entities;

    console.log(entity);

    var connection = mysql.createConnection(
    {
      port: 3306,
      host: 'us-cdbr-azure-east-b.cloudapp.net',
      user: 'b5a370a8f6d91a',
      password: 'e928dad7',
      database: 'athena'
    });

    connection.connect();

    
 
    connection.query('USE athena', function(err){
         if(err) throw err;

         console.log("Successful connection!");
         // connection.query('SELECT LAST_INSERT_ID() FROM Entities', function(err, idValue){
         //    console.log(idValue);
         // });
    var followers, employees, categories, url,
        twitter_handle, influence,
        relations, key_people;

    (entity.categories !== null) ? categories = '"' + entity.categories.join(", ") + '"' : categories = null;
    (entity.url !== null) ? url = '"' + entity.url + '"' : url = null;
    (entity.twitter_handle !== null) ? twitter_handle = '"' + entity.twitter_handle + '"' : twitter_handle = null;
    (entity.followers !== null) ? followers = entity.followers : followers = null;
    (entity.employees !== null) ? employees = entity.employees : employees = null;
    (entity.influence !== null) ? influence = '"' + entity.influence + '"' : influence = null;
    (entity.relations !== null) ? relations = '"' + entity.relations.join(", ") + '"' : relations = null;
    (entity.key_people !== null) ? key_people = '"' + entity.key_people.join(", ") + '"' : key_people = null;

            // connection.query('SET @@auto_increment_increment=1;', function(err){
            // if(err) throw err;


            //  Need to check if it exists prior to entering into the database.

        connection.query('INSERT INTO Entities ('
                    + 'ID, Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, '
                    + 'Employees, Influence, Relations, KeyPeople, TimeStamp) VALUES ('
                    + 'LAST_INSERT_ID()+1' + ',"' 
                    + entity.name + '","' 
                    + entity.nickname + '","'
                    + entity.type + '",'
                    + categories + ',"'
                    + entity.location + '",'
                    + url + ','
                    + twitter_handle + ','
                    + followers + ','
                    + employees + ','
                    + influence + ',' 
                    + relations + ','
                    + key_people + ','
                    + 'NOW());', function (err, result) {
                         if (err) throw err;
                         console.log(result.insertId);

                         (entity.funding_received).forEach(function(object){


                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "'", function(err, rows, fields){
                                if(rows !== undefined && rows.length >= 1)
                                {
                                    // If the entity already exists, use its ID for the entity id when inserting into connections...
                                    connection.query('INSERT INTO Bridges ('
                                        + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES ('
                                        + result.insertId + ',' 
                                        + rows[0].ID + ',"'
                                        +  'Funding Received' + '",'
                                        +  object.year + ','
                                        +  object.amount
                                        + ');', function (err) {
                                             if (err) throw err;
                                        });
                                    console.log("Inside condition");
                                }
                            });
                         });

                        (entity.investments_received).forEach(function(object){


                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "'", function(err, rows, fields){
                                if(rows !== undefined && rows.length >= 1)
                                {
                                    // If the entity already exists, use its ID for the entity id when inserting into connections...
                                    connection.query('INSERT INTO Bridges ('
                                        + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES ('
                                        + result.insertId + ',' 
                                        + rows[0].ID + ',"'
                                        +  'Investments Received' + '",'
                                        +  object.year + ','
                                        +  object.amount
                                        + ');', function (err) {
                                             if (err) throw err;
                                        });
                                    console.log("Inside condition");
                                }
                            });
                         });

                         (entity.investments_made).forEach(function(object){


                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "'", function(err, rows, fields){
                                if(rows !== undefined && rows.length >= 1)
                                {
                                    // If the entity already exists, use its ID for the entity id when inserting into connections...
                                    connection.query('INSERT INTO Bridges ('
                                        + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES ('
                                        + result.insertId + ',' 
                                        + rows[0].ID + ',"'
                                        +  'Investments Made' + '",'
                                        +  object.year + ','
                                        +  object.amount
                                        + ');', function (err) {
                                             if (err) throw err;
                                        });
                                    console.log("Inside condition");
                                }
                            });
                         });

                        (entity.funding_given).forEach(function(object){


                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "'", function(err, rows, fields){
                                if(rows !== undefined && rows.length >= 1)
                                {
                                    // If the entity already exists, use its ID for the entity id when inserting into connections...
                                    connection.query('INSERT INTO Bridges ('
                                        + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES ('
                                        + result.insertId + ',' 
                                        + rows[0].ID + ',"'
                                        +  'Funding Given' + '",'
                                        +  object.year + ','
                                        +  object.amount
                                        + ');', function (err) {
                                             if (err) throw err;
                                        });
                                    console.log("Inside condition");
                                }
                            });
                         });

                    (entity.data).forEach(function(object){


                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "'", function(err, rows, fields){
                                if(rows !== undefined && rows.length >= 1)
                                {
                                    // If the entity already exists, use its ID for the entity id when inserting into connections...
                                    connection.query('INSERT INTO Bridges ('
                                        + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES ('
                                        + result.insertId + ',' 
                                        + rows[0].ID + ',"'
                                        +  'Data' + '",'
                                        +  object.year + ','
                                        +  object.amount
                                        + ');', function (err) {
                                             if (err) throw err;
                                        });
                                    console.log("Inside condition");
                                }
                            });
                         });

                    (entity.collaborations).forEach(function(object){


                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "'", function(err, rows, fields){
                                if(rows !== undefined && rows.length >= 1)
                                {
                                    // If the entity already exists, use its ID for the entity id when inserting into connections...
                                    connection.query('INSERT INTO Bridges ('
                                        + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES ('
                                        + result.insertId + ',' 
                                        + rows[0].ID + ',"'
                                        +  'Collaboration' + '",'
                                        +  object.year + ','
                                        +  object.amount
                                        + ');', function (err) {
                                             if (err) throw err;
                                        });
                                    console.log("Inside condition");
                                }
                            });
                         });

                         
                    });

        });


        


    // });


    

    // connection.query('USE athena', function (err) {
    //     if (err) throw err;
    //     connection.query('INSERT INTO Entities ('
    //                 + 'ID, Name, Nickname, Type, Category, Location, Website, TwitterHandle, TwitterFollowers, '
    //                 + 'Employees, GlobalLocal, RelatedOrganizations, KeyPeople) VALUES (' 
    //                 + '"' + 150 + '","' 
    //                 + entity.name + '","' 
    //                 + entity.nickname + '","'
    //                 + entity.type + '","'
    //                 + entity.categories + '","'
    //                 + entity.location + '","'
    //                 + entity.weblink + '","'
    //                 + entity.twitterH + '","'
    //                 + entity.followers + '","'
    //                 + entity.numemp + '","'
    //                 + entity.golr + '","' 
    //                 + entity.relatedto + '","'
    //                 + entity.people + '");', function (err) {
    //                      if (err) throw err;
    //                 });
    // });

    //DELETE FROM `athena`.`entities` WHERE `ID`='150';
    // connection.query('SELECT LAST(Name) FROM Entities;', function(err, rows, fields){
    //     if(err) throw err;
    //     for(var i in rows){
    //         console.log(i);
    //     }
    // });

    // console.log("New object" + JSON.stringify(entity));
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

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

// Configuration
// app.set('port', port);
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade'); 
// app.use(express.static(path.join(__dirname, 'public')));

// Potential resolution???
// app.all('*', function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
//     res.header('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With');
//     res.header('Access-Control-Allow-Credentials', 'true');

//      if( req.method.toLowerCase() === "options" ) {
//         res.send( 200 );
//     }
//     else {
//         next();
//     }
// });



// Main route sends our HTML file
 


// app.post('/', function(req, res) {
//     console.log(req.body);
// });
 
// Update MySQL database
app.post('/dbview', function (req, res) {
    console.log((req.body).name);
    // connection.query('INSERT INTO users (name) VALUES (?)', (req.body).name, 
    //     function (err, result) {
    //         if (err) throw err;
    //         // res.send('User added to database with ID: ' + result.insertId);
    //     }
    // );
});

// app.post('/dbview', function (req, res) {
//     console.log((req.body));
//     temp = (req.body).name;
//     connection.query('DELETE FROM users WHERE name = (?)', (req.body).name, 
//         function (err, result) {
//             if (err) throw err;
//             console.log(result);
//             res.send('User deleted from database.');
//         }
//     );
// });

app.post('/ajax', function(req, res){
    console.log('processing');
    res.send('processing the login form');
});
 
// connection.end();
module.exports = app;

// app.get('/ajax', function(req, res, next){
//     var obj = {};
//     console.log('body: ' + JSON.stringify(req.body));
//     res.end('{"success" : "Updated Successfully", "status" : 200}');

// });



// app.listen(app.get('port'));
