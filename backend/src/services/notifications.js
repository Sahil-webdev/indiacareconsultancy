const { getPool } = require('../config/mysql');

async function createNotification({
  title,
  message,
  sentBy = null,
  recipientUserId = null,
  recipientRole = null,
  category = null,
  entityType = null,
  entityId = null,
  actionUrl = null,
  metadata = null,
  target = 'All',
  connection = null,
}) {
  const executor = connection || getPool();
  const metadataJson = metadata ? JSON.stringify(metadata) : null;

  await executor.execute(
    `INSERT INTO notifications
      (title, message, target, status, reach_count, sent_by, sent_at, recipient_user_id, recipient_role, category, entity_type, entity_id, action_url, is_read, metadata_json)
     VALUES (?, ?, ?, 'Sent', 1, ?, NOW(), ?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      title,
      message,
      target,
      sentBy,
      recipientUserId,
      recipientRole,
      category,
      entityType,
      entityId,
      actionUrl,
      metadataJson,
    ]
  );
}

async function createSuperAdminNotification(input) {
  return createNotification({
    ...input,
    recipientRole: 'super_admin',
    target: 'All',
  });
}

module.exports = {
  createNotification,
  createSuperAdminNotification,
};
