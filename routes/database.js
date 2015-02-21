exports.save = function(request, response){
  var entity = request.body;
  request.getConnection(function (err, connection){
    //  Cleans up the sent stringified data.

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

  var developJSON = function(result, entity)
  {
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
                                });
                              });
                              
                          });
                        }
                      };
                    })(newFundingReceivedEntity));                   
              });
          }

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
                                });
                              });
                              
                          });
                        }
                      }
                    })(newInvestmentsReceivedEntity));

              });
          }

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
                                });
                              });
                              
                          });
                        }

                      };
                    })(newInvestmentsMadeEntity));


              
              });
          }

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
                                  });
                                });
                                
                            });
                          }
                        };
                  })(newFundingGivenEntity));
   
                  });
          }

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
                                });
                              });
                              
                            });
                          }
                        };
                     })(newDataEntity));
              }
          }

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
                               });
                              });
                            
                          });
                        }
                      };
                    })(newCollaborationEntity));
              }
          }

          if (entity.revenue !== null) {
              (entity.revenue).forEach(function(object) {
                  var id = result.insertId;

                  connection.query('INSERT INTO Operations (EntityID, Finance, Amount, Year) VALUES (' + id + ',"Revenue",' + object.amount + ',' + object.year + ');', function(err) {
                      if (err) throw err;
                  });
              });
          }

          if (entity.expenses !== null) {
              (entity.expenses).forEach(function(object) {
                  var id = result.insertId;

                  connection.query('INSERT INTO Operations (EntityID, Finance, Amount, Year) VALUES (' + id + ',"Expenses",' + object.amount + ',' + object.year + ');', function(err) {
                      if (err) throw err;
                  });
              });
          }
          //  Time to export this data to a json file!
          connection.query("SET @count = -1;", function(err) {
              if (err) throw err;
              connection.query("UPDATE `Entities` SET `ID` = @count := @count + 1;", function(err) {
                  if (err) throw err;

                    console.log("done");
                  });
              }); 
            };  

  var insertNode = function(pastID, entity, categories, url, twitter_handle, followers, employees, influence, relations, key_people) {
    connection.query('INSERT INTO Entities (Name, Nickname, Type, Categories, Location, Website, TwitterHandle, Followers, Employees, Influence, Relations, KeyPeople, CreatedAt, Render) VALUES ("' + entity.name + '","' + entity.nickname + '","' + entity.type + '",' + categories + ',"' + entity.location + '",' + url + ',' + twitter_handle + ',' + followers + ',' + employees + ',' + influence + ',' + relations + ',' + key_people + ',' + 'NOW(), 1);', function(err, result) {
          if (err) throw err;

          console.log("Current: " + result.insertId);
          console.log("Past: " + pastID);
          if(pastID !== -1)
          {
            connection.query('UPDATE `Bridges` SET `Entity2ID`=' + result.insertId + ' WHERE Entity2ID=' + pastID + ' AND Render=1', function(err){
              console.log("Inside");
              developJSON(result, entity);
              if (err) throw err;
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
                    connection.query('SELECT * FROM Entities WHERE ((Name="' + entity.name + '" OR Nickname="' + entity.name + '") AND Render=1) ORDER BY CreatedAt DESC LIMIT 1', function(err, rows, field){
                      if (err) throw err;

                      if(rows.length > 0)
                      {
                        connection.query('UPDATE `Entities` SET `Render`=0 WHERE Name="' + entity.name + '" OR Nickname="' + entity.name + '"', function(err){
                          if (err) throw err;
                          connection.query('UPDATE `Bridges` SET `Render`=0 WHERE Entity1ID=' + rows[0].ID, function(err){
                            if (err) throw err;
                            insertNode(rows[0].ID, entity, categories, url, twitter_handle, followers, employees, influence, relations, key_people);
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
        });
  });
};