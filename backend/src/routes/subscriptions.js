const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchRows, fetchOne } = require('../services/mysqlUtils');

const router = express.Router();

// Get subscription plans
router.get('/', async (req, res, next) => {
  try {
    const plans = await fetchRows('SELECT id, plan_key, label, amount, duration_days, description, updated_at FROM subscription_plans ORDER BY id ASC');
    res.json({ success: true, plans });
  } catch (error) {
    next(error);
  }
});

// Update plan amount or days (super admin)
router.patch('/:planKey', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only super admin can update subscription plans' });
    }
    await getPool().execute(
      `UPDATE subscription_plans
       SET amount = ?, duration_days = ?, description = ?, updated_by = ?
       WHERE plan_key = ?`,
      [
        req.body.amount,
        req.body.durationDays,
        req.body.description || null,
        req.user.id,
        req.params.planKey,
      ]
    );
    const plan = await fetchOne('SELECT id, plan_key, label, amount, duration_days, description, updated_at FROM subscription_plans WHERE plan_key = ?', [req.params.planKey]);
    res.json({ success: true, plan });
  } catch (error) {
    next(error);
  }
});

// Doctor/Hospital submits UPI UTR payment for Subscription Verification
router.post('/request-activation', protect, async (req, res, next) => {
  try {
    const { entityType, entityId, amount, utrNumber, screenshotUrl } = req.body;
    if (!utrNumber || String(utrNumber).trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 12-digit UTR / UPI Transaction Reference Number' });
    }

    const pool = getPool();
    const cleanUtr = String(utrNumber).trim();

    // Insert pending payment request
    const [result] = await pool.execute(
      `INSERT INTO payments
        (user_id, payment_type, entity_type, entity_id, amount, status, payment_method, transaction_ref, screenshot_url, created_at)
       VALUES (?, 'subscription', ?, ?, ?, 'Pending', 'UPI', ?, ?, NOW())`,
      [req.user.id, entityType || 'doctor', entityId, amount || 999, cleanUtr, screenshotUrl || null]
    );

    res.locals.activityLog = {
      action: 'Subscription payment submitted',
      entityType: entityType || 'doctor',
      entityId,
      category: 'Revenue',
      dashboardHref: '/dashboard/super-admin/verification/subscription-approvals',
      description: `${entityType || 'doctor'} ${entityId} submitted UTR ${cleanUtr} for ₹${amount || 999} subscription approval`,
    };

    res.json({
      success: true,
      message: 'UPI payment submitted successfully. Super Admin will verify the UTR and activate your subscription shortly.',
      paymentId: result.insertId,
      utrNumber: cleanUtr,
    });
  } catch (error) {
    next(error);
  }
});

// Super Admin: Get all pending subscription payment requests
router.get('/requests', protect, async (req, res, next) => {
  try {
    if (!['super_admin', 'consultant'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Super Admin access required' });
    }

    const rows = await fetchRows(
      `SELECT
        p.id,
        p.user_id,
        p.entity_type,
        p.entity_id,
        p.amount,
        p.status,
        p.payment_method,
        p.transaction_ref AS utr_number,
        p.screenshot_url,
        p.created_at,
        p.paid_at,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role,
        CASE
          WHEN p.entity_type = 'doctor' THEN d.name
          WHEN p.entity_type = 'hospital' THEN h.name
          ELSE u.name
        END AS entity_name,
        CASE
          WHEN p.entity_type = 'doctor' THEN d.speciality
          WHEN p.entity_type = 'hospital' THEN h.city
          ELSE ''
        END AS entity_detail
      FROM payments p
      INNER JOIN users u ON u.id = p.user_id
      LEFT JOIN doctors d ON (p.entity_type = 'doctor' AND d.id = p.entity_id)
      LEFT JOIN hospitals h ON (p.entity_type = 'hospital' AND h.id = p.entity_id)
      WHERE p.payment_type = 'subscription'
      ORDER BY p.status = 'Pending' DESC, p.created_at DESC`
    );

    res.json({ success: true, requests: rows });
  } catch (error) {
    next(error);
  }
});

// Super Admin: Approve or Reject subscription payment request
router.patch('/requests/:id', protect, async (req, res, next) => {
  try {
    if (!['super_admin', 'consultant'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Super Admin access required' });
    }

    const { action, rejectReason } = req.body; // 'approve' | 'reject'
    const paymentId = req.params.id;
    const pool = getPool();

    const payment = await fetchOne('SELECT * FROM payments WHERE id = ?', [paymentId]);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }

    if (action === 'approve') {
      const targetTable = payment.entity_type === 'doctor' ? 'doctors' : 'hospitals';
      const planKey = payment.entity_type === 'doctor' ? 'doctor' : 'hospital';
      const plan = await fetchOne('SELECT duration_days FROM subscription_plans WHERE plan_key = ?', [planKey]);
      const durationDays = plan ? Number(plan.duration_days) : 30;

      await pool.execute(
        `UPDATE payments SET status = 'Paid', paid_at = NOW() WHERE id = ?`,
        [paymentId]
      );

      await pool.execute(
        `UPDATE ${targetTable}
         SET is_subscribed = 1,
             subscription_paid_at = NOW(),
             subscription_ends_at = DATE_ADD(NOW(), INTERVAL ? DAY)
         WHERE id = ?`,
        [durationDays, payment.entity_id]
      );

      res.locals.activityLog = {
        action: 'Subscription payment approved',
        entityType: payment.entity_type,
        entityId: payment.entity_id,
        category: 'Revenue',
        dashboardHref: '/dashboard/super-admin/verification/subscription-approvals',
        description: `Approved UTR ${payment.transaction_ref} for ${payment.entity_type} ${payment.entity_id}`,
      };

      return res.json({ success: true, message: 'Subscription payment approved and activated for 30 days!' });
    } else {
      await pool.execute(
        `UPDATE payments SET status = 'Failed' WHERE id = ?`,
        [paymentId]
      );

      return res.json({ success: true, message: 'Subscription payment request marked as rejected.' });
    }
  } catch (error) {
    next(error);
  }
});

// Immediate Direct Activate Route (Legacy/Super Admin direct override)
router.post('/activate', protect, async (req, res, next) => {
  try {
    const { entityType, entityId, amount, paymentMethod, transactionRef } = req.body;
    const pool = getPool();
    const targetTable = entityType === 'doctor' ? 'doctors' : 'hospitals';
    const planKey = entityType === 'doctor' ? 'doctor' : 'hospital';
    const plan = await fetchOne('SELECT duration_days FROM subscription_plans WHERE plan_key = ?', [planKey]);
    const durationDays = plan ? Number(plan.duration_days) : 30;

    await pool.execute(
      `INSERT INTO payments
        (user_id, payment_type, entity_type, entity_id, amount, status, payment_method, transaction_ref, paid_at)
       VALUES (?, 'subscription', ?, ?, ?, 'Paid', ?, ?, NOW())`,
      [req.user.id, entityType, entityId, amount, paymentMethod || null, transactionRef || null]
    );

    await pool.execute(
      `UPDATE ${targetTable}
       SET is_subscribed = 1,
           subscription_paid_at = NOW(),
           subscription_ends_at = DATE_ADD(NOW(), INTERVAL ? DAY)
       WHERE id = ?`,
      [durationDays, entityId]
    );

    res.json({ success: true, message: 'Subscription activated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
