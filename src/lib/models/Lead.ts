import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadNote {
  note: string;
  author: string;
  createdAt: Date;
}

export interface ILead extends Document {
  patientDetails: {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    phone: string;
    whatsappNumber: string;
    email: string;
    city: string;
    area: string;
  };
  healthConcern: {
    mainProblem: string;
    symptoms: string;
    duration: string;
    preferredSpeciality: string;
    reports?: string[]; // array of report file paths
  };
  preferences: {
    preferredLocation: string;
    budgetRange: string;
    preferredDoctorGender: 'Male' | 'Female' | 'Any';
    preferredHospitalClinic?: string;
    preferredDateTime: string;
  };
  consent: {
    patientDisclaimerConsent: boolean;
    dataConsent: boolean;
  };
  status: 'New' | 'Contacted' | 'Need More Details' | 'Doctor Suggested' | 'Appointment Pending' | 'Converted' | 'Lost';
  assignedConsultantId?: mongoose.Types.ObjectId;
  recommendedDoctors: mongoose.Types.ObjectId[];
  recommendedHospitals: mongoose.Types.ObjectId[];
  followUpNotes: ILeadNote[];
  createdAt: Date;
}

const LeadNoteSchema = new Schema({
  note: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const LeadSchema: Schema = new Schema({
  patientDetails: {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
  },
  healthConcern: {
    mainProblem: { type: String, required: true },
    symptoms: { type: String, required: true },
    duration: { type: String, required: true },
    preferredSpeciality: { type: String, required: true },
    reports: [{ type: String }],
  },
  preferences: {
    preferredLocation: { type: String, required: true },
    budgetRange: { type: String, required: true },
    preferredDoctorGender: { type: String, enum: ['Male', 'Female', 'Any'], default: 'Any' },
    preferredHospitalClinic: { type: String },
    preferredDateTime: { type: String, required: true },
  },
  consent: {
    patientDisclaimerConsent: { type: Boolean, required: true },
    dataConsent: { type: Boolean, required: true },
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Need More Details', 'Doctor Suggested', 'Appointment Pending', 'Converted', 'Lost'],
    default: 'New',
    index: true,
  },
  assignedConsultantId: { type: Schema.Types.ObjectId, ref: 'User' },
  recommendedDoctors: [{ type: Schema.Types.ObjectId, ref: 'Doctor' }],
  recommendedHospitals: [{ type: Schema.Types.ObjectId, ref: 'Hospital' }],
  followUpNotes: [LeadNoteSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
