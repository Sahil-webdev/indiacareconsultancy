const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchOne, fetchRows } = require('../services/mysqlUtils');

const router = express.Router();

const FOLLOW_UP_STATUSES = ['Not Called', 'Called', 'Interested', 'Appointment Fixed', 'Not Interested'];

const FOLLOW_UP_TO_LEAD = {
  'Not Called': { status: 'Contacted', pipelineStage: 'Follow-up' },
  Called: { status: 'Contacted', pipelineStage: 'Contacted' },
  Interested: { status: 'Need More Details', pipelineStage: 'Qualified' },
  'Appointment Fixed': { status: 'Appointment Pending', pipelineStage: 'Appointment Requested' },
  'Not Interested': { status: 'Lost', pipelineStage: 'Lost' },
};

function formatFollowUp(row) {
  return {
    id: String(row.id),
    leadId: row.lead_id ? String(row.lead_id) : null,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    concern: row.concern || '',
    city: row.city || '',
    priority: row.priority,
    status: row.status,
    assignedTo: row.assigned_to ? String(row.assigned_to) : null,
    consultantName: row.consultant_name || 'Unassigned',
    notes: row.notes || '',
    nextFollowUp: row.next_follow_up,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function syncLeadFromFollowUp(connection, followUp) {
  if (!followUp.lead_id) return;
  const leadSync = FOLLOW_UP_TO_LEAD[followUp.status];
  if (!leadSync) return;

  await connection.execute(
    `UPDATE leads
     SET status = ?, pipeline_stage = ?, follow_up_at = ?, last_contacted_at = NOW()
     WHERE id = ?`,
    [
      leadSync.status,
      leadSync.pipelineStage,
      followUp.next_follow_up || null,
      followUp.lead_id,
    ]
  );
}

router.get('/', protect, async (req, res, next) => {
  try {
    const rows = await fetchRows(
      `SELECT
         fu.*,
         u.name AS consultant_name
       FROM follow_ups fu
       LEFT JOIN users u ON u.id = fu.assigned_to
       ORDER BY
         CASE WHEN fu.next_follow_up IS NULL THEN 1 ELSE 0 END,
         fu.next_follow_up ASC,
         fu.created_at DESC`
    );

    res.json({
      success: true,
      count: rows.length,
      followUps: rows.map(formatFollowUp),
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    const current = await fetchOne('SELECT * FROM follow_ups WHERE id = ?', [req.params.id]);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    const nextStatus = req.body.status || current.status;
    if (!FOLLOW_UP_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid follow-up status' });
    }

    const nextPriority = req.body.priority || current.priority;
    const nextFollowUp = req.body.nextFollowUp === undefined ? current.next_follow_up : (req.body.nextFollowUp || null);
    const nextAssignedTo = req.body.assignedTo === undefined ? current.assigned_to : (req.body.assignedTo || null);
    const nextNotes = req.body.notes === undefined ? current.notes : (req.body.notes || null);

    await pool.execute(
      `UPDATE follow_ups
       SET status = ?, priority = ?, assigned_to = ?, notes = ?, next_follow_up = ?
       WHERE id = ?`,
      [nextStatus, nextPriority, nextAssignedTo, nextNotes, nextFollowUp, req.params.id]
    );

    const updated = await fetchOne('SELECT * FROM follow_ups WHERE id = ?', [req.params.id]);
    await syncLeadFromFollowUp(pool, updated);

    res.locals.activityLog = {
      action: 'Follow-up updated',
      entityType: 'follow_up',
      entityId: req.params.id,
      category: 'Operations',
      dashboardHref: '/dashboard/super-admin/follow-ups',
      description: `Follow-up ${req.params.id} updated to ${updated.status}`,
    };

    const row = await fetchOne(
      `SELECT fu.*, u.name AS consultant_name
       FROM follow_ups fu
       LEFT JOIN users u ON u.id = fu.assigned_to
       WHERE fu.id = ?`,
      [req.params.id]
    );

    res.json({ success: true, followUp: formatFollowUp(row) });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/notes', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    const current = await fetchOne('SELECT * FROM follow_ups WHERE id = ?', [req.params.id]);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    const rawNote = String(req.body.note || '').trim();
    if (!rawNote) {
      return res.status(400).json({ success: false, message: 'Note is required' });
    }

    const actorName = req.user.name || req.user.email || 'Admin';
    const stampedNote = `[${new Date().toLocaleString('en-IN')}] ${actorName}: ${rawNote}`;
    const nextNotes = current.notes ? `${current.notes}\n${stampedNote}` : stampedNote;

    await pool.execute('UPDATE follow_ups SET notes = ? WHERE id = ?', [nextNotes, req.params.id]);

    res.locals.activityLog = {
      action: 'Follow-up note added',
      entityType: 'follow_up',
      entityId: req.params.id,
      category: 'Operations',
      dashboardHref: '/dashboard/super-admin/follow-ups',
      description: `A note was added to follow-up ${req.params.id}`,
    };

    const row = await fetchOne(
      `SELECT fu.*, u.name AS consultant_name
       FROM follow_ups fu
       LEFT JOIN users u ON u.id = fu.assigned_to
       WHERE fu.id = ?`,
      [req.params.id]
    );

    res.json({ success: true, followUp: formatFollowUp(row) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
