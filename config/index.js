var _ = require('lodash');

exports.db = {
  'cleardb': { 
    port: 3306,
    host: 'us-cdbr-azure-east-b.cloudapp.net',
    user: 'b7441ee5de6609',
    password: '24c5199a',
    database: 'cdb_3c66f3c15f'
  },
  'localhost': {
    port: 8889,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'civic_dev'
  }
}

// export DB_USER=username
// export DB_PW='password'
