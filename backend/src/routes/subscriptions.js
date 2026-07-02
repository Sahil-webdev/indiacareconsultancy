const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchRows, fetchOne } = require('../services/mysqlUtils');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const plans = await fetchRows('SELECT id, plan_key, label, amount, duration_days, description, updated_at FROM subscription_plans ORDER BY id ASC');
    res.json({ success: true, plans });
  } catch (error) {
    next(error);
  }
});

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
