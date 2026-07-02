const bcrypt = require('bcryptjs');
const { getPool } = require('../config/mysql');

const demoUsers = [
  { name: 'Vikram Singh', email: 'admin@indiacare.com', password: 'password123', role: 'super_admin' },
  { name: 'Ritu Consultant', email: 'consultant@indiacare.com', password: 'password123', role: 'consultant' },
  { name: 'Dr. Ramesh Kumar', email: 'ramesh.kumar@indiacare.com', password: 'password123', role: 'doctor' },
  { name: 'Apollo Hospital Indraprastha', email: 'contact@apollo-delhi.com', password: 'password123', role: 'hospital' },
];

const hospitalSeeds = [
  {
    email: 'contact@apollo-delhi.com',
    name: 'Apollo Hospital Indraprastha',
    phone: '+91 11 7179 1090',
    emergencyContact: '+91 11 1066',
    website: 'https://www.apollohospitals.com',
    image: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e963?auto=format&fit=crop&q=80&w=800',
    registrationNo: 'DL-HOSP-20948',
    hospitalType: 'Multispeciality',
    totalBeds: 710,
    address: 'Mathura Road, Sarita Vihar, New Delhi',
    city: 'Delhi',
    opdTimings: '8:00 AM - 8:00 PM',
    about: 'World-class multispeciality hospital with advanced critical care and surgical infrastructure.',
    rating: 4.8,
    isApproved: 1,
    isSubscribed: 1,
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology'],
    facilities: ['ICU', '24/7 Emergency', 'Pharmacy', 'Robotic Surgery', 'Blood Bank'],
    accreditations: ['NABH Accredited', 'JCI Accredited'],
  },
  {
    email: 'fortis.memorial@indiacare.com',
    name: 'Fortis Memorial Research Institute',
    phone: '+91 124 716 2200',
    emergencyContact: '+91 124 105010',
    website: 'https://www.fortishealthcare.com',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    registrationNo: 'HR-HOSP-58291',
    hospitalType: 'Multispeciality',
    totalBeds: 450,
    address: 'Sector 44, opposite HUDA City Centre, Gurugram',
    city: 'Gurugram',
    opdTimings: '9:00 AM - 7:00 PM',
    about: 'Advanced tertiary care hospital for neuro, cardio and women health services.',
    rating: 4.7,
    isApproved: 1,
    isSubscribed: 1,
    departments: ['Neurology', 'Cardiology', 'Gynecology', 'Urology'],
    facilities: ['ICU', 'Dialysis Unit', 'In-house MRI/CT Scan', 'Ambulance service'],
    accreditations: ['NABH Accredited'],
  },
  {
    email: 'info@kdah.com',
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    phone: '+91 22 4269 6969',
    emergencyContact: '+91 22 1052',
    website: 'https://www.kokilabenhospital.com',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    registrationNo: 'MH-HOSP-12847',
    hospitalType: 'Specialty',
    totalBeds: 750,
    address: 'Andheri West, Mumbai',
    city: 'Mumbai',
    opdTimings: '9:00 AM - 5:00 PM',
    about: 'Center of excellence for orthopedics, cardiac sciences and neurosciences.',
    rating: 4.9,
    isApproved: 1,
    isSubscribed: 1,
    departments: ['Orthopedics', 'Cardiology', 'Neurology', 'ENT'],
    facilities: ['Intelligent ICU', 'Rehabilitation Center', 'Trauma Center'],
    accreditations: ['NABH Accredited'],
  },
  {
    email: 'apply@sunshineclinic.com',
    name: 'Sunshine Clinic & Hospital',
    phone: '+91 141 234 5678',
    emergencyContact: '+91 94130 99999',
    website: '',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
    registrationNo: 'RJR-2020-01123',
    hospitalType: 'General',
    totalBeds: 40,
    address: '45, Tonk Road, Jaipur',
    city: 'Jaipur',
    opdTimings: '10:00 AM - 6:00 PM',
    about: 'Community hospital serving Jaipur families with affordable, quality care.',
    rating: 4.3,
    isApproved: 0,
    isSubscribed: 0,
    departments: ['General Medicine', 'Gynecology', 'Pediatrics'],
    facilities: ['OPD', 'Minor OT', 'Pathology'],
    accreditations: [],
  },
];

const doctorSeeds = [
  {
    email: 'ramesh.kumar@indiacare.com',
    name: 'Dr. Ramesh Kumar',
    phone: '+91 98765 43210',
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    registrationNo: 'MCI-34521',
    qualification: 'MD, DM (Cardiology)',
    speciality: 'Cardiology',
    experienceYears: 18,
    hospitalEmail: 'contact@apollo-delhi.com',
    clinicAddress: 'Heart Care Center, Connaught Place, New Delhi',
    city: 'Delhi',
    area: 'Connaught Place',
    consultationFee: 1500,
    consultationType: 'Both',
    opdTimings: '10:00 AM - 6:00 PM',
    bio: 'Interventional cardiologist with 18 years of experience in complex angioplasties and preventive heart care.',
    rating: 4.9,
    isApproved: 1,
    isSubscribed: 1,
    languages: ['English', 'Hindi', 'Punjabi'],
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    services: ['Coronary Angioplasty', 'Heart Failure Management', 'Pacemaker Implantation'],
    awards: ['Best Cardiologist Award 2024'],
  },
  {
    email: 'sunita.sharma@indiacare.com',
    name: 'Dr. Sunita Sharma',
    phone: '+91 98765 43211',
    gender: 'Female',
    photo: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400',
    registrationNo: 'MCI-56782',
    qualification: 'MD, DNB (Neurology)',
    speciality: 'Neurology',
    experienceYears: 14,
    hospitalEmail: 'fortis.memorial@indiacare.com',
    clinicAddress: 'Brain & Spine Clinic, Sector 62, Noida',
    city: 'Noida',
    area: 'Sector 62',
    consultationFee: 1200,
    consultationType: 'Both',
    opdTimings: '11:00 AM - 5:00 PM',
    bio: 'Neurologist focused on stroke, epilepsy, and headache management.',
    rating: 4.8,
    isApproved: 1,
    isSubscribed: 1,
    languages: ['English', 'Hindi'],
    availability: ['Mon', 'Wed', 'Fri'],
    services: ['Stroke Rehabilitation', 'EEG & EMG Testing'],
    awards: ['Distinguished Service Award 2023'],
  },
  {
    email: 'amit.patel@indiacare.com',
    name: 'Dr. Amit Patel',
    phone: '+91 98765 43212',
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    registrationNo: 'MCI-29471',
    qualification: 'MS (Orthopedics), M.Ch (Joint Replacement)',
    speciality: 'Orthopedics',
    experienceYears: 15,
    hospitalEmail: 'info@kdah.com',
    clinicAddress: 'Orthofit Clinic, Bandra West, Mumbai',
    city: 'Mumbai',
    area: 'Bandra West',
    consultationFee: 1000,
    consultationType: 'Offline',
    opdTimings: '9:30 AM - 4:00 PM',
    bio: 'Orthopedic surgeon specializing in robotic knee and hip replacements.',
    rating: 4.7,
    isApproved: 1,
    isSubscribed: 1,
    languages: ['English', 'Hindi', 'Gujarati'],
    availability: ['Tue', 'Thu', 'Sat'],
    services: ['Robotic Knee Replacement', 'Arthroscopic Ligament Reconstruction'],
    awards: ['Rising Star in Orthopedics 2022'],
  },
  {
    email: 'aryan.kapoor@email.com',
    name: 'Dr. Aryan Kapoor',
    phone: '+91 98100 21111',
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1623854767648-e7bb8c5f478e?auto=format&fit=crop&q=80&w=400',
    registrationNo: 'DMC/R/2015/12345',
    qualification: 'MBBS, MD (Cardiology)',
    speciality: 'Cardiology',
    experienceYears: 9,
    hospitalEmail: 'contact@apollo-delhi.com',
    clinicAddress: 'A-14, Safdarjung Enclave, New Delhi',
    city: 'Delhi',
    area: 'Safdarjung',
    consultationFee: 800,
    consultationType: 'Both',
    opdTimings: '10:00 AM - 3:00 PM',
    bio: 'Cardiologist awaiting first-time approval with strong preventive cardiology background.',
    rating: 4.5,
    isApproved: 0,
    isSubscribed: 0,
    languages: ['Hindi', 'English'],
    availability: ['Mon', 'Wed', 'Fri', 'Sat'],
    services: ['Echocardiography', 'Angiography'],
    awards: [],
  },
];

async function ensureUser(pool, user) {
  const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [user.email]);
  if (rows.length) return rows[0].id;
  const passwordHash = await bcrypt.hash(user.password, 12);
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)',
    [user.name, user.email, passwordHash, user.role]
  );
  return result.insertId;
}

async function ensureEntityUser(pool, role, name, email) {
  return ensureUser(pool, {
    name,
    email,
    password: 'password123',
    role,
  });
}

async function replaceChildRows(pool, tableName, fkColumn, fkValue, valueColumn, values) {
  await pool.execute(`DELETE FROM ${tableName} WHERE ${fkColumn} = ?`, [fkValue]);
  for (const value of values) {
    await pool.execute(`INSERT INTO ${tableName} (${fkColumn}, ${valueColumn}) VALUES (?, ?)`, [fkValue, value]);
  }
}

async function ensureHospital(pool, hospital) {
  const [existing] = await pool.execute('SELECT id FROM hospitals WHERE email = ?', [hospital.email]);
  const userId = await ensureEntityUser(pool, 'hospital', hospital.name, hospital.email);

  if (existing.length) {
    const id = existing[0].id;
    await replaceChildRows(pool, 'hospital_departments', 'hospital_id', id, 'department', hospital.departments);
    await replaceChildRows(pool, 'hospital_facilities', 'hospital_id', id, 'facility', hospital.facilities);
    await replaceChildRows(pool, 'hospital_accreditations', 'hospital_id', id, 'accreditation', hospital.accreditations);
    return id;
  }

  const [result] = await pool.execute(
    `INSERT INTO hospitals
      (user_id, name, email, phone, emergency_contact, website, image, registration_no, hospital_type, total_beds, address, city, opd_timings, about, rating, is_approved, is_subscribed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      hospital.name,
      hospital.email,
      hospital.phone,
      hospital.emergencyContact,
      hospital.website || null,
      hospital.image,
      hospital.registrationNo,
      hospital.hospitalType,
      hospital.totalBeds,
      hospital.address,
      hospital.city,
      hospital.opdTimings,
      hospital.about,
      hospital.rating,
      hospital.isApproved,
      hospital.isSubscribed,
    ]
  );
  const hospitalId = result.insertId;
  await replaceChildRows(pool, 'hospital_departments', 'hospital_id', hospitalId, 'department', hospital.departments);
  await replaceChildRows(pool, 'hospital_facilities', 'hospital_id', hospitalId, 'facility', hospital.facilities);
  await replaceChildRows(pool, 'hospital_accreditations', 'hospital_id', hospitalId, 'accreditation', hospital.accreditations);
  return hospitalId;
}

async function ensureDoctor(pool, doctor) {
  const [existing] = await pool.execute('SELECT id FROM doctors WHERE email = ?', [doctor.email]);
  const userId = await ensureEntityUser(pool, 'doctor', doctor.name, doctor.email);
  const [hospitalRows] = await pool.execute('SELECT id, name FROM hospitals WHERE email = ?', [doctor.hospitalEmail]);
  const linkedHospital = hospitalRows[0] || null;

  if (existing.length) {
    const id = existing[0].id;
    await replaceChildRows(pool, 'doctor_availability', 'doctor_id', id, 'day', doctor.availability);
    await replaceChildRows(pool, 'doctor_languages', 'doctor_id', id, 'language', doctor.languages);
    await replaceChildRows(pool, 'doctor_services', 'doctor_id', id, 'service', doctor.services);
    await replaceChildRows(pool, 'doctor_awards', 'doctor_id', id, 'award', doctor.awards);
    if (linkedHospital) {
      await pool.execute('INSERT IGNORE INTO hospital_doctors (hospital_id, doctor_id) VALUES (?, ?)', [linkedHospital.id, id]);
    }
    return id;
  }

  const [result] = await pool.execute(
    `INSERT INTO doctors
      (user_id, name, email, phone, gender, photo, registration_no, qualification, speciality, experience_years, hospital_name, clinic_address, city, area, consultation_fee, consultation_type, opd_timings, bio, rating, is_approved, is_subscribed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      doctor.name,
      doctor.email,
      doctor.phone,
      doctor.gender,
      doctor.photo,
      doctor.registrationNo,
      doctor.qualification,
      doctor.speciality,
      doctor.experienceYears,
      linkedHospital ? linkedHospital.name : null,
      doctor.clinicAddress,
      doctor.city,
      doctor.area,
      doctor.consultationFee,
      doctor.consultationType,
      doctor.opdTimings,
      doctor.bio,
      doctor.rating,
      doctor.isApproved,
      doctor.isSubscribed,
    ]
  );
  const doctorId = result.insertId;
  await replaceChildRows(pool, 'doctor_availability', 'doctor_id', doctorId, 'day', doctor.availability);
  await replaceChildRows(pool, 'doctor_languages', 'doctor_id', doctorId, 'language', doctor.languages);
  await replaceChildRows(pool, 'doctor_services', 'doctor_id', doctorId, 'service', doctor.services);
  await replaceChildRows(pool, 'doctor_awards', 'doctor_id', doctorId, 'award', doctor.awards);
  if (linkedHospital) {
    await pool.execute('INSERT IGNORE INTO hospital_doctors (hospital_id, doctor_id) VALUES (?, ?)', [linkedHospital.id, doctorId]);
  }
  return doctorId;
}

async function ensureLeadSeed(pool) {
  const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM leads');
  if (rows[0].count > 0) return;

  const [consultantRows] = await pool.execute("SELECT id FROM users WHERE role = 'consultant' LIMIT 1");
  const consultantId = consultantRows[0] ? consultantRows[0].id : null;

  await pool.execute(
    `INSERT INTO leads
      (patient_name, patient_age, patient_gender, patient_phone, patient_whatsapp, patient_email, patient_city, patient_area, main_problem, symptoms, duration, preferred_speciality, preferred_location, budget_range, preferred_doctor_gender, preferred_hospital, preferred_datetime, status, assigned_consultant_id, patient_disclaimer, data_consent, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Sahil Sharma',
      29,
      'Male',
      '+91 98765 43299',
      '+91 98765 43299',
      'sahil.sharma@example.com',
      'Delhi',
      'Connaught Place',
      'Severe chest pain and shortness of breath',
      'Pain radiating to left shoulder on exertion',
      'Last 10 days',
      'Cardiology',
      'Delhi',
      'Medium',
      'Male',
      'Apollo Hospital Indraprastha',
      '2026-07-10 afternoon',
      'Doctor Suggested',
      consultantId,
      1,
      1,
      'High',
    ]
  );
}

async function ensureAppointmentSeed(pool) {
  const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM appointments');
  if (rows[0].count > 0) return;
  const [doctorRows] = await pool.execute("SELECT id FROM doctors WHERE email = 'ramesh.kumar@indiacare.com' LIMIT 1");
  const [hospitalRows] = await pool.execute("SELECT id FROM hospitals WHERE email = 'contact@apollo-delhi.com' LIMIT 1");
  const doctorId = doctorRows[0] ? doctorRows[0].id : null;
  const hospitalId = hospitalRows[0] ? hospitalRows[0].id : null;
  await pool.execute(
    `INSERT INTO appointments
      (patient_name, patient_phone, patient_email, doctor_id, hospital_id, appointment_date, time_slot, concern, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Rahul Sharma',
      '+91 98110 12345',
      'rahul@example.com',
      doctorId,
      hospitalId,
      '2026-07-03',
      '10:30 AM',
      'Chest pain evaluation',
      'Confirmed',
    ]
  );
}

async function ensureSeedData() {
  const pool = getPool();
  for (const user of demoUsers) {
    await ensureUser(pool, user);
  }
  for (const hospital of hospitalSeeds) {
    await ensureHospital(pool, hospital);
  }
  for (const doctor of doctorSeeds) {
    await ensureDoctor(pool, doctor);
  }
  await ensureLeadSeed(pool);
  await ensureAppointmentSeed(pool);
}

module.exports = { ensureSeedData };
