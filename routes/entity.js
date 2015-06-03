var express = require('express');
var mysql   = require('mysql');
var sql     = require('sql-bricks');
var wrap    = require('mysql-wrap');
var _       = require('lodash');
var path    = require('path');

var select = sql.select;
var insert = sql.insert;
var update = sql.update;

var router  = express.Router();

var data  = require('../data');

var config  = require('../config');
var pool    = mysql.createPool(config.db);
var db      = wrap(pool);
var async   = require('async');
var fs      = require('fs');

var file = path.join(__dirname, '..', 'data', 'data.json');

router.get('/', function(req, res) {
  var entities, bridges;

  var qry = select("id, name, nickname, followers, employees, entity_type, categories, key_people, relations, twitter_handle, followers, website")
  .from("entities_view").where({render: 1}).toString()

  db.query(qry)
  .then(function(results) {
    entities = results;
    qry = select().from("bridges_view").where({render: 1}).toString()

    return db.query(qry)
  })
  .then(function(results) {
    bridges = results;
    qry = select().from("operations_view").toString()

    return db.query(qry)
  })
  .then(function(results) {
    operations = results;
    qry = select().from("locations_with_city").toString()

    return db.query(qry)
  })
  .then(function(results) {
    res.json(data.processVertices(entities, bridges, operations, results));
  })
  .catch(function(err) {
    console.log("ERROR on /entities", err);
    res.sendStatus(400);
  });
});

router.get('/top', function(req, res) {
  data.getTopEntities(function(err, obj) {
  if (err) {
    console.log("ERROR on /entities/top", err);
    res.sendStatus(400);
  } else {
    res.json(obj);
  }
  })
})

router.get('/:id', function(req, res) {
  var qry = select("id, categories, website, twitter_handle, influence, relations, key_people")
  .from("entities_view").where({id: req.params.id, render: 1}).toString()

  db.query(qry).then(function(result) {
    var out = result[0];

    if (out.key_people) {
      out.key_people = _.map(out.key_people.split("|"), function(p) {
      return { name: p };
      });
    } else {
      out.key_people = [];
    }

    res.json({ entity: out });
  })
  .catch(function(err) {
    console.log("ERROR on /entities/" + req.params.id, err);
    res.sendStatus(400);
  });
});

router.post('/', function(req, res) {
  var entity = req.body;

  console.log(req.body, 'backend request');
  // { entity: 'Individual',
  // categories: [ 'General Civic Tech', 'Jobs & Education' ],
  // name: 'Ashton Kutcher',
  // nickname: null,
  // locations:
  //  [ { city: null, addresses: null },
  //    { city: [Object], address: '12, Unity Street' } ],
  // url: 'http://en.wikipedia.org/wiki/Ashton_Kutcher',
  // employees: null,
  // key_people: null,
  // twitter_handle: null,
  // followers: null,
  // relations: null,
  // funding_received: null,
  // investments_received: null,
  // funding_given: null,
  // investments_made: [ { name: 'Votizen', amount: '0', year: null } ],
  // collaborations: null,
  // employers: [ 'Engagement Lab' ],
  // data: null,
  // revenue: null,
  // expenses: null,
  // influence: null }

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

  if (entity.locations !== null) {
    for (var i = 0; i < entity.locations.length; i++) {
      var location = entity.locations[i];
      if(location.city === "") {
        location.city = null;
      }
      if(location.address === "") {
        location.address = null;
      }
    }
  }

  fs.readFile(file, 'utf8', function (err,data) {
    if (err) {
      console.log(err);
    } else {
      data = JSON.parse(data);
      data.push(entity);
      fs.writeFile(file, JSON.stringify(data), function (err) {
        if (err) return console.log(err);
        console.log('File saved.');
      });
    }
  });


  pool.getConnection(function (err, connection){
    if(err) throw err;

    var asyncTasks = [];
    var developJSON = function(result, entity) {


      asyncTasks.push(function(callback){

        var counterFR = 0;
        if (entity.funding_received !== null) {
        var newFundingReceivedEntity;
          (entity.funding_received).forEach(function(object) {
          newFundingReceivedEntity = object;
            connection.query('SELECT * FROM Entities WHERE ((name = "' + (newFundingReceivedEntity.name) + '" OR nickname = "' + (newFundingReceivedEntity.name) + '") AND (Render=1)) ORDER BY created_at DESC LIMIT 1;',
            (function(newFundingReceivedEntity){
              return function(err, rows, fields){
              if (rows !== undefined && rows.length >= 1) {
                // If the entity already exists, use its ID for the entity id when inserting into connections...
                connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, connection_year, amount, render, deleted_at) VALUES (' + result.insertId + ',' + rows[0].id + ',"Funding Received",' + newFundingReceivedEntity.year + ',' + newFundingReceivedEntity.amount + ', 1, null);', function(err) {
                  if (err) throw err;
                  if(counterFR === entity.funding_received.length - 1)
                  {
                  callback(null, 'Funding Received');
                  }
                  else
                  {
                  counterFR++;
                  }
                });
              }
              //  The entity mentioned in funding_received does not exist.
              else
              {
                connection.query('INSERT INTO Entities (name, nickname, entity_type, categories, location, Website, twitter_handle, followers, employees, influence, relations, key_people, created_at, render, deleted_at) VALUES ("' + (newFundingReceivedEntity.name) + '","' + (newFundingReceivedEntity.name) + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(), 0, null);', function(err, resultInner) {
                  if (err) throw err;
                  connection.query('SELECT * FROM Entities WHERE ((Name = "' + (newFundingReceivedEntity.name) + '" OR Nickname = "' + (newFundingReceivedEntity.name) + '") AND Render=0) ORDER BY created_at DESC LIMIT 1;', function(err, innerRows, innerFields) {
                  if (err) throw err;
                  connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, connection_year, amount, render, deleted_at) VALUES (' + result.insertId + ',' + innerRows[0].id + ',"Funding Received",' + newFundingReceivedEntity.year + ',' + newFundingReceivedEntity.amount + ',0, null);', function(err) {
                    if (err) throw err;
                    if(counterFR === entity.funding_received.length - 1)
                    {
                    callback('Funding Received');
                    }
                    else
                    {
                    counterFR++;
                    }
                  });
                  });

                });
              }
              };
            })(newFundingReceivedEntity));
          });
        }
        else{
        callback(null, 'Funding Received');
        }

      });

      asyncTasks.push(function(callback){
        var counterIR = 0;
        if (entity.investments_received !== null) {
        var newInvestmentsReceivedEntity;
          (entity.investments_received).forEach(function(object) {
          newInvestmentsReceivedEntity = object;
            connection.query('SELECT * FROM Entities WHERE ((name = "' + (newInvestmentsReceivedEntity.name) + '" OR nickname = "' + (newInvestmentsReceivedEntity.name) + '") AND (Render=1)) ORDER BY created_at DESC LIMIT 1;',
            (function(newInvestmentsReceivedEntity){
              return function(err, rows, fields){
              if (rows !== undefined && rows.length >= 1) {
                // If the entity already exists, use its ID for the entity id when inserting into connections...
                connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, connection_year, amount, render, deleted_at) VALUES (' + result.insertId + ',' + rows[0].id + ',"Investment Received",' + newInvestmentsReceivedEntity.year + ',' + newInvestmentsReceivedEntity.amount + ',1, null);', function(err) {
                  if (err) throw err;
                  if(counterIR === entity.investments_received.length - 1)
                  {
                  callback(null, 'Investments Received');
                  }
                  else
                  {
                  counterIR++;
                  }
                });

              }
              else
              {
                connection.query('INSERT INTO Entities (name, nickname, entity_type, categories, location, website, twitter_handle, followers, employees, influence, relations, key_people, created_at, Render, deleted_at) VALUES ("' + (newInvestmentsReceivedEntity.name) + '","' + (newInvestmentsReceivedEntity.name) + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(),0, null);', function(err, resultInner) {
                  if (err) throw err;
                  connection.query('SELECT * FROM Entities WHERE ((name = "' + (newInvestmentsReceivedEntity.name) + '" OR nickname = "' + (newInvestmentsReceivedEntity.name) + '") AND Render=0) ORDER BY created_at DESC LIMIT 1;', function(err, innerRows, innerFields) {
                  if (err) throw err;
                  connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, connection_year, amount, render, deleted_at) VALUES (' + result.insertId + ',' + innerRows[0].id + ',"Investment Received",' + newInvestmentsReceivedEntity.year + ',' + newInvestmentsReceivedEntity.amount + ',0, null);', function(err) {
                    if (err) throw err;
                    if(counterIR === entity.investments_received.length - 1)
                    {
                    callback('Investments Received');
                    }
                    else
                    {
                    counterIR++;
                    }
                  });
                  });

                });
              }
              }
            })(newInvestmentsReceivedEntity));

          });
        }
        else {
        callback(null, 'Investments Received');
        }
      });

      asyncTasks.push(function(callback){
        var counterIM = 0;
        if (entity.investments_made !== null) {
        var newInvestmentsMadeEntity;
          (entity.investments_made).forEach(function(object) {
          newInvestmentsMadeEntity = object;
            connection.query('SELECT * FROM Entities WHERE ((name = "' + (newInvestmentsMadeEntity.name) + '" OR nickname = "' + (newInvestmentsMadeEntity.name) + '") AND (Render=1)) ORDER BY created_at DESC LIMIT 1;',
            (function(newInvestmentsMadeEntity){
              return function(err, rows, fields){
              if (rows !== undefined && rows.length >= 1) {
                // If the entity already exists, use its ID for the entity id when inserting into connections...
                  connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, connection_year, amount, render, deleted_at) VALUES (' + result.insertId + ',' + rows[0].id + ',"Investment Made",' + newInvestmentsMadeEntity.year + ',' + newInvestmentsMadeEntity.amount + ',1, null);', function(err) {
                    if (err) throw err;
                    if(counterIM === entity.investments_made.length - 1)
                    {
                    callback(null, 'Investments Made');
                    }
                    else
                    {
                    counterIM++;
                    }
                  });

              }
              else
              {
                connection.query('INSERT INTO Entities (name, nickname, entity_type, categories, location, website, twitter_handle, followers, employees, influence, relations, key_people, created_at, Render, deleted_at) VALUES ("' + (newInvestmentsMadeEntity.name) + '","' + (newInvestmentsMadeEntity.name) + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(),0, null);', function(err, resultInner) {
                  if (err) throw err;
                  connection.query('SELECT * FROM Entities WHERE ((name = "' + (newInvestmentsMadeEntity.name) + '" OR nickname = "' + (newInvestmentsMadeEntity.name) + '") AND Render=0) ORDER BY created_at DESC LIMIT 1;', function(err, innerRows, innerFields) {
                  if (err) throw err;
                  connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, connection_year, amount, render, deleted_at) VALUES (' + result.insertId + ',' + innerRows[0].id + ',"Investment Made",' + newInvestmentsMadeEntity.year + ',' + newInvestmentsMadeEntity.amount + ',0, null);', function(err) {
                    if (err) throw err;
                    if(counterIM === entity.investments_made.length - 1)
                    {
                    callback(null, 'Investments Made');
                    }
                    else
                    {
                    counterIM++;
                    }
                  });
                  });

                });
              }

              };
            })(newInvestmentsMadeEntity));



          });
        }
        else {
        callback(null, 'Investments Made');
        }
      });

      asyncTasks.push(function(callback){
        var counterFG = 0;
        if (entity.funding_given !== null) {
        var newFundingGivenEntity;
          (entity.funding_given).forEach(function(object) {
          newFundingGivenEntity = object;
            connection.query('SELECT * FROM Entities WHERE ((name = "' + (newFundingGivenEntity.name) + '" OR nickname = "' + (newFundingGivenEntity.name) + '") AND (render=1)) ORDER BY created_at DESC LIMIT 1;',
              (function(newFundingGivenEntity){
              return function(err, rows, fields){
                if (rows !== undefined && rows.length >= 1) {
                // If the entity already exists, use its ID for the entity id when inserting into connections...
                connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, connection_year, amount, render, deleted_at) VALUES (' + result.insertId + ',' + rows[0].id + ',"Funding Given",' + (newFundingGivenEntity.year) + ',' + (newFundingGivenEntity.amount) + ',1, null);', function(err) {
                  if (err) throw err;
                  if(counterFG === entity.funding_given.length - 1)
                    {
                    callback(null, 'Funding Given');
                    }
                    else
                    {
                    counterFG++;
                    }
                });

                }
                else
                {
                connection.query('INSERT INTO Entities (name, nickname, entity_type, categories, location, website, twitter_handle, followers, employees, influence, relations, key_people, created_at, render, deleted_at) VALUES ("' + (newFundingGivenEntity.name) + '","' + (newFundingGivenEntity.name) + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(),0, null);', function(err, resultInner) {
                  if (err) throw err;
                  connection.query('SELECT * FROM Entities WHERE ((Name = "' + (newFundingGivenEntity.name) + '" OR Nickname = "' + (newFundingGivenEntity.name) + '") AND Render=0) ORDER BY created_at DESC LIMIT 1;', function(err, innerRows, innerFields) {
                    if (err) throw err;
                    connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, connection_year, amount, render, deleted_at) VALUES (' + result.insertId + ',' + innerRows[0].id + ',"Funding Given",' + (newFundingGivenEntity.year) + ',' + (newFundingGivenEntity.amount) + ',0, null);', function(err) {
                    if (err) throw err;
                    if(counterFG === entity.funding_given.length - 1)
                    {
                      callback(null, 'Funding Given');
                    }
                    else
                    {
                      counterFG++;
                    }
                    });
                  });

                });
                }
              };
            })(newFundingGivenEntity));

            });
        }
        else{
        callback(null, 'Funding Given');
        }
      });

      asyncTasks.push(function(callback){
        var counterD = 0;
        if (entity.data !== null) {
        var newDataEntity;
          for (var i = 0; i < entity.data.length; i++) {
            newDataEntity = entity.data[i];
            connection.query('SELECT * FROM Entities WHERE ((name = "' + newDataEntity + '" OR nickname = "' + newDataEntity + '") AND (render=1)) ORDER BY created_at DESC LIMIT 1;',
             (function(newDataEntity){
              return function(err, rows, fields){
                if (rows !== undefined && rows.length >= 1) {
                // If the entity already exists, use its ID for the entity id when inserting into connections...
                connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, render, deleted_at) VALUES (' + result.insertId + ',' + rows[0].id + ',"Data", 1, null);', function(err) {
                  if (err) throw err;
                  if(counterD === entity.data.length - 1)
                  {
                  callback(null, 'Data');
                  }
                  else
                  {
                  counterD++;
                  }
                });

                }
                else
                {
                connection.query('INSERT INTO Entities (name, nickname, entity_type, categories, location, website, twitter_handle, followers, employees, influence, relations, key_people, created_at, Render, deleted_at) VALUES ("' + newDataEntity + '","' + newDataEntity + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(),0, null);', function(err, resultInner) {
                  if (err) throw err;
                  connection.query('SELECT * FROM Entities WHERE ((Name = "' + newDataEntity + '" OR Nickname = "' + newDataEntity + '") AND Render=0) ORDER BY created_at DESC LIMIT 1;', function(err, innerRows, innerFields) {
                  if (err) throw err;
                  connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, render, deleted_at) VALUES (' + result.insertId + ',' + innerRows[0].id + ',"Data", 0, null);', function(err) {
                    if (err) throw err;
                    if(counterD === entity.data.length - 1)
                    {
                    callback(null, 'Data');
                    }
                    else
                    {
                    counterD++;
                    }
                  });
                  });

                });
                }
              };
             })(newDataEntity));
          }
        }
        else {
        callback(null, 'Data');
        }
      });

      asyncTasks.push(function(callback){
        var counterC = 0;
        if (entity.collaborations !== null) {
        var newCollaborationEntity;
          for (var j = 0; j < entity.collaborations.length; j++) {
          // console.log("Index " + j + ": " + entity.collaborations[j]);
          newCollaborationEntity = entity.collaborations[j];
            connection.query('SELECT * FROM Entities WHERE ((name = "' + newCollaborationEntity + '" OR nickname = "' + newCollaborationEntity + '") AND (render=1)) ORDER BY created_at DESC LIMIT 1;',
            (function(newCollaborationEntity){
              return function(err, rows, fields){
               if (rows !== undefined && rows.length >= 1) {
                // If the entity already exists, use its ID for the entity id when inserting into connections...
                connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, render, deleted_at) VALUES (' + result.insertId + ',' + rows[0].id + ',"Collaboration", 1, null);', function(err) {
                  if (err) throw err;
                  if(counterC === entity.collaborations.length - 1)
                  {
                  callback(null, 'Collaboration');
                  }
                  else
                  {
                  counterC++;
                  }
                });

              }
              else
              {
                // console.log("Else: " + newEntity);
                connection.query('INSERT INTO Entities (Name, Nickname, entity_type, Categories, Location, Website, twitter_handle, Followers, Employees, Influence, Relations, key_people, created_at, Render, deleted_at) VALUES ("' + newCollaborationEntity + '","' + newCollaborationEntity + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(), 0, null);', function(err, resultInner) {
                if (err) throw err;
                connection.query('SELECT * FROM Entities WHERE ((Name = "' + newCollaborationEntity + '" OR Nickname = "' + newCollaborationEntity + '") AND Render=0) ORDER BY created_at DESC LIMIT 1;', function(err, innerRows, innerFields) {
                  if (err) throw err;
                  connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, render, deleted_at) VALUES (' + result.insertId + ',' + innerRows[0].id + ',"Collaboration", 0, null);', function(err) {
                  if (err) throw err;
                  if(counterC === entity.collaborations.length - 1)
                  {
                    callback(null, 'Collaboration');
                  }
                  else
                  {
                    counterC++;
                  }
                   });
                  });
                });
              }
              };
            })(newCollaborationEntity));
          }
        }
        else {
        callback(null, 'Collaboration');
        }
      });

      //employment
      asyncTasks.push(function(callback){
        var counterEM = 0;
        if (entity.employers !== null) {
        var newEmploymentEntity;
          for (var j = 0; j < entity.employers.length; j++) {
          // console.log("Index " + j + ": " + entity.collaborations[j]);
          newEmploymentEntity = entity.employers[j];
            connection.query('SELECT * FROM Entities WHERE ((name = "' + newEmploymentEntity + '" OR nickname = "' + newEmploymentEntity + '") AND (render=1)) ORDER BY created_at DESC LIMIT 1;',
            (function(newEmploymentEntity){
              return function(err, rows, fields){
               if (rows !== undefined && rows.length >= 1) {
                // If the entity already exists, use its ID for the entity id when inserting into connections...
                connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, render, deleted_at) VALUES (' + result.insertId + ',' + rows[0].id + ',"Employment", 1, null);', function(err) {
                  if (err) throw err;
                  if(counterEM === entity.employers.length - 1)
                  {
                  callback(null, 'Employment');
                  }
                  else
                  {
                  counterEM++;
                  }
                });

              }
              else
              {
                // console.log("Else: " + newEntity);
                connection.query('INSERT INTO Entities (Name, Nickname, entity_type, Categories, Location, Website, twitter_handle, Followers, Employees, Influence, Relations, key_people, created_at, Render, deleted_at) VALUES ("' + newEmploymentEntity + '","' + newEmploymentEntity + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(), 0, null);', function(err, resultInner) {
                if (err) throw err;
                connection.query('SELECT * FROM Entities WHERE ((Name = "' + newEmploymentEntity + '" OR Nickname = "' + newEmploymentEntity + '") AND Render=0) ORDER BY created_at DESC LIMIT 1;', function(err, innerRows, innerFields) {
                  if (err) throw err;
                  connection.query('INSERT INTO Bridges (entity_1_id, entity_2_id, connection, render, deleted_at) VALUES (' + result.insertId + ',' + innerRows[0].id + ',"Employment", 0, null);', function(err) {
                  if (err) throw err;
                  if(counterEM === entity.employers.length - 1)
                  {
                    callback(null, 'Employment');
                  }
                  else
                  {
                    counterEM++;
                  }
                   });
                  });
                });
              }
              };
            })(newEmploymentEntity));
          }
        }
        else {
        callback(null, 'Collaboration');
        }
      });


      asyncTasks.push(function(callback){
        var counterR = 0;
        if (entity.revenue !== null) {
          (entity.revenue).forEach(function(object) {
            var id = result.insertId;

            connection.query('INSERT INTO Operations (entity_id, Finance, Amount, Year, deleted_at) VALUES (' + id + ',"Revenue",' + object.amount + ',' + object.year + ', null);', function(err) {
              if (err) throw err;
              if(counterR === entity.revenue.length - 1)
              {
              callback(null, 'Revenue');
              }
              else
              {
              counterR++;
              }
            });
          });
        }
        else {
        callback(null, 'Revenue');
        }
      });

      asyncTasks.push(function(callback){
        var counterE = 0;
        if (entity.expenses !== null) {
          (entity.expenses).forEach(function(object) {
            var id = result.insertId;

            connection.query('INSERT INTO Operations (entity_id, Finance, Amount, Year, deleted_at) VALUES (' + id + ',"Expenses",' + object.amount + ',' + object.year + ', null);', function(err) {
              if (err) throw err;
              if(counterE === entity.expenses.length - 1)
              {
              callback(null, 'Expenses');
              }
              else
              {
              counterE++;
              }
            });
          });
        }
        else {
        callback(null, 'Expenses');
        }
      });

      async.parallel(asyncTasks, function(err, results){
        console.log(results);
        //  Time to export this data to a json file!

        fs.readFile(file, 'utf8', function (err,data) {
        // var end2 = new Date().getTime();
          if (err) {
            console.log(err);
          } else {
          data = JSON.parse(data);
          console.log(data, "data");
          data.splice(-1,1);

          fs.writeFile(file, JSON.stringify(data), function (err) {
            if (err) return console.log(err);
            connection.release();
            console.log('File saved.-----------------------------');
          });
          }
        });
      });
    };


    var insertNode = function(pastID, entity, categories, url, twitter_handle, followers, employees, influence, relations, key_people, newIdValue) {
      connection.query('INSERT INTO Entities (id, name, nickname, entity_type, categories, location, website, twitter_handle, followers, employees, influence, relations, key_people, created_at, Render, deleted_at) VALUES (' + newIdValue + ',"' + entity.name + '","' + entity.nickname + '","' + entity.entity_type + '",' + categories + ',"' + entity.location + '",' + url + ',' + twitter_handle + ',' + followers + ',' + employees + ',' + influence + ',' + relations + ',' + key_people + ',' + 'NOW(), 1, null);', function(err, result) {
        if (err) throw err;

        console.log("Current: " + result.insertId);
        console.log("Past: " + pastID);
        if(pastID !== -1)
        {

        connection.query('UPDATE `Operations` SET `entity_id`=? WHERE (entity_id=?)', [result.insertId, pastID], function(err){
          if (err) throw err;
          connection.query('UPDATE `Bridges` SET `entity_2_id`=' + result.insertId + ' WHERE (entity_2_id=' + pastID + ' AND render=1)', function(err){
          if (err) throw err;
          console.log("Inside");
          // var end5 = new Date().getTime();
          // console.log("Actual insertion: " + (end5 - start5));
          // start2 = new Date().getTime();
          developJSON(result, entity);
          });
        });
        }
        else
        {
        var end5 = new Date().getTime();
          // console.log("Actual insertion: " + (end5 - start5));
          // start2 = new Date().getTime();
        developJSON(result, entity);
        }
      });
    };

    connection.query("SELECT * FROM entities ORDER BY id DESC LIMIT 0, 1", function(err, entries, attr) {
      if (err) throw err;

      console.log(entries, '----' , attr);
      var newIdValue = entries[0].id + 1;
      // connection.query("ALTER TABLE `Entities` AUTO_INCREMENT = 1;", function(err) {
        // if (err) throw err;
        var followers, employees, categories, url,
          twitter_handle, influence,
          relations, key_people;

        connection.query('SET @@auto_increment_increment=1;', function(err) {
          if (err) throw err;
        });

        connection.query('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";', function(err) {
          if (err) throw err;
        });

        console.log("Finally got here...");

        (entity.categories !== null) ? categories = '"' + entity.categories.join(", ") + '"': categories = null;
        (entity.url !== null) ? url = '"' + entity.url + '"': url = null;
        (entity.twitter_handle !== null) ? twitter_handle = '"' + entity.twitter_handle + '"': twitter_handle = null;
        (entity.followers !== null) ? followers = entity.followers: followers = null;
        (entity.employees !== null) ? employees = entity.employees: employees = null;
        (entity.influence !== null) ? influence = '"' + entity.influence + '"': influence = null;
        (entity.relations !== null) ? relations = '"' + entity.relations.join(", ") + '"': relations = null;
        (entity.key_people !== null) ? key_people = '"' + entity.key_people.join("| ") + '"': key_people = null;

        //  Need to check if it exists prior to entering into the database.
        connection.query('SELECT * FROM Entities WHERE ((name="' + entity.name + '" OR nickname="' + entity.name + '") AND render=1) ORDER BY created_at DESC LIMIT 1', function(err, rows, field){

          if (err) throw err;

          if(rows.length > 0)
          {
            console.log("Called because row is not empty")
            connection.query('UPDATE `Entities` SET `Render`=0 WHERE ((name="' + entity.name + '" OR nickname="' + entity.name + '") AND render=1)', function(err){
              if (err) throw err;

              connection.query('UPDATE `Bridges` SET `Render`=0 WHERE (entity_1_id=' + rows[0].id + ' AND render=1)', function(err){
                if (err) throw err;

                if(typeof(rows[0].Followers) === "number"){
                  // var end4 = new Date().getTime();
                  insertNode(rows[0].id, entity, categories, url, twitter_handle, rows[0].followers, employees, influence, relations, key_people, newIdValue);
                }
                else{
                  // var end4 = new Date().getTime();
                  insertNode(rows[0].id, entity, categories, url, twitter_handle, followers, employees, influence, relations, key_people, newIdValue);
                }
              });
            });
          }
          else
            {
            console.log("Called because row is EMPTY!!!")
            // var end4 = new Date().getTime();
            insertNode(-1, entity, categories, url, twitter_handle, followers, employees, influence, relations, key_people, newIdValue);
          }
        });
      // });
    });
  });


  // asyncTasks.push(function(callback) {
  //   if(entity.locations.length > 0){
  //     var locations = req.body.locations;
  //     _.each(locations, function(location) {
  //       var city = location.city;
  //       if (city !== null) {
  //         connection.query('SELECT * FROM cities WHERE city_name LIKE "' + MenloPark + '" AND state_name LIKE "' + California + '" AND country_name LIKE "' + UnitedStates + '";', function (city) {
  //           return function(err, rows, fields) {
  //             if (rows !== undefined && rows.length >= 1) {
  //               connection.query('UPDATE cities WHERE city_name LIKE "' + MenloPark + '" AND state_name LIKE "' + California + '" AND country_name LIKE"' + UnitedStates + '";')
  //             }
  //           };
  //         });


  //         if(city.id === null) {
  //           http.get('http://dev.virtualearth.net/REST/v1/Locations?query=' + encodeURI(city.cityName) + '&key=Ah_CBBU6s6tupk_v45WVz46zMfevFT5Lkt9vpmwqV5LedzE221Kfridd7khQxD8M', function(response) {
  //           var data = '';
  //           response.on('data', function(chunk) {
  //             data += chunk;
  //           }).on('end', function() {
  //             var location = JSON.parse(data);
  //             if(location){
  //             if (location.resourceSets && location.resourceSets.length > 0 && location.resourceSets[0].resources && location.resourceSets[0].resources.length > 0) {
  //               http.get('http://restcountries.eu/rest/v1/name/' + location.resourceSets[0].resources[0].address.countryRegion + '?fullText=true', function(res) {
  //               var result = '';
  //               res.on('data', function(chunk) {
  //                 result += chunk;
  //               }).on('end', function() {
  //                 var countryDetail = JSON.parse(result);
  //                 var cityDetails = {
  //                 city_name: location.resourceSets[0].resources[0].address.locality || null,
  //                 state_code: location.resourceSets[0].resources[0].address.adminDistrict || null,
  //                 state_name: null,
  //                 country_code: countryDetail[0].alpha3Code || null,
  //                 country_name: location.resourceSets[0].resources[0].address.countryRegion || null,
  //                 city_lat: location.resourceSets[0].resources[0].point.coordinates[0] || null,
  //                 city_long: location.resourceSets[0].resources[0].point.coordinates[1] || null,
  //                 deleted_at: null
  //                 };

  //                 var qry = insert("cities", cityDetails);
  //                 db.query(qry.toString()).then(function(result){
  //                 var CityAddresses = city.addresses;
  //                 _.each(CityAddresses, function(CityAddress) {
  //                   if(CityAddress.id === null) {
  //                   http.get('http://dev.virtualearth.net/REST/v1/Locations?q=' + encodeURI(CityAddress.address) + '&key=Ah_CBBU6s6tupk_v45WVz46zMfevFT5Lkt9vpmwqV5LedzE221Kfridd7khQxD8M', function(resp) {
  //                     var address = '';
  //                     resp.on('data', function(chunk) {
  //                     address += chunk;
  //                     }).on('end', function() {
  //                     if (address){

  //                       address = JSON.parse(address);
  //                       if (address.resourceSets && address.resourceSets.length > 0 && address.resourceSets[0].resources && address.resourceSets[0].resources.length > 0) {
  //                       var locationsObj= {
  //                         entity_id: req.body.id,
  //                         city_id: result.insertId,
  //                         address: CityAddress.address,
  //                         address_lat: address.resourceSets[0].resources[0].geocodePoints[0].coordinates[0],
  //                         address_long: address.resourceSets[0].resources[0].geocodePoints[0].coordinates[1],
  //                         deleted_at: null
  //                       };

  //                       var qry = insert("locations", locationsObj);
  //                       db.query(qry.toString()).then(function(result) {
  //                         console.log(result, 'hhhdhhd');
  //                         resp.json(result);
  //                       });
  //                       } else {
  //                       console.log('address array returned empty');
  //                       }
  //                     } else {
  //                       console.log('address not found');
  //                     }
  //                     });
  //                   });
  //                   }
  //                 });
  //                 });
  //               });
  //               });
  //             } else {
  //               console.log('Location array returned empty')
  //             }
  //             }
  //             else {
  //             console.log('location not found');
  //             }
  //           }).on('error', function(err) {
  //           });
  //           });
  //         }
  //       }
  //     });
  //   } else {
  //     callback(null, 'Locations');
  //   }
  // });

});

// });


module.exports = router;
