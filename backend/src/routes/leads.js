const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchOne, fetchRows } = require('../services/mysqlUtils');
const { createSuperAdminNotification } = require('../services/notifications');

const router = express.Router();

const PIPELINE_TO_STATUS = {
  'New': 'New',
  'Contact Attempted': 'New',
  'Contacted': 'Contacted',
  'Qualified': 'Need More Details',
  'Matching in Progress': 'Need More Details',
  'Doctor Options Sent': 'Doctor Suggested',
  'Patient Decision Pending': 'Doctor Suggested',
  'Appointment Requested': 'Appointment Pending',
  'Appointment Confirmed': 'Appointment Pending',
  'Follow-up': 'Contacted',
  'Converted': 'Converted',
  'Lost': 'Lost',
  'Spam': 'Lost',
};

function formatLead(row) {
  return {
    id: String(row.id),
    patientName: row.patient_name,
    patientAge: Number(row.patient_age || 0),
    patientGender: row.patient_gender,
    patientPhone: row.patient_phone,
    patientWhatsapp: row.patient_whatsapp,
    patientEmail: row.patient_email,
    patientCity: row.patient_city,
    patientArea: row.patient_area,
    mainProblem: row.main_problem,
    symptoms: row.symptoms,
    duration: row.duration,
    preferredSpeciality: row.preferred_speciality,
    preferredLocation: row.preferred_location,
    budgetRange: row.budget_range,
    preferredDoctorGender: row.preferred_doctor_gender,
    preferredHospital: row.preferred_hospital || '',
    preferredDateTime: row.preferred_datetime,
    status: row.status,
    pipelineStage: row.pipeline_stage || row.status,
    assignedConsultantId: row.assigned_consultant_id ? String(row.assigned_consultant_id) : null,
    assignedConsultantName: row.consultant_name || 'Unassigned',
    patientDisclaimer: Boolean(Number(row.patient_disclaimer || 0)),
    dataConsent: Boolean(Number(row.data_consent || 0)),
    priority: row.priority,
    isSpam: Boolean(Number(row.is_spam || 0)),
    isArchived: Boolean(Number(row.is_archived || 0)),
    followUpAt: row.follow_up_at,
    lastContactedAt: row.last_contacted_at,
    noteCount: Number(row.note_count || 0),
    recommendedDoctorCount: Number(row.recommended_doctor_count || 0),
    recommendedHospitalCount: Number(row.recommended_hospital_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
        (patient_name, patient_age, patient_gender, patient_phone, patient_whatsapp, patient_email, patient_city, patient_area, main_problem, symptoms, duration, preferred_speciality, preferred_location, budget_range, preferred_doctor_gender, preferred_hospital, preferred_datetime, patient_disclaimer, data_consent, status, pipeline_stage, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', 'New', 'Medium')`,
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
    await createSuperAdminNotification({
      title: 'New consultation lead received',
      message: `${patient.name || 'A patient'} submitted a new ${concern.preferredSpeciality || 'medical'} consultation request.`,
      category: 'lead',
      entityType: 'lead',
      entityId: leadId,
      actionUrl: '/dashboard/super-admin/leads',
      metadata: { patientName: patient.name, speciality: concern.preferredSpeciality },
    });
    res.status(201).json({ success: true, message: 'Consultation request submitted!', lead });
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    const { status, assignedTo, stage, includeArchived, includeSpam } = req.query;
    const conditions = [];
    const params = [];
    if (status) {
      conditions.push('l.status = ?');
      params.push(status);
    }
    if (stage) {
      conditions.push('l.pipeline_stage = ?');
      params.push(stage);
    }
    if (assignedTo) {
      conditions.push('l.assigned_consultant_id = ?');
      params.push(assignedTo);
    }
    if (includeArchived !== '1') {
      conditions.push('COALESCE(l.is_archived, 0) = 0');
    }
    if (includeSpam !== '1') {
      conditions.push('COALESCE(l.is_spam, 0) = 0');
    }
    const leads = await fetchRows(
      `SELECT
         l.*,
         u.name AS consultant_name,
         (SELECT COUNT(*) FROM lead_notes ln WHERE ln.lead_id = l.id) AS note_count,
         (SELECT COUNT(*) FROM lead_recommended_doctors lrd WHERE lrd.lead_id = l.id) AS recommended_doctor_count,
         (SELECT COUNT(*) FROM lead_recommended_hospitals lrh WHERE lrh.lead_id = l.id) AS recommended_hospital_count
       FROM leads l
       LEFT JOIN users u ON u.id = l.assigned_consultant_id
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY l.created_at DESC`,
      params
    );
    res.json({ success: true, count: leads.length, leads: leads.map(formatLead) });
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
      `SELECT id, name, speciality, city
       FROM doctors
       WHERE is_approved = 1
       ORDER BY name ASC`
    );
    const hospitals = await fetchRows(
      `SELECT id, name, city
       FROM hospitals
       WHERE is_approved = 1
       ORDER BY name ASC`
    );

    res.json({
      success: true,
      consultants: consultants.map((item) => ({ id: String(item.id), name: item.name, email: item.email })),
      doctors: doctors.map((item) => ({ id: String(item.id), name: item.name, speciality: item.speciality, city: item.city })),
      hospitals: hospitals.map((item) => ({ id: String(item.id), name: item.name, city: item.city })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const lead = await fetchOne(
      `SELECT
         l.*,
         u.name AS consultant_name,
         (SELECT COUNT(*) FROM lead_notes ln WHERE ln.lead_id = l.id) AS note_count,
         (SELECT COUNT(*) FROM lead_recommended_doctors lrd WHERE lrd.lead_id = l.id) AS recommended_doctor_count,
         (SELECT COUNT(*) FROM lead_recommended_hospitals lrh WHERE lrh.lead_id = l.id) AS recommended_hospital_count
       FROM leads l
       LEFT JOIN users u ON u.id = l.assigned_consultant_id
       WHERE l.id = ?`,
      [req.params.id]
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const notes = await fetchRows(
      `SELECT ln.id, ln.note, ln.created_at, u.name AS author_name
       FROM lead_notes ln
       LEFT JOIN users u ON u.id = ln.author_id
       WHERE ln.lead_id = ?
       ORDER BY ln.created_at DESC`,
      [req.params.id]
    );
    const recommendedDoctors = await fetchRows(
      `SELECT d.id, d.name, d.speciality, d.city
       FROM lead_recommended_doctors lrd
       INNER JOIN doctors d ON d.id = lrd.doctor_id
       WHERE lrd.lead_id = ?`,
      [req.params.id]
    );
    const recommendedHospitals = await fetchRows(
      `SELECT h.id, h.name, h.city
       FROM lead_recommended_hospitals lrh
       INNER JOIN hospitals h ON h.id = lrh.hospital_id
       WHERE lrh.lead_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      lead: formatLead(lead),
      notes: notes.map((item) => ({
        id: String(item.id),
        note: item.note,
        authorName: item.author_name || 'Unknown',
        createdAt: item.created_at,
      })),
      recommendedDoctors: recommendedDoctors.map((item) => ({ id: String(item.id), name: item.name, speciality: item.speciality, city: item.city })),
      recommendedHospitals: recommendedHospitals.map((item) => ({ id: String(item.id), name: item.name, city: item.city })),
    });
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
    const pipelineStage = payload.pipelineStage || current.pipeline_stage || current.status;
    const status = payload.status || PIPELINE_TO_STATUS[pipelineStage] || current.status;
    await pool.execute(
      `UPDATE leads
       SET status = ?, pipeline_stage = ?, assigned_consultant_id = ?, priority = ?, preferred_hospital = ?, is_spam = ?, is_archived = ?, follow_up_at = ?, last_contacted_at = ?
       WHERE id = ?`,
      [
        status,
        pipelineStage,
        payload.assignedConsultantId === undefined ? current.assigned_consultant_id || null : payload.assignedConsultantId || null,
        payload.priority || current.priority,
        payload.preferredHospital || current.preferred_hospital || null,
        payload.isSpam === undefined ? current.is_spam || 0 : (payload.isSpam ? 1 : 0),
        payload.isArchived === undefined ? current.is_archived || 0 : (payload.isArchived ? 1 : 0),
        payload.followUpAt === undefined ? current.follow_up_at || null : payload.followUpAt || null,
        payload.touchLead ? new Date() : current.last_contacted_at || null,
        req.params.id,
      ]
    );
    const nextFollowUpAt = payload.followUpAt === undefined ? current.follow_up_at || null : payload.followUpAt || null;
    if (nextFollowUpAt || pipelineStage === 'Follow-up') {
      const existingFollowUp = await fetchOne('SELECT id FROM follow_ups WHERE lead_id = ? LIMIT 1', [req.params.id]);
      if (existingFollowUp) {
        await pool.execute(
          `UPDATE follow_ups
           SET patient_name = ?, patient_phone = ?, concern = ?, city = ?, priority = ?, assigned_to = ?, next_follow_up = ?, status = ?, updated_at = NOW()
           WHERE lead_id = ?`,
          [
            current.patient_name,
            current.patient_phone,
            current.main_problem,
            current.patient_city,
            payload.priority || current.priority,
            payload.assignedConsultantId === undefined ? current.assigned_consultant_id || null : payload.assignedConsultantId || null,
            nextFollowUpAt,
            pipelineStage === 'Follow-up' ? 'Not Called' : 'Called',
            req.params.id,
          ]
        );
      } else {
        await pool.execute(
          `INSERT INTO follow_ups
            (lead_id, patient_name, patient_phone, concern, city, priority, status, assigned_to, next_follow_up, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.params.id,
            current.patient_name,
            current.patient_phone,
            current.main_problem,
            current.patient_city,
            payload.priority || current.priority,
            'Not Called',
            payload.assignedConsultantId === undefined ? current.assigned_consultant_id || null : payload.assignedConsultantId || null,
            nextFollowUpAt,
            null,
          ]
        );
      }
    }
    const lead = await fetchOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    res.locals.activityLog = {
      action: 'Lead updated',
      entityType: 'lead',
      entityId: req.params.id,
      category: 'Operations',
      dashboardHref: '/dashboard/super-admin/leads',
      description: `Lead ${req.params.id} was updated to stage ${lead.pipeline_stage || lead.status}`,
    };
    res.json({ success: true, lead: formatLead(lead) });
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
    res.locals.activityLog = {
      action: 'Lead note added',
      entityType: 'lead',
      entityId: req.params.id,
      category: 'Operations',
      dashboardHref: '/dashboard/super-admin/leads',
      description: `A note was added to lead ${req.params.id}`,
    };
    res.json({ success: true, message: 'Note added successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/recommendations', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    const lead = await fetchOne('SELECT id FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const doctorIds = Array.isArray(req.body.doctorIds) ? req.body.doctorIds : [];
    const hospitalIds = Array.isArray(req.body.hospitalIds) ? req.body.hospitalIds : [];
    await pool.execute('DELETE FROM lead_recommended_doctors WHERE lead_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM lead_recommended_hospitals WHERE lead_id = ?', [req.params.id]);

    for (const doctorId of doctorIds) {
      await pool.execute('INSERT INTO lead_recommended_doctors (lead_id, doctor_id) VALUES (?, ?)', [req.params.id, doctorId]);
    }
    for (const hospitalId of hospitalIds) {
      await pool.execute('INSERT INTO lead_recommended_hospitals (lead_id, hospital_id) VALUES (?, ?)', [req.params.id, hospitalId]);
    }

    if (req.body.note) {
      await pool.execute('INSERT INTO lead_notes (lead_id, note, author_id) VALUES (?, ?, ?)', [req.params.id, req.body.note, req.user.id]);
    }

    const nextStage = req.body.sendToPatient ? 'Patient Decision Pending' : 'Doctor Options Sent';
    await pool.execute(
      `UPDATE leads
       SET pipeline_stage = ?, status = ?, last_contacted_at = NOW()
       WHERE id = ?`,
      [nextStage, PIPELINE_TO_STATUS[nextStage], req.params.id]
    );

    res.locals.activityLog = {
      action: req.body.sendToPatient ? 'Lead options sent to patient' : 'Lead recommendations updated',
      entityType: 'lead',
      entityId: req.params.id,
      category: 'Operations',
      dashboardHref: '/dashboard/super-admin/leads',
      description: `${doctorIds.length} doctors and ${hospitalIds.length} hospitals were attached to lead ${req.params.id}`,
    };

    res.json({ success: true, message: 'Recommendations saved successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/appointment', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    const lead = await fetchOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const doctorId = req.body.doctorId || null;
    const hospitalId = req.body.hospitalId || null;
    const concern = req.body.concern || lead.main_problem;
    const [result] = await pool.execute(
      `INSERT INTO appointments
        (patient_name, patient_phone, patient_email, doctor_id, hospital_id, appointment_date, time_slot, concern, status, workflow_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Confirmed')`,
      [
        lead.patient_name,
        lead.patient_phone,
        lead.patient_email,
        doctorId,
        hospitalId,
        req.body.appointmentDate,
        req.body.timeSlot,
        concern,
      ]
    );

    await pool.execute(
      `UPDATE leads
       SET pipeline_stage = 'Appointment Confirmed', status = 'Appointment Pending', last_contacted_at = NOW()
       WHERE id = ?`,
      [req.params.id]
    );

    if (req.body.note) {
      await pool.execute('INSERT INTO lead_notes (lead_id, note, author_id) VALUES (?, ?, ?)', [req.params.id, req.body.note, req.user.id]);
    }

    res.locals.activityLog = {
      action: 'Lead appointment created',
      entityType: 'lead',
      entityId: req.params.id,
      category: 'Operations',
      dashboardHref: '/dashboard/super-admin/appointments',
      description: `Appointment created from lead ${req.params.id}`,
    };

    res.json({ success: true, appointmentId: String(result.insertId) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
