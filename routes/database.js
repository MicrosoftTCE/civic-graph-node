var async = require('async');
var fs = require('fs');
var path = require("path");
var mysql = require('mysql');

var file = path.join(__dirname, '..', 'routes', 'data.json');
var civicJSON = path.join(__dirname, '..', 'public', 'data', 'civic.json');
var db_config = require('./../configuration/credentials.js');
var pool = mysql.createPool(db_config.cred.cleardb);

exports.save = function(request, response){
  console.log("Request!!!!" + request);
  var entity = request.body;
   var start = new Date().getTime();

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

    console.log("This is the entity: " + entity);

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
    console.log("Got a connection!");
    //  Cleans up the sent stringified data.
    if(err) throw err;
    

  var developJSON = function(result, entity)
  {
    
      var asyncTasks = [];

        asyncTasks.push(function(callback){
          
          var counterFR = 0;
          if (entity.funding_received !== null) {
            var newFundingReceivedEntity;
              (entity.funding_received).forEach(function(object) {
                newFundingReceivedEntity = object;
                  connection.query('SELECT * FROM Entities WHERE ((Name = "' + (newFundingReceivedEntity.name) + '" OR Nickname = "' + (newFundingReceivedEntity.name) + '") AND (Render=1)) ORDER BY CreatedAt DESC LIMIT 1;', 
                    (function(newFundingReceivedEntity){
                      return function(err, rows, fields){
                        if (rows !== undefined && rows.length >= 1) {
                          // If the entity already exists, use its ID for the entity id when inserting into connections...
                          connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, ConnectionYear, Amount, Render) VALUES (' + result.insertId + ',' + rows[0].ID + ',"Funding Received",' + newFundingReceivedEntity.year + ',' + newFundingReceivedEntity.amount + ',1);', function(err) {
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
                          connection.query('INSERT INTO Entities (Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + (newFundingReceivedEntity.name) + '","' + (newFundingReceivedEntity.name) + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(),0);', function(err, resultInner) {
                              if (err) throw err;
                              connection.query('SELECT * FROM Entities WHERE ((Name = "' + (newFundingReceivedEntity.name) + '" OR Nickname = "' + (newFundingReceivedEntity.name) + '") AND Render=0) ORDER BY CreatedAt DESC LIMIT 1;', function(err, innerRows, innerFields) {
                                if (err) throw err;
                                connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, ConnectionYear, Amount, Render) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"Funding Received",' + newFundingReceivedEntity.year + ',' + newFundingReceivedEntity.amount + ',0);', function(err) {
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
                  connection.query('SELECT * FROM Entities WHERE ((Name = "' + (newInvestmentsReceivedEntity.name) + '" OR Nickname = "' + (newInvestmentsReceivedEntity.name) + '") AND (Render=1)) ORDER BY CreatedAt DESC LIMIT 1;', 
                    (function(newInvestmentsReceivedEntity){
                      return function(err, rows, fields){
                        if (rows !== undefined && rows.length >= 1) {
                          // If the entity already exists, use its ID for the entity id when inserting into connections...
                          connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, ConnectionYear, Amount, Render) VALUES (' + result.insertId + ',' + rows[0].ID + ',"Investment Received",' + newInvestmentsReceivedEntity.year + ',' + newInvestmentsReceivedEntity.amount + ',1);', function(err) {
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
                          connection.query('INSERT INTO Entities (Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + (newInvestmentsReceivedEntity.name) + '","' + (newInvestmentsReceivedEntity.name) + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(),0);', function(err, resultInner) {
                              if (err) throw err;
                              connection.query('SELECT * FROM Entities WHERE ((Name = "' + (newInvestmentsReceivedEntity.name) + '" OR Nickname = "' + (newInvestmentsReceivedEntity.name) + '") AND Render=0) ORDER BY CreatedAt DESC LIMIT 1;', function(err, innerRows, innerFields) {
                                if (err) throw err;
                                connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, ConnectionYear, Amount, Render) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"Investment Received",' + newInvestmentsReceivedEntity.year + ',' + newInvestmentsReceivedEntity.amount + ',0);', function(err) {
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
                  connection.query('SELECT * FROM Entities WHERE ((Name = "' + (newInvestmentsMadeEntity.name) + '" OR Nickname = "' + (newInvestmentsMadeEntity.name) + '") AND (Render=1)) ORDER BY CreatedAt DESC LIMIT 1;', 
                    (function(newInvestmentsMadeEntity){
                      return function(err, rows, fields){
                        if (rows !== undefined && rows.length >= 1) {
                            // If the entity already exists, use its ID for the entity id when inserting into connections...
                              connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, ConnectionYear, Amount, Render) VALUES (' + result.insertId + ',' + rows[0].ID + ',"Investment Made",' + newInvestmentsMadeEntity.year + ',' + newInvestmentsMadeEntity.amount + ',1);', function(err) {
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
                          connection.query('INSERT INTO Entities (Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + (newInvestmentsMadeEntity.name) + '","' + (newInvestmentsMadeEntity.name) + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(),0);', function(err, resultInner) {
                              if (err) throw err;
                              connection.query('SELECT * FROM Entities WHERE ((Name = "' + (newInvestmentsMadeEntity.name) + '" OR Nickname = "' + (newInvestmentsMadeEntity.name) + '") AND Render=0) ORDER BY CreatedAt DESC LIMIT 1;', function(err, innerRows, innerFields) {
                                if (err) throw err;
                                connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, ConnectionYear, Amount, Render) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"Investment Made",' + newInvestmentsMadeEntity.year + ',' + newInvestmentsMadeEntity.amount + ',0);', function(err) {
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
                  connection.query('SELECT * FROM Entities WHERE ((Name = "' + (newFundingGivenEntity.name) + '" OR Nickname = "' + (newFundingGivenEntity.name) + '") AND (Render=1)) ORDER BY CreatedAt DESC LIMIT 1;',
                      (function(newFundingGivenEntity){
                        return function(err, rows, fields){
                          if (rows !== undefined && rows.length >= 1) {
                          // If the entity already exists, use its ID for the entity id when inserting into connections...
                            connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, ConnectionYear, Amount, Render) VALUES (' + result.insertId + ',' + rows[0].ID + ',"Funding Given",' + (newFundingGivenEntity.year) + ',' + (newFundingGivenEntity.amount) + ',1);', function(err) {
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
                            connection.query('INSERT INTO Entities (Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + (newFundingGivenEntity.name) + '","' + (newFundingGivenEntity.name) + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(),0);', function(err, resultInner) {
                                if (err) throw err;
                                connection.query('SELECT * FROM Entities WHERE ((Name = "' + (newFundingGivenEntity.name) + '" OR Nickname = "' + (newFundingGivenEntity.name) + '") AND Render=0) ORDER BY CreatedAt DESC LIMIT 1;', function(err, innerRows, innerFields) {
                                  if (err) throw err;
                                  connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, ConnectionYear, Amount, Render) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"Funding Given",' + (newFundingGivenEntity.year) + ',' + (newFundingGivenEntity.amount) + ',0);', function(err) {
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
                  connection.query('SELECT * FROM Entities WHERE ((Name = "' + newDataEntity + '" OR Nickname = "' + newDataEntity + '") AND (Render=1)) ORDER BY CreatedAt DESC LIMIT 1;',
                     (function(newDataEntity){
                        return function(err, rows, fields){
                          if (rows !== undefined && rows.length >= 1) {
                          // If the entity already exists, use its ID for the entity id when inserting into connections...
                            connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, Render) VALUES (' + result.insertId + ',' + rows[0].ID + ',"Data", 1);', function(err) {
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
                            connection.query('INSERT INTO Entities (Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + newDataEntity + '","' + newDataEntity + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(),0);', function(err, resultInner) {
                              if (err) throw err;
                              connection.query('SELECT * FROM Entities WHERE ((Name = "' + newDataEntity + '" OR Nickname = "' + newDataEntity + '") AND Render=0) ORDER BY CreatedAt DESC LIMIT 1;', function(err, innerRows, innerFields) {
                                if (err) throw err;
                                connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, Render) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"Data", 0);', function(err) {
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
                  connection.query('SELECT * FROM Entities WHERE ((Name = "' + newCollaborationEntity + '" OR Nickname = "' + newCollaborationEntity + '") AND (Render=1)) ORDER BY CreatedAt DESC LIMIT 1;', 
                    (function(newCollaborationEntity){
                      return function(err, rows, fields){
                         if (rows !== undefined && rows.length >= 1) {
                          // If the entity already exists, use its ID for the entity id when inserting into connections...
                          connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, Render) VALUES (' + result.insertId + ',' + rows[0].ID + ',"Collaboration", 1);', function(err) {
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
                          connection.query('INSERT INTO Entities (Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + newCollaborationEntity + '","' + newCollaborationEntity + '","Unknown",' + null + ',"Unknown",' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + null + ',' + 'NOW(), 0);', function(err, resultInner) {
                            if (err) throw err;
                            connection.query('SELECT * FROM Entities WHERE ((Name = "' + newCollaborationEntity + '" OR Nickname = "' + newCollaborationEntity + '") AND Render=0) ORDER BY CreatedAt DESC LIMIT 1;', function(err, innerRows, innerFields) {
                              if (err) throw err;
                              connection.query('INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, Render) VALUES (' + result.insertId + ',' + innerRows[0].ID + ',"Collaboration", 0);', function(err) {
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

        asyncTasks.push(function(callback){
          var counterR = 0;
          if (entity.revenue !== null) {
              (entity.revenue).forEach(function(object) {
                  var id = result.insertId;

                  connection.query('INSERT INTO Operations (EntityID, Finance, Amount, Year) VALUES (' + id + ',"Revenue",' + object.amount + ',' + object.year + ');', function(err) {
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

                  connection.query('INSERT INTO Operations (EntityID, Finance, Amount, Year) VALUES (' + id + ',"Expenses",' + object.amount + ',' + object.year + ');', function(err) {
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
              if (err) {
                  console.log(err);
              } else {
                  data = JSON.parse(data);
                  console.log(data);
                  data.splice(-1,1);
                  
                  fs.writeFile(file, JSON.stringify(data), function (err) {
                    if (err) return console.log(err);
                    console.log('data.json saved.-----------------------------');
                    renderJSON(connection);
                  });
              }
          });
                    //connection.release();
                    //console.log("Completed");
                
        });
    };  

  var insertNode = function(pastID, entity, categories, url, twitter_handle, followers, employees, influence, relations, key_people) {

    connection.query('INSERT INTO Entities (Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + entity.name + '","' + entity.nickname + '","' + entity.type + '",' + categories + ',"' + entity.location + '",' + url + ',' + twitter_handle + ',' + followers + ',' + employees + ',' + influence + ',' + relations + ',' + key_people + ',' + 'NOW(), 1);', function(err, result) {
          if (err) throw err;

          console.log("Current: " + result.insertId);
          console.log("Past: " + pastID);
          if(pastID !== -1)
          {

            connection.query('UPDATE `Operations` SET `EntityID`=' + result.insertId + ' WHERE (EntityID=' + pastID + ')', function(err){
              if (err) throw err;
              console.log('updated...');
              connection.query('UPDATE `Bridges` SET `Entity2ID`=' + result.insertId + ' WHERE Entity2ID=' + pastID + ' AND Render=1', function(err){
                if (err) throw err;
                console.log("Inside");
                developJSON(result, entity);
                
              });
            });
          }
          else
          {
            developJSON(result, entity);
          }
      });
  };


        connection.query("SET @count = -1;", function(err) {
            if (err) throw err;
            connection.query("UPDATE `Entities` SET `ID` = @count := @count + 1;", function(err) {
                if (err) throw err;
                // connection.query("ALTER TABLE `Entities` AUTO_INCREMENT = 1;", function(err) {
                    // if (err) throw err;
                    var followers, employees, categories, url,
                        twitter_handle, influence,
                        relations, key_people;

                    connection.query('SET @@auto_increment_increment=1;', function(err) {
                        if (err) throw err;

                        connection.query('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";', function(err) {
                            if (err) throw err;
                        

                            console.log("Finally got here...");

                            (entity.categories !== null) ? categories = '"' + entity.categories.join(", ") + '"': categories = null;
                            (entity.url !== null) ? url = '"' + entity.url + '"': url = null;
                            (entity.twitter_handle !== null) ? twitter_handle = '"' + entity.twitter_handle + '"': twitter_handle = null;
                            (entity.followers !== null) ? followers = entity.followers: followers = null;
                            (entity.employees !== null) ? employees = entity.employees: employees = null;
                            (entity.influence !== null) ? influence = '"' + entity.influence + '"': influence = null;
                            (entity.relations !== null) ? relations = '"' + entity.relations.join(", ") + '"': relations = null;
                            (entity.key_people !== null) ? key_people = '"' + entity.key_people.join(", ") + '"': key_people = null;

                            //  Need to check if it exists prior to entering into the database.
                            connection.query('SELECT * FROM Entities WHERE ((Name="' + entity.name + '" OR Nickname="' + entity.name + '") AND Render=1) ORDER BY CreatedAt DESC LIMIT 1', function(err, rows, field){
                              if (err) throw err;

                              if(rows.length > 0)
                              {
                                connection.query('UPDATE `Entities` SET `Render`=0 WHERE ((Name="' + entity.name + '" OR Nickname="' + entity.name + '") AND Render=1)', function(err){
                                  if (err) throw err;

                                  connection.query('UPDATE `Bridges` SET `Render`=0 WHERE (Entity1ID=' + rows[0].ID + ' AND Render=1)', function(err){
                                    if (err) throw err;
                                    
                                    connection.query('UPDATE `Operations` SET `Render`=0 WHERE (EntityID=' + rows[0].ID + ' AND Render=1', function(err){

                                      if(typeof(rows[0].Followers) === "number"){
                                        insertNode(rows[0].ID, entity, categories, url, twitter_handle, rows[0].Followers, employees, influence, relations, key_people);
                                      }
                                      else{
                                        insertNode(rows[0].ID, entity, categories, url, twitter_handle, followers, employees, influence, relations, key_people);
                                      }

                                    });
                                  });
                                });
                               
                              }
                              else
                              {
                                insertNode(-1, entity, categories, url, twitter_handle, followers, employees, influence, relations, key_people);
                              }
                            });
                        });
                    });

                // });
            });
        });
  });

  function renderJSON(connection){
  var done = function() {
    fs.writeFile(civicJSON, JSON.stringify(content), function(err) {
        if (err) {
            console.log(err);
        } else {
            var end = new Date().getTime();
            console.log("Overall Time: " + (end - start));
            console.log("civic.json file was saved!");
            connection.release();
        }
    });
  };

  var content= {
        nodes: [], data_connections: [], funding_connections: [], investment_connections: [], collaboration_connections: []
    }; 

  var asyncProcesses = [];

    //  Generating all of the node based data with revenue and expense data and ????????????node being rendered???????????...
    //  Must construct a dictionary of {name:[list of financial data]}
    asyncProcesses.push(function(callback){
      connection.query('SELECT e.name, o.finance, o.amount, o.year FROM entities as e INNER JOIN operations as o on e.ID = o.entityid', function(err, result) {
        if (err) throw err;

        var createDictionary = function (d, doneCallback) {
          if(!(d.name in operationsDict))
            //  Must create a new name key within the dictionary            
            operationsDict[d.name] = {revenue:[], expenses:[]};
          switch(d.finance)
          {
            case "Revenue":
              operationsDict[d.name]['revenue'].push({amount: d.amount, year: d.year});
              break;
            case "Expenses":
              operationsDict[d.name]['expenses'].push({amount: d.amount, year: d.year});  
              break;
            default:
              break;
          }
          return doneCallback(null, "Completed Iteration.");
        };

        var operationsDict = {};

        //  Example data piece...
        // {
        //   "John D. Rockefeller Foundation": {revenue: [[20000, 2014]], expenses: []}
        // }

        async.map(result, createDictionary, function(err, result){
          callback(null, operationsDict);
        });
      });
    });

    //  Generating all of the node based data...
    //  Must construct a dictionary of {}
    asyncProcesses.push(function(callback){
      connection.query('SELECT * FROM entities', function(err, result){
        if (err) throw err;

        callback(null, result);
      });
    });

    //  Generating all of the connection based data...
    //  Must construct a dictionary of {source_name:[list of connections]}
    asyncProcesses.push(function(callback){
      connection.query('SELECT e1.name as name1, b.entity1id, e2.name as name2, b.entity2id, b.connection, b.connectionyear, b.amount, b.render FROM cdb_c7da98943c.bridges b LEFT JOIN cdb_c7da98943c.entities e1 on e1.ID = b.Entity1ID LEFT JOIN cdb_c7da98943c.entities e2 on e2.ID = b.Entity2ID;', function(err, result){
        if (err) throw err;

        var createDictionary = function (d, doneCallback) {
          if(!(d.name1 in connectionsDict))
            //  Must create a new name key within the dictionary            
            connectionsDict[d.name1] = {funding_received:[], funding_given:[], investments_received:[], investments_made:[], data:[], collaborations:[]};
          if(d.render == 1)
            switch(d.connection)
            {
              case "Funding Received":
                connectionsDict[d.name1]['funding_received'].push({entity:d.name2, amount: d.amount, year: d.connectionyear});
                break;
              case "Funding Given":
                connectionsDict[d.name1]['funding_given'].push({entity:d.name2, amount: d.amount, year: d.connectionyear});
                break;
              case "Investment Received":
                connectionsDict[d.name1]['investments_received'].push({entity:d.name2, amount: d.amount, year: d.connectionyear});
                break;
              case "Investment Given":
                connectionsDict[d.name1]['investments_made'].push({entity:d.name2, amount: d.amount, year: d.connectionyear});
                break;
              case "Data":
                connectionsDict[d.name1]['data'].push({entity: d.name2});
                break;
              case "Collaboration":
                connectionsDict[d.name1]['collaborations'].push({entity: d.name2});  
                break;
              default:
                break;
            }
          return doneCallback(null, "Completed Iteration.");
        };

        var connectionsDict = {};
        var asyncConnectionsTasks = [];

        //  Process for actual content
        asyncConnectionsTasks.push(function(contentCallback){

          async.filter(result, function(d, booleanCallback){
              switch(d.connection)
              {
                case "Funding Received":
                  (content.funding_connections).push({
                    source: d.entity1id,
                    target: d.entity2id,
                    type: "Received",
                    year: d.connectionyear,
                    amount: d.amount,
                    render: d.render
                  });
                  break;
                case "Funding Given":
                  (content.funding_connections).push({
                    source: d.entity1id,
                    target: d.entity2id,
                    type: "Given",
                    year: d.connectionyear,
                    amount: d.amount,
                    render: d.render
                  });
                  break;
                case "Investment Received":
                  (content.investment_connections).push({
                    source: d.entity1id,
                    target: d.entity2id,
                    type: "Received",
                    year: d.connectionyear,
                    amount: d.amount,
                    render: d.render
                  });
                  break;
                case "Investment Given":
                  (content.investment_connections).push({
                    source: d.entity1id,
                    target: d.entity2id,
                    type: "Made",
                    year: d.connectionyear,
                    amount: d.amount,
                    render: d.render
                  });
                  break;
                case "Collaboration":
                  (content.collaboration_connections).push({
                    source: d.entity1id,
                    target: d.entity2id,
                    render: d.render
                  });
                  break;
                case "Data":
                  (content.data_connections).push({
                    source: d.entity1id,
                    target: d.entity2id,
                    render: d.render
                  });
                default:
                  break;
              }
              return booleanCallback(true);
            }, function(filteredData){
              console.log(filteredData.length);
              contentCallback(null, "Finished processing content.");
              // results now equals an array of the existing files
            }
          );
        });

        //  Process dictionary...
        asyncConnectionsTasks.push(function(dictionaryCallback){
          async.map(result, createDictionary, function(err, result){
            dictionaryCallback(null, "Finished processing dictionary.");
          });
        });

        async.parallel(asyncConnectionsTasks, function(err, result){
          callback(null, connectionsDict);
        });
      });
    });

    async.parallel(asyncProcesses, function(err, results){
      var operationsDict = results[0];
      var entitiesDump = results[1];
      var connectionsDict = results[2];

      console.log(JSON.stringify(connectionsDict));

      var generateNodeData = function(d, completeCallback){
        var object = {ID: null, type: null, categories: null, name: null, nickname: null, location: null, url: null, employees: null, key_people: null, twitter_handle: null, followers: null, relations: null, influence: null, funding_received: [], funding_given: [], investments_received: [], investments_made: [], collaborations: [], data: [], revenue: [], expenses: []};

        
        object['ID'] = d.ID;
        object['type'] = d.Type;
        (d.Categories !== null) ? object['categories'] = (d.Categories).split(", "): object['categories'] = null;
        object['name'] = d.Name;
        object['nickname'] = d.Nickname;
        object['location'] = d.Location;

        (d.Website !== null) ? object['url'] = d.Website: object['url'] = null;
        (d.Employees !== null) ? object['employees'] = d.Employees: object['employees'] = null;

        if (d.KeyPeople !== null)
        {
          var people = d.KeyPeople.split(", ");
          object['key_people'] = [];
          for(var i = 0; i < people.length; i++)
          {
            object['key_people'].push({name: people[i]});
          }
          
        } 
        else
        {
          object['key_people'] = null;
        }                  

        (d.TwitterHandle !== null) ? object['twitter_handle'] = d.TwitterHandle: object['twitter_handle'] = null;
        (d.Followers !== null) ? object['followers'] = d.Followers: object['followers'] = null;

        if (d.Relations !== null)
        {
          var relations = d.Relations.split(", ");
          object['relations'] = [];
          for(var i = 0; i < relations.length; i++)
          {
            object['relations'].push({entity: relations[i]});
          }
        } 
        else
        {
          object['relations'] = null;
        }    

        (d.Influence !== null) ? object['influence'] = d.Influence: object['influence'] = null;

        if(d.Name in connectionsDict)
        {
          object['funding_received'] = connectionsDict[d.Name]['funding_received'];
          object['funding_given'] = connectionsDict[d.Name]['funding_given'];
          object['investments_received'] = connectionsDict[d.Name]['investments_received'];
          object['investments_made'] = connectionsDict[d.Name]['investments_made'];
          object['collaborations'] = connectionsDict[d.Name]['collaborations'];
          object['data'] = connectionsDict[d.Name]['data'];
        }

        if(d.Name in operationsDict)
        {
          object['revenue'] = operationsDict[d.Name]['revenue'];
          object['expenses'] = operationsDict[d.Name]['expenses'];
        }

        object['render'] = d.Render;

        //  Time to clean up...
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
        {
          object['revenue'] = null;
        }
        if(object['expenses'].length === 0)
        {
          object['expenses'] = null;
        }

        content.nodes.push(object);

        return completeCallback(null, "Completed Iteration.");
      };
      async.map(entitiesDump, generateNodeData, function(err, result){
        done();
      });
    });
  }

};