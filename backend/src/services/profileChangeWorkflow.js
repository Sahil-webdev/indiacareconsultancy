const { getPool } = require('../config/mysql');
const { createNotification, createSuperAdminNotification } = require('./notifications');
const { formatDoctor, formatHospital } = require('./entityFormatters');

const DOCTOR_SCALAR_FIELDS = {
  name: { column: 'name' },
  phone: { column: 'phone' },
  photo: { column: 'photo' },
  medicalRegistrationNumber: { column: 'registration_no' },
  qualification: { column: 'qualification' },
  speciality: { column: 'speciality' },
  experience: { column: 'experience_years', parse: (value) => Number(value || 0) },
  clinicAddress: { column: 'clinic_address' },
  location: { column: 'city' },
  area: { column: 'area' },
  consultationFee: { column: 'consultation_fee', parse: (value) => Number(value || 0) },
  consultationType: { column: 'consultation_type' },
  bio: { column: 'bio' },
  opdTimings: { column: 'opd_timings' },
  hospitalName: { column: 'hospital_name' },
};

const DOCTOR_LIST_FIELDS = {
  availability: { table: 'doctor_availability', column: 'day' },
  languages: { table: 'doctor_languages', column: 'language' },
  services: { table: 'doctor_services', column: 'service' },
  awards: { table: 'doctor_awards', column: 'award' },
};

const HOSPITAL_SCALAR_FIELDS = {
  name: { column: 'name' },
  phone: { column: 'phone' },
  emergencyContact: { column: 'emergency_contact' },
  website: { column: 'website' },
  image: { column: 'image' },
  registrationDetails: { column: 'registration_no' },
  hospitalType: { column: 'hospital_type' },
  totalBeds: { column: 'total_beds', parse: (value) => Number(value || 0) },
  address: { column: 'address' },
  location: { column: 'city' },
  opdTimings: { column: 'opd_timings' },
  about: { column: 'about' },
};

const HOSPITAL_LIST_FIELDS = {
  departments: { table: 'hospital_departments', column: 'department' },
  facilities: { table: 'hospital_facilities', column: 'facility' },
  accreditations: { table: 'hospital_accreditations', column: 'accreditation' },
};

function normalizeScalar(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function normalizeList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function parseStoredList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function prettifyFieldName(field) {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

async function replaceListValues(connection, table, keyColumn, entityId, valueColumn, values) {
  await connection.execute(`DELETE FROM ${table} WHERE ${keyColumn} = ?`, [entityId]);
  for (const value of values) {
    await connection.execute(`INSERT INTO ${table} (${keyColumn}, ${valueColumn}) VALUES (?, ?)`, [entityId, value]);
  }
}

async function loadDoctorRow(connection, id) {
  const [rows] = await connection.execute('SELECT * FROM doctors WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function loadHospitalRow(connection, id) {
  const [rows] = await connection.execute('SELECT * FROM hospitals WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function getFormattedDoctor(connection, id) {
  const [rows] = await connection.execute(`
    SELECT
      d.*,
      u.is_active AS account_is_active,
      COALESCE((SELECT JSON_ARRAYAGG(day) FROM doctor_availability WHERE doctor_id = d.id), JSON_ARRAY()) AS availability,
      COALESCE((SELECT JSON_ARRAYAGG(language) FROM doctor_languages WHERE doctor_id = d.id), JSON_ARRAY()) AS languages,
      COALESCE((SELECT JSON_ARRAYAGG(service) FROM doctor_services WHERE doctor_id = d.id), JSON_ARRAY()) AS services,
      COALESCE((SELECT JSON_ARRAYAGG(award) FROM doctor_awards WHERE doctor_id = d.id), JSON_ARRAY()) AS awards,
      (SELECT COUNT(*) FROM profile_change_requests WHERE entity_type = 'doctor' AND entity_id = d.id AND status = 'Pending') AS pending_change_requests
    FROM doctors d
    INNER JOIN users u ON u.id = d.user_id
    WHERE d.id = ?
    LIMIT 1
  `, [id]);
  return rows[0] ? formatDoctor(rows[0]) : null;
}

async function getFormattedHospital(connection, id) {
  const [rows] = await connection.execute(`
    SELECT
      h.*,
      u.is_active AS account_is_active,
      COALESCE((SELECT JSON_ARRAYAGG(department) FROM hospital_departments WHERE hospital_id = h.id), JSON_ARRAY()) AS departments,
      COALESCE((SELECT JSON_ARRAYAGG(facility) FROM hospital_facilities WHERE hospital_id = h.id), JSON_ARRAY()) AS facilities,
      COALESCE((SELECT JSON_ARRAYAGG(accreditation) FROM hospital_accreditations WHERE hospital_id = h.id), JSON_ARRAY()) AS accreditations,
      (SELECT COUNT(*) FROM hospital_doctors WHERE hospital_id = h.id) AS doctor_count,
      (SELECT COUNT(*) FROM profile_change_requests WHERE entity_type = 'hospital' AND entity_id = h.id AND status = 'Pending') AS pending_change_requests
    FROM hospitals h
    INNER JOIN users u ON u.id = h.user_id
    WHERE h.id = ?
    LIMIT 1
  `, [id]);
  return rows[0] ? formatHospital(rows[0]) : null;
}

async function submitDoctorProfileChanges({ doctorId, actorUser, updates, currentDoctor }) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const doctorRow = await loadDoctorRow(connection, doctorId);
    if (!doctorRow) throw new Error('Doctor not found');

    const scalarAssignments = [];
    const scalarValues = [];
    const changedFields = [];

    for (const [field, config] of Object.entries(DOCTOR_SCALAR_FIELDS)) {
      if (updates[field] === undefined) continue;
      const oldValue = currentDoctor[field] ?? '';
      const newValue = updates[field];
      if (normalizeScalar(oldValue) === normalizeScalar(newValue)) continue;

      await connection.execute(
        `DELETE FROM profile_change_requests
         WHERE entity_type = 'doctor' AND entity_id = ? AND field_name = ? AND status = 'Pending'`,
        [doctorId, field]
      );
      await connection.execute(
        `INSERT INTO profile_change_requests (entity_type, entity_id, field_name, old_value, new_value, status)
         VALUES ('doctor', ?, ?, ?, ?, 'Pending')`,
        [doctorId, field, oldValue === '' ? null : String(oldValue), String(newValue)]
      );

      scalarAssignments.push(`${config.column} = ?`);
      scalarValues.push(config.parse ? config.parse(newValue) : newValue);
      changedFields.push(field);
    }

    for (const [field, config] of Object.entries(DOCTOR_LIST_FIELDS)) {
      if (!Array.isArray(updates[field])) continue;
      const oldValue = normalizeList(currentDoctor[field]);
      const newValue = normalizeList(updates[field]);
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;

      await connection.execute(
        `DELETE FROM profile_change_requests
         WHERE entity_type = 'doctor' AND entity_id = ? AND field_name = ? AND status = 'Pending'`,
        [doctorId, field]
      );
      await connection.execute(
        `INSERT INTO profile_change_requests (entity_type, entity_id, field_name, old_value, new_value, status)
         VALUES ('doctor', ?, ?, ?, ?, 'Pending')`,
        [doctorId, field, JSON.stringify(oldValue), JSON.stringify(newValue)]
      );

      await replaceListValues(connection, config.table, 'doctor_id', doctorId, config.column, newValue);
      changedFields.push(field);
    }

    if (!changedFields.length) {
      await connection.rollback();
      return { changed: false, doctor: currentDoctor };
    }

    if (scalarAssignments.length) {
      await connection.execute(
        `UPDATE doctors SET ${scalarAssignments.join(', ')} WHERE id = ?`,
        [...scalarValues, doctorId]
      );
    }

    if (changedFields.includes('name')) {
      await connection.execute('UPDATE users SET name = ? WHERE id = ?', [updates.name, doctorRow.user_id]);
    }

    await createSuperAdminNotification({
      title: `Doctor profile update request`,
      message: `${currentDoctor.name} submitted ${changedFields.length} profile change${changedFields.length > 1 ? 's' : ''} for review.`,
      sentBy: actorUser.id,
      category: 'profile_change',
      entityType: 'doctor',
      entityId: Number(doctorId),
      actionUrl: '/dashboard/super-admin/verification/profile-changes',
      metadata: { fields: changedFields, entityName: currentDoctor.name },
      connection,
    });

    await connection.commit();
    const updatedDoctor = await getFormattedDoctor(connection, doctorId);
    return { changed: true, doctor: updatedDoctor, changedFields };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function submitHospitalProfileChanges({ hospitalId, actorUser, updates, currentHospital }) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const hospitalRow = await loadHospitalRow(connection, hospitalId);
    if (!hospitalRow) throw new Error('Hospital not found');

    const scalarAssignments = [];
    const scalarValues = [];
    const changedFields = [];

    for (const [field, config] of Object.entries(HOSPITAL_SCALAR_FIELDS)) {
      if (updates[field] === undefined) continue;
      const oldValue = currentHospital[field] ?? '';
      const newValue = updates[field];
      if (normalizeScalar(oldValue) === normalizeScalar(newValue)) continue;

      await connection.execute(
        `DELETE FROM profile_change_requests
         WHERE entity_type = 'hospital' AND entity_id = ? AND field_name = ? AND status = 'Pending'`,
        [hospitalId, field]
      );
      await connection.execute(
        `INSERT INTO profile_change_requests (entity_type, entity_id, field_name, old_value, new_value, status)
         VALUES ('hospital', ?, ?, ?, ?, 'Pending')`,
        [hospitalId, field, oldValue === '' ? null : String(oldValue), String(newValue)]
      );

      scalarAssignments.push(`${config.column} = ?`);
      scalarValues.push(config.parse ? config.parse(newValue) : newValue);
      changedFields.push(field);
    }

    for (const [field, config] of Object.entries(HOSPITAL_LIST_FIELDS)) {
      if (!Array.isArray(updates[field])) continue;
      const oldValue = normalizeList(currentHospital[field]);
      const newValue = normalizeList(updates[field]);
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;

      await connection.execute(
        `DELETE FROM profile_change_requests
         WHERE entity_type = 'hospital' AND entity_id = ? AND field_name = ? AND status = 'Pending'`,
        [hospitalId, field]
      );
      await connection.execute(
        `INSERT INTO profile_change_requests (entity_type, entity_id, field_name, old_value, new_value, status)
         VALUES ('hospital', ?, ?, ?, ?, 'Pending')`,
        [hospitalId, field, JSON.stringify(oldValue), JSON.stringify(newValue)]
      );

      await replaceListValues(connection, config.table, 'hospital_id', hospitalId, config.column, newValue);
      changedFields.push(field);
    }

    if (!changedFields.length) {
      await connection.rollback();
      return { changed: false, hospital: currentHospital };
    }

    if (scalarAssignments.length) {
      await connection.execute(
        `UPDATE hospitals SET ${scalarAssignments.join(', ')} WHERE id = ?`,
        [...scalarValues, hospitalId]
      );
    }

    if (changedFields.includes('name')) {
      await connection.execute('UPDATE users SET name = ? WHERE id = ?', [updates.name, hospitalRow.user_id]);
    }

    await createSuperAdminNotification({
      title: `Hospital profile update request`,
      message: `${currentHospital.name} submitted ${changedFields.length} profile change${changedFields.length > 1 ? 's' : ''} for review.`,
      sentBy: actorUser.id,
      category: 'profile_change',
      entityType: 'hospital',
      entityId: Number(hospitalId),
      actionUrl: '/dashboard/super-admin/verification/profile-changes',
      metadata: { fields: changedFields, entityName: currentHospital.name },
      connection,
    });

    await connection.commit();
    const updatedHospital = await getFormattedHospital(connection, hospitalId);
    return { changed: true, hospital: updatedHospital, changedFields };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listProfileChangeRequests() {
  const rows = await getPool().execute(`
    SELECT
      pr.*,
      d.name AS doctor_name,
      d.user_id AS doctor_user_id,
      h.name AS hospital_name,
      h.user_id AS hospital_user_id
    FROM profile_change_requests pr
    LEFT JOIN doctors d ON pr.entity_type = 'doctor' AND pr.entity_id = d.id
    LEFT JOIN hospitals h ON pr.entity_type = 'hospital' AND pr.entity_id = h.id
    ORDER BY
      CASE WHEN pr.status = 'Pending' THEN 0 ELSE 1 END,
      COALESCE(pr.reviewed_at, pr.created_at) DESC,
      pr.created_at DESC
  `);

  const records = rows[0];
  const grouped = new Map();

  for (const row of records) {
    const entityName = row.entity_type === 'doctor' ? row.doctor_name : row.hospital_name;
    const entityUserId = row.entity_type === 'doctor' ? row.doctor_user_id : row.hospital_user_id;
    const timeKey = row.status === 'Pending'
      ? 'pending'
      : new Date(row.reviewed_at || row.created_at).toISOString();
    const key = `${row.entity_type}:${row.entity_id}:${row.status}:${timeKey}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key,
        entityType: row.entity_type,
        entityId: String(row.entity_id),
        entityName: entityName || `${row.entity_type} #${row.entity_id}`,
        entityUserId: entityUserId ? String(entityUserId) : null,
        status: row.status,
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at,
        fields: [],
      });
    }

    grouped.get(key).fields.push({
      id: String(row.id),
      fieldName: row.field_name,
      label: prettifyFieldName(row.field_name),
      oldValue: row.old_value,
      newValue: row.new_value,
    });
  }

  const entries = Array.from(grouped.values());
  return {
    pending: entries.filter((entry) => entry.status === 'Pending'),
    history: entries.filter((entry) => entry.status !== 'Pending').slice(0, 50),
  };
}

async function reviewProfileChanges({ entityType, entityId, decision, reviewerUser }) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [requestRows] = await connection.execute(
      `SELECT * FROM profile_change_requests
       WHERE entity_type = ? AND entity_id = ? AND status = 'Pending'
       ORDER BY id ASC`,
      [entityType, entityId]
    );

    if (!requestRows.length) {
      throw new Error('No pending profile changes found');
    }

    if (entityType === 'doctor') {
      const doctorRow = await loadDoctorRow(connection, entityId);
      if (!doctorRow) throw new Error('Doctor not found');

      if (decision === 'rejected') {
        const scalarAssignments = [];
        const scalarValues = [];

        for (const request of requestRows) {
          const scalarConfig = DOCTOR_SCALAR_FIELDS[request.field_name];
          const listConfig = DOCTOR_LIST_FIELDS[request.field_name];

          if (scalarConfig) {
            const restored = scalarConfig.parse ? scalarConfig.parse(request.old_value) : request.old_value;
            scalarAssignments.push(`${scalarConfig.column} = ?`);
            scalarValues.push(restored);
          } else if (listConfig) {
            await replaceListValues(
              connection,
              listConfig.table,
              'doctor_id',
              entityId,
              listConfig.column,
              parseStoredList(request.old_value)
            );
          }
        }

        if (scalarAssignments.length) {
          await connection.execute(
            `UPDATE doctors SET ${scalarAssignments.join(', ')} WHERE id = ?`,
            [...scalarValues, entityId]
          );
        }

        const nameRevert = requestRows.find((request) => request.field_name === 'name');
        if (nameRevert) {
          await connection.execute('UPDATE users SET name = ? WHERE id = ?', [nameRevert.old_value || doctorRow.name, doctorRow.user_id]);
        }
      }

      await connection.execute(
        `UPDATE profile_change_requests
         SET status = ?, reviewed_by = ?, reviewed_at = NOW()
         WHERE entity_type = 'doctor' AND entity_id = ? AND status = 'Pending'`,
        [decision === 'approved' ? 'Approved' : 'Rejected', reviewerUser.id, entityId]
      );

      await createNotification({
        title: decision === 'approved' ? 'Profile changes approved' : 'Profile changes rejected',
        message: decision === 'approved'
          ? 'Your profile changes were approved by the super admin and remain live.'
          : 'Your recent profile changes were rejected by the super admin and have been rolled back.',
        sentBy: reviewerUser.id,
        recipientUserId: doctorRow.user_id,
        recipientRole: 'doctor',
        category: 'profile_change',
        entityType: 'doctor',
        entityId: Number(entityId),
        actionUrl: '/dashboard/doctor/profile',
        metadata: { decision, fields: requestRows.map((request) => request.field_name) },
        connection,
      });
    } else if (entityType === 'hospital') {
      const hospitalRow = await loadHospitalRow(connection, entityId);
      if (!hospitalRow) throw new Error('Hospital not found');

      if (decision === 'rejected') {
        const scalarAssignments = [];
        const scalarValues = [];

        for (const request of requestRows) {
          const scalarConfig = HOSPITAL_SCALAR_FIELDS[request.field_name];
          const listConfig = HOSPITAL_LIST_FIELDS[request.field_name];

          if (scalarConfig) {
            const restored = scalarConfig.parse ? scalarConfig.parse(request.old_value) : request.old_value;
            scalarAssignments.push(`${scalarConfig.column} = ?`);
            scalarValues.push(restored);
          } else if (listConfig) {
            await replaceListValues(
              connection,
              listConfig.table,
              'hospital_id',
              entityId,
              listConfig.column,
              parseStoredList(request.old_value)
            );
          }
        }

        if (scalarAssignments.length) {
          await connection.execute(
            `UPDATE hospitals SET ${scalarAssignments.join(', ')} WHERE id = ?`,
            [...scalarValues, entityId]
          );
        }

        const nameRevert = requestRows.find((request) => request.field_name === 'name');
        if (nameRevert) {
          await connection.execute('UPDATE users SET name = ? WHERE id = ?', [nameRevert.old_value || hospitalRow.name, hospitalRow.user_id]);
        }
      }

      await connection.execute(
        `UPDATE profile_change_requests
         SET status = ?, reviewed_by = ?, reviewed_at = NOW()
         WHERE entity_type = 'hospital' AND entity_id = ? AND status = 'Pending'`,
        [decision === 'approved' ? 'Approved' : 'Rejected', reviewerUser.id, entityId]
      );

      await createNotification({
        title: decision === 'approved' ? 'Profile changes approved' : 'Profile changes rejected',
        message: decision === 'approved'
          ? 'Your hospital profile changes were approved by the super admin and remain live.'
          : 'Your recent hospital profile changes were rejected by the super admin and have been rolled back.',
        sentBy: reviewerUser.id,
        recipientUserId: hospitalRow.user_id,
        recipientRole: 'hospital',
        category: 'profile_change',
        entityType: 'hospital',
        entityId: Number(entityId),
        actionUrl: '/dashboard/hospital/profile',
        metadata: { decision, fields: requestRows.map((request) => request.field_name) },
        connection,
      });
    } else {
      throw new Error('Unsupported entity type');
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  listProfileChangeRequests,
  reviewProfileChanges,
  submitDoctorProfileChanges,
  submitHospitalProfileChanges,
};
