var fs = require('fs');
var file = __dirname + '../../../public/data/civic.json';

var getEntityData = function(identifier, request){
  var entity;
  var data = JSON.parse(fs.readFileSync(file, 'utf8'));

  if(request.params.name !== undefined) {
    entity = data.nodes.filter(function(d){
      return d.name.toLowerCase() === request.params.name.toLowerCase() || d.nickname.toLowerCase() === request.params.name.toLowerCase();
    });
  }

  switch(identifier){
    case "retrieve_entities":
        return data.nodes;
      break;
    case "retrieve_entity":
        return entity;
      break;
    case "retrieve_categories":
        return entity[0].categories;
      break;
    case "retrieve_key_people":
        return entity[0].key_people;
      break;
    case "retrieve_relations":
        return entity[0].relations;
      break;
    case "retrieve_funding_received":
        return entity[0].funding_received;
      break;
    case "retrieve_funding_given":
        return entity[0].funding_given;
      break;
    case "retrieve_investments_received":
        return entity[0].investments_received;
      break;
    case "retrieve_investments_made":
        return entity[0].investments_made;
      break;
    case "retrieve_collaborations":
        return entity[0].collaborations;
      break;
    case "retrieve_data":
        return entity[0].data;
      break;
    case "retrieve_revenue":
        return entity[0].revenue;
      break;
    case "retrieve_expenses":
        return entity[0].expenses;
      break;
    default:
      break;
  };
};

exports.retrieve_entities = function(request, response){
  response.json(getEntityData("retrieve_entities", request));
};

//  Replace spaces with %20
exports.retrieve_entity = function(request, response){
  response.json(getEntityData("retrieve_entity", request));
};

exports.retrieve_categories = function(request, response){
  response.json(getEntityData("retrieve_categories", request));
};

exports.retrieve_key_people = function(request, response){
  response.json(getEntityData("retrieve_key_people", request));
};

exports.retrieve_relations = function(request, response){
  response.json(getEntityData("retrieve_relations", request));
};

exports.retrieve_funding_received = function(request, response){
  response.json(getEntityData("retrieve_funding_received", request));
};

exports.retrieve_funding_given = function(request, response){
  response.json(getEntityData("retrieve_funding_given", request));
};

exports.retrieve_investments_received = function(request, response){
  response.json(getEntityData("retrieve_investments_received", request));
};

exports.retrieve_investments_made = function(request, response){
  response.json(getEntityData("retrieve_investments_made", request));
};

exports.retrieve_collaborations = function(request, response){
  response.json(getEntityData("retrieve_collaborations", request));
};

exports.retrieve_data = function(request, response){
  response.json(getEntityData("retrieve_data", request));
};

exports.retrieve_revenue = function(request, response){
  response.json(getEntityData("retrieve_revenue", request));
};

exports.retrieve_expenses = function(request, response){
  response.json(getEntityData("retrieve_expenses", request));
};