import mysql from "mysql2/promise";

// Default development values
const DB_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'shoi',
};

console.log('Database configuration:', {
  host: DB_CONFIG.host,
  user: DB_CONFIG.user,
  database: DB_CONFIG.database,
});

const pool = mysql.createPool({
  host: DB_CONFIG.host,
  user: DB_CONFIG.user,
  password: DB_CONFIG.password,
  database: DB_CONFIG.database,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
});

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[] | any> {
  try {
    const [rows] = await pool.execute(sql, params);
    
    // For INSERT/UPDATE/DELETE, return the result object with insertId, affectedRows, etc.
    if (rows && typeof rows === 'object' && 'insertId' in rows) {
      return rows;
    }
    
    // For SELECT queries, return the rows array
    return Array.isArray(rows) ? rows as T[] : [rows] as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}