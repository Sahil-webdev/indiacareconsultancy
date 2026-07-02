const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchOne, fetchRows } = require('../services/mysqlUtils');
const { formatDoctor } = require('../services/entityFormatters');
const { createUserAccount } = require('../services/accountProvisioning');

const router = express.Router();

const baseDoctorSelect = `
  SELECT
    d.*,
    COALESCE((SELECT JSON_ARRAYAGG(day) FROM doctor_availability WHERE doctor_id = d.id), JSON_ARRAY()) AS availability,
    COALESCE((SELECT JSON_ARRAYAGG(language) FROM doctor_languages WHERE doctor_id = d.id), JSON_ARRAY()) AS languages,
    COALESCE((SELECT JSON_ARRAYAGG(service) FROM doctor_services WHERE doctor_id = d.id), JSON_ARRAY()) AS services,
    COALESCE((SELECT JSON_ARRAYAGG(award) FROM doctor_awards WHERE doctor_id = d.id), JSON_ARRAY()) AS awards,
    (SELECT COUNT(*) FROM profile_change_requests WHERE entity_type = 'doctor' AND entity_id = d.id AND status = 'Pending') AS pending_change_requests
  FROM doctors d
`;

async function getDoctorById(id) {
  const row = await fetchOne(
    `${baseDoctorSelect}
     WHERE d.id = ?`,
    [id]
  );
  return row ? formatDoctor(row) : null;
}

router.get('/', async (req, res, next) => {
  try {
    const { speciality, location, gender, consultationType, search, status, approval } = req.query;
    const conditions = [];
    const params = [];

    if (!approval && !status) {
      conditions.push('d.is_approved = 1');
    }
    if (approval === 'approved') conditions.push('d.is_approved = 1');
    if (approval === 'pending') conditions.push('d.is_approved = 0');
    if (speciality) {
      conditions.push('d.speciality LIKE ?');
      params.push(`%${speciality}%`);
    }
    if (location) {
      conditions.push('d.city LIKE ?');
      params.push(`%${location}%`);
    }
    if (gender) {
      conditions.push('d.gender = ?');
      params.push(gender);
    }
    if (consultationType) {
      conditions.push('d.consultation_type = ?');
      params.push(consultationType);
    }
    if (status === 'subscribed') conditions.push('d.is_subscribed = 1');
    if (search) {
      conditions.push('(d.name LIKE ? OR d.speciality LIKE ? OR d.hospital_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const rows = await fetchRows(
      `${baseDoctorSelect}
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY d.is_approved DESC, d.rating DESC, d.created_at DESC`,
      params
    );

    const doctors = rows.map(formatDoctor);
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    next(error);
  }
});

router.get('/me/profile', protect, async (req, res, next) => {
  try {
    const doctor = await fetchOne('SELECT id FROM doctors WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    const payload = await getDoctorById(doctor.id);
    res.json({ success: true, doctor: payload });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const doctor = await getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    if (!['super_admin', 'consultant'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only admin or consultant can create doctor accounts' });
    }
    const pool = getPool();
    const body = req.body;
    const connection = await pool.getConnection();
    let doctorId;
    try {
      await connection.beginTransaction();
      const userId = await createUserAccount(connection, {
        name: body.name,
        email: body.email,
        password: body.password,
        role: 'doctor',
      });

      const [result] = await connection.execute(
        `INSERT INTO doctors
          (user_id, name, email, phone, gender, photo, registration_no, qualification, speciality, experience_years, hospital_name, clinic_address, city, area, consultation_fee, consultation_type, opd_timings, bio, rating, is_approved, is_subscribed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          body.isApproved ? 1 : 0,
          body.isSubscribed ? 1 : 0,
        ]
      );

      doctorId = result.insertId;
      for (const day of body.availability || []) {
        await connection.execute('INSERT INTO doctor_availability (doctor_id, day) VALUES (?, ?)', [doctorId, day]);
      }
      for (const language of body.languages || []) {
        await connection.execute('INSERT INTO doctor_languages (doctor_id, language) VALUES (?, ?)', [doctorId, language]);
      }
      for (const service of body.services || []) {
        await connection.execute('INSERT INTO doctor_services (doctor_id, service) VALUES (?, ?)', [doctorId, service]);
      }
      for (const award of body.awards || []) {
        await connection.execute('INSERT INTO doctor_awards (doctor_id, award) VALUES (?, ?)', [doctorId, award]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const doctor = await getDoctorById(doctorId);
    res.status(201).json({ success: true, doctor });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const pool = getPool();
    const doctor = await getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const isAdmin = ['super_admin', 'consultant'].includes(req.user.role);
    const updates = req.body;

    if (!isAdmin) {
      const editableFields = ['name', 'phone', 'qualification', 'speciality', 'experience', 'clinicAddress', 'location', 'area', 'consultationFee', 'consultationType', 'bio', 'opdTimings'];
      for (const field of editableFields) {
        if (updates[field] !== undefined && String(updates[field]) !== String(doctor[field] ?? '')) {
          await pool.execute(
            `INSERT INTO profile_change_requests (entity_type, entity_id, field_name, old_value, new_value, status)
             VALUES ('doctor', ?, ?, ?, ?, 'Pending')`,
            [req.params.id, field, doctor[field] ?? null, String(updates[field])]
          );
        }
      }
      return res.json({ success: true, message: 'Profile update submitted for review' });
    }

    await pool.execute(
      `UPDATE doctors
       SET name = ?, phone = ?, qualification = ?, speciality = ?, experience_years = ?, clinic_address = ?, city = ?, area = ?, consultation_fee = ?, consultation_type = ?, bio = ?, opd_timings = ?, rating = ?, is_approved = ?, is_subscribed = ?, subscription_paid_at = ?, subscription_ends_at = ?, hospital_name = ?
       WHERE id = ?`,
      [
        updates.name ?? doctor.name,
        updates.phone ?? doctor.phone,
        updates.qualification ?? doctor.qualification,
        updates.speciality ?? doctor.speciality,
        updates.experience ?? doctor.experience,
        updates.clinicAddress ?? doctor.clinicAddress,
        updates.location ?? doctor.location,
        updates.area ?? doctor.area,
        updates.consultationFee ?? doctor.consultationFee,
        updates.consultationType ?? doctor.consultationType,
        updates.bio ?? doctor.bio,
        updates.opdTimings ?? doctor.opdTimings,
        updates.rating ?? doctor.rating,
        updates.isApproved === undefined ? (doctor.isApproved ? 1 : 0) : (updates.isApproved ? 1 : 0),
        updates.isSubscribed === undefined ? (doctor.isSubscribed ? 1 : 0) : (updates.isSubscribed ? 1 : 0),
        updates.subscriptionPaidAt ?? doctor.subscriptionPaidAt ?? null,
        updates.subscriptionEndsAt ?? doctor.subscriptionEndsAt ?? null,
        updates.hospitalName ?? doctor.hospitalName ?? null,
        req.params.id,
      ]
    );

    if (Array.isArray(updates.availability)) {
      await pool.execute('DELETE FROM doctor_availability WHERE doctor_id = ?', [req.params.id]);
      for (const day of updates.availability) {
        await pool.execute('INSERT INTO doctor_availability (doctor_id, day) VALUES (?, ?)', [req.params.id, day]);
      }
    }
    if (Array.isArray(updates.languages)) {
      await pool.execute('DELETE FROM doctor_languages WHERE doctor_id = ?', [req.params.id]);
      for (const value of updates.languages) {
        await pool.execute('INSERT INTO doctor_languages (doctor_id, language) VALUES (?, ?)', [req.params.id, value]);
      }
    }
    if (Array.isArray(updates.services)) {
      await pool.execute('DELETE FROM doctor_services WHERE doctor_id = ?', [req.params.id]);
      for (const value of updates.services) {
        await pool.execute('INSERT INTO doctor_services (doctor_id, service) VALUES (?, ?)', [req.params.id, value]);
      }
    }
    if (Array.isArray(updates.awards)) {
      await pool.execute('DELETE FROM doctor_awards WHERE doctor_id = ?', [req.params.id]);
      for (const value of updates.awards) {
        await pool.execute('INSERT INTO doctor_awards (doctor_id, award) VALUES (?, ?)', [req.params.id, value]);
      }
    }

    if (updates.approvePendingChanges) {
      await pool.execute(
        `UPDATE profile_change_requests
         SET status = 'Approved', reviewed_by = ?, reviewed_at = NOW()
         WHERE entity_type = 'doctor' AND entity_id = ? AND status = 'Pending'`,
        [req.user.id, req.params.id]
      );
    }

    const updatedDoctor = await getDoctorById(req.params.id);
    res.json({ success: true, doctor: updatedDoctor });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
