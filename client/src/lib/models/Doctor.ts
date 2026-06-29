import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  email: string;
  phone: string;
  photo: string;
  medicalRegistrationNumber: string;
  qualification: string;
  speciality: string;
  experience: number; // in years
  clinicAddress: string;
  consultationFee: number;
  location: string;
  area: string;
  rating: number;
  gender: 'Male' | 'Female' | 'Other';
  availability: string[]; // e.g. ['Mon', 'Wed', 'Fri']
  consultationType: 'Online' | 'Offline' | 'Both';
  isApproved: boolean;
  subscriptionPlan: 'Basic' | 'Premium' | 'Elite';
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  bio?: string;
  languages?: string[];
  services?: string[];
  awards?: string[];
}

const DoctorSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  photo: { type: String, default: '/doctors/default-doctor.jpg' },
  medicalRegistrationNumber: { type: String, required: true },
  qualification: { type: String, required: true },
  speciality: { type: String, required: true, index: true },
  experience: { type: Number, required: true },
  clinicAddress: { type: String, required: true },
  consultationFee: { type: Number, required: true },
  location: { type: String, required: true, index: true },
  area: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  availability: [{ type: String }],
  consultationType: { type: String, enum: ['Online', 'Offline', 'Both'], default: 'Both' },
  isApproved: { type: Boolean, default: false },
  subscriptionPlan: { type: String, enum: ['Basic', 'Premium', 'Elite'], default: 'Basic' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  bio: { type: String },
  languages: [{ type: String }],
  services: [{ type: String }],
  awards: [{ type: String }],
});

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
