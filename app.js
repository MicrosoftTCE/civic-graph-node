var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var fs = require('fs');
var async = require('async');

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

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
var parseUrlencoded = bodyParser.urlencoded({
  extended: false
});

app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/dbview', dbactions);
app.use('/static', staticaction);
app.use('/ajax', ajaxaction);

//  For debugging purposes
var logger = require('./logger');
app.use(logger);

var handleData = require('./routes/handleData');
app.post('/handleData', parseUrlencoded, function(request, response) {
    // console.log(request.body);

    //  Cleans up the sent stringified data.
    var entity = request.body;

    //  Convert ALL empty strings to null...
    for (var property in entity) {
        if (entity[property] === "") {
            entity[property] = null;
        }
    }

    if (entity.funding_received !== null) {
        for (var i = 0; i < entity.funding_received.length; i++) {
            var funding = entity.funding_received[i];
            if (funding.amount === "")
                funding.amount = null;
            if (funding.year === "")
                funding.year = null;
        }
    }

    if (entity.investments_received !== null) {
        for (var i = 0; i < entity.investments_received.length; i++) {
            var investment = entity.investments_received[i];
            if (investment.amount === "")
                investment.amount = null;
            if (investment.year === "")
                investment.year = null;
        }
    }

    if (entity.funding_given !== null) {
        for (var i = 0; i < entity.funding_given.length; i++) {
            var funding = entity.funding_given[i];
            if (funding.amount === "")
                funding.amount = null;
            if (funding.year === "")
                funding.year = null;
        }
    }

    if (entity.investments_made !== null) {
        for (var i = 0; i < entity.investments_made.length; i++) {
            var investment = entity.investments_made[i];
            if (investment.amount === "")
                investment.amount = null;
            if (investment.year === "")
                investment.year = null;
        }
    }

    if (entity.revenue !== null) {
        for (var i = 0; i < entity.revenue.length; i++) {
            var revenue_item = entity.revenue[i];
            if (revenue_item.amount === "")
                revenue_item.amount = null;
            if (revenue_item.year === "")
                revenue_item.year = null;
        }
    }

    if (entity.expenses !== null) {
        for (var i = 0; i < entity.expenses.length; i++) {
            var expense = entity.expenses[i];
            if (expense.amount === "")
                expense.amount = null;
            if (expense.year === "")
                expense.year = null;
        }
    }

    console.log(entity);

    var connection = mysql.createConnection({
        port: 3306,
        host: 'us-cdbr-azure-east-b.cloudapp.net',
        user: 'b5a370a8f6d91a',
        password: 'e928dad7',
        database: 'athena'
    });

    connection.connect();

    // connection.query('USE athena', function(err){
    //   if(err) throw err;

    //   connection.query("SELECT * FROM Bridges WHERE " + "Entity1ID=" + 1 + " OR " + "Entity2ID=" + 1, function(err, rows, fields){
    //       // object['funding_received']
    //       // object['funding_given']
    //       // object['investments_received']
    //       // object['investments_made']
    //       // object['collaborations']
    //       // object['data'] 
    //       console.log(rows);
    //       console.log(fields);
    //   });
    // });

    // use `Athena`;
    // set @count = -1;
    // update `Entities` set `ID` = @count := @count + 1;
    // ALTER TABLE `Entities` AUTO_INCREMENT = 0;
    // SELECT * FROM athena.entities;

    var content = {
        nodes: [], data_connections: [], funding_connections: [], investment_connections: [], collaboration_connections: []
    };

    var acquireNodes = function(d, callback) {
    

      connection.query("SELECT Entities.Name, Bridges.Entity1ID, Bridges.Entity2ID, Bridges.Connection, Bridges.ConnectionYear, Bridges.Amount FROM Bridges INNER JOIN Entities ON Bridges.Entity2ID=Entities.ID AND Bridges.Entity1ID=" + d.ID, function(err, rows, fields) {
              if (err) return err;
              connection.query("SELECT * FROM operations WHERE EntityID=" + d.ID, function(err, operationRows, operationFields){
                  var object = {};
                  object['ID'] = d.ID;
                  object['type'] = d.Type;
                  (d.Categories !== null) ? object['categories'] = (d.Categories).split(", "): object['categories'] = null;
                  object['name'] = d.Name;
                  object['nickname'] = d.Nickname;
                  object['location'] = d.Location;
                  (d.Website !== null) ? object['url'] = d.Website: object['url'] = null;
                  (d.Employees !== null) ? object['employees'] = d.Employees: object['employees'] = null;
                  (d.KeyPeople !== null) ? object['key_people'] = d.KeyPeople.split(", "): object['key_people'] = null;
                  (d.TwitterHandle !== null) ? object['twitter_handle'] = d.TwitterHandle: object['twitter_handle'] = null;
                  (d.Followers !== null) ? object['followers'] = d.Followers: object['followers'] = null;
                  (d.Relations !== null) ? object['relations'] = (d.Relations).split(", "): object['relations'] = null;
                  (d.Influence !== null) ? object['influence'] = d.Influence: object['influence'] = null;
                  object['funding_received'] = [];
                  object['funding_given'] = [];
                  object['investments_received'] = [];
                  object['investments_made'] = [];
                  object['collaborations'] = [];
                  object['data'] = [];
                  object['revenue'] = [];
                  object['expenses'] = [];

                  rows.forEach(function(e) {
                    switch (e.Connection) {
                      case "Funding Received":
                        // console.log(JSON.stringify({entity: entRows[0].Name, amount: e.Amount, year: e.ConnectionYear}));
                        object['funding_received'].push({
                          entity: e.Name,
                          amount: e.Amount,
                          year: e.ConnectionYear
                        });
                        break;
                      case "Funding Given":
                        object['funding_given'].push({
                          entity: e.Name,
                          amount: e.Amount,
                          year: e.ConnectionYear
                        });
                        break;
                      case "Investment Received":
                        object['investments_received'].push({
                            entity: e.Name,
                            amount: e.Amount,
                            year: e.ConnectionYear
                        });
                        break;
                      case "Investment Made":
                        object['investments_made'].push({
                          entity: e.Name,
                          amount: e.Amount,
                          year: e.ConnectionYear
                        });
                        break;
                      case "Collaboration":
                        object['collaborations'].push({
                          entity: e.Name
                        });
                        break;
                      case "Data":
                        object['data'].push({
                          entity: e.Name
                        });
                        break;
                      default:
                        break;
                    }
                  });

                  operationRows.forEach(function(e){
                    switch(e.Finance) {
                      case "Revenue":
                        object['revenue'].push({amount: e.Amount, year: e.Year});
                        break;
                      case "Expenses":
                        object['expenses'].push({amount: e.Amount, year: e.Year});
                        break;
                      default:
                        break;
                    }
                  });

                  object['render'] = d.Render;

                  if(object['funding_received'].length === 0)
                    object['funding_received'] = null;
                  if(object['funding_given'].length === 0)
                    object['funding_given'] = null;
                  if(object['investments_received'].length === 0)
                    object['investments_received'] = null;
                  if(object['investments_made'].length === 0)
                    object['investments_made'] = null;
                  if(object['collaborations'].length === 0)
                    object['collaborations'] = null;
                  if(object['data'].length === 0)
                    object['data'] = null;
                  if(object['revenue'].length === 0)
                    object['revenue'] = null;
                  if(object['expenses'].length === 0)
                    object['expenses'] = null;
                  
                  console.log(object);
                  callback(null, object);
              });
        
      });

  };

  var done = function(err, result) {
                                              
    content.nodes = result;
    
    var file = __dirname + '/public/data/civic.json';
    fs.writeFile(file, JSON.stringify(content), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    });
  };

  var insertNode = function(entity, categories, url, twitter_handle, followers, employees, influence, relations, key_people) {
    connection.query('INSERT INTO Entities (Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + entity.name + '","' + entity.nickname + '","' + entity.type + '",' + categories + ',"' + entity.location + '",' + url + ',' + twitter_handle + ',' + followers + ',' + employees + ',' + influence + ',' + relations + ',' + key_people + ',' + 'NOW(), 1);', function(err, result) {
          if (err) throw err;

          console.log(result.insertId);

          if (entity.funding_received !== null) {
              (entity.funding_received).forEach(function(object) {
                  connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "' OR Nickname = " + "'" + (object.name) + "'", function(err, rows, fields) {
                      if (rows !== undefined && rows.length >= 1) {
                          // If the entity already exists, use its ID for the entity id when inserting into connections...
                          connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES (' + result.insertId + ',' + rows[0].ID + ',"' + 'Funding Received' + '",' + object.year + ',' + object.amount + ');', function(err) {
                              if (err) throw err;
                          });
                          
                      }
                      else
                      {
                        connection.query('INSERT INTO Entities (' + 'Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, ' + 'Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + (object.name) + '","' + (object.name) + '","' + 'Unknown' + '",' + null + ',"' + 'Unknown' + '",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(), 0);', function(err, resultInner) {
                            if (err) throw err;
                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "' OR Nickname = " + "'" + (object.name) + "'", function(err, innerRows, innerFields) {
                              if (err) throw err;
                              connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"' + 'Funding Received' + '",' + object.year + ',' + object.amount + ');', function(err) {
                                if (err) throw err;
                              });
                            });
                            
                        });
                      }
                  });
              });
          }

          if (entity.investments_received !== null) {
              (entity.investments_received).forEach(function(object) {
                  connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "' OR Nickname = " + "'" + (object.name) + "'", function(err, rows, fields) {
                      if (rows !== undefined && rows.length >= 1) {
                          // If the entity already exists, use its ID for the entity id when inserting into connections...
                          connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES (' + result.insertId + ',' + rows[0].ID + ',"' + 'Investment Received' + '",' + object.year + ',' + object.amount + ');', function(err) {
                              if (err) throw err;
                          });
                          
                      }
                      else
                      {
                        connection.query('INSERT INTO Entities (' + 'Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, ' + 'Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + (object.name) + '","' + (object.name) + '","' + 'Unknown' + '",' + null + ',"' + 'Unknown' + '",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(), 0);', function(err, resultInner) {
                            if (err) throw err;
                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "' OR Nickname = " + "'" + (object.name) + "'", function(err, innerRows, innerFields) {
                              if (err) throw err;
                              connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"' + 'Investment Received' + '",' + object.year + ',' + object.amount + ');', function(err) {
                                if (err) throw err;
                              });
                            });
                            
                        });
                      }
                  });
              });
          }

          if (entity.investments_made !== null) {
              (entity.investments_made).forEach(function(object) {
                  connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "' OR Nickname = " + "'" + (object.name) + "'", function(err, rows, fields) {
                      if (rows !== undefined && rows.length >= 1) {
                          // If the entity already exists, use its ID for the entity id when inserting into connections...
                          connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES (' + result.insertId + ',' + rows[0].ID + ',"' + 'Investment Made' + '",' + object.year + ',' + object.amount + ');', function(err) {
                              if (err) throw err;
                          });
                          
                      }
                      else
                      {
                        connection.query('INSERT INTO Entities (' + 'Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, ' + 'Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + (object.name) + '","' + (object.name) + '","' + 'Unknown' + '",' + null + ',"' + 'Unknown' + '",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(), 0);', function(err, resultInner) {
                            if (err) throw err;
                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "' OR Nickname = " + "'" + (object.name) + "'", function(err, innerRows, innerFields) {
                              if (err) throw err;
                              connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"' + 'Investment Made' + '",' + object.year + ',' + object.amount + ');', function(err) {
                                if (err) throw err;
                              });
                            });
                            
                        });
                      }
                  });
              });
          }

          if (entity.funding_given !== null) {
              (entity.funding_given).forEach(function(object) {
                  connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "' OR Nickname = " + "'" + (object.name) + "'", function(err, rows, fields) {
                      if (rows !== undefined && rows.length >= 1) {
                          // If the entity already exists, use its ID for the entity id when inserting into connections...
                          connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES (' + result.insertId + ',' + rows[0].ID + ',"' + 'Funding Given' + '",' + object.year + ',' + object.amount + ');', function(err) {
                              if (err) throw err;
                          });
                          
                      }
                      else
                      {
                        connection.query('INSERT INTO Entities (' + 'Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, ' + 'Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + (object.name) + '","' + (object.name) + '","' + 'Unknown' + '",' + null + ',"' + 'Unknown' + '",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(), 0);', function(err, resultInner) {
                            if (err) throw err;
                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "' OR Nickname = " + "'" + (object.name) + "'", function(err, innerRows, innerFields) {
                              if (err) throw err;
                              connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection, ConnectionYear, Amount) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"' + 'Funding Given' + '",' + object.year + ',' + object.amount + ');', function(err) {
                                if (err) throw err;
                              });
                            });
                            
                        });
                      }
                  });
              });
          }

          if (entity.data !== null) {
              for (var i = 0; i < entity.data.length; i++) {
                  connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (entity.data[i]) + "' OR Nickname = " + "'" + (entity.data[i]) + "'", function(err, rows, fields) {
                      if (rows !== undefined && rows.length >= 1) {
                          // If the entity already exists, use its ID for the entity id when inserting into connections...
                          connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection) VALUES (' + result.insertId + ',' + rows[0].ID + ',"' + 'Data' + '");', function(err) {
                              if (err) throw err;
                          });
                          
                      }
                      else
                      {
                        connection.query('INSERT INTO Entities (' + 'Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, ' + 'Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + (object.name) + '","' + (object.name) + '","' + 'Unknown' + '",' + null + ',"' + 'Unknown' + '",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(), 0);', function(err, resultInner) {
                            if (err) throw err;
                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "' OR Nickname = " + "'" + (object.name) + "'", function(err, innerRows, innerFields) {
                              if (err) throw err;
                              connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"' + 'Data' + '");', function(err) {
                                if (err) throw err;
                              });
                            });
                            
                        });
                      }
                  });
              }
          }

          if (entity.collaborations !== null) {
              for (var i = 0; i < entity.collaborations.length; i++) {
                  connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (entity.collaborations[i]) + "' OR Nickname = " + "'" + (entity.collaborations[i]) + "'", function(err, rows, fields) {
                      if (rows !== undefined && rows.length >= 1) {
                          // If the entity already exists, use its ID for the entity id when inserting into connections...
                          connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection) VALUES (' + result.insertId + ',' + rows[0].ID + ',"' + 'Collaboration' + '");', function(err) {
                              if (err) throw err;
                          });
                          
                      }
                      else
                      {
                        connection.query('INSERT INTO Entities (' + 'Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, ' + 'Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + (object.name) + '","' + (object.name) + '","' + 'Unknown' + '",' + null + ',"' + 'Unknown' + '",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(), 0);', function(err, resultInner) {
                            if (err) throw err;
                            connection.query('SELECT * FROM Entities WHERE Name = ' + "'" + (object.name) + "' OR Nickname = " + "'" + (object.name) + "'", function(err, innerRows, innerFields) {
                              if (err) throw err;
                              connection.query('INSERT INTO Bridges (' + 'Entity1ID, Entity2ID, Connection) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"' + Collaboration + '");', function(err) {
                                if (err) throw err;
                              });
                            });
                            
                        });
                      }
                  });
              }
          }

          if (entity.revenue !== null) {
              (entity.revenue).forEach(function(object) {
                  var id = result.insertId;

                  connection.query('INSERT INTO Operations (' + 'EntityID, Finance, Amount, Year) VALUES (' + id + ',"' + 'Revenue' + '",' + object.amount + ',' + object.year + ');', function(err) {
                      if (err) throw err;
                  });
              });
          }

          if (entity.expenses !== null) {
              (entity.expenses).forEach(function(object) {
                  var id = result.insertId;

                  connection.query('INSERT INTO Operations (' + 'EntityID, Finance, Amount, Year) VALUES (' + id + ',"' + 'Expenses' + '",' + object.amount + ',' + object.year + ');', function(err) {
                      if (err) throw err;
                  });
              });
          }
          //  Time to export this data to a json file!
          connection.query("SET @count = -1;", function(err) {
              if (err) throw err;
              connection.query("UPDATE `Entities` SET `ID` = @count := @count + 1;", function(err) {
                  if (err) throw err;

                  connection.query('SELECT * FROM Entities', function(err, result) {
                      entities = result;

                      connection.query('SELECT * FROM Bridges', function(err, result) {
                          connections = result;

                          connection.query('SELECT * FROM Operations', function(err, result) {
                              operations = result;

                              //  Let's add the data to the necessary JSON

                              // entities.forEach(function(d, i) {
                              //     acquireNodes(d, i);
                              // });
                              connections.filter(function(d) {
                                  return d.Connection === "Funding Received" || d.Connection === "Funding Given";
                                }).forEach(function(d) {
                                    (content.funding_connections).push({
                                        source: d.Entity1ID,
                                        target: d.Entity2ID,
                                        year: d.ConnectionYear,
                                        amount: d.Amount
                                    });
                                });

                                connections.filter(function(d) {
                                    return d.Connection === "Investment Received" || d.Connection === "Investment Made";
                                }).forEach(function(d) {
                                    (content.investment_connections).push({
                                        source: d.Entity1ID,
                                        target: d.Entity2ID,
                                        year: d.ConnectionYear,
                                        amount: d.Amount
                                    });
                                });

                                connections.filter(function(d) {
                                    return d.Connection === "Collaboration";
                                }).forEach(function(d) {
                                    (content.collaboration_connections).push({
                                        source: d.Entity1ID,
                                        target: d.Entity2ID
                                    });
                                });

                                connections.filter(function(d) {
                                    return d.Connection === "Data";
                                }).forEach(function(d) {
                                    (content.data_connections).push({
                                        source: d.Entity1ID,
                                        target: d.Entity2ID
                                    });
                                });

                              async.map(entities,acquireNodes, done);
                          });
                      });
                  });
             });
          });
      });
  };

    connection.query('USE athena', function(err) {
        if (err) throw err;

        console.log("Successful connection!");

        connection.query("SET @count = -1;", function(err) {
            if (err) throw err;
            connection.query("UPDATE `Entities` SET `ID` = @count := @count + 1;", function(err) {
                if (err) throw err;
                connection.query("ALTER TABLE `Entities` AUTO_INCREMENT = 1;", function(err) {
                    if (err) throw err;
                    var followers, employees, categories, url,
                        twitter_handle, influence,
                        relations, key_people;

                    connection.query('SET @@auto_increment_increment=1;', function(err) {
                        if (err) throw err;
                    });

                    connection.query('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";', function(err) {
                        if (err) throw err;
                    });

                    (entity.categories !== null) ? categories = '"' + entity.categories.join(", ") + '"': categories = null;
                    (entity.url !== null) ? url = '"' + entity.url + '"': url = null;
                    (entity.twitter_handle !== null) ? twitter_handle = '"' + entity.twitter_handle + '"': twitter_handle = null;
                    (entity.followers !== null) ? followers = entity.followers: followers = null;
                    (entity.employees !== null) ? employees = entity.employees: employees = null;
                    (entity.influence !== null) ? influence = '"' + entity.influence + '"': influence = null;
                    (entity.relations !== null) ? relations = '"' + entity.relations.join(", ") + '"': relations = null;
                    (entity.key_people !== null) ? key_people = '"' + entity.key_people.join(", ") + '"': key_people = null;

                    //  Need to check if it exists prior to entering into the database.
                    connection.query('SELECT * FROM Entities WHERE Name=LCASE("' + entity.name + '") OR Nickname=LCASE("' + entity.name + '")', function(err, rows, field){
                      if (err) throw err;

                      if(rows.length > 0)
                      {
                        connection.query('UPDATE `Entities` SET `Render`=0 WHERE Name=LCASE("' + entity.name + '") OR Nickname=LCASE("' + entity.name + '")', function(err){
                          if (err) throw err;
                          insertNode(entity, categories, url, twitter_handle, followers, employees, influence, relations, key_people);
                        });
                      }
                      else
                      {
                        insertNode(entity, categories, url, twitter_handle, followers, employees, influence, relations, key_people);
                      }
                    });
                });
            });
        });
    });
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

// Update MySQL database
app.post('/dbview', function(req, res) {
console.log((req.body).name);
});

app.post('/ajax', function(req, res) {
console.log('processing');
res.send('processing the login form');
});

// connection.end();
module.exports = app;