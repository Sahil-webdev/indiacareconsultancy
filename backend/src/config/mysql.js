const mysql = require('mysql2/promise');

let pool = null;

const connectMySQL = async () => {
  try {
    pool = mysql.createPool({
      host:               process.env.MYSQL_HOST     || '127.0.0.1',
      port:               parseInt(process.env.MYSQL_PORT || '3306'),
      user:               process.env.MYSQL_USER     || 'root',
      password:           process.env.MYSQL_PASSWORD || 'admin123',
      database:           process.env.MYSQL_DATABASE || 'icc',
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0,
      timezone:           '+05:30',
    });

    // Test the connection
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT 1');
    conn.release();

    console.log(`✅ MySQL connected: ${process.env.MYSQL_HOST || '127.0.0.1'}:${process.env.MYSQL_PORT || 3306}/${process.env.MYSQL_DATABASE || 'icc'}`);
    return pool;
  } catch (error) {
    console.error(`❌ MySQL connection error: ${error.message}`);
    // Don't exit — MongoDB can still work independently
  }
};

/**
 * Get the MySQL pool (use in routes/controllers)
 * @returns {mysql.Pool}
 */
const getPool = () => {
  if (!pool) throw new Error('MySQL pool not initialised — call connectMySQL() first');
  return pool;
};

module.exports = { connectMySQL, getPool };
