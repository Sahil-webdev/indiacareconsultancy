const bcrypt = require('bcryptjs');

async function createUserAccount(connection, { name, email, password, role }) {
  const [existingRows] = await connection.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (existingRows.length > 0) {
    const error = new Error('Email already exists. Please use a different email.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await connection.execute(
    `INSERT INTO users (name, email, password_hash, role, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [name, email, passwordHash, role]
  );

  return result.insertId;
}

module.exports = { createUserAccount };
