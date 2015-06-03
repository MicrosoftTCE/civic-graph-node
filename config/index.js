var _ = require('lodash');

exports.db = {
  'cleardb':{ 
  port: 3306,
  host: 'us-cdbr-azure-east-b.cloudapp.net',
  user: 'bf43a42fa1bdc5',
  password: '05873492',
  database: 'cdb_3c66f3c15f'
  },
  'localhost' : {
      port: 8889,
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'civic_dev'
    }
}

// export DB_USER=username
// export DB_PW='password'
