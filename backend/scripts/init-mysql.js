require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_USER', 'MYSQL_DATABASE'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(`Missing MySQL env vars: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

async function initMySQL() {
  const sqlFilePath = path.join(__dirname, '..', 'sql', 'init-mysql.sql');
  const rawSql = fs.readFileSync(sqlFilePath, 'utf8');
  const databaseName = process.env.MYSQL_DATABASE;
  const sql = rawSql.replace(/__ICC_DB_NAME__/g, databaseName);

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    await connection.query(sql);
    console.log(`MySQL database "${databaseName}" and tables are ready.`);
  } finally {
    await connection.end();
  }
}

initMySQL().catch((error) => {
  console.error(`MySQL init failed: ${error.message}`);
  process.exit(1);
});
