var express = require('express');

var router  = express.Router();

var data  = require('../data');

router.get('/vertices', function(req, res) {
  data.getVertices(function(err, obj) {
    if (err) {
      console.log(err);
      res.sendStatus(400);
    } else {
      res.json(obj);
    }
  })
});

router.get('/store', function(req, res) {
  data.getStore(function(err, obj) {
    if (err) {
      console.log(err);
      res.sendStatus(400);
    } else {
      res.json(obj);
    }
  })
});

router.get('/edges/all', function(req, res) {
  data.getEdges('all', function(err, obj) {
    if (err) {
      console.log("ERROR on /graph/edges/all", err);
      res.sendStatus(400);
    } else {
      res.json(obj);
    }
  })
});

router.get('/edges/funding', function(req, res) {
  data.getEdges('funding', function(err, obj) {
    if (err) {
      console.log("ERROR on /graph/edges/funding", err);
      res.sendStatus(400);
    } else {
      res.json(obj);
    }
  })
});

router.get('/edges/investment', function(req, res) {
  data.getEdges('investment', function(err, obj) {
    if (err) {
      console.log("ERROR on /graph/edges/investment", err);
      res.sendStatus(400);
    } else {
      res.json(obj);
    }
  })
});

router.get('/edges/collaboration', function(req, res) {
  data.getEdges('collaboration', function(err, obj) {
    if (err) {
      console.log("ERROR on /graph/edges/collaboration", err);
      res.sendStatus(400);
    } else {
      res.json(obj);
    }
  })
});

router.get('/edges/data', function(req, res) {
  data.getEdges('data', function(err, obj) {
    if (err) {
      console.log("ERROR on /graph/edges/data", err);
      res.sendStatus(400);
    } else {
      res.json(obj);
    }
  })
});

module.exports = router;
