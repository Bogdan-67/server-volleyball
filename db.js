const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'postgres',
  password: '45936463',
  host: 'localhost',
  port: 5432,
  database: 'volley',
});

module.exports = pool;
