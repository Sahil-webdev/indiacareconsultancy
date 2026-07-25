const express = require('express');
const { protect } = require('../middleware/auth');
const { fetchRows, fetchOne } = require('../services/mysqlUtils');
const { createNotification } = require('../services/notifications');

const router = express.Router();

function getUrgency(daysLeft) {
  if (daysLeft <= 7) return 'Critical';
  if (daysLeft <= 14) return 'Warning';
  if (daysLeft <= 30) return 'Moderate';
  return 'Low';
}

function formatRecord(row) {
  const expiresOn = row.expires_on || row.expiry_date || row.subscription_ends_at;
  const daysLeft = Math.max(0, Number(row.days_left || 0));
  return {
    id: `${row.record_type}_${row.entity_type}_${row.entity_id}_${row.row_id}`,
    rowId: String(row.row_id),
    entityType: row.entity_type,
    entityId: String(row.entity_id),
    ownerName: row.owner_name,
    ownerEmail: row.owner_email || '',
    ownerPhone: row.owner_phone || '',
    ownerUserId: row.owner_user_id ? String(row.owner_user_id) : null,
    recordType: row.record_type,
    label: row.label,
    expiresOn,
    daysLeft,
    urgency: getUrgency(daysLeft),
    fileUrl: row.file_url || null,
  };
}

router.get('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }

    const documents = await fetchRows(
      `SELECT
         vd.id AS row_id,
         vd.entity_type,
         vd.entity_id,
         vd.doc_type AS label,
         vd.expiry_date AS expires_on,
         DATEDIFF(vd.expiry_date, CURDATE()) AS days_left,
         vd.file_url,
         'verification_document' AS record_type,
         CASE WHEN vd.entity_type = 'doctor' THEN d.name ELSE h.name END AS owner_name,
         CASE WHEN vd.entity_type = 'doctor' THEN d.email ELSE h.email END AS owner_email,
         CASE WHEN vd.entity_type = 'doctor' THEN d.phone ELSE h.phone END AS owner_phone,
         CASE WHEN vd.entity_type = 'doctor' THEN d.user_id ELSE h.user_id END AS owner_user_id
       FROM verification_documents vd
       LEFT JOIN doctors d ON vd.entity_type = 'doctor' AND d.id = vd.entity_id
       LEFT JOIN hospitals h ON vd.entity_type = 'hospital' AND h.id = vd.entity_id
       WHERE vd.expiry_date IS NOT NULL
         AND vd.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 45 DAY)`
    );

    const subscriptions = await fetchRows(
      `SELECT
         d.id AS row_id,
         'doctor' AS entity_type,
         d.id AS entity_id,
         'Subscription Expiry' AS label,
         d.subscription_ends_at AS expires_on,
         DATEDIFF(DATE(d.subscription_ends_at), CURDATE()) AS days_left,
         NULL AS file_url,
         'subscription' AS record_type,
         d.name AS owner_name,
         d.email AS owner_email,
         d.phone AS owner_phone,
         d.user_id AS owner_user_id
       FROM doctors d
       WHERE d.is_subscribed = 1
         AND d.subscription_ends_at IS NOT NULL
         AND DATE(d.subscription_ends_at) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 45 DAY)
       UNION ALL
       SELECT
         h.id AS row_id,
         'hospital' AS entity_type,
         h.id AS entity_id,
         'Subscription Expiry' AS label,
         h.subscription_ends_at AS expires_on,
         DATEDIFF(DATE(h.subscription_ends_at), CURDATE()) AS days_left,
         NULL AS file_url,
         'subscription' AS record_type,
         h.name AS owner_name,
         h.email AS owner_email,
         h.phone AS owner_phone,
         h.user_id AS owner_user_id
       FROM hospitals h
       WHERE h.is_subscribed = 1
         AND h.subscription_ends_at IS NOT NULL
         AND DATE(h.subscription_ends_at) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 45 DAY)`
    );

    const records = [...documents, ...subscriptions]
      .map(formatRecord)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    res.json({ success: true, records });
  } catch (error) {
    next(error);
  }
});

router.post('/:recordType/:entityType/:entityId/:rowId/remind', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }

    const { recordType, entityType, entityId, rowId } = req.params;
    let record;
    if (recordType === 'verification_document') {
      record = await fetchOne(
        `SELECT
           vd.id AS row_id,
           vd.doc_type AS label,
           vd.expiry_date AS expires_on,
           CASE WHEN vd.entity_type = 'doctor' THEN d.name ELSE h.name END AS owner_name,
           CASE WHEN vd.entity_type = 'doctor' THEN d.user_id ELSE h.user_id END AS owner_user_id
         FROM verification_documents vd
         LEFT JOIN doctors d ON vd.entity_type = 'doctor' AND d.id = vd.entity_id
         LEFT JOIN hospitals h ON vd.entity_type = 'hospital' AND h.id = vd.entity_id
         WHERE vd.id = ? AND vd.entity_type = ? AND vd.entity_id = ?`,
        [rowId, entityType, entityId]
      );
    } else {
      const table = entityType === 'doctor' ? 'doctors' : 'hospitals';
      record = await fetchOne(
        `SELECT id AS row_id, name AS owner_name, user_id AS owner_user_id, subscription_ends_at AS expires_on
         FROM ${table}
         WHERE id = ?`,
        [entityId]
      );
      if (record) record.label = 'Subscription Expiry';
    }

    if (!record || !record.owner_user_id) {
      return res.status(404).json({ success: false, message: 'Expiring record not found' });
    }

    await createNotification({
      title: recordType === 'subscription' ? 'Subscription renewal reminder' : 'Document expiry reminder',
      message: recordType === 'subscription'
        ? `Your subscription is expiring on ${new Date(record.expires_on).toLocaleDateString('en-IN')}. Please renew to keep access active.`
        : `Your ${record.label} is expiring on ${new Date(record.expires_on).toLocaleDateString('en-IN')}. Please upload a renewed document.`,
      sentBy: req.user.id,
      recipientUserId: record.owner_user_id,
      recipientRole: entityType,
      category: 'verification',
      entityType: recordType,
      entityId: Number(entityId),
      actionUrl: entityType === 'doctor' ? '/dashboard/doctor/profile' : '/dashboard/hospital/profile',
      target: entityType === 'doctor' ? 'Doctors' : 'Hospitals',
    });

    res.locals.activityLog = {
      action: 'Expiry reminder sent',
      entityType: recordType,
      entityId,
      category: 'Verification',
      dashboardHref: '/dashboard/super-admin/verification/expiring-docs',
      description: `Reminder sent to ${record.owner_name} for ${record.label}`,
    };

    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
