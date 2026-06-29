import mongoose, { Schema, Document } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  email: string;
  phone: string;
  image: string;
  registrationDetails: string;
  address: string;
  location: string;
  rating: number;
  departments: string[]; // e.g. ['Cardiology', 'Neurology']
  facilities: string[]; // e.g. ['ICU', '24/7 Emergency', 'Pharmacy']
  isApproved: boolean;
  subscriptionPlan: 'Basic' | 'Premium';
  userId: mongoose.Types.ObjectId;
  doctors: mongoose.Types.ObjectId[]; // list of linked doctor IDs
  createdAt: Date;
  opdTimings?: string;
  emergencyContact?: string;
  gallery?: string[];
}

const HospitalSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  image: { type: String, default: '/hospitals/default-hospital.jpg' },
  registrationDetails: { type: String, required: true },
  address: { type: String, required: true },
  location: { type: String, required: true, index: true },
  rating: { type: Number, default: 4.5 },
  departments: [{ type: String }],
  facilities: [{ type: String }],
  isApproved: { type: Boolean, default: false },
  subscriptionPlan: { type: String, enum: ['Basic', 'Premium'], default: 'Basic' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  doctors: [{ type: Schema.Types.ObjectId, ref: 'Doctor' }],
  createdAt: { type: Date, default: Date.now },
  opdTimings: { type: String, default: '9:00 AM - 6:00 PM' },
  emergencyContact: { type: String },
  gallery: [{ type: String }],
});

export default mongoose.models.Hospital || mongoose.model<IHospital>('Hospital', HospitalSchema);
