import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId?: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  speciality: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  status: 'Pending' | 'Confirmed' | 'Rescheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  consultantId?: mongoose.Types.ObjectId;
  patientUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AppointmentSchema: Schema = new Schema({
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  patientEmail: { type: String, required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
  speciality: { type: String, required: true },
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled'],
    default: 'Pending',
    index: true,
  },
  notes: { type: String },
  consultantId: { type: Schema.Types.ObjectId, ref: 'User' },
  patientUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
