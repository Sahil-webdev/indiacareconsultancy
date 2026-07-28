const { boolFromDb, parseJson } = require('./mysqlUtils');
const { buildAvailabilitySchedule } = require('./doctorAvailability');

function formatDoctor(row) {
  const isActive = boolFromDb(row.account_is_active ?? 1);
  const isApproved = boolFromDb(row.is_approved);
  const approvalStatus = isApproved ? 'approved' : (isActive ? 'pending' : 'rejected');
  const availability = parseJson(row.availability, []);
  const availabilitySchedule = buildAvailabilitySchedule({
    availability,
    availabilitySchedule: parseJson(row.availability_schedule, null),
    opdTimings: row.opd_timings || '',
  });
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    name: row.name,
    email: row.email,
    phone: row.phone,
    photo: row.photo,
    medicalRegistrationNumber: row.registration_no,
    qualification: row.qualification,
    speciality: row.speciality,
    experience: Number(row.experience_years || 0),
    clinicAddress: row.clinic_address,
    googleMapsLink: row.google_maps_link || '',
    consultationFee: Number(row.consultation_fee || 0),
    location: row.city,
    city: row.city,
    area: row.area,
    rating: Number(row.rating || 0),
    gender: row.gender,
    availability,
    availabilitySchedule,
    consultationType: row.consultation_type,
    isApproved,
    isSubscribed: boolFromDb(row.is_subscribed),
    isActive,
    approvalStatus,
    subscriptionEndsAt: row.subscription_ends_at,
    subscriptionPaidAt: row.subscription_paid_at,
    bio: row.bio || '',
    languages: parseJson(row.languages, []),
    services: parseJson(row.services, []),
    awards: parseJson(row.awards, []),
    hospitalName: row.hospital_name || '',
    opdTimings: row.opd_timings || '',
    experienceTimeline: parseJson(row.experience_timeline, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pendingChangeRequests: Number(row.pending_change_requests || 0),
  };
}

function formatHospital(row) {
  const isActive = boolFromDb(row.account_is_active ?? 1);
  const isApproved = boolFromDb(row.is_approved);
  const approvalStatus = isApproved ? 'approved' : (isActive ? 'pending' : 'rejected');
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    name: row.name,
    email: row.email,
    phone: row.phone,
    emergencyContact: row.emergency_contact || '',
    website: row.website || '',
    image: row.image,
    registrationDetails: row.registration_no,
    hospitalType: row.hospital_type,
    address: row.address,
    location: row.city,
    city: row.city,
    rating: Number(row.rating || 0),
    departments: parseJson(row.departments, []),
    facilities: parseJson(row.facilities, []),
    accreditations: parseJson(row.accreditations, []),
    isApproved,
    isSubscribed: boolFromDb(row.is_subscribed),
    isActive,
    approvalStatus,
    subscriptionEndsAt: row.subscription_ends_at,
    subscriptionPaidAt: row.subscription_paid_at,
    opdTimings: row.opd_timings || '',
    gallery: parseJson(row.gallery, []),
    about: row.about || '',
    totalBeds: Number(row.total_beds || 0),
    doctorCount: Number(row.doctor_count || 0),
    pendingChangeRequests: Number(row.pending_change_requests || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = {
  formatDoctor,
  formatHospital,
};
