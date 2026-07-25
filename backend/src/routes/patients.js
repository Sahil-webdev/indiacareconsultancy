const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchOne, fetchRows } = require('../services/mysqlUtils');

const router = express.Router();

function formatPatient(row) {
  return {
    id: String(row.id),
    name: row.patient_name,
    age: row.patient_age ? Number(row.patient_age) : null,
    gender: row.patient_gender || '',
    phone: row.patient_phone,
    email: row.patient_email || '',
    city: row.patient_city || '',
    concern: row.concern || '',
    status: row.status,
    consultantId: row.assigned_consultant_id ? String(row.assigned_consultant_id) : null,
    consultant: row.consultant_name || 'Unassigned',
    lastContact: row.last_contacted_at,
    nextFollowup: row.next_follow_up_at,
    source: row.source || 'Website',
    joined: row.joined_at,
    internalNotes: row.internal_notes || '',
  };
}

async function syncPatientsFromSources() {
  const pool = getPool();

  await pool.execute(`
    INSERT INTO patients
      (patient_name, patient_age, patient_gender, patient_phone, patient_email, patient_city, concern, assigned_consultant_id, source, last_contacted_at, next_follow_up_at, joined_at)
    SELECT
      l.patient_name,
      l.patient_age,
      l.patient_gender,
      l.patient_phone,
      l.patient_email,
      l.patient_city,
      l.preferred_speciality,
      l.assigned_consultant_id,
      'Website',
      l.last_contacted_at,
      l.follow_up_at,
      l.created_at
    FROM leads l
    LEFT JOIN patients p ON p.patient_phone = l.patient_phone
    WHERE p.id IS NULL
  `);

  await pool.execute(`
    UPDATE patients p
    INNER JOIN (
      SELECT
        l.patient_phone,
        l.patient_name,
        l.patient_age,
        l.patient_gender,
        l.patient_email,
        l.patient_city,
        l.preferred_speciality,
        l.assigned_consultant_id,
        l.last_contacted_at,
        l.follow_up_at,
        l.created_at
      FROM leads l
      INNER JOIN (
        SELECT patient_phone, MAX(created_at) AS latest_created_at
        FROM leads
        GROUP BY patient_phone
      ) latest ON latest.patient_phone = l.patient_phone AND latest.latest_created_at = l.created_at
    ) src ON src.patient_phone = p.patient_phone
    SET
      p.patient_name = src.patient_name,
      p.patient_age = src.patient_age,
      p.patient_gender = src.patient_gender,
      p.patient_email = COALESCE(src.patient_email, p.patient_email),
      p.patient_city = COALESCE(src.patient_city, p.patient_city),
      p.concern = COALESCE(src.preferred_speciality, p.concern),
      p.assigned_consultant_id = COALESCE(src.assigned_consultant_id, p.assigned_consultant_id),
      p.last_contacted_at = COALESCE(src.last_contacted_at, p.last_contacted_at),
      p.next_follow_up_at = COALESCE(src.follow_up_at, p.next_follow_up_at),
      p.joined_at = LEAST(p.joined_at, src.created_at)
  `);
}

async function getPatientDetail(id) {
  const patient = await fetchOne(
    `SELECT
       p.*,
       u.name AS consultant_name
     FROM patients p
     LEFT JOIN users u ON u.id = p.assigned_consultant_id
     WHERE p.id = ?`,
    [id]
  );
  if (!patient) return null;

  const leads = await fetchRows(
    `SELECT id, preferred_speciality, pipeline_stage, created_at, follow_up_at
     FROM leads
     WHERE patient_phone = ?
     ORDER BY created_at DESC`,
    [patient.patient_phone]
  );
  const appointments = await fetchRows(
    `SELECT id, appointment_date, time_slot, workflow_status, status, created_at
     FROM appointments
     WHERE patient_phone = ?
     ORDER BY appointment_date DESC, created_at DESC`,
    [patient.patient_phone]
  );

  return {
    patient: formatPatient(patient),
    leads: leads.map((row) => ({
      id: String(row.id),
      concern: row.preferred_speciality || '',
      stage: row.pipeline_stage || '',
      createdAt: row.created_at,
      followUpAt: row.follow_up_at,
    })),
    appointments: appointments.map((row) => ({
      id: String(row.id),
      appointmentDate: row.appointment_date,
      timeSlot: row.time_slot,
      status: row.workflow_status || row.status,
      createdAt: row.created_at,
    })),
  };
}

router.get('/', protect, async (req, res, next) => {
  try {
    await syncPatientsFromSources();
    const patients = await fetchRows(
      `SELECT
         p.*,
         u.name AS consultant_name
       FROM patients p
       LEFT JOIN users u ON u.id = p.assigned_consultant_id
       ORDER BY p.joined_at DESC, p.created_at DESC`
    );
    res.json({ success: true, patients: patients.map(formatPatient) });
  } catch (error) {
    next(error);
  }
});

router.get('/meta/options', protect, async (req, res, next) => {
  try {
    const consultants = await fetchRows(
      `SELECT id, name, email
       FROM users
       WHERE role = 'consultant' AND is_active = 1
       ORDER BY name ASC`
    );
    const doctors = await fetchRows(
      `SELECT id, name, speciality
       FROM doctors
       WHERE is_approved = 1
       ORDER BY name ASC`
    );
    res.json({
      success: true,
      consultants: consultants.map((row) => ({ id: String(row.id), name: row.name, email: row.email })),
      doctors: doctors.map((row) => ({ id: String(row.id), name: row.name, speciality: row.speciality })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const payload = await getPatientDetail(req.params.id);
    if (!payload) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, ...payload });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    const current = await fetchOne('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await pool.execute(
      `UPDATE patients
       SET patient_name = ?, patient_age = ?, patient_gender = ?, patient_phone = ?, patient_email = ?, patient_city = ?, concern = ?, status = ?, assigned_consultant_id = ?, last_contacted_at = ?, next_follow_up_at = ?, internal_notes = ?
       WHERE id = ?`,
      [
        req.body.name ?? current.patient_name,
        req.body.age ?? current.patient_age,
        req.body.gender ?? current.patient_gender,
        req.body.phone ?? current.patient_phone,
        req.body.email ?? current.patient_email,
        req.body.city ?? current.patient_city,
        req.body.concern ?? current.concern,
        req.body.status ?? current.status,
        req.body.consultantId === undefined ? current.assigned_consultant_id : (req.body.consultantId || null),
        req.body.lastContactedAt === undefined ? current.last_contacted_at : (req.body.lastContactedAt || null),
        req.body.nextFollowup === undefined ? current.next_follow_up_at : (req.body.nextFollowup || null),
        req.body.internalNotes === undefined ? current.internal_notes : (req.body.internalNotes || null),
        req.params.id,
      ]
    );

    if (current.patient_phone) {
      await pool.execute(
        `UPDATE leads
         SET patient_name = ?, patient_phone = ?, patient_email = ?, patient_city = ?, preferred_speciality = ?, assigned_consultant_id = ?, follow_up_at = ?
         WHERE patient_phone = ?`,
        [
          req.body.name ?? current.patient_name,
          req.body.phone ?? current.patient_phone,
          req.body.email ?? current.patient_email,
          req.body.city ?? current.patient_city,
          req.body.concern ?? current.concern,
          req.body.consultantId === undefined ? current.assigned_consultant_id : (req.body.consultantId || null),
          req.body.nextFollowup === undefined ? current.next_follow_up_at : (req.body.nextFollowup || null),
          current.patient_phone,
        ]
      );
    }

    const updated = await fetchOne(
      `SELECT p.*, u.name AS consultant_name
       FROM patients p
       LEFT JOIN users u ON u.id = p.assigned_consultant_id
       WHERE p.id = ?`,
      [req.params.id]
    );

    res.locals.activityLog = {
      action: 'Patient updated',
      entityType: 'patient',
      entityId: req.params.id,
      category: 'Operations',
      dashboardHref: '/dashboard/super-admin/patients',
      description: `${updated.patient_name} record was updated`,
    };

    res.json({ success: true, patient: formatPatient(updated) });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/actions', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    const patient = await fetchOne('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const action = String(req.body.action || '');
    let message = 'Action completed successfully';

    if (action === 'create_lead') {
      const [result] = await pool.execute(
        `INSERT INTO leads
          (patient_name, patient_age, patient_gender, patient_phone, patient_whatsapp, patient_email, patient_city, patient_area, main_problem, symptoms, duration, preferred_speciality, preferred_location, budget_range, preferred_doctor_gender, preferred_hospital, preferred_datetime, patient_disclaimer, data_consent, status, pipeline_stage, priority, assigned_consultant_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Any', NULL, ?, 1, 1, 'New', 'New', 'Medium', ?)`,
        [
          patient.patient_name,
          patient.patient_age || 0,
          patient.patient_gender || 'Other',
          patient.patient_phone,
          patient.patient_phone,
          patient.patient_email,
          patient.patient_city || '',
          '',
          patient.concern || 'General consultation',
          patient.concern || 'General consultation',
          'Not specified',
          patient.concern || 'General Medicine',
          patient.patient_city || 'India',
          'Flexible',
          new Date().toISOString(),
          patient.assigned_consultant_id || null,
        ]
      );
      message = `Consultation lead L${result.insertId} created successfully`;
    } else if (action === 'book_appointment') {
      await pool.execute(
        `INSERT INTO appointments
          (patient_name, patient_phone, patient_email, doctor_id, hospital_id, appointment_date, time_slot, concern, status, workflow_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Requested')`,
        [
          patient.patient_name,
          patient.patient_phone,
          patient.patient_email,
          req.body.doctorId || null,
          null,
          req.body.appointmentDate,
          req.body.timeSlot,
          patient.concern || null,
        ]
      );
      message = 'Appointment created successfully';
    } else if (action === 'add_note') {
      const note = String(req.body.note || '').trim();
      if (!note) {
        return res.status(400).json({ success: false, message: 'Note is required' });
      }
      const actorName = req.user.name || req.user.email || 'Admin';
      const stamped = `[${new Date().toLocaleString('en-IN')}] ${actorName}: ${note}`;
      const nextNotes = patient.internal_notes ? `${patient.internal_notes}\n${stamped}` : stamped;
      await pool.execute('UPDATE patients SET internal_notes = ? WHERE id = ?', [nextNotes, req.params.id]);
      message = 'Internal note saved successfully';
    } else if (action === 'status_change') {
      const status = String(req.body.status || '');
      await pool.execute('UPDATE patients SET status = ? WHERE id = ?', [status, req.params.id]);
      message = `Patient marked as ${status}`;
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported patient action' });
    }

    res.locals.activityLog = {
      action: 'Patient action executed',
      entityType: 'patient',
      entityId: req.params.id,
      category: 'Operations',
      dashboardHref: '/dashboard/super-admin/patients',
      description: `${patient.patient_name}: ${message}`,
    };

    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
