exports.db = {
  port: 3306,
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: 'civic_dev'
}
