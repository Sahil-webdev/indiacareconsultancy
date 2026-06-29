const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  name:                { type: String, required: true },
  email:               { type: String, required: true, unique: true },
  phone:               { type: String, required: true },
  image:               { type: String, default: '/hospitals/default-hospital.jpg' },
  registrationDetails: { type: String, required: true },
  address:             { type: String, required: true },
  location:            { type: String, required: true, index: true },
  rating:              { type: Number, default: 4.5 },
  departments:         [{ type: String }],
  facilities:          [{ type: String }],
  isApproved:          { type: Boolean, default: false },
  subscriptionPlan:    { type: String, enum: ['Basic', 'Premium'], default: 'Basic' },
  userId:              { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctors:             [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  opdTimings:          { type: String, default: '9:00 AM - 6:00 PM' },
  emergencyContact:    { type: String },
  gallery:             [{ type: String }],
  createdAt:           { type: Date, default: Date.now },
});

module.exports = mongoose.model('Hospital', HospitalSchema);
