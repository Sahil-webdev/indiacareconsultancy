const express = require('express');
const { protect } = require('../middleware/auth');
const { fetchOne, fetchRows, parseJson } = require('../services/mysqlUtils');

const router = express.Router();

function formatRelativeDate(value) {
  if (!value) return null;
  const now = Date.now();
  const then = new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor((now - then) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

async function fetchRecentActivities(limit = 50, category = null) {
  const params = [];
  let whereClause = '';

  if (category && category !== 'All') {
    whereClause = 'WHERE JSON_UNQUOTE(JSON_EXTRACT(al.details, "$.category")) = ?';
    params.push(category);
  }

  const rows = await fetchRows(
    `SELECT
       al.id,
       al.action,
       al.entity_type,
       al.entity_id,
       al.details,
       al.created_at,
       u.name AS user_name,
       u.role AS user_role
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT ${Math.min(Math.max(Number(limit || 50), 1), 200)}`,
    params
  );

  return rows.map((row) => {
    const details = parseJson(row.details, {});
    return {
      id: String(row.id),
      action: row.action,
      entityType: row.entity_type || 'system',
      entityId: row.entity_id ? String(row.entity_id) : null,
      actorName: row.user_name || 'System',
      actorRole: row.user_role || 'system',
      createdAt: row.created_at,
      timeAgo: formatRelativeDate(row.created_at),
      description: details.description || null,
      category: details.category || 'General',
      dashboardHref: details.dashboardHref || null,
      device: details.device || null,
    };
  });
}

router.get('/summary', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }

    const [
      doctorApprovals,
      hospitalApprovals,
      profileChanges,
      expiringDocs,
      unassignedLeads,
      pendingAppointments,
      overdueFollowUps,
      failedPayments,
      expiringSubscriptions,
      openComplaints,
      recentActivities,
    ] = await Promise.all([
      fetchOne(`
        SELECT COUNT(*) AS count, MIN(d.created_at) AS oldest_at
        FROM doctors d
        INNER JOIN users u ON u.id = d.user_id
        WHERE d.is_approved = 0 AND u.is_active = 1
      `),
      fetchOne(`
        SELECT COUNT(*) AS count, MIN(h.created_at) AS oldest_at
        FROM hospitals h
        INNER JOIN users u ON u.id = h.user_id
        WHERE h.is_approved = 0 AND u.is_active = 1
      `),
      fetchOne(`SELECT COUNT(*) AS count, MIN(created_at) AS oldest_at FROM profile_change_requests WHERE status = 'Pending'`),
      fetchOne(`SELECT COUNT(*) AS count, MIN(expiry_date) AS nearest_expiry FROM verification_documents WHERE expiry_date IS NOT NULL AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`),
      fetchOne(`SELECT COUNT(*) AS count, MIN(created_at) AS oldest_at FROM leads WHERE assigned_consultant_id IS NULL`),
      fetchOne(`SELECT COUNT(*) AS count, MIN(appointment_date) AS oldest_at FROM appointments WHERE status = 'Pending'`),
      fetchOne(`SELECT COUNT(*) AS count, MIN(next_follow_up) AS oldest_at FROM follow_ups WHERE next_follow_up IS NOT NULL AND next_follow_up < NOW() AND status NOT IN ('Appointment Fixed','Not Interested')`),
      fetchOne(`SELECT COUNT(*) AS count, MIN(created_at) AS oldest_at FROM payments WHERE status = 'Failed'`),
      fetchOne(`
        SELECT COUNT(*) AS count, MIN(subscription_ends_at) AS oldest_at
        FROM (
          SELECT subscription_ends_at FROM doctors WHERE is_subscribed = 1 AND subscription_ends_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
          UNION ALL
          SELECT subscription_ends_at FROM hospitals WHERE is_subscribed = 1 AND subscription_ends_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
        ) expiring_subscriptions
      `),
      fetchOne(`SELECT COUNT(*) AS count, MIN(created_at) AS oldest_at FROM complaints WHERE status IN ('Open','In Review')`),
      fetchRecentActivities(24),
    ]);

    const sections = [
      {
        title: 'Verification Queue',
        color: 'border-amber-500/25',
        items: [
          {
            key: 'doctor_approvals',
            icon: 'UserCheck',
            label: 'Doctors Awaiting Approval',
            count: Number(doctorApprovals?.count || 0),
            urgency: Number(doctorApprovals?.count || 0) > 0 ? 'high' : 'low',
            href: '/dashboard/super-admin/verification/doctor-approvals',
            note: doctorApprovals?.oldest_at ? `Oldest submission: ${formatRelativeDate(doctorApprovals.oldest_at)}` : 'No pending doctor approvals',
          },
          {
            key: 'hospital_approvals',
            icon: 'Building2',
            label: 'Hospitals Awaiting Approval',
            count: Number(hospitalApprovals?.count || 0),
            urgency: Number(hospitalApprovals?.count || 0) > 0 ? 'high' : 'low',
            href: '/dashboard/super-admin/verification/hospital-approvals',
            note: hospitalApprovals?.oldest_at ? `Oldest submission: ${formatRelativeDate(hospitalApprovals.oldest_at)}` : 'No pending hospital approvals',
          },
          {
            key: 'profile_changes',
            icon: 'RefreshCw',
            label: 'Profile Changes Pending',
            count: Number(profileChanges?.count || 0),
            urgency: Number(profileChanges?.count || 0) > 0 ? 'medium' : 'low',
            href: '/dashboard/super-admin/verification/profile-changes',
            note: profileChanges?.oldest_at ? `Oldest request: ${formatRelativeDate(profileChanges.oldest_at)}` : 'No pending profile changes',
          },
          {
            key: 'expiring_docs',
            icon: 'FileWarning',
            label: 'Documents Expiring in 7 Days',
            count: Number(expiringDocs?.count || 0),
            urgency: Number(expiringDocs?.count || 0) > 0 ? 'high' : 'low',
            href: '/dashboard/super-admin/verification/expiring-docs',
            note: expiringDocs?.nearest_expiry ? `Nearest expiry: ${new Date(expiringDocs.nearest_expiry).toLocaleDateString('en-IN')}` : 'No documents expiring soon',
          },
        ],
      },
      {
        title: 'Operations',
        color: 'border-indigo-500/25',
        items: [
          {
            key: 'unassigned_leads',
            icon: 'ClipboardList',
            label: 'Unassigned Consultation Leads',
            count: Number(unassignedLeads?.count || 0),
            urgency: Number(unassignedLeads?.count || 0) > 0 ? 'high' : 'low',
            href: '/dashboard/super-admin/leads',
            note: unassignedLeads?.oldest_at ? `Oldest lead: ${formatRelativeDate(unassignedLeads.oldest_at)}` : 'All leads are assigned',
          },
          {
            key: 'pending_appointments',
            icon: 'Calendar',
            label: 'Appointments Awaiting Confirm',
            count: Number(pendingAppointments?.count || 0),
            urgency: Number(pendingAppointments?.count || 0) > 0 ? 'medium' : 'low',
            href: '/dashboard/super-admin/appointments',
            note: pendingAppointments?.oldest_at ? `Oldest pending date: ${new Date(pendingAppointments.oldest_at).toLocaleDateString('en-IN')}` : 'No pending appointment confirmations',
          },
          {
            key: 'overdue_follow_ups',
            icon: 'Flag',
            label: 'Follow-ups Overdue',
            count: Number(overdueFollowUps?.count || 0),
            urgency: Number(overdueFollowUps?.count || 0) > 0 ? 'medium' : 'low',
            href: '/dashboard/super-admin/follow-ups',
            note: overdueFollowUps?.oldest_at ? `Oldest follow-up due: ${formatRelativeDate(overdueFollowUps.oldest_at)}` : 'No overdue follow-ups',
          },
        ],
      },
      {
        title: 'Revenue & Payments',
        color: 'border-red-500/25',
        items: [
          {
            key: 'failed_payments',
            icon: 'CreditCard',
            label: 'Failed Payments',
            count: Number(failedPayments?.count || 0),
            urgency: Number(failedPayments?.count || 0) > 0 ? 'high' : 'low',
            href: '/dashboard/super-admin/payments',
            note: failedPayments?.oldest_at ? `Oldest failed payment: ${formatRelativeDate(failedPayments.oldest_at)}` : 'No failed payments right now',
          },
          {
            key: 'expiring_subscriptions',
            icon: 'AlertCircle',
            label: 'Subscriptions Ending Soon',
            count: Number(expiringSubscriptions?.count || 0),
            urgency: Number(expiringSubscriptions?.count || 0) > 0 ? 'medium' : 'low',
            href: '/dashboard/super-admin/subscriptions',
            note: expiringSubscriptions?.oldest_at ? `Nearest expiry: ${new Date(expiringSubscriptions.oldest_at).toLocaleDateString('en-IN')}` : 'No subscriptions ending in the next 3 days',
          },
        ],
      },
      {
        title: 'Support',
        color: 'border-rose-500/25',
        items: [
          {
            key: 'open_complaints',
            icon: 'Ticket',
            label: 'Open Complaints',
            count: Number(openComplaints?.count || 0),
            urgency: Number(openComplaints?.count || 0) > 0 ? 'high' : 'low',
            href: '/dashboard/super-admin/support/complaints',
            note: openComplaints?.oldest_at ? `Oldest complaint: ${formatRelativeDate(openComplaints.oldest_at)}` : 'No open complaints',
          },
        ],
      },
    ];

    res.json({ success: true, sections, activities: recentActivities });
  } catch (error) {
    next(error);
  }
});

router.get('/activities', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }

    const category = typeof req.query.category === 'string' ? req.query.category : null;
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 60;
    const activities = await fetchRecentActivities(limit, category);

    res.json({ success: true, activities });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
