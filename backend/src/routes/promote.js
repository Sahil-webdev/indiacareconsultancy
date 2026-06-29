const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Simple JSON-file based promotion storage (same as current Next.js API)
const DATA_FILE = path.join(__dirname, '../../promoted.json');

const readData = () => {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); } catch { return []; }
};
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// GET /api/promote
router.get('/', (req, res) => {
  res.json(readData());
});

// POST /api/promote
router.post('/', (req, res) => {
  const { action, item, id } = req.body;
  let list = readData();
  if (action === 'promote') {
    list = list.filter((i) => i.id !== item.id);
    list.unshift({ ...item, promotedAt: new Date().toISOString() });
    writeData(list);
    return res.json({ success: true, message: 'Promoted successfully' });
  }
  if (action === 'cancel') {
    list = list.filter((i) => i.id !== id);
    writeData(list);
    return res.json({ success: true, message: 'Promotion cancelled' });
  }
  res.status(400).json({ success: false, message: 'Invalid action' });
});

module.exports = router;
