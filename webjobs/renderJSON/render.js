var mysql = require('mysql');
var fs = require('fs');
var async = require('async');
var connection = mysql.createConnection({
  host: 'us-cdbr-azure-east-b.cloudapp.net',
  user: 'bab063a997d6ce',
  password: 'd5fd92fd',
  database: 'civicteabtdklgiw'
});

 connection.connect();

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
                  object['funding_received'] = [];
                  object['funding_given'] = [];
                  object['investments_received'] = [];
                  object['investments_made'] = [];
                  object['collaborations'] = [];
                  object['data'] = [];
                  object['revenue'] = [];
                  object['expenses'] = [];

                  if(rows.length !== 0)
                  {
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
                  }

                  if(operationRows !== undefined)
                  {
                    if(operationRows.length !== 0)
                    {
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
                    }
                  }
                  
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
                  
                  console.log("testing");
                  callback(null, object);
              });
        
      });

  };

  var done = function(err, result) {
                                              
    content.nodes = result;
    
    var file = 'D:\\home\\site\\wwwroot\\public\\data\\civic.json';
    fs.writeFile(file, JSON.stringify(content), function(err) {
        if (err) {
            console.log(err);
        } else {
          
            console.log("The file was saved!");
            process.exit(1);

        }
    });
  };

  var content= {
        nodes: [], data_connections: [], funding_connections: [], investment_connections: [], collaboration_connections: []
    }; 

    connection.query('SELECT * FROM Entities', function(err, result) {
      if (err) throw err;
      
      entities = result;

      connection.query('SELECT * FROM Bridges', function(err, result) {
        if (err) throw err;
        connections = result;

          connection.query('SELECT * FROM Operations', function(err, result) {
            if (err) throw err;
            operations = result;

              connections.filter(function(d) {
                return d.Connection === "Funding Received" || d.Connection === "Funding Given";
              }).forEach(function(d) {
                // console.log(d);

                if(d.Connection === "Funding Received")
                {
                  (content.funding_connections).push({
                      source: d.Entity1ID,
                      target: d.Entity2ID,
                      type: "Received",
                      year: d.ConnectionYear,
                      amount: d.Amount,
                      render: d.Render
                  });
                }
                else
                {
                  (content.funding_connections).push({
                      source: d.Entity1ID,
                      target: d.Entity2ID,
                      type: "Given",
                      year: d.ConnectionYear,
                      amount: d.Amount,
                      render: d.Render
                  });
                }
              });

              connections.filter(function(d) {
                  return d.Connection === "Investment Received" || d.Connection === "Investment Made";
              }).forEach(function(d) {
                if(d.Connection === "Investment Received")
                {
                  (content.investment_connections).push({
                      source: d.Entity1ID,
                      target: d.Entity2ID,
                      type: "Received",
                      year: d.ConnectionYear,
                      amount: d.Amount,
                      render: d.Render
                  });
                }
                else
                {
                  (content.investment_connections).push({
                      source: d.Entity1ID,
                      target: d.Entity2ID,
                      type: "Made",
                      year: d.ConnectionYear,
                      amount: d.Amount,
                      render: d.Render
                  });
                }
              });

              connections.filter(function(d) {
                  return d.Connection === "Collaboration";
              }).forEach(function(d) {
                  (content.collaboration_connections).push({
                      source: d.Entity1ID,
                      target: d.Entity2ID,
                      render: d.Render
                  });
              });

              connections.filter(function(d) {
                  return d.Connection === "Data";
              }).forEach(function(d) {
                  (content.data_connections).push({
                      source: d.Entity1ID,
                      target: d.Entity2ID,
                      render: d.Render
                  });
              });

              async.map(entities,acquireNodes, done);
              connection.end();
             
    });
  });
});