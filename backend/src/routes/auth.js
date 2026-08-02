const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');
const { fetchOne } = require('../services/mysqlUtils');
const { buildDevice, buildIpAddress, recordAuditLog } = require('../services/auditLogger');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await fetchOne(
      `SELECT id, name, email, password_hash, role, is_active
       FROM users
       WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user);
    await recordAuditLog({
      userId: user.id,
      action: 'Panel login',
      entityType: 'auth',
      entityId: user.id,
      ipAddress: buildIpAddress(req),
      details: {
        role: user.role,
        category: 'Security',
        dashboardHref: user.role === 'super_admin'
          ? '/dashboard/super-admin'
          : user.role === 'consultant'
            ? '/dashboard/consultant'
            : user.role === 'doctor'
              ? '/dashboard/doctor'
              : '/dashboard/hospital',
        description: `${user.name} logged into the panel`,
        device: buildDevice(req),
      },
    });

    res.json({
      success: true,
      token,
      user: { id: String(user.id), name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await fetchOne(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'doctor') {
      profile = await fetchOne('SELECT id, is_subscribed, is_approved FROM doctors WHERE user_id = ? LIMIT 1', [user.id]);
    } else if (user.role === 'hospital') {
      profile = await fetchOne('SELECT id, is_subscribed, is_approved FROM hospitals WHERE user_id = ? LIMIT 1', [user.id]);
    }

    res.json({
      success: true,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: Boolean(Number(user.is_active)),
        createdAt: user.created_at,
        profile: profile
          ? {
              entityId: String(profile.id),
              isSubscribed: Boolean(Number(profile.is_subscribed)),
              isApproved: Boolean(Number(profile.is_approved)),
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register-doctor
router.post('/register-doctor', async (req, res, next) => {
  const { getPool } = require('../config/mysql');
  const { createUserAccount } = require('../services/accountProvisioning');
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const body = req.body;

    // Create user account
    const userId = await createUserAccount(connection, {
      name: body.name,
      email: body.email,
      password: body.password,
      role: 'doctor',
    });

    // Insert into doctors table (is_approved = 0, is_subscribed = 0)
    const [docRes] = await connection.execute(
      `INSERT INTO doctors
        (user_id, name, email, phone, gender, photo, registration_no, qualification, speciality, experience_years, hospital_name, clinic_address, city, area, consultation_fee, consultation_type, opd_timings, bio, rating, is_approved, is_subscribed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [
        userId,
        body.name,
        body.email,
        body.phone,
        body.gender,
        body.photo || '/doctors/default-doctor.jpg',
        body.medicalRegistrationNumber,
        body.qualification,
        body.speciality,
        body.experience || 0,
        body.hospitalName || null,
        body.clinicAddress,
        body.location,
        body.area || '',
        body.consultationFee || 0,
        body.consultationType || 'Both',
        body.opdTimings || null,
        body.bio || '',
        body.rating || 4.5,
      ]
    );

    const doctorId = docRes.insertId;

    if (body.utrNumber) {
      await connection.execute(
        `INSERT INTO payments
          (user_id, payment_type, entity_type, entity_id, amount, status, payment_method, transaction_ref, screenshot_url, created_at)
         VALUES (?, 'subscription', 'doctor', ?, ?, 'Pending', 'UPI', ?, ?, NOW())`,
        [userId, doctorId, body.subscriptionFee || 999, body.utrNumber.trim(), body.screenshotUrl || null]
      );
    }

    await connection.commit();

    const { createSuperAdminNotification } = require('../services/notifications');
    await createSuperAdminNotification({
      title: 'New Doctor Partner Registration & Subscription',
      message: `${body.name} registered as Doctor partner and submitted UTR: ${body.utrNumber || 'N/A'}.`,
      category: 'subscription',
      entityType: 'doctor',
      entityId: doctorId,
      actionUrl: '/dashboard/super-admin/verification/subscription-approvals',
      metadata: { doctorName: body.name, utrNumber: body.utrNumber },
    });

    res.status(201).json({ success: true, message: 'Doctor registered successfully. Payment & Registration sent for approval.' });
  } catch (error) {
    await connection.rollback();
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  } finally {
    connection.release();
  }
});

// POST /api/auth/register-hospital
router.post('/register-hospital', async (req, res, next) => {
  const { getPool } = require('../config/mysql');
  const { createUserAccount } = require('../services/accountProvisioning');
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const body = req.body;

    // Create user account
    const userId = await createUserAccount(connection, {
      name: body.name,
      email: body.email,
      password: body.password,
      role: 'hospital',
    });

    // Insert into hospitals table (is_approved = 0, is_subscribed = 0)
    const [hospRes] = await connection.execute(
      `INSERT INTO hospitals
        (user_id, name, email, phone, emergency_contact, website, image, registration_no, hospital_type, total_beds, address, city, opd_timings, about, rating, is_approved, is_subscribed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [
        userId,
        body.name,
        body.email,
        body.phone,
        body.emergencyContact || null,
        body.website || null,
        body.image || '/hospitals/default-hospital.jpg',
        body.registrationNo,
        body.hospitalType || 'Multispeciality',
        body.totalBeds || 0,
        body.address,
        body.city,
        body.opdTimings || '9:00 AM - 6:00 PM',
        body.about || '',
        body.rating || 4.5,
      ]
    );

    const hospitalId = hospRes.insertId;

    if (body.utrNumber) {
      await connection.execute(
        `INSERT INTO payments
          (user_id, payment_type, entity_type, entity_id, amount, status, payment_method, transaction_ref, screenshot_url, created_at)
         VALUES (?, 'subscription', 'hospital', ?, ?, 'Pending', 'UPI', ?, ?, NOW())`,
        [userId, hospitalId, body.subscriptionFee || 1999, body.utrNumber.trim(), body.screenshotUrl || null]
      );
    }

    await connection.commit();

    const { createSuperAdminNotification } = require('../services/notifications');
    await createSuperAdminNotification({
      title: 'New Hospital Partner Registration & Subscription',
      message: `${body.name} registered as Hospital partner and submitted UTR: ${body.utrNumber || 'N/A'}.`,
      category: 'subscription',
      entityType: 'hospital',
      entityId: hospitalId,
      actionUrl: '/dashboard/super-admin/verification/subscription-approvals',
      metadata: { hospitalName: body.name, utrNumber: body.utrNumber },
    });

    res.status(201).json({ success: true, message: 'Hospital registered successfully. Payment & Registration sent for approval.' });
  } catch (error) {
    await connection.rollback();
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  } finally {
    connection.release();
  }
});

module.exports = router;
