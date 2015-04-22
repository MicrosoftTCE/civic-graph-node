var mysql = require('mysql');
var fs = require('fs');
var async = require('async');

var startTime = new Date().getTime();

var connection = mysql.createConnection({
  connectionLimit: 40,
  port: 3306,
  host: 'au-cdbr-azure-east-a.cloudapp.net',
  user: 'b0c63aecaa6676',
  password: '8e008947',
  database: 'cdb_c7da98943c'
});

//  Testbench Time: 4.31 min.

 connection.connect();

var start = new Date().getTime();

var done = function() {
    var file = 'civic.json';
    fs.writeFile(file, JSON.stringify(content), function(err) {
        if (err) {
            console.log(err);
        } else {
            var endTime = new Date().getTime();

            var differenceWithoutConnection = endTime - start;
            var differenceWithConnection = endTime - startTime;
            console.log("Time Differential Without Connection: " + differenceWithoutConnection);
            console.log("Time Differential With Connection: " + differenceWithConnection);
            console.log("The file was saved!");
            connection.end();
            process.exit(1);

        }
    });
  };

  var content= {
        nodes: [], data_connections: [], funding_connections: [], investment_connections: [], collaboration_connections: []
    }; 

  var asyncTasks = [];

    //  Generating all of the node based data with revenue and expense data and ????????????node being rendered???????????...
    //  Must construct a dictionary of {name:[list of financial data]}
    asyncTasks.push(function(callback){
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
    asyncTasks.push(function(callback){
      connection.query('SELECT * FROM entities', function(err, result){
        if (err) throw err;
        callback(null, result);
      });
    });

    //  Generating all of the connection based data...
    //  Must construct a dictionary of {source_name:[list of connections]}
    asyncTasks.push(function(callback){
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

    async.parallel(asyncTasks, function(err, results){
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
