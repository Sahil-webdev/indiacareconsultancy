const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchOne, fetchRows } = require('../services/mysqlUtils');

const router = express.Router();

async function getEntityForUser(user) {
  if (user.role === 'doctor') {
    return fetchOne(
      `SELECT d.id, d.name, d.speciality, d.photo, d.experience_years, d.city, d.consultation_fee, d.rating
       FROM doctors d
       WHERE d.user_id = ?
       LIMIT 1`,
      [user.id]
    );
  }

  if (user.role === 'hospital') {
    return fetchOne(
      `SELECT h.id, h.name, h.image, h.hospital_type, h.city, h.address, h.rating, h.total_beds
       FROM hospitals h
       WHERE h.user_id = ?
       LIMIT 1`,
      [user.id]
    );
  }

  return null;
}

async function fetchActiveSpotlightForEntity(entityType, entityId) {
  return fetchOne(
    `SELECT s.*, p.status AS payment_status
     FROM spotlights s
     LEFT JOIN payments p ON p.id = s.payment_id
     WHERE s.entity_type = ? AND s.entity_id = ? AND s.is_active = 1 AND s.ends_at >= NOW()
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [entityType, entityId]
  );
}

router.get('/', async (req, res, next) => {
  try {
    const rows = await fetchRows(
      `SELECT
         s.id AS spotlight_id,
         s.entity_type,
         s.entity_id,
         s.tagline,
         s.starts_at,
         s.ends_at,
         s.created_at,
         d.name AS doctor_name,
         d.photo AS doctor_photo,
         d.speciality AS doctor_speciality,
         d.experience_years AS doctor_experience,
         d.city AS doctor_city,
         d.consultation_fee AS doctor_fee,
         d.rating AS doctor_rating,
         h.name AS hospital_name,
         h.image AS hospital_image,
         h.city AS hospital_city,
         h.address AS hospital_address,
         h.rating AS hospital_rating,
         h.hospital_type AS hospital_type
       FROM spotlights s
       LEFT JOIN doctors d ON s.entity_type = 'doctor' AND d.id = s.entity_id
       LEFT JOIN hospitals h ON s.entity_type = 'hospital' AND h.id = s.entity_id
       WHERE s.is_active = 1 AND s.ends_at >= NOW()
       ORDER BY s.starts_at DESC, s.id DESC`
    );

    const items = rows
      .map((row) => {
        if (row.entity_type === 'doctor' && row.doctor_name) {
          return {
            id: String(row.entity_id),
            spotlightId: String(row.spotlight_id),
            type: 'doctor',
            name: row.doctor_name,
            photo: row.doctor_photo,
            speciality: row.doctor_speciality,
            rating: Number(row.doctor_rating || 0),
            experience: Number(row.doctor_experience || 0),
            city: row.doctor_city,
            consultationFee: Number(row.doctor_fee || 0),
            tagline: row.tagline,
            promotedAt: row.created_at,
            startsAt: row.starts_at,
            endsAt: row.ends_at,
          };
        }

        if (row.entity_type === 'hospital' && row.hospital_name) {
          return {
            id: String(row.entity_id),
            spotlightId: String(row.spotlight_id),
            type: 'hospital',
            name: row.hospital_name,
            image: row.hospital_image,
            rating: Number(row.hospital_rating || 0),
            city: row.hospital_city,
            address: row.hospital_address,
            hospitalType: row.hospital_type,
            tagline: row.tagline,
            promotedAt: row.created_at,
            startsAt: row.starts_at,
            endsAt: row.ends_at,
          };
        }

        return null;
      })
      .filter(Boolean);

    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

router.get('/current', protect, async (req, res, next) => {
  try {
    if (!['doctor', 'hospital'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only doctors or hospitals can access spotlight status' });
    }

    const entity = await getEntityForUser(req.user);
    if (!entity) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const fee = await fetchOne(
      'SELECT amount, duration_days FROM spotlight_fees WHERE entity_type = ? LIMIT 1',
      [req.user.role]
    );
    const activeSpotlight = await fetchActiveSpotlightForEntity(req.user.role, entity.id);

    res.json({
      success: true,
      fee: {
        amount: Number(fee?.amount || 0),
        durationDays: Number(fee?.duration_days || 30),
      },
      spotlight: activeSpotlight
        ? {
            id: String(activeSpotlight.id),
            tagline: activeSpotlight.tagline,
            startsAt: activeSpotlight.starts_at,
            endsAt: activeSpotlight.ends_at,
            isActive: Boolean(Number(activeSpotlight.is_active)),
            paymentStatus: activeSpotlight.payment_status || 'Paid',
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, async (req, res, next) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    if (!['doctor', 'hospital'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only doctors or hospitals can manage spotlight promotions' });
    }

    const entity = await getEntityForUser(req.user);
    if (!entity) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const action = req.body.action;
    const entityType = req.user.role;
    const entityId = entity.id;

    if (action === 'cancel') {
      await connection.execute(
        `UPDATE spotlights
         SET is_active = 0, ends_at = NOW()
         WHERE entity_type = ? AND entity_id = ? AND is_active = 1`,
        [entityType, entityId]
      );

      return res.json({ success: true, message: 'Spotlight removed successfully' });
    }

    if (action !== 'promote') {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const tagline = String(req.body.tagline || '').trim();
    if (!tagline) {
      return res.status(400).json({ success: false, message: 'Tagline is required' });
    }

    await connection.beginTransaction();

    const fee = await fetchOne(
      'SELECT amount, duration_days FROM spotlight_fees WHERE entity_type = ? LIMIT 1',
      [entityType]
    );

    const amount = Number(fee?.amount || 0);
    const durationDays = Number(fee?.duration_days || 30);

    await connection.execute(
      `UPDATE spotlights
       SET is_active = 0
       WHERE entity_type = ? AND entity_id = ? AND is_active = 1`,
      [entityType, entityId]
    );

    const [paymentResult] = await connection.execute(
      `INSERT INTO payments
        (user_id, payment_type, entity_type, entity_id, amount, currency, status, payment_method, transaction_ref, paid_at)
       VALUES (?, 'spotlight', ?, ?, ?, 'INR', 'Paid', ?, ?, NOW())`,
      [
        req.user.id,
        entityType,
        entityId,
        amount,
        req.body.paymentMethod || 'UPI',
        req.body.transactionRef || `SPOT-${entityType.toUpperCase()}-${entityId}-${Date.now()}`,
      ]
    );

    const [spotlightResult] = await connection.execute(
      `INSERT INTO spotlights
        (entity_type, entity_id, tagline, payment_id, fee_charged, starts_at, ends_at, is_active)
       VALUES (?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 1)`,
      [entityType, entityId, tagline, paymentResult.insertId, amount, durationDays]
    );

    await connection.commit();

    const spotlight = await fetchOne(
      'SELECT * FROM spotlights WHERE id = ? LIMIT 1',
      [spotlightResult.insertId]
    );

    res.json({
      success: true,
      message: 'Spotlight activated successfully',
      spotlight: {
        id: String(spotlight.id),
        tagline: spotlight.tagline,
        startsAt: spotlight.starts_at,
        endsAt: spotlight.ends_at,
        isActive: Boolean(Number(spotlight.is_active)),
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

module.exports = router;
