var express = require('express');
var mysql   = require('mysql');
var sql     = require('sql-bricks');
var wrap    = require('mysql-wrap');
var _       = require('lodash');

var select = sql.select;

var router  = express.Router();
// var dat  = require('../data');

var config  = require('../config');
var data1  = require('../data');
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
      var funding_received = [];
      var funding_given =[];
      var investments_made = [];
      var investments_received = [];
      var collaboration = [];
      var employment = [];
      var data = [];

      _.each(bridges, function(row) {
        // console.log(bridges, 'heeyyyy');
        switch(row.connection) {
          case 'Funding Received':
            funding_received.push(row);
            break;
          case 'Investment Received':
            investments_received.push(row);
            break;
          case 'Collaboration':
            collaboration.push(row);
            break;
          case 'Data':
            data.push(row);
            break;
          case 'Employment':
            employment.push(row);
            break;
        }
      });

      res.json({
        entities: _.values(data1.processVertices(entities, bridges, results)),
        funding_received_connections: data1.processEdges(funding_received, true),
        funding_given_connections: data1.processEdges(funding_given, true),
        investments_received_connections: data1.processEdges(investments_received, true),
        investments_made_connections: data1.processEdges(investments_made, true),
        collaboration_connections: data1.processEdges(collaboration),
        data_connections: data1.processEdges(data),
        employment_connections: data1.processVertices(employment),

      });
    })
    .catch(function(err) {
      console.log("ERROR on /athena", err);
      res.sendStatus(400);
    });
});

//Entities Routes

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


router.get('/entities/:name/key_people', function(req, res) {
  var qry = select("key_people").from("entities_view")
    .where({ name: req.params.name }).toString();

  db.query(qry).then(function(result) {
    var people = result[0];

    if (people.key_people) {
      people.key_people = _.map(people.key_people.split("|"), function(p) {
        return { name: p };
      });
    } else {
      people.key_people = [];
    }

    res.json(people.key_people);
  })
  .catch(function(err) {
    console.log("ERROR on /entities/" + req.params.name + '/key_people', err);
    res.sendStatus(400);
  });
})

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
    "FROM bridges_view b LEFT JOIN entities e ON e.id = b.entity_2_id, " +
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
    "FROM bridges_view b LEFT JOIN entities e ON e.id = b.entity_1_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE b.entity_2_id = t.id AND b.connection LIKE 'Funding%'";


  db.query(qry, [req.params.name])
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/funding_given', err);
      res.sendStatus(400);
    });

});

router.get('/entities/:name/investments_received', function (req, res) {
  var qry = "SELECT e.name, b.amount, b.connection_year AS year " +
    "FROM bridges_view b LEFT JOIN entities e ON e.id = b.entity_2_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE b.entity_1_id = t.id AND b.connection LIKE 'Investment%'";


  db.query(qry, [req.params.name])
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/investments_received', err);
      res.sendStatus(400);
    });

});

router.get('/entities/:name/investments_made', function (req, res) {
  var qry = "SELECT e.name, b.amount, b.connection_year AS year " +
    "FROM bridges_view b LEFT JOIN entities e ON e.id = b.entity_1_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE b.entity_2_id = t.id AND b.connection LIKE 'Investment%'";


  db.query(qry, [req.params.name])
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/investments_made', err);
      res.sendStatus(400);
    });

});

router.get('/entities/:name/collaborations', function (req, res) {
  var qry = "SELECT e.name, b.amount, b.connection_year AS year " +
    "FROM bridges_view b LEFT JOIN entities e ON e.id = b.entity_2_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE b.entity_1_id = t.id AND b.connection LIKE 'Collaborations%'";


  db.query(qry, [req.params.name])
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/collaborations', err);
      res.sendStatus(400);
    });

});

router.get('/entities/:name/data', function (req, res) {
  var qry = "SELECT e.name, b.amount, b.connection_year AS year " +
    "FROM bridges_view b LEFT JOIN entities e ON e.id = b.entity_2_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE b.entity_1_id = t.id AND b.connection LIKE 'Data%'";


  db.query(qry, [req.params.name])
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/data', err);
      res.sendStatus(400);
    });

});

router.get('/entities/:name/revenue', function (req, res) {
  var qry = "SELECT o.amount, o.year " +
    "FROM operations_view o LEFT JOIN entities e ON e.id = o.entity_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE O.entity_id = t.id AND o.finance LIKE 'Revenue%'";

  db.query(qry, [req.params.name])
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/revenue', err);
      res.sendStatus(400);
    });

});

router.get('/entities/:name/expenses', function (req, res) {
  var qry = "SELECT o.amount, o.year " +
    "FROM operations_view o LEFT JOIN entities e ON e.id = o.entity_id, " +
    "(SELECT id FROM `entities` WHERE TRIM(name) = ?) t WHERE O.entity_id = t.id AND o.finance LIKE 'Expenses%'";

  db.query(qry, [req.params.name])
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      console.log("ERROR on /entities/" + req.params.name + '/expenses', err);
      res.sendStatus(400);
    });

});

//Connections Routes

router.get('/connections', function (req, res) {
  var qry = "SELECT a.name AS source_name," +
    "b.entity_1_id AS source," +
    "c.name AS target_name," +
    "b.entity_2_id AS target," +
    "b.connection AS connection," +
    "b.amount AS amount," +
    "b.render AS render," +
    "b.connection_year AS year " +
    "FROM bridges_view b JOIN entities a ON (b.entity_1_id = a.id) JOIN entities c ON (b.entity_2_id = c.id)";

  db.query(qry).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /connections", err);
    res.sendStatus(400);
  });
})

router.get('/connections/funding', function (req, res) {
  var qry = "SELECT a.name AS source_name," +
    "b.entity_1_id AS source," +
    "c.name AS target_name," +
    "b.entity_2_id AS target," +
    "b.connection AS connection," +
    "b.amount AS amount," +
    "b.connection_year AS year," +
    "b.render AS render " +
    "FROM bridges_view b JOIN entities a ON (b.entity_1_id = a.id) JOIN entities c ON (b.entity_2_id = c.id) " +
    "WHERE (b.connection = ? OR b.connection = ?) ";

  db.query(qry, ['Funding Received', 'Funding Given']).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /connections/funding", err);
    res.sendStatus(400);
  });
})


router.get('/connections/investments', function (req, res) {
  var qry = "SELECT a.name AS source_name," +
    "b.entity_1_id AS source," +
    "c.name AS target_name," +
    "b.entity_2_id AS target," +
    "b.connection AS connection," +
    "b.amount AS amount," +
    "b.connection_year AS year," +
    "b.render AS render " +
    "FROM bridges_view b JOIN entities a ON (b.entity_1_id = a.id) JOIN entities c ON (b.entity_2_id = c.id) " +
    "WHERE (b.connection = ? OR b.connection = ?) ";

  db.query(qry, ['Investment Received', 'Investment Given']).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /connections/investments", err);
    res.sendStatus(400);
  });
})

router.get('/connections/collaborations', function (req, res) {
  var qry = "SELECT a.name AS source_name," +
    "b.entity_1_id AS source," +
    "c.name AS target_name," +
    "b.entity_2_id AS target," +
    "b.connection AS connection," +
    "b.amount AS amount," +
    "b.connection_year AS year," +
    "b.render AS render " +
    "FROM bridges_view b JOIN entities a ON (b.entity_1_id = a.id) JOIN entities c ON (b.entity_2_id = c.id) " +
    "WHERE (b.connection = ?) ";

  db.query(qry, ['Collaboration']).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /connections/collaborations", err);
    res.sendStatus(400);
  });
})


router.get('/connections/data', function (req, res) {
  var qry = "SELECT a.name AS source_name," +
    "b.entity_1_id AS source," +
    "c.name AS target_name," +
    "b.entity_2_id AS target," +
    "b.connection AS connection," +
    "b.amount AS amount," +
    "b.connection_year AS year," +
    "b.render AS render " +
    "FROM bridges_view b JOIN entities a ON (b.entity_1_id = a.id) JOIN entities c ON (b.entity_2_id = c.id) " +
    "WHERE (b.connection = ?) ";

  db.query(qry, ['Data']).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /connections/data", err);
    res.sendStatus(400);
  });
})

router.get('/connections/:name', function (req, res) {
  var qry = "SELECT a.name AS source_name," +
    "b.entity_1_id AS source," +
    "c.name AS target_name," +
    "b.entity_2_id AS target," +
    "b.connection AS connection," +
    "b.amount AS amount," +
    "b.connection_year AS year," +
    "b.render AS render " +
    "FROM bridges_view b JOIN entities a ON (b.entity_1_id = a.id) JOIN entities c ON (b.entity_2_id = c.id)" +
    "WHERE b.entity_1_id IN " +
    "(SELECT id FROM entities WHERE name = ? OR nickname = ?)" +
    "OR b.entity_2_id IN " +
    "(SELECT id FROM entities WHERE name = ? OR nickname = ?)";

  db.query(qry, [req.params.name, req.params.name, req.params.name, req.params.name, req.params.name]).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /connections/" + req.params.name, err);
    res.sendStatus(400);
  });
})

router.get('/connections/:name/funding', function (req, res) {
  var qry = "SELECT a.name AS source_name," +
    "b.entity_1_id AS source," +
    "c.name AS target_name," +
    "b.entity_2_id AS target," +
    "b.connection AS connection," +
    "b.amount AS amount," +
    "b.connection_year AS year," +
    "b.render AS render " +
    "FROM bridges_view b JOIN entities a ON (b.entity_1_id = a.id) JOIN entities c ON (b.entity_2_id = c.id)" +
    "WHERE (b.entity_1_id IN " +
    "(SELECT id FROM entities WHERE name = ? OR nickname = ?)" +
    "OR b.entity_2_id IN " +
    "(SELECT id FROM entities WHERE name = ? OR nickname = ?))" +
    "AND (b.connection = ? OR b.connection = ?)";

  db.query(qry, [req.params.name, req.params.name, req.params.name, req.params.name, 'Funding Received', 'Funding Given']).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /connections/" + req.params.name + '/funding', err);
    res.sendStatus(400);
  });
})


router.get('/connections/:name/investments', function (req, res) {
  var qry = "SELECT a.name AS source_name," +
    "b.entity_1_id AS source," +
    "c.name AS target_name," +
    "b.entity_2_id AS target," +
    "b.connection AS connection," +
    "b.amount AS amount," +
    "b.connection_year AS year," +
    "b.render AS render " +
    "FROM bridges_view b JOIN entities a ON (b.entity_1_id = a.id) JOIN entities c ON (b.entity_2_id = c.id)" +
    "WHERE (b.entity_1_id IN " +
    "(SELECT id FROM entities WHERE name = ? OR nickname = ?)" +
    "OR b.entity_2_id IN " +
    "(SELECT id FROM entities WHERE name = ? OR nickname = ?))" +
    "AND (b.connection = ? OR b.connection = ?)";

  db.query(qry, [req.params.name, req.params.name, req.params.name, req.params.name, 'Investment Received', 'Investment Given']).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /connections/" + req.params.name + '/investments', err);
    res.sendStatus(400);
  });
})

router.get('/connections/:name/collaborations', function (req, res) {
  var qry = "SELECT a.name AS source_name," +
    "b.entity_1_id AS source," +
    "c.name AS target_name," +
    "b.entity_2_id AS target," +
    "b.connection AS connection," +
    "b.amount AS amount," +
    "b.connection_year AS year," +
    "b.render AS render " +
    "FROM bridges_view b JOIN entities a ON (b.entity_1_id = a.id) JOIN entities c ON (b.entity_2_id = c.id)" +
    "WHERE (b.entity_1_id IN " +
    "(SELECT id FROM entities WHERE name = ? OR nickname = ?)" +
    "OR b.entity_2_id IN " +
    "(SELECT id FROM entities WHERE name = ? OR nickname = ?))" +
    "AND (b.connection = ?)";

  db.query(qry, [req.params.name, req.params.name, req.params.name, req.params.name, 'Collaboration']).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /connections/" + req.params.name + '/collaborations', err);
    res.sendStatus(400);
  });
})

router.get('/connections/:name/data', function (req, res) {
  var qry = "SELECT a.name AS source_name," +
    "b.entity_1_id AS source," +
    "c.name AS target_name," +
    "b.entity_2_id AS target," +
    "b.connection AS connection," +
    "b.amount AS amount," +
    "b.connection_year AS year," +
    "b.render AS render " +
    "FROM bridges_view b JOIN entities a ON (b.entity_1_id = a.id) JOIN entities c ON (b.entity_2_id = c.id)" +
    "WHERE (b.entity_1_id IN " +
    "(SELECT id FROM entities WHERE name = ? OR nickname = ?)" +
    "OR b.entity_2_id IN " +
    "(SELECT id FROM entities WHERE name = ? OR nickname = ?))" +
    "AND (b.connection = ?)";

  db.query(qry, [req.params.name, req.params.name, req.params.name, req.params.name, 'Data']).then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    console.log("ERROR on /connections/" + req.params.name + '/data', err);
    res.sendStatus(400);
  });
})




//Operations Routes
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
