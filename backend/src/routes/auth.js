const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');
const { fetchOne } = require('../services/mysqlUtils');

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

module.exports = router;
