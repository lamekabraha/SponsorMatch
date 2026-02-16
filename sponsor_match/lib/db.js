// lib/db.js
import mysql from 'mysql2/promise';

let poolInstance = null;

function getPool() {
  if (!poolInstance) {
    const password = process.env.DB_PASS || process.env.DB_PASSWORD;
    const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0 || !password) {
      const missingAll = [...missing, ...(!password ? ['DB_PASS or DB_PASSWORD'] : [])];
      throw new Error(
        `Missing DB env vars: ${missingAll.join(', ')}. ` +
          'Add them to .env.local and restart the dev server.'
      );
    }

    poolInstance = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return poolInstance;
}

// Export a proxy so pool.query() etc. work; pool is created on first use
const pool = new Proxy(
  {},
  {
    get(_, prop) {
      return getPool()[prop];
    },
  }
);

export default pool;
