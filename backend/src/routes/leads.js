const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchOne, fetchRows } = require('../services/mysqlUtils');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const pool = getPool();
    const payload = req.body;
    const patient = payload.patientDetails || {};
    const concern = payload.healthConcern || {};
    const preferences = payload.preferences || {};
    const consent = payload.consent || {};
    const [result] = await pool.execute(
      `INSERT INTO leads
        (patient_name, patient_age, patient_gender, patient_phone, patient_whatsapp, patient_email, patient_city, patient_area, main_problem, symptoms, duration, preferred_speciality, preferred_location, budget_range, preferred_doctor_gender, preferred_hospital, preferred_datetime, patient_disclaimer, data_consent, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', 'Medium')`,
      [
        patient.name,
        patient.age,
        patient.gender,
        patient.phone,
        patient.whatsappNumber,
        patient.email,
        patient.city,
        patient.area,
        concern.mainProblem,
        concern.symptoms,
        concern.duration,
        concern.preferredSpeciality,
        preferences.preferredLocation,
        preferences.budgetRange,
        preferences.preferredDoctorGender || 'Any',
        preferences.preferredHospitalClinic || null,
        preferences.preferredDateTime,
        consent.patientDisclaimerConsent ? 1 : 0,
        consent.dataConsent ? 1 : 0,
      ]
    );

    const leadId = result.insertId;
    for (const report of concern.reports || []) {
      await pool.execute('INSERT INTO lead_reports (lead_id, report_url) VALUES (?, ?)', [leadId, report]);
    }
    const lead = await fetchOne('SELECT * FROM leads WHERE id = ?', [leadId]);
    res.status(201).json({ success: true, message: 'Consultation request submitted!', lead });
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    const { status, assignedTo } = req.query;
    const conditions = [];
    const params = [];
    if (status) {
      conditions.push('l.status = ?');
      params.push(status);
    }
    if (assignedTo) {
      conditions.push('l.assigned_consultant_id = ?');
      params.push(assignedTo);
    }
    const leads = await fetchRows(
      `SELECT l.*, u.name AS consultant_name
       FROM leads l
       LEFT JOIN users u ON u.id = l.assigned_consultant_id
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY l.created_at DESC`,
      params
    );
    res.json({ success: true, count: leads.length, leads });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    const current = await fetchOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    const payload = req.body;
    await pool.execute(
      `UPDATE leads
       SET status = ?, assigned_consultant_id = ?, priority = ?, preferred_hospital = ?
       WHERE id = ?`,
      [
        payload.status || current.status,
        payload.assignedConsultantId || current.assigned_consultant_id || null,
        payload.priority || current.priority,
        payload.preferredHospital || current.preferred_hospital || null,
        req.params.id,
      ]
    );
    const lead = await fetchOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    res.json({ success: true, lead });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/notes', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    const lead = await fetchOne('SELECT id FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    await pool.execute(
      'INSERT INTO lead_notes (lead_id, note, author_id) VALUES (?, ?, ?)',
      [req.params.id, req.body.note, req.user.id]
    );
    res.json({ success: true, message: 'Note added successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
