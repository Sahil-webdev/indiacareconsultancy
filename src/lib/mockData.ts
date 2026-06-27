export interface DoctorMock {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  medicalRegistrationNumber: string;
  qualification: string;
  speciality: string;
  experience: number;
  clinicAddress: string;
  consultationFee: number;
  location: string;
  area: string;
  rating: number;
  gender: 'Male' | 'Female' | 'Other';
  availability: string[];
  consultationType: 'Online' | 'Offline' | 'Both';
  isApproved: boolean;
  subscriptionPlan: 'Basic' | 'Premium' | 'Elite';
  bio: string;
  languages: string[];
  services: string[];
  awards: string[];
  hospitalId?: string;
  userId?: string;
}

export interface HospitalMock {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  registrationDetails: string;
  address: string;
  location: string;
  rating: number;
  departments: string[];
  facilities: string[];
  isApproved: boolean;
  subscriptionPlan: 'Basic' | 'Premium';
  opdTimings: string;
  emergencyContact: string;
  gallery: string[];
  userId?: string;
  doctors?: string[];
}

export interface BlogMock {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  readTime: string;
  author: string;
  date: string;
}

export interface LeadMock {
  id: string;
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
    reports?: string[];
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
  assignedConsultantId?: string;
  recommendedDoctors: string[]; // Doctor IDs
  recommendedHospitals: string[]; // Hospital IDs
  followUpNotes: { note: string; author: string; createdAt: string }[];
  createdAt: string;
}

export interface AppointmentMock {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId?: string;
  hospitalId?: string;
  speciality: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'Pending' | 'Confirmed' | 'Rescheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  consultantId?: string;
  patientUserId?: string;
  createdAt: string;
}

export interface UserMock {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'hospital' | 'consultant' | 'admin';
  createdAt: string;
}

// ----------------------------------------------------
// INITIAL SEED DATA
// ----------------------------------------------------

export const INITIAL_SPECIALITIES = [
  { slug: 'cardiology', title: 'Cardiology', icon: 'Heart', desc: 'Heart care, bypass, angiography, valve repair, and cardiovascular health.' },
  { slug: 'neurology', title: 'Neurology', icon: 'Brain', desc: 'Brain, nervous system, stroke management, headaches, and nerve disorders.' },
  { slug: 'orthopedics', title: 'Orthopedic', icon: 'Bone', desc: 'Bone, joint replacements, fractures, arthritis care, and spine surgeries.' },
  { slug: 'dermatology', title: 'Dermatology', icon: 'Sparkles', desc: 'Skin, hair, nails, acne treatments, anti-aging, and skin surgeries.' },
  { slug: 'gynecology', title: 'Gynecology', icon: 'Baby', desc: 'Women health, pregnancy support, prenatal care, and reproductive health.' },
  { slug: 'pediatrics', title: 'Pediatrics', icon: 'Smile', desc: 'Child health care, vaccinations, growth monitoring, and pediatric diseases.' },
  { slug: 'dentistry', title: 'Dentist', icon: 'Activity', desc: 'Teeth cleaning, root canal treatments, crowns, implants, and orthodontics.' },
  { slug: 'ent', title: 'ENT', icon: 'Ear', desc: 'Ear, nose, throat treatments, sinus issues, hearing loss, and tonsillitis.' },
  { slug: 'urology', title: 'Urology', icon: 'ShieldAlert', desc: 'Kidney stones, urinary tract infections, and male reproductive system.' },
  { slug: 'gastroenterology', title: 'Gastroenterology', icon: 'Flame', desc: 'Digestive tract diseases, stomach disorders, endoscopy, and liver care.' },
];

export const INITIAL_DOCTORS: DoctorMock[] = [
  {
    id: 'doc_1',
    name: 'Dr. Ramesh Kumar',
    email: 'ramesh.kumar@indiacare.com',
    phone: '+91 98765 43210',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    medicalRegistrationNumber: 'MCI-34521',
    qualification: 'MD, DM (Cardiology)',
    speciality: 'Cardiology',
    experience: 18,
    clinicAddress: 'Heart Care Center, Connaught Place, New Delhi',
    consultationFee: 1500,
    location: 'Delhi',
    area: 'Connaught Place',
    rating: 4.9,
    gender: 'Male',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    consultationType: 'Both',
    isApproved: true,
    subscriptionPlan: 'Elite',
    bio: 'Dr. Ramesh Kumar is a pioneer in interventional cardiology with over 18 years of experience in performing complex angioplasties and pacemaker implantations. He is dedicated to compassionate patient care.',
    languages: ['English', 'Hindi', 'Punjabi'],
    services: ['Coronary Angioplasty', 'Heart Failure Management', 'Pacemaker Implantation', 'Echocardiogram (ECHO)'],
    awards: ['Best Cardiologist Award 2024 (IMA)', 'Dr. BC Roy National Award (2021)'],
    hospitalId: 'hosp_1',
  },
  {
    id: 'doc_2',
    name: 'Dr. Sunita Sharma',
    email: 'sunita.sharma@indiacare.com',
    phone: '+91 98765 43211',
    photo: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400',
    medicalRegistrationNumber: 'MCI-56782',
    qualification: 'MD, DNB (Neurology)',
    speciality: 'Neurology',
    experience: 14,
    clinicAddress: 'Brain & Spine Clinic, Sector 62, Noida',
    consultationFee: 1200,
    location: 'Noida',
    area: 'Sector 62',
    rating: 4.8,
    gender: 'Female',
    availability: ['Mon', 'Wed', 'Fri'],
    consultationType: 'Both',
    isApproved: true,
    subscriptionPlan: 'Premium',
    bio: 'Dr. Sunita Sharma specializes in stroke management, epilepsy treatments, and neuro-immunological disorders. She runs an advanced epilepsy clinic.',
    languages: ['English', 'Hindi'],
    services: ['Stroke Rehabilitation', 'Epilepsy Treatment', 'Migraine Management', 'EEG & EMG Testing'],
    awards: ['Neuro Science Research Fellow - AIIMS', 'Distinguished Service Award (2023)'],
    hospitalId: 'hosp_2',
  },
  {
    id: 'doc_3',
    name: 'Dr. Amit Patel',
    email: 'amit.patel@indiacare.com',
    phone: '+91 98765 43212',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    medicalRegistrationNumber: 'MCI-29471',
    qualification: 'MS (Orthopedics), M.Ch (Joint Replacement)',
    speciality: 'Orthopedic',
    experience: 15,
    clinicAddress: 'Orthofit Clinic, Bandra West, Mumbai',
    consultationFee: 1000,
    location: 'Mumbai',
    area: 'Bandra West',
    rating: 4.7,
    gender: 'Male',
    availability: ['Tue', 'Thu', 'Sat'],
    consultationType: 'Offline',
    isApproved: true,
    subscriptionPlan: 'Premium',
    bio: 'Dr. Amit Patel is a renowned Joint Replacement surgeon specializing in robotic knee and hip replacements. He has successfully completed over 3,000 joint surgeries.',
    languages: ['English', 'Hindi', 'Gujarati', 'Marathi'],
    services: ['Robotic Knee Replacement', 'Total Hip Replacement', 'Arthroscopic Ligament Reconstruction', 'Fracture Care'],
    awards: ['Rising Star in Orthopedics (2022)', 'Best Paper Award on Arthroplasty (2020)'],
    hospitalId: 'hosp_3',
  },
  {
    id: 'doc_4',
    name: 'Dr. Meera Nair',
    email: 'meera.nair@indiacare.com',
    phone: '+91 98765 43213',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    medicalRegistrationNumber: 'MCI-73620',
    qualification: 'MD (Dermatology)',
    speciality: 'Dermatology',
    experience: 9,
    clinicAddress: 'Skin & Aesthetics Studio, Indiranagar, Bengaluru',
    consultationFee: 800,
    location: 'Bengaluru',
    area: 'Indiranagar',
    rating: 4.6,
    gender: 'Female',
    availability: ['Mon', 'Tue', 'Thu', 'Fri'],
    consultationType: 'Online',
    isApproved: true,
    subscriptionPlan: 'Basic',
    bio: 'Dr. Meera Nair offers complete skin, hair, and anti-aging treatments. She is an expert in lasers, chemical peels, and scar revision.',
    languages: ['English', 'Malayalam', 'Kannada', 'Hindi'],
    services: ['Laser Hair Removal', 'Chemical Peels', 'Acne Scar Revision', 'Anti-Aging Therapy'],
    awards: ['Best Aesthetic Dermatologist (South) 2023'],
    hospitalId: 'hosp_4',
  },
  {
    id: 'doc_5',
    name: 'Dr. Rajesh Verma',
    email: 'rajesh.verma@indiacare.com',
    phone: '+91 98765 43214',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    medicalRegistrationNumber: 'MCI-19462',
    qualification: 'MD (Pediatrics)',
    speciality: 'Pediatrics',
    experience: 12,
    clinicAddress: 'Kids Clinic, Sector 15, Gurugram',
    consultationFee: 700,
    location: 'Gurugram',
    area: 'Sector 15',
    rating: 4.8,
    gender: 'Male',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    consultationType: 'Both',
    isApproved: true,
    subscriptionPlan: 'Basic',
    bio: 'Dr. Rajesh Verma has over 12 years of experience caring for children from infancy through adolescence. He believes in minimal medication and preventive child health.',
    languages: ['English', 'Hindi'],
    services: ['Childhood Vaccination', 'Growth & Nutrition Counseling', 'Pediatric Asthma Care', 'Newborn Care'],
    awards: ['Child Health Champion (2021)'],
    hospitalId: 'hosp_1',
  },
  {
    id: 'doc_6',
    name: 'Dr. Neha Gupta',
    email: 'neha.gupta@indiacare.com',
    phone: '+91 98765 43215',
    photo: 'https://images.unsplash.com/photo-1623854767648-e7bb8c5f478e?auto=format&fit=crop&q=80&w=400',
    medicalRegistrationNumber: 'MCI-84729',
    qualification: 'MS (Obstetrics & Gynecology)',
    speciality: 'Gynecology',
    experience: 16,
    clinicAddress: 'Motherhood Clinic, Salt Lake, Kolkata',
    consultationFee: 1100,
    location: 'Kolkata',
    area: 'Salt Lake',
    rating: 4.9,
    gender: 'Female',
    availability: ['Mon', 'Tue', 'Thu', 'Fri'],
    consultationType: 'Both',
    isApproved: true,
    subscriptionPlan: 'Elite',
    bio: 'Dr. Neha Gupta is a leading obstetrician and laparoscopic surgeon. She specializes in high-risk pregnancy management, PCOS counseling, and keyhole gynecological surgeries.',
    languages: ['English', 'Bengali', 'Hindi'],
    services: ['High-Risk Pregnancy Management', 'Laparoscopic Hysterectomy', 'PCOS & Fertility Counseling', 'Painless Delivery Support'],
    awards: ['Kolkata Women Empowerment Icon 2023', 'Excellence in Laparoscopy Award'],
    hospitalId: 'hosp_2',
  },
  {
    id: 'doc_7',
    name: 'Dr. Sanjay Gupta',
    email: 'sanjay.gupta@indiacare.com',
    phone: '+91 98765 43216',
    photo: 'https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&q=80&w=400',
    medicalRegistrationNumber: 'MCI-93820',
    qualification: 'MDS (Orthodontics & Dentofacial Orthopedics)',
    speciality: 'Dentist',
    experience: 10,
    clinicAddress: 'Dental Elite, Gachibowli, Hyderabad',
    consultationFee: 500,
    location: 'Hyderabad',
    area: 'Gachibowli',
    rating: 4.7,
    gender: 'Male',
    availability: ['Mon', 'Wed', 'Fri', 'Sat'],
    consultationType: 'Offline',
    isApproved: true,
    subscriptionPlan: 'Basic',
    bio: 'Dr. Sanjay Gupta specializes in smile makeovers, dental implants, and invisible aligners. He uses state-of-the-art 3D imaging for treatment design.',
    languages: ['English', 'Telugu', 'Hindi'],
    services: ['Smile Design & Veneers', 'Dental Implants', 'Invisalign Aligners', 'Root Canal Treatment'],
    awards: ['Best Young Dentist Award (South-East)', 'Fellow of International College of Dentists'],
    hospitalId: 'hosp_3',
  },
  {
    id: 'doc_8',
    name: 'Dr. Vikranth Reddy',
    email: 'vikranth.reddy@indiacare.com',
    phone: '+91 98765 43217',
    photo: 'https://images.unsplash.com/photo-1582969306434-20ad64d79bf5?auto=format&fit=crop&q=80&w=400',
    medicalRegistrationNumber: 'MCI-30491',
    qualification: 'MS (ENT)',
    speciality: 'ENT',
    experience: 11,
    clinicAddress: 'Ear, Nose & Throat Clinic, Adyar, Chennai',
    consultationFee: 800,
    location: 'Chennai',
    area: 'Adyar',
    rating: 4.6,
    gender: 'Male',
    availability: ['Tue', 'Thu', 'Sat'],
    consultationType: 'Both',
    isApproved: true,
    subscriptionPlan: 'Basic',
    bio: 'Dr. Vikranth Reddy is an expert in snoring therapy, endoscopic sinus surgeries, and middle ear micro-surgeries. He focuses on long-term allergy management.',
    languages: ['English', 'Tamil', 'Telugu'],
    services: ['Endoscopic Sinus Surgery', 'Snoring & Sleep Apnea Therapy', 'Hearing Loss Treatment', 'Tympanoplasty'],
    awards: ['Rising ENT Specialist Award (2022)'],
    hospitalId: 'hosp_4',
  }
];

export const INITIAL_HOSPITALS: HospitalMock[] = [
  {
    id: 'hosp_1',
    name: 'Apollo Hospital Indraprastha',
    email: 'contact@apollo-delhi.com',
    phone: '+91 11 7179 1090',
    image: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e963?auto=format&fit=crop&q=80&w=800',
    registrationDetails: 'DL-HOSP-20948',
    address: 'Mathura Road, Sarita Vihar, New Delhi',
    location: 'Delhi',
    rating: 4.8,
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Gastroenterology'],
    facilities: ['ICU (100+ Beds)', '24/7 Emergency', 'Pharmacy', 'Robotic Surgery', 'Blood Bank', 'Organ Transplant'],
    isApproved: true,
    subscriptionPlan: 'Premium',
    opdTimings: '8:00 AM - 8:00 PM',
    emergencyContact: '+91 11 1066',
    gallery: [
      'https://images.unsplash.com/photo-1586773860418-d3b3de97e963?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'hosp_2',
    name: 'Fortis Memorial Research Institute',
    email: 'contact@fortis-gurgaon.com',
    phone: '+91 124 716 2200',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    registrationDetails: 'HR-HOSP-58291',
    address: 'Sector 44, opposite HUDA City Centre, Gurugram',
    location: 'Gurugram',
    rating: 4.7,
    departments: ['Neurology', 'Cardiology', 'Gynecology', 'Urology', 'Nephrology', 'Dermatology'],
    facilities: ['ICU', '24/7 Trauma Care', 'Dialysis Unit', 'In-house MRI/CT Scan', 'Cafeteria', 'Ambulance service'],
    isApproved: true,
    subscriptionPlan: 'Premium',
    opdTimings: '9:00 AM - 7:00 PM',
    emergencyContact: '+91 124 105010',
    gallery: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'hosp_3',
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    email: 'info@kdah.com',
    phone: '+91 22 4269 6969',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    registrationDetails: 'MH-HOSP-12847',
    address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai',
    location: 'Mumbai',
    rating: 4.9,
    departments: ['Orthopedics', 'Cardiology', 'Neurology', 'Dentist', 'ENT', 'Pediatrics'],
    facilities: ['Full-time Specialists System', 'Level 1 Trauma Center', 'Intelligent ICU', 'Rehabilitation Center', 'Free Wi-Fi'],
    isApproved: true,
    subscriptionPlan: 'Premium',
    opdTimings: '9:00 AM - 5:00 PM',
    emergencyContact: '+91 22 1052',
    gallery: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1538108176447-280586497d96?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'hosp_4',
    name: 'Manipal Hospital Hal Airport Road',
    email: 'info@manipalhospitals.com',
    phone: '+91 80 2502 4444',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
    registrationDetails: 'KA-HOSP-94812',
    address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru',
    location: 'Bengaluru',
    rating: 4.6,
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Gastroenterology', 'Gynecology'],
    facilities: ['24/7 Cardiac Emergency', 'Intensive Care Unit (ICU)', 'Chemotherapy Unit', 'Valet Parking', 'Diagnostic Labs'],
    isApproved: true,
    subscriptionPlan: 'Basic',
    opdTimings: '8:30 AM - 6:30 PM',
    emergencyContact: '+91 80 2525 6666',
    gallery: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

export const INITIAL_BLOGS: BlogMock[] = [
  {
    id: 'blog_1',
    title: 'Understanding Heart Failure: Symptoms, Causes, and Care Options',
    slug: 'understanding-heart-failure',
    excerpt: 'Heart failure does not mean your heart has stopped working. Learn what it actually is, how to spot the signs early, and modern medical treatments.',
    content: 'Heart failure is a chronic, progressive condition in which the heart muscle is unable to pump enough blood to meet the body\'s needs for blood and oxygen. Essentially, the heart can\'t keep up with its workload. \n\n### Symptoms of Heart Failure\n- Shortness of breath during activities or even while lying flat.\n- Persistent coughing or wheezing.\n- Swelling in the legs, ankles, or feet (edema) due to fluid retention.\n- Fatigue and weakness.\n- Rapid or irregular heartbeat.\n\n### Treatment and Consultation\nEarly diagnosis and medical consultation with a certified cardiologist are key. Modern therapies, including lifestyle adjustments, medications (beta-blockers, ACE inhibitors), and sometimes surgical procedures, help patients live full and active lives. At India Care Consultancy, we guide you to the leading cardiologists and specialized hospitals that offer comprehensive heart failure rehabilitation programs.',
    category: 'Cardiology',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
    readTime: '5 min read',
    author: 'Dr. Ramesh Kumar',
    date: 'June 10, 2026'
  },
  {
    id: 'blog_2',
    title: 'A Guide to Managing Chronic Migraines & Knowing When to See a Neurologist',
    slug: 'guide-managing-chronic-migraines',
    excerpt: 'Migraines are more than just bad headaches. Discover the neurological causes, triggers, preventive measures, and advanced therapies.',
    content: 'Migraine is a complex neurological disorder characterized by recurrent, moderate-to-severe headaches, often accompanied by symptoms such as nausea, vomiting, and sensitivity to light or sound. \n\n### Triggers to Watch For\n- Dietary factors (aged cheese, excessive caffeine, processed foods).\n- Hormonal changes in women.\n- Stress, fatigue, and lack of sleep.\n- Environmental triggers (bright lights, strong odors).\n\n### When to Consult a Specialist\nIf you experience more than 15 headache days a month, or if over-the-counter painkillers no longer provide relief, it is time to consult a neurologist. Modern treatments such as Botox injections, CGRP inhibitors, and lifestyle coaching can significantly reduce the frequency and intensity of attacks.',
    category: 'Neurology',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800',
    readTime: '6 min read',
    author: 'Dr. Sunita Sharma',
    date: 'May 28, 2026'
  },
  {
    id: 'blog_3',
    title: 'Top 5 Skincare Myths Debunked by Professional Dermatologists',
    slug: 'top-skincare-myths-debunked',
    excerpt: 'Is hot water good for oily skin? Does drinking water cure acne? Get the facts directly from top board-certified dermatologists.',
    content: 'With so much skincare advice circulating online, it is easy to fall for myths that might do more harm than good to your skin barrier.\n\n### Myth 1: Drinking water will instantly cure dry skin\nWhile staying hydrated is crucial for overall health, drinking extra water does not directly hydrate the outer layer of your skin. Proper topical moisturization with ceramides or hyaluronic acid is necessary to seal in moisture.\n\n### Myth 2: You do not need sunscreen on cloudy days\nUp to 80% of UV rays can pass through clouds. Daily application of a broad-spectrum SPF 30 or higher sunscreen is the single best way to prevent premature aging and skin cancers.\n\n### Myth 3: Oily skin does not need moisturizer\nSkipping moisturizer can actually dehydrate your skin, prompting it to produce even more oil. Opt for oil-free, non-comedogenic gel-based formulas instead.',
    category: 'Dermatology',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800',
    readTime: '4 min read',
    author: 'Dr. Meera Nair',
    date: 'April 15, 2026'
  }
];

export const INITIAL_LEADS: LeadMock[] = [
  {
    id: 'lead_1',
    patientDetails: {
      name: 'Sahil Sharma',
      age: 29,
      gender: 'Male',
      phone: '+91 98765 43299',
      whatsappNumber: '+91 98765 43299',
      email: 'sahil.sharma@example.com',
      city: 'Delhi',
      area: 'Connaught Place',
    },
    healthConcern: {
      mainProblem: 'Severe Chest pain and shortness of breath',
      symptoms: 'Mild pain radiating to left shoulder on walking fast, breathlessness.',
      duration: 'Last 10 days',
      preferredSpeciality: 'Cardiology',
    },
    preferences: {
      preferredLocation: 'Delhi',
      budgetRange: 'Medium',
      preferredDoctorGender: 'Male',
      preferredHospitalClinic: 'Apollo Hospital Indraprastha',
      preferredDateTime: '2026-06-18 afternoon',
    },
    consent: {
      patientDisclaimerConsent: true,
      dataConsent: true,
    },
    status: 'Doctor Suggested',
    assignedConsultantId: 'user_consultant',
    recommendedDoctors: ['doc_1'],
    recommendedHospitals: ['hosp_1'],
    followUpNotes: [
      { note: 'Assigned lead. Contacted patient on call. He requested suggestions.', author: 'Consultant Ramesh', createdAt: '2026-06-14T12:00:00Z' },
      { note: 'Suggested Dr. Ramesh Kumar at Apollo Hospital.', author: 'Consultant Ramesh', createdAt: '2026-06-14T14:30:00Z' }
    ],
    createdAt: '2026-06-14T11:30:00Z'
  },
  {
    id: 'lead_2',
    patientDetails: {
      name: 'Anjali Gupta',
      age: 34,
      gender: 'Female',
      phone: '+91 98765 43298',
      whatsappNumber: '+91 98765 43298',
      email: 'anjali@example.com',
      city: 'Mumbai',
      area: 'Bandra West',
    },
    healthConcern: {
      mainProblem: 'Frequent joint pain and swelling',
      symptoms: 'Knee joints swelling in the morning, difficulty climbing stairs.',
      duration: 'Last 3 months',
      preferredSpeciality: 'Orthopedic',
    },
    preferences: {
      preferredLocation: 'Mumbai',
      budgetRange: 'High',
      preferredDoctorGender: 'Any',
      preferredHospitalClinic: 'Kokilaben Dhirubhai Ambani Hospital',
      preferredDateTime: '2026-06-20 morning',
    },
    consent: {
      patientDisclaimerConsent: true,
      dataConsent: true,
    },
    status: 'New',
    recommendedDoctors: [],
    recommendedHospitals: [],
    followUpNotes: [],
    createdAt: '2026-06-14T13:45:00Z'
  }
];

export const INITIAL_APPOINTMENTS: AppointmentMock[] = [
  {
    id: 'apt_1',
    patientName: 'Sahil Sharma',
    patientPhone: '+91 98765 43299',
    patientEmail: 'sahil.sharma@example.com',
    doctorId: 'doc_1',
    hospitalId: 'hosp_1',
    speciality: 'Cardiology',
    appointmentDate: '2026-06-18',
    appointmentTime: '14:30',
    status: 'Pending',
    notes: 'Coordination done by consultant. Patient has mild angina symptoms.',
    consultantId: 'user_consultant',
    patientUserId: 'user_patient',
    createdAt: '2026-06-14T14:35:00Z'
  }
];

export const INITIAL_USERS: UserMock[] = [
  { id: 'user_patient', name: 'Sahil Sharma', email: 'patient@indiacare.com', phone: '+91 98765 43299', role: 'patient', createdAt: '2026-06-14T10:00:00Z' },
  { id: 'user_doctor', name: 'Dr. Ramesh Kumar', email: 'ramesh.kumar@indiacare.com', phone: '+91 98765 43210', role: 'doctor', createdAt: '2026-06-14T10:10:00Z' },
  { id: 'user_hospital', name: 'Apollo Hospital', email: 'contact@apollo-delhi.com', phone: '+91 11 7179 1090', role: 'hospital', createdAt: '2026-06-14T10:20:00Z' },
  { id: 'user_consultant', name: 'Consultant Ramesh', email: 'consultant@indiacare.com', phone: '+91 88888 88888', role: 'consultant', createdAt: '2026-06-14T10:30:00Z' },
  { id: 'user_admin', name: 'Super Admin', email: 'admin@indiacare.com', phone: '+91 99999 99999', role: 'admin', createdAt: '2026-06-14T10:40:00Z' },
];

// ----------------------------------------------------
// IN-MEMORY SIMULATION STORE (PERSISTENT IN RAM DURING DEV SERVER RUNTIME)
// ----------------------------------------------------

class MockDBStore {
  doctors: DoctorMock[] = [...INITIAL_DOCTORS];
  hospitals: HospitalMock[] = [...INITIAL_HOSPITALS];
  blogs: BlogMock[] = [...INITIAL_BLOGS];
  leads: LeadMock[] = [...INITIAL_LEADS];
  appointments: AppointmentMock[] = [...INITIAL_APPOINTMENTS];
  users: UserMock[] = [...INITIAL_USERS];

  // Users Auth Methods
  registerUser(user: Omit<UserMock, 'id' | 'createdAt'>) {
    const newUser: UserMock = {
      ...user,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  findUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // Doctor Methods
  registerDoctor(doc: Omit<DoctorMock, 'id' | 'rating' | 'isApproved' | 'createdAt'> & { rating?: number; isApproved?: boolean }) {
    const newDoc: DoctorMock = {
      ...doc,
      id: `doc_${Date.now()}`,
      rating: doc.rating || 4.5,
      isApproved: doc.isApproved !== undefined ? doc.isApproved : false,
      createdAt: new Date().toISOString()
    } as DoctorMock;
    this.doctors.push(newDoc);
    return newDoc;
  }

  // Hospital Methods
  registerHospital(hosp: Omit<HospitalMock, 'id' | 'rating' | 'isApproved' | 'createdAt'> & { rating?: number; isApproved?: boolean }) {
    const newHosp: HospitalMock = {
      ...hosp,
      id: `hosp_${Date.now()}`,
      rating: hosp.rating || 4.5,
      isApproved: hosp.isApproved !== undefined ? hosp.isApproved : false,
      createdAt: new Date().toISOString()
    } as HospitalMock;
    this.hospitals.push(newHosp);
    return newHosp;
  }

  // Leads Methods
  createLead(lead: Omit<LeadMock, 'id' | 'status' | 'recommendedDoctors' | 'recommendedHospitals' | 'followUpNotes' | 'createdAt'>) {
    const newLead: LeadMock = {
      ...lead,
      id: `lead_${Date.now()}`,
      status: 'New',
      recommendedDoctors: [],
      recommendedHospitals: [],
      followUpNotes: [],
      createdAt: new Date().toISOString()
    };
    this.leads.push(newLead);
    return newLead;
  }

  updateLeadStatus(leadId: string, status: LeadMock['status'], note?: string, author?: string) {
    const leadIndex = this.leads.findIndex(l => l.id === leadId);
    if (leadIndex !== -1) {
      this.leads[leadIndex].status = status;
      if (note && author) {
        this.leads[leadIndex].followUpNotes.push({
          note,
          author,
          createdAt: new Date().toISOString()
        });
      }
      return this.leads[leadIndex];
    }
    return null;
  }

  assignConsultantToLead(leadId: string, consultantId: string) {
    const leadIndex = this.leads.findIndex(l => l.id === leadId);
    if (leadIndex !== -1) {
      this.leads[leadIndex].assignedConsultantId = consultantId;
      return this.leads[leadIndex];
    }
    return null;
  }

  addRecommendationsToLead(leadId: string, doctorIds: string[], hospitalIds: string[]) {
    const leadIndex = this.leads.findIndex(l => l.id === leadId);
    if (leadIndex !== -1) {
      this.leads[leadIndex].recommendedDoctors = doctorIds;
      this.leads[leadIndex].recommendedHospitals = hospitalIds;
      this.leads[leadIndex].status = 'Doctor Suggested';
      return this.leads[leadIndex];
    }
    return null;
  }

  // Appointment Methods
  createAppointment(apt: Omit<AppointmentMock, 'id' | 'status' | 'createdAt'>) {
    const newApt: AppointmentMock = {
      ...apt,
      id: `apt_${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    this.appointments.push(newApt);
    return newApt;
  }

  updateAppointmentStatus(aptId: string, status: AppointmentMock['status'], notes?: string) {
    const aptIndex = this.appointments.findIndex(a => a.id === aptId);
    if (aptIndex !== -1) {
      this.appointments[aptIndex].status = status;
      if (notes) {
        this.appointments[aptIndex].notes = notes;
      }
      return this.appointments[aptIndex];
    }
    return null;
  }

  // Blogs Methods
  createBlog(blog: Omit<BlogMock, 'id' | 'date' | 'slug'>) {
    const slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newBlog: BlogMock = {
      ...blog,
      id: `blog_${Date.now()}`,
      slug,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    this.blogs.push(newBlog);
    return newBlog;
  }

  deleteDoctor(docId: string) {
    this.doctors = this.doctors.filter(d => d.id !== docId);
  }

  deleteHospital(hospId: string) {
    this.hospitals = this.hospitals.filter(h => h.id !== hospId);
  }
}

// Global persistence for Dev Hot Reloads
declare global {
  // eslint-disable-next-line no-var
  var mockDB: MockDBStore | undefined;
}

if (!global.mockDB) {
  global.mockDB = new MockDBStore();
}

export const mockDB = global.mockDB;
export const specialities = INITIAL_SPECIALITIES;
