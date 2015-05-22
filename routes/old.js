var express = require('express');
var mysql   = require('mysql');
var sql     = require('sql-bricks');
var wrap    = require('mysql-wrap');
var _       = require('lodash');

var select = sql.select;

var router  = express.Router();

var config  = require('../config');
var pool    = mysql.createPool(config.db);
var db      = wrap(pool);

router.get('/athena', function(req, res) {
  var entities, bridges;

  var qry = select().from("entities").toString()

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
      res.json(config.processResults(entities, bridges, results));
    })
    .catch(function(err) {
      console.log("ERROR on /entities", err);
      res.sendStatus(400);
    });
});

router.get('/entities/:name', function(req, res) {
  var qry = select("name").from("entities_view")
    .where({ name: req.params.name }).toString();

  db.query(qry).then(function(result) {
    res.json(result[0]);
  })
  .catch(function(err) {
    console.log("ERROR on /entities/" + req.params.name, err);
    res.sendStatus(400);
  });
})

router.get('/entities/:name/categories', function(req, res) {
  var qry = select("categories").from("entities_view")
    .where({ name: req.params.name }).toString();

  db.query(qry).then(function(result) {
    res.json(result[0]);
  })
  .catch(function(err) {
    console.log("ERROR on /entities/" + req.params.name + '/categories', err);
    res.sendStatus(400);
  });
})

// router.get('/entities/:name/key_people', function(req, res) {
//   var qry = select("key_people").from("entities_view")
//     .where({ name: req.params.name }).toString();

//   db.query(qry).then(function(result) {
//     // res.json(result[0]);

//     var people = result[0];

//     if (people.key_people) {
//       people.key_people = _.map(people.key_people.split("|"), function(p) {
//         return { name: p };
//       });
//     } else {
//       people.key_people = [];
//     }

//     res.json({ key_people: people });
//   })
//   .catch(function(err) {
//     console.log("ERROR on /entities/" + req.params.name + '/key_people', err);
//     res.sendStatus(400);
//   });
// })

router.get('/entities/:name/relations', function (req, res) {
  var qry = select("relations").from("entities_view")
    .where({ name: req.params.name }).toString();

  db.query(qry).then(function(result) {
    res.json(result[0]);
  })
  .catch(function(err) {
    console.log("ERROR on /entities/" + req.params.name + '/relations', err);
    res.sendStatus(400);
  });
});


router.get('/entities/:name/funding_received', function (req, res) {
  var qry = "SELECT e.name, b.amount, b.connection_year AS year " +
    "FROM bridges b LEFT JOIN entities e ON e.id = b.entity_2_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE b.entity_1_id = t.id AND b.connection LIKE 'Funding%'";

  db.query(qry, [req.params.name])
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/funding_received', err);
      res.sendStatus(400);
    });

});

router.get('/entities/:name/funding_given', function (req, res) {
  var qry = "SELECT e.name, b.amount, b.connection_year AS year " +
    "FROM bridges b LEFT JOIN entities e ON e.id = b.entity_1_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE b.entity_2_id = t.id AND b.connection LIKE 'Funding%'";


  db.query(qry, [req.params.name])
    .then(function(result) {
      console.log(result);
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/funding_given', err);
      res.sendStatus(400);
    });

});

router.get('/entities/:name/investments_received', function (req, res) {
  var qry = "SELECT e.name, b.amount, b.connection_year AS year " +
    "FROM bridges b LEFT JOIN entities e ON e.id = b.entity_2_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE b.entity_1_id = t.id AND b.connection LIKE 'Investment%'";


  db.query(qry, [req.params.name])
    .then(function(result) {
      console.log(result);
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/investments_received', err);
      res.sendStatus(400);
    });

});

router.get('/entities/:name/investments_made', function (req, res) {
  var qry = "SELECT e.name, b.amount, b.connection_year AS year " +
    "FROM bridges b LEFT JOIN entities e ON e.id = b.entity_1_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE b.entity_2_id = t.id AND b.connection LIKE 'Investment%'";


  db.query(qry, [req.params.name])
    .then(function(result) {
      console.log(result);
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/investments_made', err);
      res.sendStatus(400);
    });

});

router.get('/entities/:name/collaborations', function (req, res) {
  var qry = "SELECT e.name, b.amount, b.connection_year AS year " +
    "FROM bridges b LEFT JOIN entities e ON e.id = b.entity_2_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE b.entity_1_id = t.id AND b.connection LIKE 'Collaborations%'";


  db.query(qry, [req.params.name])
    .then(function(result) {
      console.log(result);
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/collaborations', err);
      res.sendStatus(400);
    });

});

router.get('/entities/:name/data', function (req, res) {
  var qry = "SELECT e.name, b.amount, b.connection_year AS year " +
    "FROM bridges b LEFT JOIN entities e ON e.id = b.entity_2_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE b.entity_1_id = t.id AND b.connection LIKE 'Data%'";


  db.query(qry, [req.params.name])
    .then(function(result) {
      console.log(result);
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/data', err);
      res.sendStatus(400);
    });

});



// app.get('/entities/:name/revenue', entities.retrieve_revenue);
// app.get('/entities/:name/expenses', entities.retrieve_expenses);

router.get('/operations', function (req, res) {
  var qry = select().from("operations_view").toString();

  db.query(qry).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /operations", err);
    res.sendStatus(400);
  });
});

router.get('/operations/revenue/:year', function (req, res) {
  var qry = select('*').from("operations_view")
    .where('finance', 'revenue').and({year: req.params.year}).toString();

  db.query(qry).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /operations/revenue/" + req.params.year, err);
    res.sendStatus(400);
  });
});

router.get('/operations/expenses/:year', function (req, res) {
  var qry = select().from("operations_view")
    .where('finance', 'expenses').and({year: req.params.year}).toString();

  db.query(qry).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /operations/expenses/" + req.params.year, err);
    res.sendStatus(400);
  });
});


module.exports = router;
