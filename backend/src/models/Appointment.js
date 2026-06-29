const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientName:     { type: String, required: true },
  patientPhone:    { type: String, required: true },
  patientEmail:    { type: String },
  doctorId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  hospitalId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  appointmentDate: { type: Date, required: true },
  timeSlot:        { type: String, required: true },
  concern:         { type: String },
  status:          { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  createdAt:       { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
