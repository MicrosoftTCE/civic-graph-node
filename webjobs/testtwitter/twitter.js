var Twit = require('twit');
var mysql = require('mysql');
var client = new Twit({
    consumer_key: '3E2ZGC6HPurNYnA4srlxcYP71',
    consumer_secret: '3arTb0BGUCPvBpi4D9K4yh1RWKc03IhSBzfJVzNvB6eS8X5WKi',
    access_token: '2564117432-WhwcyfZmhQdnO0b0npgQp50mi2PFGt8jEiJIg4T',
    access_token_secret: 'tc10O82BHi5mkOPdlZTsgqk3tNAN5DrlqAD68BgVxKNlW'
});

var connection = mysql.createConnection(
{
    host: 'au-cdbr-azure-east-a.cloudapp.net',
    user: 'b0c63aecaa6676',
    password: '8e008947',
    database: 'cdb_c7da98943c'
});

connection.connect();

connection.query('SELECT TwitterHandle FROM Entities WHERE ID BETWEEN ? AND ?', [200, 334], function(error, result){
  if(error) throw error;
  result.forEach(function(d){
    if(d.TwitterHandle !== null)
    {
      handle = d.TwitterHandle;
      client.get('users/show', { screen_name: handle },  
        (function(handle){
          return function(err, data, response){
            connection.query('UPDATE Entities SET Followers = ? WHERE TwitterHandle = ?', [data.followers_count, handle], function(error, result){
              if(error) throw error;
              console.log(handle + ": " + data.followers_count);
            });
          };
      })(handle)); 
    }
  });
});
