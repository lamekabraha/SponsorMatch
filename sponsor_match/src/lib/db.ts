import mysql, { Pool, PoolOptions, RowDataPacket } from 'mysql2/promise';

// Define MySQL connection options with type safety
const dbConfig: PoolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
};

// Create a connection pool (recommended for production)
let pool: Pool;

try {
  pool = mysql.createPool(dbConfig);
  console.log('MySQL connection pool created successfully.');
} catch (error) {
  console.error('Failed to create MySQL connection pool:', error);
  process.exit(1); // Exit if DB connection fails
}

export async function query<T extends RowDataPacket[][] | RowDataPacket[] | mysql.OkPacket | mysql.ResultSetHeader>(sql: string, params?: any[]): Promise<T> {
  try {
    const [rows] = await pool.execute<T>(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export { pool };
