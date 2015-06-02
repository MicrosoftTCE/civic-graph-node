var express = require('express');
var mysql   = require('mysql');
var sql     = require('sql-bricks');
var wrap    = require('mysql-wrap');
var _       = require('lodash');

var select = sql.select;
var insert = sql.insert;
var update = sql.update;

var router  = express.Router();

var data  = require('../data');

var config  = require('../config');
var pool    = mysql.createPool(config.db);
var db      = wrap(pool);

router.get('/', function(req, res) {
  var entities, bridges;

  var qry = select("id, name, nickname, followers, employees, entity_type")
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
  var formObj = req.body;

  var entityObj = {
    name: formObj.name,
    nickname: formObj.nickname,
    entity_type: formObj.entity_type,
    categories: formObj.categories,
    location: formObj.location,
    website: formObj.url,
    twitter_handle: formObj.twitter_handle,
    followers: formObj.followers,
    employees: formObj.employees,
    influence: formObj.influence,
    relations: formObj.relations,
    key_people: formObj.key_people,
    ip_address: formObj.ip_address,
    ip_geolocation: formObj.ip_geolocation,
    render: "1",
    deleted_at: null
  };


  if(formObj.id) {
    var qry = update("entities", entityObj).where({id : formObj.id}).returning('*').toString();

    db.query(qry).then(function(result) {
      res.json(result);
    });

  } else {
    var qry = insert("entities", entityObj);

    db.query(qry.toString()).then(function(result) {
      qry = select().from("entities_view").where({id : result.insertId}).toString();

        return db.qry(qry);
      }).then(function (result) {
        res.json(result);

        var entity = result;

        if (formObj.funding_recieved !== null) {

        }
      });
// .catch(function(err) {
//       console.log("ERROR posting to /entities", err);
//       res.sendStatus(400);
//     });
  }
});

{

}


// var newFundingReceivedEntity;
//               (entity.funding_received).forEach(function(object) {
//                 newFundingReceivedEntity = object;

module.exports = router;
