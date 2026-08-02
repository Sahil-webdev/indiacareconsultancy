export interface SiteDoctor {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  medicalRegistrationNumber: string;
  qualification: string;
  speciality: string;
  experience: number;
  clinicAddress: string;
  googleMapsLink?: string;
  consultationFee: number;
  location: string;
  area: string;
  rating: number;
  gender: 'Male' | 'Female' | 'Other' | string;
  availability: string[];
  availabilitySchedule?: Record<string, string[]>;
  consultationType: 'Online' | 'Offline' | 'Both' | string;
  opdTimings?: string;
  isApproved: boolean;
  isSubscribed?: boolean;
  subscriptionPlan: 'Basic' | 'Premium' | 'Elite';
  bio: string;
  languages: string[];
  services: string[];
  awards: string[];
  experienceTimeline?: {
    years: string;
    role: string;
    place: string;
    desc: string;
  }[];
  hospitalId?: string;
  hospitalName?: string;
}

export interface SiteHospitalDoctorOption {
  id: string;
  name: string;
  speciality: string;
}

export interface SiteHospital {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  registrationDetails: string;
  address: string;
  googleMapsLink?: string;
  location: string;
  rating: number;
  hospitalType?: string;
  totalBeds?: number;
  departments: string[];
  facilities: string[];
  accreditations?: string[];
  isApproved: boolean;
  isSubscribed?: boolean;
  subscriptionPlan: 'Basic' | 'Premium';
  opdTimings: string;
  emergencyContact: string;
  gallery: string[];
  about?: string;
  doctors?: string[];
  affiliatedDoctors?: SiteHospitalDoctorOption[];
}
