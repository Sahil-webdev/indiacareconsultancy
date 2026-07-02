const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchOne, fetchRows } = require('../services/mysqlUtils');
const { formatHospital } = require('../services/entityFormatters');
const { createUserAccount } = require('../services/accountProvisioning');

const router = express.Router();

const baseHospitalSelect = `
  SELECT
    h.*,
    COALESCE((SELECT JSON_ARRAYAGG(department) FROM hospital_departments WHERE hospital_id = h.id), JSON_ARRAY()) AS departments,
    COALESCE((SELECT JSON_ARRAYAGG(facility) FROM hospital_facilities WHERE hospital_id = h.id), JSON_ARRAY()) AS facilities,
    COALESCE((SELECT JSON_ARRAYAGG(accreditation) FROM hospital_accreditations WHERE hospital_id = h.id), JSON_ARRAY()) AS accreditations,
    (SELECT COUNT(*) FROM hospital_doctors WHERE hospital_id = h.id) AS doctor_count,
    (SELECT COUNT(*) FROM profile_change_requests WHERE entity_type = 'hospital' AND entity_id = h.id AND status = 'Pending') AS pending_change_requests
  FROM hospitals h
`;

async function getHospitalById(id) {
  const row = await fetchOne(
    `${baseHospitalSelect}
     WHERE h.id = ?`,
    [id]
  );
  return row ? formatHospital(row) : null;
}

router.get('/', async (req, res, next) => {
  try {
    const { location, department, search, approval, status } = req.query;
    const conditions = [];
    const params = [];

    if (!approval && !status) {
      conditions.push('h.is_approved = 1');
    }
    if (approval === 'approved') conditions.push('h.is_approved = 1');
    if (approval === 'pending') conditions.push('h.is_approved = 0');
    if (location) {
      conditions.push('h.city LIKE ?');
      params.push(`%${location}%`);
    }
    if (department) {
      conditions.push(`EXISTS (
        SELECT 1 FROM hospital_departments hd
        WHERE hd.hospital_id = h.id AND hd.department LIKE ?
      )`);
      params.push(`%${department}%`);
    }
    if (search) {
      conditions.push('(h.name LIKE ? OR h.city LIKE ? OR h.hospital_type LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status === 'subscribed') conditions.push('h.is_subscribed = 1');

    const rows = await fetchRows(
      `${baseHospitalSelect}
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY h.is_approved DESC, h.rating DESC, h.created_at DESC`,
      params
    );

    const hospitals = rows.map(formatHospital);
    res.json({ success: true, count: hospitals.length, hospitals });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    if (!['super_admin', 'consultant'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only admin or consultant can create hospital accounts' });
    }
    const pool = getPool();
    const body = req.body;
    const connection = await pool.getConnection();
    let hospitalId;

    try {
      await connection.beginTransaction();
      const userId = await createUserAccount(connection, {
        name: body.name,
        email: body.email,
        password: body.password,
        role: 'hospital',
      });

      const [result] = await connection.execute(
        `INSERT INTO hospitals
          (user_id, name, email, phone, emergency_contact, website, image, registration_no, hospital_type, total_beds, address, city, opd_timings, about, rating, is_approved, is_subscribed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          body.name,
          body.email,
          body.phone,
          body.emergencyContact || null,
          body.website || null,
          body.image || '/hospitals/default-hospital.jpg',
          body.registrationDetails,
          body.hospitalType || 'Multispeciality',
          body.totalBeds || 0,
          body.address,
          body.location,
          body.opdTimings || '9:00 AM - 6:00 PM',
          body.about || '',
          body.rating || 4.5,
          body.isApproved ? 1 : 0,
          body.isSubscribed ? 1 : 0,
        ]
      );

      hospitalId = result.insertId;
      for (const value of body.departments || []) {
        await connection.execute('INSERT INTO hospital_departments (hospital_id, department) VALUES (?, ?)', [hospitalId, value]);
      }
      for (const value of body.facilities || []) {
        await connection.execute('INSERT INTO hospital_facilities (hospital_id, facility) VALUES (?, ?)', [hospitalId, value]);
      }
      for (const value of body.accreditations || []) {
        await connection.execute('INSERT INTO hospital_accreditations (hospital_id, accreditation) VALUES (?, ?)', [hospitalId, value]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const hospital = await getHospitalById(hospitalId);
    res.status(201).json({ success: true, hospital });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
});

router.get('/me/profile', protect, async (req, res, next) => {
  try {
    const hospital = await fetchOne('SELECT id FROM hospitals WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }
    const payload = await getHospitalById(hospital.id);
    res.json({ success: true, hospital: payload });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const hospital = await getHospitalById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    res.json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    const hospital = await getHospitalById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const isAdmin = ['super_admin', 'consultant'].includes(req.user.role);
    const updates = req.body;

    if (!isAdmin) {
      const editableFields = ['name', 'phone', 'emergencyContact', 'website', 'registrationDetails', 'address', 'location', 'opdTimings', 'about', 'totalBeds', 'hospitalType'];
      for (const field of editableFields) {
        if (updates[field] !== undefined && String(updates[field]) !== String(hospital[field] ?? '')) {
          await pool.execute(
            `INSERT INTO profile_change_requests (entity_type, entity_id, field_name, old_value, new_value, status)
             VALUES ('hospital', ?, ?, ?, ?, 'Pending')`,
            [req.params.id, field, hospital[field] ?? null, String(updates[field])]
          );
        }
      }
      return res.json({ success: true, message: 'Profile update submitted for review' });
    }

    await pool.execute(
      `UPDATE hospitals
       SET name = ?, phone = ?, emergency_contact = ?, website = ?, registration_no = ?, hospital_type = ?, total_beds = ?, address = ?, city = ?, opd_timings = ?, about = ?, rating = ?, is_approved = ?, is_subscribed = ?, subscription_paid_at = ?, subscription_ends_at = ?
       WHERE id = ?`,
      [
        updates.name ?? hospital.name,
        updates.phone ?? hospital.phone,
        updates.emergencyContact ?? hospital.emergencyContact,
        updates.website ?? hospital.website ?? null,
        updates.registrationDetails ?? hospital.registrationDetails,
        updates.hospitalType ?? hospital.hospitalType,
        updates.totalBeds ?? hospital.totalBeds,
        updates.address ?? hospital.address,
        updates.location ?? hospital.location,
        updates.opdTimings ?? hospital.opdTimings,
        updates.about ?? hospital.about,
        updates.rating ?? hospital.rating,
        updates.isApproved === undefined ? (hospital.isApproved ? 1 : 0) : (updates.isApproved ? 1 : 0),
        updates.isSubscribed === undefined ? (hospital.isSubscribed ? 1 : 0) : (updates.isSubscribed ? 1 : 0),
        updates.subscriptionPaidAt ?? hospital.subscriptionPaidAt ?? null,
        updates.subscriptionEndsAt ?? hospital.subscriptionEndsAt ?? null,
        req.params.id,
      ]
    );

    if (Array.isArray(updates.departments)) {
      await pool.execute('DELETE FROM hospital_departments WHERE hospital_id = ?', [req.params.id]);
      for (const value of updates.departments) {
        await pool.execute('INSERT INTO hospital_departments (hospital_id, department) VALUES (?, ?)', [req.params.id, value]);
      }
    }
    if (Array.isArray(updates.facilities)) {
      await pool.execute('DELETE FROM hospital_facilities WHERE hospital_id = ?', [req.params.id]);
      for (const value of updates.facilities) {
        await pool.execute('INSERT INTO hospital_facilities (hospital_id, facility) VALUES (?, ?)', [req.params.id, value]);
      }
    }
    if (Array.isArray(updates.accreditations)) {
      await pool.execute('DELETE FROM hospital_accreditations WHERE hospital_id = ?', [req.params.id]);
      for (const value of updates.accreditations) {
        await pool.execute('INSERT INTO hospital_accreditations (hospital_id, accreditation) VALUES (?, ?)', [req.params.id, value]);
      }
    }
    if (updates.approvePendingChanges) {
      await pool.execute(
        `UPDATE profile_change_requests
         SET status = 'Approved', reviewed_by = ?, reviewed_at = NOW()
         WHERE entity_type = 'hospital' AND entity_id = ? AND status = 'Pending'`,
        [req.user.id, req.params.id]
      );
    }

    const updatedHospital = await getHospitalById(req.params.id);
    res.json({ success: true, hospital: updatedHospital });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
