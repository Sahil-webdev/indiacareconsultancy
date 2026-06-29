const mongoose = require('mongoose');

const LeadNoteSchema = new mongoose.Schema({
  note:      { type: String, required: true },
  author:    { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const LeadSchema = new mongoose.Schema({
  patientDetails: {
    name:           { type: String, required: true },
    age:            { type: Number, required: true },
    gender:         { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone:          { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    email:          { type: String, required: true },
    city:           { type: String, required: true },
    area:           { type: String, required: true },
  },
  healthConcern: {
    mainProblem:          { type: String, required: true },
    symptoms:             { type: String, required: true },
    duration:             { type: String, required: true },
    preferredSpeciality:  { type: String, required: true },
    reports:              [{ type: String }],
  },
  preferences: {
    preferredLocation:       { type: String, required: true },
    budgetRange:             { type: String, required: true },
    preferredDoctorGender:   { type: String, enum: ['Male', 'Female', 'Any'], default: 'Any' },
    preferredHospitalClinic: { type: String },
    preferredDateTime:       { type: String, required: true },
  },
  consent: {
    patientDisclaimerConsent: { type: Boolean, required: true },
    dataConsent:              { type: Boolean, required: true },
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Need More Details', 'Doctor Suggested', 'Appointment Pending', 'Converted', 'Lost'],
    default: 'New',
    index: true,
  },
  assignedConsultantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recommendedDoctors:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  recommendedHospitals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' }],
  followUpNotes:        [LeadNoteSchema],
  createdAt:            { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lead', LeadSchema);
