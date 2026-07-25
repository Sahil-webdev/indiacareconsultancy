const express = require('express');
const { protect } = require('../middleware/auth');
const { fetchOne, fetchRows } = require('../services/mysqlUtils');
const { getPool } = require('../config/mysql');

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 50);
    const unreadOnly = req.query.unreadOnly === '1';
    const params = [req.user.id, req.user.role];
    const unreadClause = unreadOnly ? 'AND COALESCE(n.is_read, 0) = 0' : '';

    const notifications = await fetchRows(
      `SELECT
         n.id,
         n.title,
         n.message,
         n.category,
         n.entity_type,
         n.entity_id,
         n.action_url,
         n.created_at,
         COALESCE(n.is_read, 0) AS is_read,
         sender.name AS sender_name
       FROM notifications n
       LEFT JOIN users sender ON sender.id = n.sent_by
       WHERE (
         n.recipient_user_id = ?
         OR (n.recipient_user_id IS NULL AND n.recipient_role = ?)
       )
       ${unreadClause}
       ORDER BY n.created_at DESC
       LIMIT ${limit}`,
      params
    );

    const unread = await fetchOne(
      `SELECT COUNT(*) AS unreadCount
       FROM notifications n
       WHERE (
         n.recipient_user_id = ?
         OR (n.recipient_user_id IS NULL AND n.recipient_role = ?)
       )
       AND COALESCE(n.is_read, 0) = 0`,
      [req.user.id, req.user.role]
    );

    res.json({
      success: true,
      notifications: notifications.map((notification) => ({
        id: String(notification.id),
        title: notification.title,
        message: notification.message,
        category: notification.category || 'general',
        entityType: notification.entity_type || null,
        entityId: notification.entity_id ? String(notification.entity_id) : null,
        actionUrl: notification.action_url || null,
        createdAt: notification.created_at,
        isRead: Boolean(Number(notification.is_read)),
        senderName: notification.sender_name || null,
      })),
      unreadCount: Number(unread?.unreadCount || 0),
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.execute(
      `UPDATE notifications
       SET is_read = 1
       WHERE id = ?
       AND (recipient_user_id = ? OR (recipient_user_id IS NULL AND recipient_role = ?))`,
      [req.params.id, req.user.id, req.user.role]
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/read-all', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.execute(
      `UPDATE notifications
       SET is_read = 1
       WHERE recipient_user_id = ?
          OR (recipient_user_id IS NULL AND recipient_role = ?)`,
      [req.user.id, req.user.role]
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
