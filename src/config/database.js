const mysql = require('mysql2/promise');

function createDatabasePool(config = process.env) {
  const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno de MySQL: ${missing.join(', ')}`);
  }

  return mysql.createPool({
    host: config.DB_HOST,
    port: Number(config.DB_PORT || 3306),
    user: config.DB_USER,
    password: config.DB_PASSWORD || '',
    database: config.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });
}

module.exports = { createDatabasePool };
