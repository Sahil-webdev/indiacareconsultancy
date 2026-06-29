const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name:                     { type: String, required: true },
  email:                    { type: String, required: true, unique: true },
  phone:                    { type: String, required: true },
  photo:                    { type: String, default: '/doctors/default-doctor.jpg' },
  medicalRegistrationNumber:{ type: String, required: true },
  qualification:            { type: String, required: true },
  speciality:               { type: String, required: true, index: true },
  experience:               { type: Number, required: true },
  clinicAddress:            { type: String, required: true },
  consultationFee:          { type: Number, required: true },
  location:                 { type: String, required: true, index: true },
  area:                     { type: String, required: true },
  rating:                   { type: Number, default: 4.5 },
  gender:                   { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  availability:             [{ type: String }],
  consultationType:         { type: String, enum: ['Online', 'Offline', 'Both'], default: 'Both' },
  isApproved:               { type: Boolean, default: false },
  subscriptionPlan:         { type: String, enum: ['Basic', 'Premium', 'Elite'], default: 'Basic' },
  userId:                   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bio:                      { type: String },
  languages:                [{ type: String }],
  services:                 [{ type: String }],
  awards:                   [{ type: String }],
  createdAt:                { type: Date, default: Date.now },
});

module.exports = mongoose.model('Doctor', DoctorSchema);
