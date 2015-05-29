var d3 = require('d3');
var _  = require('lodash');

var colors = {
  cyan: "rgb(46, 146, 207)",
  purple: "rgb(111,93,168)",
  teal: "rgb(38,114,114)",
  yellow: "rgb(235,232,38)",
  pink: "rgb(191,72,150)",
  gold: "rgb(255,185,0)",
  blue: "rgb(0,164,239)",
  lime: "rgb(127,186,0)",
  orange: "rgb(242,80,34)"
};

var employeeScale = d3.scale.sqrt().domain([10, 130000]).range([10, 50]);
var twitterScale  = d3.scale.sqrt().domain([10, 1000000]).range([10, 50]);

var getQueryParams = function() {
  console.log("Running getQueryParams");

  var qStr = {};

  var qry = window.location.search.substring(1);

  var pairs = qry.split('&');

  _.each(pairs, function(pair) {

    var arr = pair.split('=');

    if (arr.length > 1) {
      var prop = arr[0];
      var value = arr[1];

      if (typeof qStr[prop] === "undefined") {
        qStr[prop] = value;
      } else if (typeof qStr[prop] === "string") {
        qStr[prop] = [ qStr[prop], value ];
      } else {
        qStr[prop].push(value);
      }
    }
  })

  console.log("And returning qStr = ", qStr);
  return qStr;
};

var getNameHash = function () {
  window.civicStore.lookups = window.civicStore.lookups || {};

  if (!window.civicStore.lookups.byName) {
    var byName = {};

    _.each(
      _.values(window.civicStore.vertices),
      function(entity) {
        var name = entity.name.toLowerCase();

        byName[name] = byName[name] || [];
        byName[name].push({ id: entity.id, name: entity.name });
      }
    )

    window.civicStore.lookups.byName = byName;
  }

  return window.civicStore.lookups.byName;
};

var getNicknameHash = function () {
  window.civicStore.lookups = window.civicStore.lookups || {};

  if (!window.civicStore.lookups.byNickname) {
    var byNickname = {};

    _.each(
      _.values(window.civicStore.vertices),
      function(entity) {
        var nickname = entity.nickname.toLowerCase();

        byNickname[nickname] = byNickname[nickname] || [];
        byNickname[nickname].push({ id: entity.id, name: entity.nickname });
      }
    )

    window.civicStore.lookups.byNickname = byNickname;
  }

  return window.civicStore.lookups.byNickname;
};

var getLocationHash = function () {
  window.civicStore.lookups = window.civicStore.lookups || {};

  if (!window.civicStore.lookups.byLocation) {
    var byLocation = {};

    _.each(
      _.values(window.civicStore.locations),
      function(location) {
        var city = window.civicStore.cities[location.city_id];
        var key = [city.city_name];

        if (city.state_name) {
          key.push(city.state_name);
        } else if (city.state_code) {
          key.push(city.state_code);
        }

        if (city.country_name) {
          key.push(city.country_name);
        } else if (city.country_code) {
          key.push(city.country_code);
        }

        key = key.join(", ").toLowerCase()

        byLocation[key] = byLocation[key] || [];
        byLocation[key].push(window.civicStore.vertices[location.entity]);
      }
    )

    window.civicStore.lookups.byLocation = byLocation;
  }

  return window.civicStore.lookups.byLocation;
};

var getSortedNames = function () {
  window.civicStore.lists = window.civicStore.lists || {};

  if (!window.civicStore.lists.names) {
    window.civicStore.lists.names = _.chain(window.civicStore.vertices)
      .values()
      .map(function(entity) { return [ entity.name, entity.nickname ]; })
      .flatten()
      .sortBy(function(name) { return name.toLowerCase(); })
      .uniq(true, function(name) { return name.toLowerCase(); })
      .value();
  }

  return window.civicStore.lists.names;
};

var getSortedNameOptions = function () {
  return _.map(getSortedNames(), function(name) {
    return '<option value="' + name + '"></option>'
  }).join('');
};

var getSortedLocations = function () {
  window.civicStore.lists = window.civicStore.lists || {};

  if (!window.civicStore.lists.locations) {
    window.civicStore.lists.locations = _.chain(window.civicStore.locations)
      .values()
      .map(function(location) {
        var city = window.civicStore.cities[location.city_id];
        var loc = [ city.city_name ];

        if (city.state_name) {
          loc.push(city.state_name);
        } else if (city.state_code) {
          loc.push(city.state_code);
        }

        if (city.country_name) {
          loc.push(city.country_name);
        } else if (city.country_code) {
          loc.push(city.country_code);
        }

        return loc.join(", ");
      })
      .uniq()
      .sortBy()
      .value();
  }

  return window.civicStore.lists.locations;
};

var getSortedLocationOptions = function () {
  return _.map(getSortedLocations(), function(name) {
    return '<option value="' + name + '"></option>'
  }).join('');
};

var getSortedList = function () {
  window.civicStore.lists = window.civicStore.lists || {};

  if (!window.civicStore.lists.sorted) {
    window.civicStore.lists.sorted = _.sortBy(
      getSortedNames().concat(getSortedLocations()),
      function(item) {
        return item.toLowerCase();
      }
    )
  }

  return window.civicStore.lists.sorted;
};

var getLowercaseList = function () {
  window.civicStore.lists = window.civicStore.lists || {};

  if (!window.civicStore.lists.lowercase) {
    window.civicStore.lists.lowercase = _.chain(getSortedList())
      .map(function(item) { return item.toLowerCase(); })
      .uniq()
      .value();
  }

  return window.civicStore.lists.lowercase;
};

exports.colors                   = colors
exports.employeeScale            = employeeScale
exports.twitterScale             = twitterScale;
exports.getQueryParams           = getQueryParams;
exports.getNameHash              = getNameHash;
exports.getNicknameHash          = getNicknameHash;
exports.getLocationHash          = getLocationHash;
exports.getSortedNames           = getSortedNames;
exports.getSortedLocations       = getSortedLocations;
exports.getSortedList            = getSortedList;
exports.getLowercaseList         = getLowercaseList;
exports.getSortedNameOptions     = getSortedNameOptions;
exports.getSortedLocationOptions = getSortedLocationOptions;
// exports.getEntityById            = getEntityById;
// exports.getEntityByName          = getEntityByName;
// exports.getEntityByNickname      = getEntityByNickname;
