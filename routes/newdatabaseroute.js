var async = require('async');
var fs = require('fs');
var path = require("path");
var mysql = require('mysql');

var file = path.join(__dirname, '..', 'routes', 'newdata.json');

var db_config = require('./../configuration/credentials.js');
var pool = mysql.createPool(db_config.cred.cleardb);

var startTime = new Date().getTime();

pool.getConnection(function(err, connection){
  var entity = request.body;

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

  //  Normalize data and aggregate names and amounts and years.
  function initialize(entity){
    asyncInitial = [];

    asyncInitial.push(function(callback){
      connection.query('SET @@auto_increment_increment=1', function(error, result){
        if(err) throw err;
        callback(null, "Auto-increment set to 1.")
      });
    });
    asyncInitial.push(function(callback){
      for (var property in entity) {
        if (entity[property] === "") {
            entity[property] = null;
        }
      }
      callback(null, "Property values cleaned.");
    });
    asyncInitial.push(function(callback){
      var funding_received_condition = [];
      if (entity.funding_received !== null) {
        for (var i = 0; i < entity.funding_received.length; i++) {
          var funding = entity.funding_received[i];
          if (funding.amount === "")
              funding.amount = null;
          if (funding.year === "")
              funding.year = null;
          funding_received_condition.push('(SELECT e1.name as name1, e1.nickname as nickname1, b.entity1id, e2.name as name2, e2.nickname as nickname2, b.entity2id, b.connection, b.connectionyear, b.amount, b.render FROM cdb_c7da98943c.bridges b LEFT JOIN cdb_c7da98943c.entities e1 on e1.ID = b.Entity1ID LEFT JOIN cdb_c7da98943c.entities e2 on e2.ID = b.Entity2ID WHERE ((e2.name="' + funding.entity + '" or e2.nickname="' + funding.entity + '") and (b.year=' + funding.year + ') and (b.connection="Funding Received")) ORDER BY b.entity2id DESC LIMIT 1)');
        }
      }
      callback(null, funding_received_condition);
    });
    asyncInitial.push(function(callback){
      var investment_received_condition = [];
      if (entity.investments_received !== null) {
        for (var i = 0; i < entity.investments_received.length; i++) {
          var investment = entity.investments_received[i];
          if (investment.amount === "")
              investment.amount = null;
          if (investment.year === "")
              investment.year = null;
          funding_received_condition.push('(SELECT e1.name as name1, e1.nickname as nickname1, b.entity1id, e2.name as name2, e2.nickname as nickname2, b.entity2id, b.connection, b.connectionyear, b.amount, b.render FROM cdb_c7da98943c.bridges b LEFT JOIN cdb_c7da98943c.entities e1 on e1.ID = b.Entity1ID LEFT JOIN cdb_c7da98943c.entities e2 on e2.ID = b.Entity2ID WHERE ((e2.name="' + investment.entity + '" or e2.nickname="' + investment.entity + '") and (b.year=' + investment.year + ') and (b.connection="Investment Received")) ORDER BY b.entity2id DESC LIMIT 1)');
        }
      }
      callback(null, investment_received_condition);
    });
    asyncInitial.push(function(callback){
      var funding_given_condition = [];
      if (entity.funding_given !== null) {
        for (var i = 0; i < entity.funding_given.length; i++) {
          var funding = entity.funding_given[i];
          if (funding.amount === "")
              funding.amount = null;
          if (funding.year === "")
              funding.year = null;
          funding_received_condition.push('(SELECT e1.name as name1, e1.nickname as nickname1, b.entity1id, e2.name as name2, e2.nickname as nickname2, b.entity2id, b.connection, b.connectionyear, b.amount, b.render FROM cdb_c7da98943c.bridges b LEFT JOIN cdb_c7da98943c.entities e1 on e1.ID = b.Entity1ID LEFT JOIN cdb_c7da98943c.entities e2 on e2.ID = b.Entity2ID WHERE ((e2.name="' + funding.entity + '" or e2.nickname="' + funding.entity + '") and (b.year=' + funding.year + ') and (b.connection="Funding Given")) ORDER BY b.entity2id DESC LIMIT 1)');
        }
      }
      callback(null, funding_given_condition);
    });
    asyncInitial.push(function(callback){
      var investment_made_condition = [];
       if (entity.investments_made !== null) {
        for (var i = 0; i < entity.investments_made.length; i++) {
          var investment = entity.investments_made[i];
          if (investment.amount === "")
              investment.amount = null;
          if (investment.year === "")
              investment.year = null;
          investment_made_condition.push('(SELECT e1.name as name1, e1.nickname as nickname1, b.entity1id, e2.name as name2, e2.nickname as nickname2, b.entity2id, b.connection, b.connectionyear, b.amount, b.render FROM cdb_c7da98943c.bridges b LEFT JOIN cdb_c7da98943c.entities e1 on e1.ID = b.Entity1ID LEFT JOIN cdb_c7da98943c.entities e2 on e2.ID = b.Entity2ID WHERE ((e2.name="' + investment.entity + '" or e2.nickname="' + investment.entity + '") and (b.year=' + investment.year + ') and (b.connection="Investment Made")) ORDER BY b.entity2id DESC LIMIT 1)');
        }
      }
      callback(null, investment_made_condition);
    });
    asyncInitial.push(function(callback){
       if (entity.revenue !== null) {
        for (var i = 0; i < entity.revenue.length; i++) {
          var revenue_item = entity.revenue[i];
          if (revenue_item.amount === "")
              revenue_item.amount = null;
          if (revenue_item.year === "")
              revenue_item.year = null;
        }
      }
      callback(null, "Revenue values cleaned.");
    });
    asyncInitial.push(function(callback){
      if (entity.expenses !== null) {
        for (var i = 0; i < entity.expenses.length; i++) {
          var expense = entity.expenses[i];
          if (expense.amount === "")
              expense.amount = null;
          if (expense.year === "")
              expense.year = null;
        }
      }
      callback(null, "Expenses values cleaned.");
    });
    asyncInitial.push(function(callback){
      (entity.categories !== null) ? categories = '"' + entity.categories.join(", ") + '"': categories = null;
      (entity.url !== null) ? url = '"' + entity.url + '"': url = null;
      (entity.twitter_handle !== null) ? twitter_handle = '"' + entity.twitter_handle + '"': twitter_handle = null;
      (entity.followers !== null) ? followers = entity.followers: followers = null;
      (entity.employees !== null) ? employees = entity.employees: employees = null;
      (entity.influence !== null) ? influence = '"' + entity.influence + '"': influence = null;
      (entity.relations !== null) ? relations = '"' + entity.relations.join(", ") + '"': relations = null;
      (entity.key_people !== null) ? key_people = '"' + entity.key_people.join(", ") + '"': key_people = null;
    });
    asyncInitial.push(function(callback){
      connection.query('SELECT * FROM Entities WHERE ((Name="' + entity.name + '" OR Nickname="' + entity.name + '") AND Render=1) ORDER BY CreatedAt DESC LIMIT 1', function(err, rows, field){
        if(err) throw err;
        var id = -1;
        if(rows.length > 0)
        {
          id = rows.length;
        }
        callback(null, id);
      });    
    });

    asyncInitial.parallel(function(err, result){
      //  

      'SELECT *'


      'INSERT INTO Bridges (Entity1ID, Entity2ID, Connection, ConnectionYear, Amount, Render)' + + 

    });

    initialize();
  }
});

//INSERT INTO Entities (ID, Name, Nickname, Type, Location) VALUES (799, "matthew", "matthew", "Individual", "New York, NY")

//UPDATE entities SET Name = "hello" where name = "matthew"
