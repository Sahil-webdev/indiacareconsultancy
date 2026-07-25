const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchOne, fetchRows } = require('../services/mysqlUtils');
const { createNotification, createSuperAdminNotification } = require('../services/notifications');

const router = express.Router();

const WORKFLOW_STATUSES = [
  'Requested',
  'Awaiting Doctor Confirmation',
  'Awaiting Patient Confirmation',
  'Confirmed',
  'Rescheduled',
  'Completed',
  'Cancelled by Patient',
  'Cancelled by Doctor',
  'No-show',
];

function mapWorkflowToDbStatus(workflowStatus) {
  switch (workflowStatus) {
    case 'Completed':
      return 'Completed';
    case 'Cancelled by Patient':
    case 'Cancelled by Doctor':
    case 'No-show':
      return 'Cancelled';
    case 'Confirmed':
    case 'Rescheduled':
      return 'Confirmed';
    default:
      return 'Pending';
  }
}

function normalizeAppointment(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    patientEmail: row.patient_email || '',
    doctorId: row.doctor_id ? String(row.doctor_id) : null,
    doctorName: row.doctor_name || 'Not assigned',
    doctorSpeciality: row.doctor_speciality || '',
    doctorPhone: row.doctor_phone || '',
    doctorEmail: row.doctor_email || '',
    doctorUserId: row.doctor_user_id ? String(row.doctor_user_id) : null,
    hospitalId: row.hospital_id ? String(row.hospital_id) : null,
    hospitalName: row.hospital_name || 'Not assigned',
    hospitalPhone: row.hospital_phone || '',
    hospitalEmail: row.hospital_email || '',
    hospitalUserId: row.hospital_user_id ? String(row.hospital_user_id) : null,
    appointmentDate: row.appointment_date,
    timeSlot: row.time_slot,
    concern: row.concern || '',
    status: row.status,
    workflowStatus: row.workflow_status || row.status,
    adminNote: row.admin_note || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };
}

async function fetchAppointmentRecord(id, reqUser = null) {
  let sql = `
    SELECT
      a.*,
      d.name AS doctor_name,
      d.speciality AS doctor_speciality,
      d.phone AS doctor_phone,
      d.email AS doctor_email,
      d.user_id AS doctor_user_id,
      h.name AS hospital_name,
      h.phone AS hospital_phone,
      h.email AS hospital_email,
      h.user_id AS hospital_user_id
    FROM appointments a
    LEFT JOIN doctors d ON d.id = a.doctor_id
    LEFT JOIN hospitals h ON h.id = a.hospital_id
    WHERE a.id = ?
  `;
  const params = [id];

  if (reqUser?.role === 'doctor') {
    sql += ' AND d.user_id = ?';
    params.push(reqUser.id);
  } else if (reqUser?.role === 'hospital') {
    sql += ' AND h.user_id = ?';
    params.push(reqUser.id);
  }

  return fetchOne(sql, params);
}

async function createAppointmentNotifications({ appointment, actorName, actionLabel, actionUrl, reqUserId }) {
  const message = `${appointment.patient_name} appointment is now ${actionLabel.toLowerCase()} for ${appointment.appointment_date} at ${appointment.time_slot}.`;

  if (appointment.doctor_user_id) {
    await createNotification({
      title: 'Appointment updated',
      message,
      sentBy: reqUserId,
      recipientUserId: appointment.doctor_user_id,
      recipientRole: 'doctor',
      category: 'appointments',
      entityType: 'appointment',
      entityId: appointment.id,
      actionUrl,
      metadata: { actorName, actionLabel },
      target: 'Doctors',
    });
  }

  if (appointment.hospital_user_id) {
    await createNotification({
      title: 'Appointment updated',
      message,
      sentBy: reqUserId,
      recipientUserId: appointment.hospital_user_id,
      recipientRole: 'hospital',
      category: 'appointments',
      entityType: 'appointment',
      entityId: appointment.id,
      actionUrl,
      metadata: { actorName, actionLabel },
      target: 'Hospitals',
    });
  }
}

router.get('/', protect, async (req, res, next) => {
  try {
    let sql = `
      SELECT
        a.*,
        d.name AS doctor_name,
        d.speciality AS doctor_speciality,
        d.phone AS doctor_phone,
        d.email AS doctor_email,
        d.user_id AS doctor_user_id,
        h.name AS hospital_name,
        h.phone AS hospital_phone,
        h.email AS hospital_email,
        h.user_id AS hospital_user_id
      FROM appointments a
      LEFT JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN hospitals h ON h.id = a.hospital_id
    `;
    const params = [];

    if (req.user.role === 'doctor') {
      sql += ' WHERE d.user_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'hospital') {
      sql += ' WHERE h.user_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.time_slot DESC, a.created_at DESC';
    const appointments = await fetchRows(sql, params);
    res.json({
      success: true,
      count: appointments.length,
      appointments: appointments.map(normalizeAppointment),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const appointment = await fetchAppointmentRecord(req.params.id, req.user);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const history = await fetchRows(
      `SELECT
         al.id,
         al.action,
         al.details,
         al.created_at,
         u.name AS actor_name,
         u.role AS actor_role
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE al.entity_type = 'appointment' AND al.entity_id = ?
       ORDER BY al.created_at DESC`,
      [req.params.id]
    );

    res.json({
      success: true,
      appointment: normalizeAppointment(appointment),
      history: history.map((item) => ({
        id: String(item.id),
        action: item.action,
        actorName: item.actor_name || 'System',
        actorRole: item.actor_role || null,
        createdAt: item.created_at,
        details: item.details || null,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const pool = getPool();
    const payload = req.body;
    const workflowStatus = 'Requested';
    const [result] = await pool.execute(
      `INSERT INTO appointments
        (patient_name, patient_phone, patient_email, doctor_id, hospital_id, appointment_date, time_slot, concern, status, workflow_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        payload.patientName,
        payload.patientPhone,
        payload.patientEmail || null,
        payload.doctorId || null,
        payload.hospitalId || null,
        payload.appointmentDate,
        payload.timeSlot,
        payload.concern || null,
        workflowStatus,
      ]
    );

    await createSuperAdminNotification({
      title: 'New appointment request',
      message: `${payload.patientName} booked an appointment for ${payload.appointmentDate} at ${payload.timeSlot}.`,
      category: 'appointments',
      entityType: 'appointment',
      entityId: Number(result.insertId),
      actionUrl: '/dashboard/super-admin/appointments',
      metadata: { source: 'website' },
    });

    res.status(201).json({ success: true, appointmentId: String(result.insertId) });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    const existing = await fetchAppointmentRecord(req.params.id, req.user);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const nextWorkflowStatus = req.body.workflowStatus || existing.workflow_status || existing.status;
    if (!WORKFLOW_STATUSES.includes(nextWorkflowStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment workflow status' });
    }

    const nextStatus = mapWorkflowToDbStatus(nextWorkflowStatus);
    const nextAppointmentDate = req.body.appointmentDate || existing.appointment_date;
    const nextTimeSlot = req.body.timeSlot || existing.time_slot;
    const nextDoctorId = Object.prototype.hasOwnProperty.call(req.body, 'doctorId') ? (req.body.doctorId || null) : existing.doctor_id;
    const nextHospitalId = Object.prototype.hasOwnProperty.call(req.body, 'hospitalId') ? (req.body.hospitalId || null) : existing.hospital_id;
    const nextConcern = Object.prototype.hasOwnProperty.call(req.body, 'concern') ? (req.body.concern || null) : existing.concern;
    const nextAdminNote = Object.prototype.hasOwnProperty.call(req.body, 'adminNote') ? (req.body.adminNote || null) : existing.admin_note;

    await pool.execute(
      `UPDATE appointments
       SET doctor_id = ?, hospital_id = ?, appointment_date = ?, time_slot = ?, concern = ?, status = ?, workflow_status = ?, admin_note = ?
       WHERE id = ?`,
      [
        nextDoctorId,
        nextHospitalId,
        nextAppointmentDate,
        nextTimeSlot,
        nextConcern,
        nextStatus,
        nextWorkflowStatus,
        nextAdminNote,
        req.params.id,
      ]
    );

    const updated = await fetchAppointmentRecord(req.params.id, req.user);
    const actorName = req.user.name || req.user.email || 'Admin';
    const actionUrl = '/dashboard/super-admin/appointments';

    await createAppointmentNotifications({
      appointment: updated,
      actorName,
      actionLabel: nextWorkflowStatus,
      actionUrl,
      reqUserId: req.user.id,
    });

    res.locals.activityLog = {
      action: 'Appointment updated',
      entityType: 'appointment',
      entityId: req.params.id,
      category: 'Operations',
      dashboardHref: actionUrl,
      description: `Appointment ${req.params.id} moved to ${nextWorkflowStatus}`,
    };

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: normalizeAppointment(updated),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/actions', protect, async (req, res, next) => {
  try {
    const appointment = await fetchAppointmentRecord(req.params.id, req.user);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const action = String(req.body.action || '').trim();
    if (!action) {
      return res.status(400).json({ success: false, message: 'Action is required' });
    }

    const actorName = req.user.name || req.user.email || 'Admin';
    let message = 'Action completed successfully';
    let actionLabel = '';

    if (action === 'send_reminder') {
      actionLabel = 'Reminder sent';
      message = 'Reminder sent successfully';
      await createAppointmentNotifications({
        appointment,
        actorName,
        actionLabel,
        actionUrl: '/dashboard/super-admin/appointments',
        reqUserId: req.user.id,
      });
    } else if (action === 'initiate_refund') {
      actionLabel = 'Refund initiated';
      message = 'Refund workflow started';
      await createSuperAdminNotification({
        title: 'Refund initiated',
        message: `Refund initiated for appointment ${req.params.id} by ${actorName}.`,
        sentBy: req.user.id,
        category: 'payments',
        entityType: 'appointment',
        entityId: Number(req.params.id),
        actionUrl: '/dashboard/super-admin/appointments',
        metadata: { note: req.body.note || null },
      });
    } else if (action === 'raise_dispute') {
      actionLabel = 'Dispute raised';
      message = 'Dispute recorded successfully';
      await createSuperAdminNotification({
        title: 'Appointment dispute raised',
        message: `Dispute raised for appointment ${req.params.id} by ${actorName}.`,
        sentBy: req.user.id,
        category: 'support',
        entityType: 'appointment',
        entityId: Number(req.params.id),
        actionUrl: '/dashboard/super-admin/appointments',
        metadata: { note: req.body.note || null },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported action' });
    }

    res.locals.activityLog = {
      action: actionLabel,
      entityType: 'appointment',
      entityId: req.params.id,
      category: 'Operations',
      dashboardHref: '/dashboard/super-admin/appointments',
      description: req.body.note || actionLabel,
    };

    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
