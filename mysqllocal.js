(function(){
  var mysql = require('mysql');
  var fs = require('fs');

  var file = __dirname + '/public/data/civic.json';

  var db_config = require('./configuration/credentials.js');
  var connection = mysql.createConnection(db_config.cred.localhost);

  connection.connect();

    connection.query('CREATE DATABASE IF NOT EXISTS ' + db_config.cred.localhost.database, function (err) {
      if (err) throw err;
      connection.query('USE ' + db_config.cred.localhost.database, function (err) {
          if (err) throw err;

          connection.query('CREATE TABLE IF NOT EXISTS Entities('
              + 'ID INT NOT NULL AUTO_INCREMENT UNIQUE,'
              + 'Name VARCHAR(100) NOT NULL,'                  // Entity Name
              + 'Nickname VARCHAR(100) NOT NULL,'              // Nickname        
              + 'Type VARCHAR(30) NOT NULL,'                   // Type of Entity
              + 'Categories VARCHAR(100),'                     // Category
              + 'Location VARCHAR(100) NOT NULL,'              // Location
              + 'Website VARCHAR(100),'                        // Website
              + 'TwitterHandle VARCHAR(50),'                   // Twitter Handle
              + 'Followers INT,'                               // Number of Twitter Followers
              + 'Employees INT,'                               // Number of Employees
              + 'Influence VARCHAR(8),'    
              + 'Relations VARCHAR(1000),'                     // Related To
              + 'KeyPeople VARCHAR(1000),'                     // Key People   
              + 'IPAddress VARCHAR(100),' 
              + 'IPGeolocation VARCHAR(100),'
              + 'CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,'
              + 'Render INT,'           
              + 'PRIMARY KEY(ID, CreatedAt)'
              +  ')', function (err) {
                  if (err) throw err;
              });

          connection.query('CREATE TABLE IF NOT EXISTS Bridges('
              + 'ID INT NOT NULL AUTO_INCREMENT UNIQUE,'
              + 'Entity1ID INT NOT NULL,'
              + 'Entity2ID INT NOT NULL,'
              + 'Connection VARCHAR(30),'
              + 'ConnectionYear INT,'
              + 'Amount BIGINT,'
              + 'Render INT,'  
              + 'PRIMARY KEY (ID),'
              + 'FOREIGN KEY (Entity1ID) REFERENCES Entities(ID) ON UPDATE CASCADE,'
              + 'FOREIGN KEY (Entity2ID) REFERENCES Entities(ID) ON UPDATE CASCADE'
              + ')', function (err) {
                  if(err) throw err;
              });

          connection.query('CREATE TABLE IF NOT EXISTS Operations('
              + 'ID INT NOT NULL AUTO_INCREMENT UNIQUE,'
              + 'EntityID INT NOT NULL,'
              + 'Finance VARCHAR(10) NOT NULL,'
              + 'Amount BIGINT,'
              + 'Year INT,'
              + 'FOREIGN KEY (EntityID) REFERENCES Entities(ID) ON UPDATE CASCADE'
              + ')', function (err) {
                  if(err) throw err;
              });

          connection.query('CREATE TABLE IF NOT EXISTS Cities('
              + 'ID INT NOT NULL AUTO_INCREMENT UNIQUE,'
              + 'City_Name VARCHAR(50) NULL,'
              + 'State_Code VARCHAR(5) NULL,'
              + 'State_Name VARCHAR(50) NULL,'
              + 'Country_Code VARCHAR(5) NULL,'
              + 'Country_Name VARCHAR(50) NULL,'
              + 'City_Lat DECIMAL(18, 15) NULL,'
              + 'City_Long DECIMAL(18, 15) NULL,'
              + 'PRIMARY KEY (ID)'
              + ')', function (err) {
                  if(err) throw err;
              });

          connection.query('CREATE TABLE IF NOT EXISTS Locations('
              + 'ID INT NOT NULL AUTO_INCREMENT UNIQUE,'
              + 'Entity_ID INT NOT NULL,'
              + 'City_ID INT NOT NULL,'
              + 'Address VARCHAR(200) NULL,'
              + 'Address_Lat DECIMAL(18, 15),'
              + 'Address_Long DECIMAL(18, 15),'
              + 'PRIMARY KEY (ID),'
              + 'FOREIGN KEY (Entity_ID) REFERENCES Entities(ID) ON UPDATE CASCADE,'
              + 'FOREIGN KEY (City_ID) REFERENCES Cities(ID) ON UPDATE CASCADE'
              + ')', function (err) {
                  if(err) throw err;
                  // console.log(err);
              });

          connection.query('SET @@auto_increment_increment=1;', function(err){
              if(err) throw err;
          });

          connection.query('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";', function(err){
              if(err) throw err;
              //  If most recent entries are deleted, set to the next lowest available one.
              connection.query('ALTER TABLE Entities AUTO_INCREMENT=1;', function(err){
                if(err) throw err;
              });

              connection.query('ALTER TABLE Bridges AUTO_INCREMENT=1;', function(err){
                if(err) throw err;
              });

              connection.query('ALTER TABLE Operations AUTO_INCREMENT=1;', function(err){
                if(err) throw err;
              });

              connection.query('ALTER TABLE Locations AUTO_INCREMENT=1;', function(err){
                if(err) throw err;
              });

              connection.query('ALTER TABLE Cities AUTO_INCREMENT=1;', function(err){
                if(err) throw err;
              });
          });

          fs.readFile(file, 'utf8', function(err, data){
              if(err){
                  console.log('Error: ' + err)
              }
              
              data = JSON.parse(data);

              insertEntities(data);
              insertDataConnections(data);
              insertFundingConnections(data);
              insertInvestmentConnections(data);
              insertCollaborationConnections(data);
              insertOperations(data);
          });
      });
  });

  var insertEntities = function(data){
    // console.log(data);
    for(var i = 0; i < (data.nodes).length; i++){
      var categories;
      var relations = '';
      var key_people = '';
      ((data.nodes)[i].categories !== null) ? categories = (data.nodes)[i].categories.join(", ") : categories = null;
      if((data.nodes)[i].relations !== null) 
      {
        (data.nodes)[i].relations.forEach(function(d, x){if(x === (data.nodes)[i].relations.length){relations += d.entity;} else{relations += d.entity + ", "; }});
      }
      else
      {
        relations = null;
      }
      if((data.nodes)[i].key_people !== null) 
      {
        (data.nodes)[i].key_people.forEach(function(d, x){if(x === (data.nodes)[i].key_people.length){key_people += d.name;} else{key_people += d.name + ", "; }});
      }
      else
      {
        key_people = null;
      }

      var values = {
                      ID: (data.nodes)[i].ID, 
                      Name: (data.nodes)[i].name, 
                      Nickname: (data.nodes)[i].nickname, 
                      Type: (data.nodes)[i].type, 
                      Categories: categories, 
                      Location: (data.nodes)[i].location, 
                      Website: (data.nodes)[i].url, 
                      TwitterHandle: (data.nodes)[i].twitter_handle, 
                      Followers: (data.nodes)[i].followers, 
                      Employees: (data.nodes)[i].employees, 
                      Influence: (data.nodes)[i].influence, 
                      Relations: relations, 
                      KeyPeople: key_people, 
                      Render: (data.nodes)[i].render
                  };

      var query = connection.query('INSERT INTO Entities SET ?', values, function(err, result){

      });

      console.log(query.sql);
    }
  };

  var insertDataConnections = function(data){
    for(var j = 0; j < (data.data_connections).length; j++){
      var values = {  
                      Entity1ID: (data.data_connections)[j].source,
                      Entity2ID: (data.data_connections)[j].target,
                      Connection: 'Data',
                      Render: (data.data_connections)[j].render
                  };

      var query = connection.query('INSERT INTO Bridges SET ?', values, function(err, result){
        if (err) throw err;
      });

      console.log(query.sql);
    }
  };

  var insertFundingConnections = function(data){
    for(var k = 0; k < (data.funding_connections).length; k++){
      var values = {
                    Entity1ID: (data.funding_connections)[k].source,
                    Entity2ID: (data.funding_connections)[k].target,
                    Connection: null, //  Received vs. Given
                    ConnectionYear: (data.funding_connections[k].year),
                    Amount: (data.funding_connections[k].amount),
                    Render: (data.funding_connections[k].render)  
                };

      ((data.funding_connections)[k].type === "Received") ? values['Connection'] = "Funding Received" : values['Connection'] = "Funding Given";

      var query = connection.query('INSERT INTO Bridges SET ?', values, function(err, result){
        if (err) throw err;
      });

      console.log(query.sql);
    }
  };

  var insertInvestmentConnections = function(data){
    for(var l = 0; l < (data.investment_connections).length; l++){
      var values = {
                      Entity1ID: (data.investment_connections)[l].source,
                      Entity2ID: (data.investment_connections)[l].target,
                      Connection: null, //  Received vs. Given
                      ConnectionYear: (data.investment_connections[l].year),
                      Amount: (data.investment_connections[l].amount),
                      Render: (data.investment_connections[l].render)
                  };

      ((data.investment_connections)[l].type === "Received") ? values['Connection'] = "Investment Received" : values['Connection'] = "Investment Made";

      var query = connection.query('INSERT INTO Bridges SET ?', values, function(err, result){
        if (err) throw err;
      });

      console.log(query.sql);
    }
  };

  var insertCollaborationConnections = function(data){
    for(var m = 0; m < (data.collaboration_connections).length; m++){
      var values = {
                      Entity1ID: (data.collaboration_connections)[m].source,
                      Entity2ID: (data.collaboration_connections)[m].target,
                      Connection: 'Collaboration',
                      Render: (data.collaboration_connections)[m].render 
                  };

      var query = connection.query('INSERT INTO Bridges SET ?', values, function(err, result){
        if (err) throw err;
      });

      console.log(query.sql);
    }
  };

  var insertOperations = function(data){
    console.log(data);
    for(var n = 0; n < (data.nodes).length; n++){
      // console.log((data.nodes)[n].revenue);
      if((data.nodes)[n].revenue !== null){
        console.log("got here AGAIN");
        for(var o = 0; o < ((data.nodes)[n].revenue).length; o++){
          var values = {
                        EntityID: (data.nodes)[n].ID,
                        Finance: 'Revenue',
                        Amount: ((data.nodes)[n].revenue)[o].amount,
                        Year: ((data.nodes)[n].revenue)[o].year
                      };
          // console.log(values);

          var query = connection.query('INSERT INTO Operations SET?', values, function(err, result){
            if (err) throw err;
          });
          console.log(query.sql);
        }
      }
      if((data.nodes)[n].expenses !== null){
        for(var p = 0; p < ((data.nodes)[n].expenses).length; p++){
          var values = {
                        EntityID: (data.nodes)[n].ID,
                        Finance: 'Expenses',
                        Amount: ((data.nodes)[n].expenses)[p].amount,
                        Year:  ((data.nodes)[n].expenses)[p].year
                      };
          // console.log(values);
          var query = connection.query('INSERT INTO Operations SET?', values, function(err, result){
            if (err) throw err;
          });

          console.log(query.sql);
        }
      }
    }
  };
})();