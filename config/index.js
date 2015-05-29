var _ = require('lodash');

exports.db = {
  port: 3306,
  host: '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: 'civic_dev'
}

// export DB_USER=username
// export DB_PW='password'
