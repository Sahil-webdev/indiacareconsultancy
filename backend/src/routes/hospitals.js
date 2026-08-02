const express = require('express');
const { protect } = require('../middleware/auth');
const { getPool } = require('../config/mysql');
const { fetchOne, fetchRows } = require('../services/mysqlUtils');
const { formatHospital } = require('../services/entityFormatters');
const { createUserAccount } = require('../services/accountProvisioning');
const { submitHospitalProfileChanges } = require('../services/profileChangeWorkflow');

const router = express.Router();

const baseHospitalSelect = `
  SELECT
    h.*,
    u.is_active AS account_is_active,
    COALESCE((SELECT JSON_ARRAYAGG(department) FROM hospital_departments WHERE hospital_id = h.id), JSON_ARRAY()) AS departments,
    COALESCE((SELECT JSON_ARRAYAGG(facility) FROM hospital_facilities WHERE hospital_id = h.id), JSON_ARRAY()) AS facilities,
    COALESCE((SELECT JSON_ARRAYAGG(accreditation) FROM hospital_accreditations WHERE hospital_id = h.id), JSON_ARRAY()) AS accreditations,
    (SELECT COUNT(*) FROM hospital_doctors WHERE hospital_id = h.id) AS doctor_count,
    (SELECT COUNT(*) FROM profile_change_requests WHERE entity_type = 'hospital' AND entity_id = h.id AND status = 'Pending') AS pending_change_requests,
    (SELECT p.transaction_ref FROM payments p WHERE p.payment_type = 'subscription' AND p.entity_type = 'hospital' AND p.entity_id = h.id ORDER BY p.created_at DESC, p.id DESC LIMIT 1) AS latest_subscription_utr,
    (SELECT p.status FROM payments p WHERE p.payment_type = 'subscription' AND p.entity_type = 'hospital' AND p.entity_id = h.id ORDER BY p.created_at DESC, p.id DESC LIMIT 1) AS latest_subscription_payment_status,
    (SELECT p.screenshot_url FROM payments p WHERE p.payment_type = 'subscription' AND p.entity_type = 'hospital' AND p.entity_id = h.id ORDER BY p.created_at DESC, p.id DESC LIMIT 1) AS latest_subscription_screenshot_url,
    (SELECT p.created_at FROM payments p WHERE p.payment_type = 'subscription' AND p.entity_type = 'hospital' AND p.entity_id = h.id ORDER BY p.created_at DESC, p.id DESC LIMIT 1) AS latest_subscription_submitted_at
  FROM hospitals h
  INNER JOIN users u ON u.id = h.user_id
`;

async function getHospitalById(id) {
  const row = await fetchOne(
    `${baseHospitalSelect}
     WHERE h.id = ?`,
    [id]
  );
  return row ? formatHospital(row) : null;
}

async function fetchHospitalDoctors(hospitalId, hospitalName) {
  return fetchRows(
    `SELECT d.id, d.user_id, d.name, d.email, d.phone, d.speciality, d.qualification, d.experience_years AS exp,
            d.consultation_fee AS fee, d.rating, d.opd_timings AS shifts, d.photo,
            d.is_approved, d.is_subscribed, d.is_hospital_managed AS isHospitalManaged, d.hospital_name, d.city,
            CASE
              WHEN d.is_approved = 1 AND d.is_subscribed = 1 THEN 'Active'
              WHEN d.is_approved = 0 THEN 'Pending Verification'
              ELSE 'Active'
            END AS status
     FROM doctors d
     WHERE d.id IN (SELECT doctor_id FROM hospital_doctors WHERE hospital_id = ?)
        OR (d.hospital_name IS NOT NULL AND d.hospital_name LIKE ?)
     ORDER BY d.id DESC`,
    [hospitalId, `%${hospitalName}%`]
  );
}

async function fetchHospitalAppointments(userId) {
  return fetchRows(
    `SELECT
       a.*,
       d.name AS doctor_name,
       d.speciality AS doctor_speciality,
       d.consultation_fee AS doctor_fee,
       d.opd_timings AS doctor_opd_timings,
       h.name AS hospital_name
     FROM appointments a
     LEFT JOIN doctors d ON d.id = a.doctor_id
     LEFT JOIN hospitals h ON h.id = a.hospital_id
     WHERE h.user_id = ?
     ORDER BY a.appointment_date DESC, a.time_slot DESC, a.created_at DESC`,
    [userId]
  );
}

function monthKeyForDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
}

function dateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isSameDay(dateValue, compare) {
  const date = new Date(dateValue);
  return (
    date.getFullYear() === compare.getFullYear() &&
    date.getMonth() === compare.getMonth() &&
    date.getDate() === compare.getDate()
  );
}

router.get('/', async (req, res, next) => {
  try {
    const { location, department, search, approval, status } = req.query;
    const conditions = [];
    const params = [];

    if (!approval && !status) {
      // Public client: only show approved + subscribed (paid) hospitals
      conditions.push('h.is_approved = 1');
      conditions.push('h.is_subscribed = 1');
    }
    if (approval === 'approved') conditions.push('h.is_approved = 1');
    if (approval === 'pending') {
      conditions.push('h.is_approved = 0');
    }
    if (approval === 'rejected') {
      conditions.push('h.is_approved = 0');
      conditions.push('u.is_active = 0');
    }
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

router.get('/me/analytics', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ success: false, message: 'Forbidden: Hospital access required' });
    }

    const hospital = await fetchOne('SELECT id, name, city, phone, email FROM hospitals WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }

    const [profile, doctors, appointments, paymentRows] = await Promise.all([
      getHospitalById(hospital.id),
      fetchHospitalDoctors(hospital.id, hospital.name),
      fetchHospitalAppointments(req.user.id),
      fetchRows(
        `SELECT id, payment_type, amount, currency, status, payment_method, transaction_ref, paid_at, created_at
         FROM payments
         WHERE user_id = ? AND entity_type = 'hospital'
         ORDER BY COALESCE(paid_at, created_at) DESC, id DESC`,
        [req.user.id]
      ),
    ]);

    const now = new Date();
    const currentMonthKey = now.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    const todayAppointments = appointments.filter((item) => item.appointment_date && isSameDay(item.appointment_date, now));

    const normalizedAppointments = appointments.map((item) => {
      const totalAmount = Number(item.doctor_fee || 0);
      const platformFee = Math.round(totalAmount * 0.1);
      const hospitalNet = Math.max(totalAmount - platformFee, 0);
      return {
        id: String(item.id),
        patient: item.patient_name,
        patientPhone: item.patient_phone,
        patientEmail: item.patient_email || '',
        doctor: item.doctor_name || 'Unassigned',
        speciality: item.doctor_speciality || '',
        date: item.appointment_date,
        dateLabel: dateLabel(item.appointment_date),
        time: item.time_slot,
        mode: 'Clinic',
        status: item.workflow_status || item.status,
        fee: totalAmount,
        platformFee,
        hospitalNet,
        concern: item.concern || '',
        adminNote: item.admin_note || '',
        createdAt: item.created_at,
      };
    });

    const monthlyMap = new Map();
    normalizedAppointments.forEach((item) => {
      const key = monthKeyForDate(item.date);
      if (!key) return;
      const current = monthlyMap.get(key) || { month: key, appointments: 0, revenue: 0 };
      current.appointments += 1;
      current.revenue += item.hospitalNet;
      monthlyMap.set(key, current);
    });
    const monthly = Array.from(monthlyMap.values())
      .sort((a, b) => new Date(`01 ${a.month}`).getTime() - new Date(`01 ${b.month}`).getTime())
      .slice(-6);

    const departmentMap = new Map();
    normalizedAppointments.forEach((item) => {
      const dept = item.speciality || 'General';
      const current = departmentMap.get(dept) || { name: dept, appointments: 0, revenue: 0, rating: 0, doctorCount: 0 };
      current.appointments += 1;
      current.revenue += item.hospitalNet;
      departmentMap.set(dept, current);
    });

    doctors.forEach((doctor) => {
      const dept = doctor.speciality || 'General';
      const current = departmentMap.get(dept) || { name: dept, appointments: 0, revenue: 0, rating: 0, doctorCount: 0 };
      current.rating += Number(doctor.rating || 0);
      current.doctorCount += 1;
      departmentMap.set(dept, current);
    });

    const departments = Array.from(departmentMap.values()).map((item) => ({
      name: item.name,
      appointments: item.appointments,
      revenue: item.revenue,
      rating: item.doctorCount ? Number((item.rating / item.doctorCount).toFixed(1)) : 0,
      fillRate: Math.min(100, item.appointments > 0 ? 60 + item.appointments * 3 : 0),
      doctorCount: item.doctorCount,
    }));

    const completedAppointments = normalizedAppointments.filter((item) => item.status === 'Completed');
    const confirmedAppointments = normalizedAppointments.filter((item) => item.status === 'Confirmed' || item.status === 'Rescheduled');
    const pendingAppointments = normalizedAppointments.filter((item) => !['Completed', 'Cancelled', 'Cancelled by Patient', 'Cancelled by Doctor', 'No-show'].includes(item.status));
    const cancelledAppointments = normalizedAppointments.filter((item) => ['Cancelled', 'Cancelled by Patient', 'Cancelled by Doctor', 'No-show'].includes(item.status));

    const consultationPayments = normalizedAppointments.map((item) => ({
      id: `APT-${item.id}`,
      sourceType: 'consultation',
      patient: item.patient,
      doctor: item.doctor,
      dept: item.speciality || 'General',
      date: item.date,
      dateLabel: item.dateLabel,
      amount: item.fee,
      platform: item.platformFee,
      hospital: item.hospitalNet,
      method: 'Clinic Booking',
      status: item.status === 'Completed' ? 'Settled' : item.status === 'Cancelled' || item.status === 'Cancelled by Patient' || item.status === 'Cancelled by Doctor' ? 'Refunded' : 'Pending',
      transactionRef: '',
    }));

    const accountPayments = paymentRows.map((payment) => ({
      id: `PAY-${payment.id}`,
      sourceType: payment.payment_type,
      patient: payment.payment_type === 'subscription' ? 'Subscription' : 'Promotion',
      doctor: hospital.name,
      dept: payment.payment_type,
      date: payment.paid_at || payment.created_at,
      dateLabel: dateLabel(payment.paid_at || payment.created_at),
      amount: Number(payment.amount || 0),
      platform: 0,
      hospital: Number(payment.amount || 0),
      method: payment.payment_method || 'UPI',
      status: payment.status === 'Paid' ? 'Settled' : payment.status === 'Failed' ? 'Refunded' : 'Pending',
      transactionRef: payment.transaction_ref || '',
    }));

    const allPayments = [...consultationPayments, ...accountPayments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const hospitalRevenueThisMonth = consultationPayments
      .filter((item) => monthKeyForDate(item.date) === currentMonthKey && item.status === 'Settled')
      .reduce((sum, item) => sum + item.hospital, 0);
    const pendingRevenue = consultationPayments
      .filter((item) => item.status === 'Pending')
      .reduce((sum, item) => sum + item.hospital, 0);

    const opdSchedules = doctors.map((doctor) => {
      const doctorAppointments = normalizedAppointments.filter((item) => item.doctor === doctor.name);
      const upcomingBooked = doctorAppointments.filter((item) => !['Completed', 'Cancelled', 'Cancelled by Patient', 'Cancelled by Doctor', 'No-show'].includes(item.status)).length;
      const slots = Math.max(12, upcomingBooked + 6);
      return {
        id: String(doctor.id),
        dept: doctor.speciality || 'General',
        doctor: doctor.name,
        days: doctor.shifts || 'Schedule pending',
        start: doctor.shifts || '9:00 AM',
        end: doctor.shifts || '5:00 PM',
        slots,
        booked: upcomingBooked,
        status: upcomingBooked >= slots ? 'Full' : doctor.status === 'Pending Verification' ? 'Closed' : 'Open',
        consultationFee: Number(doctor.fee || 0),
        isHospitalManaged: Boolean(Number(doctor.isHospitalManaged || 0)),
      };
    });

    res.json({
      success: true,
      analytics: {
        profile,
        doctors,
        appointments: normalizedAppointments,
        todayAppointments: todayAppointments.map((item) => ({
          id: String(item.id),
          patient: item.patient_name,
          doctor: item.doctor_name || hospital.name,
          dept: item.doctor_speciality || 'General',
          time: item.time_slot,
          status: item.workflow_status || item.status,
        })),
        stats: {
          totalDoctors: doctors.length,
          activeDoctors: doctors.filter((doctor) => doctor.status === 'Active').length,
          totalAppointments: normalizedAppointments.length,
          confirmedAppointments: confirmedAppointments.length,
          pendingAppointments: pendingAppointments.length,
          completedAppointments: completedAppointments.length,
          cancelledAppointments: cancelledAppointments.length,
          todayAppointments: todayAppointments.length,
          patientsServed: new Set(normalizedAppointments.map((item) => `${item.patient}-${item.patientPhone}`)).size,
          averageRating: doctors.length
            ? Number((doctors.reduce((sum, doctor) => sum + Number(doctor.rating || 0), 0) / doctors.length).toFixed(2))
            : Number(profile?.rating || 0),
          monthlyRevenue: hospitalRevenueThisMonth,
          pendingRevenue,
        },
        departments,
        monthly,
        payments: allPayments,
        opdSchedules,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/hospitals/me/doctors — list doctors affiliated with logged in hospital
router.get('/me/doctors', protect, async (req, res, next) => {
  try {
    const hospital = await fetchOne('SELECT id, name FROM hospitals WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }

    const doctors = await fetchRows(
      `SELECT d.id, d.name, d.email, d.phone, d.speciality, d.qualification, d.experience_years AS exp,
              d.consultation_fee AS fee, d.rating, d.opd_timings AS shifts, d.photo,
              d.is_approved, d.is_subscribed, d.is_hospital_managed AS isHospitalManaged, d.hospital_name,
              CASE
                WHEN d.is_approved = 1 AND d.is_subscribed = 1 THEN 'Active'
                WHEN d.is_approved = 0 THEN 'Pending Verification'
                ELSE 'Active'
              END AS status
       FROM doctors d
       WHERE d.id IN (SELECT doctor_id FROM hospital_doctors WHERE hospital_id = ?)
          OR (d.hospital_name IS NOT NULL AND d.hospital_name LIKE ?)
       ORDER BY d.id DESC`,
      [hospital.id, `%${hospital.name}%`]
    );

    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    next(error);
  }
});

// POST /api/hospitals/me/doctors — add/affiliate a doctor to hospital
router.post('/me/doctors', protect, async (req, res, next) => {
  try {
    const hospital = await fetchOne('SELECT id, name, city FROM hospitals WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }

    const pool = getPool();
    const body = req.body;

    if (body.doctorId) {
      // Mode 1: Link existing doctor by ID
      await pool.execute(
        'INSERT IGNORE INTO hospital_doctors (hospital_id, doctor_id) VALUES (?, ?)',
        [hospital.id, body.doctorId]
      );
      await pool.execute(
        'UPDATE doctors SET hospital_name = ? WHERE id = ?',
        [hospital.name, body.doctorId]
      );
      return res.json({ success: true, message: 'Doctor linked to hospital successfully' });
    }

    // Mode 2: Create new Doctor and affiliate to hospital
    if (!body.name || !body.email || !body.phone || !body.speciality) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, and speciality are required' });
    }

    const { createUserAccount } = require('../services/accountProvisioning');
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      let doctorName = body.name.trim();
      if (!/^Dr\.\s*/i.test(doctorName)) {
        doctorName = `Dr. ${doctorName.replace(/\b(\w)/g, (ch) => ch.toUpperCase())}`;
      } else {
        doctorName = doctorName.replace(/\b(\w)/g, (ch) => ch.toUpperCase());
      }

      const userId = await createUserAccount(connection, {
        name: doctorName,
        email: body.email.trim(),
        password: body.password || 'Doctor123!',
        role: 'doctor',
      });

      const [docRes] = await connection.execute(
        `INSERT INTO doctors
          (user_id, name, email, phone, gender, photo, registration_no, qualification, speciality, experience_years, hospital_name, clinic_address, city, area, consultation_fee, consultation_type, opd_timings, bio, rating, is_hospital_managed, is_approved, is_subscribed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1)`,
        [
          userId,
          doctorName,
          body.email.trim(),
          body.phone.trim(),
          body.gender || 'Male',
          body.photo || '/doctors/default-doctor.jpg',
          body.registrationNo || 'MCI-PENDING',
          body.qualification || 'MBBS',
          body.speciality,
          body.experience || 0,
          hospital.name,
          body.clinicAddress || hospital.name,
          hospital.city || 'India',
          body.area || '',
          body.consultationFee || 500,
          body.consultationType || 'Both',
          body.opdTimings || 'Mon-Sat 9:00 AM - 5:00 PM',
          body.bio || `Affiliated Specialist Doctor at ${hospital.name}`,
          4.8,
        ]
      );

      const newDoctorId = docRes.insertId;

      await connection.execute(
        'INSERT IGNORE INTO hospital_doctors (hospital_id, doctor_id) VALUES (?, ?)',
        [hospital.id, newDoctorId]
      );

      await connection.commit();
      res.status(201).json({ success: true, message: `${doctorName} added and affiliated successfully!` });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
});

// DELETE /api/hospitals/me/doctors/:doctorId — remove doctor affiliation
router.delete('/me/doctors/:doctorId', protect, async (req, res, next) => {
  try {
    const hospital = await fetchOne('SELECT id FROM hospitals WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }
    const pool = getPool();
    await pool.execute(
      'DELETE FROM hospital_doctors WHERE hospital_id = ? AND doctor_id = ?',
      [hospital.id, req.params.doctorId]
    );
    res.json({ success: true, message: 'Doctor unlinked from hospital' });
  } catch (error) {
    next(error);
  }
});

router.patch('/me/doctors/:doctorId', protect, async (req, res, next) => {
  try {
    const hospital = await fetchOne('SELECT id, name FROM hospitals WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }

    const doctor = await fetchOne(
      `SELECT d.id, d.name, d.opd_timings, d.consultation_fee, d.is_hospital_managed
       FROM doctors d
       WHERE d.id = ?
         AND (
           d.id IN (SELECT doctor_id FROM hospital_doctors WHERE hospital_id = ?)
           OR (d.hospital_name IS NOT NULL AND d.hospital_name LIKE ?)
         )
       LIMIT 1`,
      [req.params.doctorId, hospital.id, `%${hospital.name}%`]
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found for this hospital' });
    }

    const updates = req.body || {};
    const pool = getPool();
    await pool.execute(
      `UPDATE doctors
       SET opd_timings = ?, consultation_fee = ?
       WHERE id = ?`,
      [
        updates.opdTimings ?? doctor.opd_timings ?? 'Mon-Sat 9:00 AM - 5:00 PM',
        updates.consultationFee ?? doctor.consultation_fee ?? 500,
        req.params.doctorId,
      ]
    );

    return res.json({ success: true, message: 'Hospital doctor timing updated successfully' });
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
    if (!hospital.isApproved || !hospital.isSubscribed) {
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
    const approvalDecision = updates.approvalDecision;

    if (!isAdmin) {
      if (req.user.role !== 'hospital' || hospital.userId !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own hospital profile' });
      }

      const result = await submitHospitalProfileChanges({
        hospitalId: req.params.id,
        actorUser: req.user,
        updates,
        currentHospital: hospital,
      });

      res.locals.activityLog = {
        action: result.changed ? 'Hospital profile change submitted' : 'Hospital profile save attempted',
        entityType: 'hospital',
        entityId: req.params.id,
        category: 'Verification',
        dashboardHref: '/dashboard/super-admin/verification/profile-changes',
        description: result.changed
          ? `${hospital.name} submitted profile updates for review`
          : `${hospital.name} opened save flow without any actual changes`,
      };

      return res.json({
        success: true,
        message: result.changed ? 'Profile update submitted for review' : 'No profile changes detected',
        hospital: result.hospital,
      });
    }

    await pool.execute(
      `UPDATE hospitals
       SET name = ?, phone = ?, emergency_contact = ?, website = ?, image = ?, registration_no = ?, hospital_type = ?, total_beds = ?, address = ?, google_maps_link = ?, gallery = ?, city = ?, opd_timings = ?, about = ?, rating = ?, is_approved = ?, is_subscribed = ?, subscription_paid_at = ?, subscription_ends_at = ?
       WHERE id = ?`,
      [
        updates.name ?? hospital.name,
        updates.phone ?? hospital.phone,
        updates.emergencyContact ?? hospital.emergencyContact,
        updates.website ?? hospital.website ?? null,
        updates.image ?? hospital.image,
        updates.registrationDetails ?? hospital.registrationDetails,
        updates.hospitalType ?? hospital.hospitalType,
        updates.totalBeds ?? hospital.totalBeds,
        updates.address ?? hospital.address,
        updates.googleMapsLink ?? hospital.googleMapsLink ?? null,
        updates.gallery === undefined
          ? JSON.stringify(hospital.gallery || [])
          : JSON.stringify(Array.isArray(updates.gallery) ? updates.gallery : []),
        updates.location ?? hospital.location,
        updates.opdTimings ?? hospital.opdTimings,
        updates.about ?? hospital.about,
        updates.rating ?? hospital.rating,
        approvalDecision === 'approved'
          ? 1
          : approvalDecision === 'rejected' || approvalDecision === 'pending'
            ? 0
            : updates.isApproved === undefined ? (hospital.isApproved ? 1 : 0) : (updates.isApproved ? 1 : 0),
        updates.isSubscribed === undefined ? (hospital.isSubscribed ? 1 : 0) : (updates.isSubscribed ? 1 : 0),
        updates.subscriptionPaidAt ?? hospital.subscriptionPaidAt ?? null,
        updates.subscriptionEndsAt ?? hospital.subscriptionEndsAt ?? null,
        req.params.id,
      ]
    );

    if (approvalDecision === 'approved' || approvalDecision === 'pending' || approvalDecision === 'rejected') {
      await pool.execute(
        'UPDATE users SET is_active = ? WHERE id = ?',
        [approvalDecision === 'rejected' ? 0 : 1, hospital.userId]
      );
    }

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
    if (updates.approvePendingChanges || approvalDecision === 'approved') {
      await pool.execute(
        `UPDATE profile_change_requests
         SET status = 'Approved', reviewed_by = ?, reviewed_at = NOW()
         WHERE entity_type = 'hospital' AND entity_id = ? AND status = 'Pending'`,
        [req.user.id, req.params.id]
      );
    }
    if (approvalDecision === 'rejected') {
      await pool.execute(
        `UPDATE profile_change_requests
         SET status = 'Rejected', reviewed_by = ?, reviewed_at = NOW()
         WHERE entity_type = 'hospital' AND entity_id = ? AND status = 'Pending'`,
        [req.user.id, req.params.id]
      );
    }

    const updatedHospital = await getHospitalById(req.params.id);
    if (approvalDecision === 'approved' || approvalDecision === 'rejected') {
      res.locals.activityLog = {
        action: approvalDecision === 'approved' ? 'Hospital approval updated' : 'Hospital rejected',
        entityType: 'hospital',
        entityId: req.params.id,
        category: 'Verification',
        dashboardHref: '/dashboard/super-admin/verification/hospital-approvals',
        description: `${updatedHospital?.name || hospital.name} was ${approvalDecision}`,
      };
    } else if (updates.approvePendingChanges) {
      res.locals.activityLog = {
        action: 'Hospital profile changes approved',
        entityType: 'hospital',
        entityId: req.params.id,
        category: 'Verification',
        dashboardHref: '/dashboard/super-admin/verification/profile-changes',
        description: `Pending profile changes approved for ${updatedHospital?.name || hospital.name}`,
      };
    }
    res.json({ success: true, hospital: updatedHospital });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/hospitals/:id — super admin only
router.delete('/:id', protect, async (req, res, next) => {
  try {
    if (!['super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }
    const pool = getPool();
    // Get user_id first
    const [rows] = await pool.execute('SELECT user_id FROM hospitals WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    const userId = rows[0].user_id;

    // Delete user (will cascade delete hospital profile)
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true, message: 'Hospital account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
