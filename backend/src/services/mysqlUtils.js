const { getPool } = require('../config/mysql');

function parseJson(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function boolFromDb(value) {
  return Boolean(Number(value));
}

async function fetchRows(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

async function fetchOne(sql, params = []) {
  const rows = await fetchRows(sql, params);
  return rows[0] || null;
}

module.exports = {
  boolFromDb,
  fetchOne,
  fetchRows,
  parseJson,
};
