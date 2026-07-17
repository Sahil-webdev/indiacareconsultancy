const express = require('express');
const router  = express.Router();
const { getPool } = require('../config/mysql');
const { protect } = require('../middleware/auth');

// Role guard helper
function superAdminOnly(req, res, next) {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
  }
  next();
}

// Auto-suggest symptoms map
const SYMPTOM_SUGGESTIONS = {
  cardiology:        ['Chest pain','Shortness of breath','Heart palpitations','Dizziness','High BP'],
  neurology:         ['Severe headaches','Numbness','Seizures','Memory loss','Muscle weakness'],
  orthopedics:       ['Joint pain','Back/neck pain','Swollen joints','Stiffness','Limited motion'],
  orthopedic:        ['Joint pain','Back/neck pain','Swollen joints','Stiffness','Limited motion'],
  dermatology:       ['Rashes','Acne flare-ups','Mole changes','Hair thinning','Nail infections'],
  gynecology:        ['Pelvic pain','Irregular cycles','Pregnancy check','Hormonal swings','Fertility'],
  pediatrics:        ['Childhood fevers','Growth lag','Vaccinations','Asthma/Allergies','Behavioural'],
  ent:               ['Sinus pressure','Hearing loss','Tonsil swelling','Hoarse voice','Tinnitus'],
  ophthalmology:     ['Blurred vision','Eye pain','Redness','Watery eyes','Night blindness'],
  psychiatry:        ['Persistent sadness','Anxiety attacks','Sleep issues','Mood swings','Hallucinations'],
  oncology:          ['Unexplained weight loss','Fatigue','Lumps','Bleeding','Persistent pain'],
  gastroenterology:  ['Acid reflux','Bloating','Abdominal cramps','Chronic diarrhea','Jaundice'],
  urology:           ['Blood in urine','Urination pain','Kidney stone','Bladder weakness','Prostate'],
  nephrology:        ['Swelling in legs','Decreased urine','Fatigue','High creatinine','Dialysis need'],
  endocrinology:     ['Excessive thirst','Weight changes','Fatigue','Hair loss','Hormonal imbalance'],
  'general surgery': ['Abdominal pain','Hernia bulge','Gallstones','Appendix pain','Post-op care'],
};

function parseSymptoms(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

// GET /api/specialities  — PUBLIC (website, active only)
router.get('/', async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, name, icon, description, symptoms, color_preset, doctor_count
       FROM specialities WHERE is_active = 1 ORDER BY id ASC`
    );
    res.json({ success: true, specialities: rows.map(r => ({ ...r, symptoms: parseSymptoms(r.symptoms) })) });
  } catch (err) { next(err); }
});

// GET /api/specialities/suggest?name=Cardiology  — PUBLIC
router.get('/suggest', (req, res) => {
  const name = (req.query.name || '').toLowerCase().trim();
  res.json({ success: true, symptoms: SYMPTOM_SUGGESTIONS[name] || [] });
});

// GET /api/specialities/all  — Super Admin (active + inactive)
router.get('/all', protect, superAdminOnly, async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, name, icon, description, symptoms, color_preset, doctor_count, is_active, created_at
       FROM specialities ORDER BY id ASC`
    );
    res.json({ success: true, specialities: rows.map(r => ({ ...r, is_active: !!r.is_active, symptoms: parseSymptoms(r.symptoms) })) });
  } catch (err) { next(err); }
});

// POST /api/specialities  — Super Admin
router.post('/', protect, superAdminOnly, async (req, res, next) => {
  try {
    const { name, icon = '🏥', description = '', symptoms = [], color_preset = 0, is_active = true } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO specialities (name, icon, description, symptoms, color_preset, is_active) VALUES (?,?,?,?,?,?)`,
      [name.trim(), icon, description, JSON.stringify(symptoms), color_preset, is_active ? 1 : 0]
    );
    const [rows] = await pool.query('SELECT * FROM specialities WHERE id = ?', [result.insertId]);
    const s = rows[0];
    res.status(201).json({ success: true, message: 'Speciality created', speciality: { ...s, is_active: !!s.is_active, symptoms: parseSymptoms(s.symptoms) } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Speciality with this name already exists' });
    next(err);
  }
});

// PUT /api/specialities/:id  — Super Admin
router.put('/:id', protect, superAdminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon = '🏥', description = '', symptoms = [], color_preset = 0, is_active = true } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    const pool = getPool();
    await pool.query(
      `UPDATE specialities SET name=?,icon=?,description=?,symptoms=?,color_preset=?,is_active=? WHERE id=?`,
      [name.trim(), icon, description, JSON.stringify(symptoms), color_preset, is_active ? 1 : 0, id]
    );
    const [rows] = await pool.query('SELECT * FROM specialities WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Speciality not found' });
    const s = rows[0];
    res.json({ success: true, message: 'Speciality updated', speciality: { ...s, is_active: !!s.is_active, symptoms: parseSymptoms(s.symptoms) } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Speciality with this name already exists' });
    next(err);
  }
});

// PATCH /api/specialities/:id/toggle  — Super Admin
router.patch('/:id/toggle', protect, superAdminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query('UPDATE specialities SET is_active = NOT is_active WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT id, name, is_active FROM specialities WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Speciality not found' });
    res.json({ success: true, message: 'Status toggled', is_active: !!rows[0].is_active });
  } catch (err) { next(err); }
});

// DELETE /api/specialities/:id  — Super Admin
router.delete('/:id', protect, superAdminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [rows] = await pool.query('SELECT id FROM specialities WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Speciality not found' });
    await pool.query('DELETE FROM specialities WHERE id = ?', [id]);
    res.json({ success: true, message: 'Speciality deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
