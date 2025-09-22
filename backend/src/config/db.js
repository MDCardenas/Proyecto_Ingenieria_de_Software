// backend/src/config/db.js
require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // ejemplo: 'localhost' o '192.168.x.x'
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false, // true para Azure
    trustServerCertificate: true // para dev local
  },
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => {
    console.log('DB Connection Failed - ', err);
    throw err;
  });

module.exports = { sql, poolPromise };
