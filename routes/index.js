exports.api = function(req, res) {
  res.render('api', { title: 'Civic Graph' });
};

exports.community = function(req, res) {
  res.render('community', { title: 'Civic Graph' });
};

exports.developer = function(req, res) {
  res.render('developer', { title: 'Civic Graph' });
};

exports.join = function(req, res) {
  res.render('join', { title: 'Become A Member!' });
};
