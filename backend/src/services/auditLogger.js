const { getPool } = require('../config/mysql');

function buildIpAddress(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || null;
}

function buildDevice(req) {
  return req.headers['user-agent'] || 'Unknown device';
}

async function recordAuditLog({
  userId = null,
  action,
  entityType = null,
  entityId = null,
  details = null,
  ipAddress = null,
}) {
  if (!action) return;

  await getPool().execute(
    `INSERT INTO audit_logs
      (user_id, action, entity_type, entity_id, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      action,
      entityType,
      entityId,
      details ? JSON.stringify(details) : null,
      ipAddress,
    ]
  );
}

function resolveGenericAction(req) {
  const path = req.path || '';
  const method = req.method.toUpperCase();

  if (path.startsWith('/auth/')) return null;
  if (path.startsWith('/notifications/')) return null;

  if (path.startsWith('/doctors')) {
    if (method === 'POST') return { action: 'Doctor created', entityType: 'doctor', entityId: req.body?.id || null };
    if (method === 'PATCH') return { action: 'Doctor updated', entityType: 'doctor', entityId: req.params?.id || req.user?.profile?.entityId || null };
    if (method === 'DELETE') return { action: 'Doctor deleted', entityType: 'doctor', entityId: req.params?.id || null };
  }

  if (path.startsWith('/hospitals')) {
    if (method === 'POST') return { action: 'Hospital created', entityType: 'hospital', entityId: req.body?.id || null };
    if (method === 'PATCH') return { action: 'Hospital updated', entityType: 'hospital', entityId: req.params?.id || req.user?.profile?.entityId || null };
    if (method === 'DELETE') return { action: 'Hospital deleted', entityType: 'hospital', entityId: req.params?.id || null };
  }

  if (path.startsWith('/leads')) {
    if (method === 'PATCH') return { action: 'Lead updated', entityType: 'lead', entityId: req.params?.id || null };
    if (method === 'POST' && /\/notes$/.test(path)) return { action: 'Lead note added', entityType: 'lead', entityId: req.params?.id || null };
  }

  if (path.startsWith('/appointments') && method === 'POST') {
    return { action: 'Appointment created', entityType: 'appointment', entityId: null };
  }

  if (path.startsWith('/subscriptions')) {
    if (method === 'PATCH') return { action: 'Subscription plan updated', entityType: 'subscription', entityId: null };
    if (method === 'POST') return { action: 'Subscription activated', entityType: 'subscription', entityId: req.body?.entityId || null };
  }

  if (path.startsWith('/profile-change-requests') && method === 'PATCH') {
    return { action: 'Profile change reviewed', entityType: req.params?.entityType || 'profile_change', entityId: req.params?.entityId || null };
  }

  return { action: `${method} ${path}`, entityType: 'system', entityId: null };
}

function captureSuccessfulApiActivity(req, res, next) {
  res.on('finish', async () => {
    try {
      if (!req.user) return;
      if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method.toUpperCase())) return;
      if (res.statusCode >= 400) return;

      const explicit = res.locals.activityLog;
      const generic = explicit || resolveGenericAction(req);
      if (!generic) return;

      await recordAuditLog({
        userId: req.user.id,
        action: generic.action,
        entityType: generic.entityType || null,
        entityId: generic.entityId ? Number(generic.entityId) : null,
        ipAddress: buildIpAddress(req),
        details: {
          role: req.user.role,
          method: req.method.toUpperCase(),
          path: req.originalUrl,
          description: generic.description || null,
          category: generic.category || null,
          dashboardHref: generic.dashboardHref || null,
          actorName: generic.actorName || null,
          entityLabel: generic.entityLabel || null,
          device: buildDevice(req),
        },
      });
    } catch (error) {
      console.error(`Audit log capture failed: ${error.message}`);
    }
  });

  next();
}

module.exports = {
  buildDevice,
  buildIpAddress,
  captureSuccessfulApiActivity,
  recordAuditLog,
};
