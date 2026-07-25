const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchOne, fetchRows } = require('../services/mysqlUtils');
const { createUserAccount } = require('../services/accountProvisioning');
const { createNotification } = require('../services/notifications');

const router = express.Router();

function formatEmployee(row) {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    city: row.city || '',
    role: row.role_label,
    department: row.department || '',
    active: row.status === 'Active',
    status: row.status,
    lastLogin: row.last_login_at,
    leadsAssigned: Number(row.leads_assigned || 0),
    joinedAt: row.joined_at || row.created_at,
    createdAt: row.created_at,
  };
}

function mapEmployeeRoleToUserRole(roleLabel) {
  return roleLabel.includes('Consultant') ? 'consultant' : 'consultant';
}

router.get('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }

    const employees = await fetchRows(
      `SELECT
         e.*,
         u.is_active
       FROM employees e
       INNER JOIN users u ON u.id = e.user_id
       ORDER BY e.created_at DESC`
    );

    res.json({ success: true, employees: employees.map(formatEmployee) });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }

    const pool = getPool();
    const connection = await pool.getConnection();
    let employeeId;

    try {
      await connection.beginTransaction();
      const userId = await createUserAccount(connection, {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password || 'Welcome@123',
        role: mapEmployeeRoleToUserRole(req.body.role || 'Consultant'),
      });

      const [result] = await connection.execute(
        `INSERT INTO employees
          (user_id, name, email, role_label, department, phone, city, status, joined_at, last_login_at, leads_assigned)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Invited', NOW(), NULL, 0)`,
        [
          userId,
          req.body.name,
          req.body.email,
          req.body.role || 'Consultant',
          req.body.department || 'Operations',
          req.body.phone || null,
          req.body.city || null,
        ]
      );
      employeeId = result.insertId;
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const employee = await fetchOne('SELECT * FROM employees WHERE id = ?', [employeeId]);
    res.locals.activityLog = {
      action: 'Employee invited',
      entityType: 'employee',
      entityId: employeeId,
      category: 'Users & Team',
      dashboardHref: '/dashboard/super-admin/employees',
      description: `${req.body.name} was added to the ICC team`,
    };
    res.status(201).json({ success: true, employee: formatEmployee(employee) });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }

    const pool = getPool();
    const current = await fetchOne('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const nextStatus = req.body.status || current.status;
    await pool.execute(
      `UPDATE employees
       SET name = ?, email = ?, role_label = ?, department = ?, phone = ?, city = ?, status = ?, leads_assigned = ?
       WHERE id = ?`,
      [
        req.body.name ?? current.name,
        req.body.email ?? current.email,
        req.body.role ?? current.role_label,
        req.body.department ?? current.department,
        req.body.phone ?? current.phone,
        req.body.city ?? current.city,
        nextStatus,
        req.body.leadsAssigned ?? current.leads_assigned,
        req.params.id,
      ]
    );

    if (nextStatus === 'Inactive' || nextStatus === 'Active') {
      await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [nextStatus === 'Active' ? 1 : 0, current.user_id]);
    }

    const row = await fetchOne('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    res.locals.activityLog = {
      action: 'Employee updated',
      entityType: 'employee',
      entityId: req.params.id,
      category: 'Users & Team',
      dashboardHref: '/dashboard/super-admin/employees',
      description: `${row.name} employee record updated`,
    };
    res.json({ success: true, employee: formatEmployee(row) });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/actions', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }

    const employee = await fetchOne('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const action = String(req.body.action || '');
    let message = 'Employee action completed';

    if (action === 'resend_invite') {
      await createNotification({
        title: 'ICC team invitation reminder',
        message: `Your ICC employee access is ready. Please use your assigned credentials to sign in.`,
        sentBy: req.user.id,
        recipientUserId: employee.user_id,
        recipientRole: 'consultant',
        category: 'team',
        entityType: 'employee',
        entityId: Number(req.params.id),
        actionUrl: '/dashboard',
        target: 'All',
      });
      message = 'Invite reminder sent successfully';
    } else if (action === 'activate') {
      await getPool().execute('UPDATE employees SET status = ? WHERE id = ?', ['Active', req.params.id]);
      await getPool().execute('UPDATE users SET is_active = 1 WHERE id = ?', [employee.user_id]);
      message = 'Employee activated successfully';
    } else if (action === 'deactivate') {
      await getPool().execute('UPDATE employees SET status = ? WHERE id = ?', ['Inactive', req.params.id]);
      await getPool().execute('UPDATE users SET is_active = 0 WHERE id = ?', [employee.user_id]);
      message = 'Employee deactivated successfully';
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported employee action' });
    }

    res.locals.activityLog = {
      action: 'Employee action executed',
      entityType: 'employee',
      entityId: req.params.id,
      category: 'Users & Team',
      dashboardHref: '/dashboard/super-admin/employees',
      description: `${employee.name}: ${message}`,
    };
    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }
    const employee = await fetchOne('SELECT user_id, name FROM employees WHERE id = ?', [req.params.id]);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    await getPool().execute('DELETE FROM users WHERE id = ?', [employee.user_id]);
    res.locals.activityLog = {
      action: 'Employee deleted',
      entityType: 'employee',
      entityId: req.params.id,
      category: 'Users & Team',
      dashboardHref: '/dashboard/super-admin/employees',
      description: `${employee.name} employee account deleted`,
    };
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
