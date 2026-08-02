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

    // Test the connection and ensure schema updates
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT 1');
    try {
      await conn.execute('ALTER TABLE doctors ADD COLUMN experience_timeline JSON NULL');
    } catch (e) {
      // Column may already exist
    }
    try {
      await conn.execute('ALTER TABLE payments ADD COLUMN screenshot_url LONGTEXT NULL');
    } catch (e) {
      // Column may already exist
    }
    try {
      await conn.execute("ALTER TABLE leads ADD COLUMN utr_number VARCHAR(120) NULL");
    } catch (e) {}
    try {
      await conn.execute("ALTER TABLE leads ADD COLUMN payment_status ENUM('Pending Verification','Paid','Failed') DEFAULT 'Pending Verification'");
    } catch (e) {}
    try {
      await conn.execute("ALTER TABLE leads ADD COLUMN consultation_fee DECIMAL(10,2) DEFAULT 9.00");
    } catch (e) {}
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS hospital_doctors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          hospital_id INT NOT NULL,
          doctor_id INT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY (hospital_id, doctor_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (e) {}
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
