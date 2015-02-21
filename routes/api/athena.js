exports.retrieve_all = function(request, response){
  var content = {
        nodes: [], data_connections: [], funding_connections: [], investment_connections: [], collaboration_connections: []
    };

  request.getConnection(function (err, connection) {
    if (err) throw err;
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

              entities.forEach(function(d){
                currentNode = d;

                connection.query("SELECT Entities.Name, Bridges.Entity1ID, Bridges.Entity2ID, Bridges.Connection, Bridges.ConnectionYear, Bridges.Amount FROM Bridges INNER JOIN Entities ON Bridges.Entity2ID=Entities.ID AND Bridges.Entity1ID=" + currentNode.ID, 
                      (function(currentNode){
                        return function(err, rows, fields) {
                          if (err) return err;
                            console.log("Rows: " + rows);
                              var object = {};
                              object['ID'] = currentNode.ID;
                              object['type'] = currentNode.Type;
                              (currentNode.Categories !== null) ? object['categories'] = (currentNode.Categories).split(", "): object['categories'] = null;
                              object['name'] = currentNode.Name;
                              object['nickname'] = currentNode.Nickname;
                              object['location'] = currentNode.Location;
                              (currentNode.Website !== null) ? object['url'] = currentNode.Website: object['url'] = null;
                              (currentNode.Employees !== null) ? object['employees'] = currentNode.Employees: object['employees'] = null;
                              (currentNode.KeyPeople !== null) ? object['key_people'] = currentNode.KeyPeople.split(", "): object['key_people'] = null;
                              (currentNode.TwitterHandle !== null) ? object['twitter_handle'] = currentNode.TwitterHandle: object['twitter_handle'] = null;
                              (currentNode.Followers !== null) ? object['followers'] = currentNode.Followers: object['followers'] = null;
                              (currentNode.Relations !== null) ? object['relations'] = (currentNode.Relations).split(", "): object['relations'] = null;
                              (currentNode.Influence !== null) ? object['influence'] = currentNode.Influence: object['influence'] = null;
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

                              if(operations.length !== 0)
                              {
                                operations.forEach(function(e){
                                  if(currentNode.ID === e.EntityID){
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
                                  }
                                });
                              }

                              object['render'] = currentNode.Render;

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

                              // console.log(object);
                              content.nodes.push(object);
                            if(currentNode === entities[entities.length - 1])
                            {
                              response.json(content);
                            }
                      
                  }
                })(currentNode));
              });
          });
      });
    });
  });
}