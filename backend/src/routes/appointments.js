const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchRows } = require('../services/mysqlUtils');

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    let sql = `
      SELECT
        a.*,
        d.name AS doctor_name,
        d.speciality AS doctor_speciality,
        h.name AS hospital_name
      FROM appointments a
      LEFT JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN hospitals h ON h.id = a.hospital_id
    `;
    const params = [];
    if (req.user.role === 'doctor') {
      sql += ' LEFT JOIN doctors owned_doctor ON owned_doctor.id = a.doctor_id WHERE owned_doctor.user_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'hospital') {
      sql += ' LEFT JOIN hospitals owned_hospital ON owned_hospital.id = a.hospital_id WHERE owned_hospital.user_id = ?';
      params.push(req.user.id);
    }
    sql += ' ORDER BY a.appointment_date ASC, a.time_slot ASC';
    const appointments = await fetchRows(sql, params);
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const pool = getPool();
    const payload = req.body;
    const [result] = await pool.execute(
      `INSERT INTO appointments
        (patient_name, patient_phone, patient_email, doctor_id, hospital_id, appointment_date, time_slot, concern, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        payload.patientName,
        payload.patientPhone,
        payload.patientEmail || null,
        payload.doctorId || null,
        payload.hospitalId || null,
        payload.appointmentDate,
        payload.timeSlot,
        payload.concern || null,
      ]
    );
    res.status(201).json({ success: true, appointmentId: String(result.insertId) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
