'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Heart, Calendar, ShieldAlert, ChevronRight, ArrowRight,
  ArrowLeft, CheckCircle2, Upload, Clock, MapPin, Building2,
  DollarSign, Phone, Mail, Stethoscope, BadgeCheck, Sparkles,
  Home, Star, X, FileText, Copy, Check, AlertCircle, CreditCard
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { siteApi } from '@/lib/api';
import { SiteDoctor, SiteHospital } from '@/lib/siteTypes';
import { usePatientAuth } from '@/lib/patientAuth';

const OFFICIAL_UPI_ID = '9024155604@ibl';
const CONSULTATION_TOKEN_FEE = 9;

/* ─── step meta ─── */
const STEPS = [
  { id: 1, label: 'Patient Details',  icon: User,        desc: 'Your basic information' },
  { id: 2, label: 'Health Concern',   icon: Heart,       desc: 'Symptoms & condition' },
  { id: 3, label: 'Preferences',      icon: Calendar,    desc: 'Location & budget' },
  { id: 4, label: 'Consent & Review', icon: ShieldAlert, desc: 'Review agreement' },
  { id: 5, label: '₹9 UPI Payment',   icon: CreditCard,  desc: 'Scan QR & enter UTR' },
];

const SPECIALITIES = [
  'Cardiology', 'Neurology', 'Orthopedic', 'Dermatology', 'Gynecology',
  'Pediatrics', 'Dentist', 'ENT', 'Urology', 'Gastroenterology',
];

/* ─── animation presets ─── */
const slideIn = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

/* ─── shared input class ─── */
const inp = (err = false) =>
  `w-full bg-white border ${err ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-primary-green focus:ring-primary-green/10'} rounded-2xl px-4 py-3 text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm`;

/* ─── Field wrapper ─── */
function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-dark-navy uppercase tracking-wide px-0.5 flex items-center gap-1">
        {label}{required && <span className="text-red-500 font-extrabold">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-text-grey px-0.5">{hint}</p>}
    </div>
  );
}

/* ─── Checkbox ─── */
function Checkbox({ checked, onChange, children }: {
  checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
          checked ? 'bg-primary-green border-primary-green' : 'border-slate-300 hover:border-primary-green/50 group-hover:border-primary-green/40'
        }`}
      >
        {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
      </div>
      <span className="text-xs text-slate-600 leading-relaxed">{children}</span>
    </label>
  );
}

/* ════════════════════════════════════════
   MAIN FORM CONTENT
════════════════════════════════════════ */
function IntakeFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { isLoggedIn, patient } = usePatientAuth();

  const doctorId = searchParams.get('doctorId') || searchParams.get('doc') || '';
  const hospitalId = searchParams.get('hospitalId') || '';
  const [preselectedDoc, setPreselectedDoc] = useState<SiteDoctor | null>(null);
  const [preselectedHospital, setPreselectedHospital] = useState<SiteHospital | null>(null);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // +1 forward, -1 back
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrError, setUtrError] = useState('');

  const [formData, setFormData] = useState({
    name: patient?.name || '', age: patient?.age || '', gender: patient?.gender || 'Male', phone: patient?.mobile || '', whatsappNumber: patient?.mobile || '', email: patient?.email || '',
    city: patient?.city || '', area: '',
    mainProblem: '', symptoms: '', duration: '',
    preferredSpeciality: '',
    reports: [] as string[],
    preferredLocation: '',
    budgetRange: 'Medium',
    preferredDoctorGender: 'Any',
    preferredHospitalClinic: '',
    preferredDateTime: '',
    patientDisclaimerConsent: false,
    dataConsent: false,
    utrNumber: '',
  });

  const copyUpiId = () => {
    navigator.clipboard.writeText(OFFICIAL_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  useEffect(() => {
    async function loadPreselectedProfile() {
      try {
        if (doctorId) {
          const response = await siteApi<{ doctor: SiteDoctor }>('/api/doctors/' + doctorId);
          const doctor = {
            ...response.doctor,
            subscriptionPlan: (response.doctor.isSubscribed ? 'Premium' : 'Basic') as SiteDoctor['subscriptionPlan'],
            hospitalName: response.doctor.hospitalName || '',
          };
          setPreselectedDoc(doctor);
          setFormData((prev) => ({
            ...prev,
            preferredSpeciality: prev.preferredSpeciality || doctor.speciality,
            preferredLocation: prev.preferredLocation || doctor.location,
            budgetRange: prev.budgetRange === 'Medium'
              ? doctor.consultationFee < 800 ? 'Low'
                : doctor.consultationFee <= 1200 ? 'Medium' : 'High'
              : prev.budgetRange,
            preferredHospitalClinic: prev.preferredHospitalClinic || doctor.clinicAddress,
          }));
          return;
        }

        if (hospitalId) {
          const response = await siteApi<{ hospital: SiteHospital }>('/api/hospitals/' + hospitalId);
          const hospital = {
            ...response.hospital,
            subscriptionPlan: (response.hospital.isSubscribed ? 'Premium' : 'Basic') as SiteHospital['subscriptionPlan'],
          };
          setPreselectedHospital(hospital);
          setFormData((prev) => ({
            ...prev,
            preferredLocation: prev.preferredLocation || hospital.location,
            preferredHospitalClinic: prev.preferredHospitalClinic || hospital.name,
            preferredSpeciality: prev.preferredSpeciality || hospital.departments[0] || '',
          }));
        }
      } catch {
        setPreselectedDoc(null);
        setPreselectedHospital(null);
      }
    }
    loadPreselectedProfile();
  }, [doctorId, hospitalId]);

  useEffect(() => {
    if (!isLoggedIn) {
      const query = searchParams.toString();
      const redirectTarget = query ? `${pathname}?${query}` : (pathname || '/book-consultation');
      router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
    }
  }, [isLoggedIn, pathname, router, searchParams]);

  const set = (field: keyof typeof formData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /* ── Validation per step ── */
  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!formData.name.trim()) { toast('error', 'Name Required', 'Please enter patient full name.'); return false; }
      if (!formData.phone.trim() || formData.phone.length < 10) { toast('error', 'Phone Required', 'Please enter a valid 10-digit mobile number.'); return false; }
      if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) { toast('error', 'Age Required', 'Please enter a valid age (1-120).'); return false; }
      if (!formData.city.trim()) { toast('error', 'City Required', 'Please enter your current city.'); return false; }
    }
    if (s === 2) {
      if (!formData.mainProblem.trim()) { toast('error', 'Health Concern Required', 'Please describe your main health concern.'); return false; }
      if (!formData.preferredSpeciality) { toast('error', 'Speciality Required', 'Please select a preferred medical speciality.'); return false; }
    }
    if (s === 3) {
      if (!formData.preferredLocation.trim()) { toast('error', 'Preferred City Required', 'Please enter your preferred location for consultation.'); return false; }
    }
    if (s === 4) {
      if (!formData.patientDisclaimerConsent || !formData.dataConsent) {
        toast('error', 'Consent Required', 'Please accept both consent agreements to proceed to ₹9 payment.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep(step)) return;
    setDirection(1);
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map(f => f.name);
      set('reports', [...formData.reports, ...names]);
      toast('info', 'File Attached', `${names.length} file(s) added.`);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.utrNumber.trim() || formData.utrNumber.trim().length < 6) {
      setUtrError('Please enter a valid 12-digit UTR / UPI Reference Number from your payment app.');
      return;
    }

    setSubmitting(true);
    setUtrError('');
    try {
      await siteApi('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          patientDetails: {
            name: formData.name, age: parseInt(formData.age) || 30,
            gender: formData.gender as 'Male' | 'Female' | 'Other',
            phone: formData.phone,
            whatsappNumber: formData.whatsappNumber || formData.phone,
            email: formData.email || 'guest@example.com',
            city: formData.city, area: formData.area || 'General',
          },
          healthConcern: {
            mainProblem: formData.mainProblem, symptoms: formData.symptoms,
            duration: formData.duration, preferredSpeciality: formData.preferredSpeciality,
            reports: formData.reports,
          },
          preferences: {
            preferredLocation: formData.preferredLocation, budgetRange: formData.budgetRange,
            preferredDoctorGender: formData.preferredDoctorGender as 'Male' | 'Female' | 'Any',
            preferredHospitalClinic: formData.preferredHospitalClinic,
            preferredDateTime: formData.preferredDateTime,
          },
          consent: { patientDisclaimerConsent: formData.patientDisclaimerConsent, dataConsent: formData.dataConsent },
          payment: {
            fee: CONSULTATION_TOKEN_FEE,
            paymentMethod: 'UPI',
            transactionRef: formData.utrNumber.trim(),
            paymentStatus: 'Submitted (Verification Pending)',
          }
        }),
      });
      setSubmitting(false);
      setSubmitted(true);
      toast('success', '₹9 Payment & Consultation Submitted!', 'Our coordinator will verify UTR & confirm your slot.');
    } catch (error) {
      setSubmitting(false);
      toast('error', 'Submission Failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  /* ── Progress % ── */
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  if (!isLoggedIn) {
    return null;
  }

  /* ════════════════ SUCCESS SCREEN ════════════════ */
  if (submitted) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 relative"
        >
          {/* Top stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-green to-accent-green rounded-t-3xl" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-soft-green flex items-center justify-center shadow-lg border-2 border-primary-green/30"
          >
            <CheckCircle2 className="w-10 h-10 text-primary-green" />
          </motion.div>

          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 uppercase tracking-widest inline-block mb-2">
                ₹9 Payment Submitted (UTR: {formData.utrNumber})
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-navy mt-1">Request Submitted! 🎉</h2>
              <p className="text-sm text-text-grey mt-3 leading-relaxed max-w-sm mx-auto">
                Our clinical coordinator will verify your UTR <strong className="text-dark-navy font-mono">{formData.utrNumber}</strong> and contact you on{' '}
                <strong className="text-dark-navy">{formData.phone}</strong> to confirm your slot.
              </p>
            </motion.div>
          </div>

          {preselectedDoc && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="w-full bg-soft-green/60 border border-primary-green/20 rounded-2xl p-4 flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-green/10 flex items-center justify-center text-primary-green font-bold flex-shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-primary-green uppercase tracking-wider">Matched Specialist</p>
                <p className="font-extrabold text-dark-navy text-sm truncate">{preselectedDoc.name}</p>
                <p className="text-xs text-text-grey truncate">{preselectedDoc.speciality} · {preselectedDoc.hospitalName || preselectedDoc.clinicAddress}</p>
              </div>
            </motion.div>
          )}

          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">What Happens Next</p>
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">1</span>
              <span>UTR Payment Verification by Clinical Coordinator</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">2</span>
              <span>Callback within 2–4 hours on registered mobile number</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-white gradient-primary py-3.5 rounded-2xl shadow-md glow-green"
            >
              <Home className="w-4 h-4" /> Return to Home
            </Link>
            <Link
              href="/find-doctor"
              className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-primary-green border border-primary-green/30 bg-soft-green py-3.5 rounded-2xl"
            >
              <Stethoscope className="w-4 h-4" /> Browse Doctors
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ════════════════ MAIN INTAKE FORM ════════════════ */
  return (
    <div className="min-h-screen bg-light-grey pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-xs text-text-grey mb-6 font-medium">
          <Link href="/" className="hover:text-primary-green transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-dark-navy font-semibold">Book Consultation</span>
        </div>

        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-green bg-soft-green border border-primary-green/20 px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Clinical Intake &amp; Booking
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-dark-navy tracking-tight">
                Get Expert Healthcare Guidance
              </h1>
              <p className="text-sm text-text-grey mt-1">
                Fill your details, pay ₹9 consultation fee via QR code, and our team will coordinate your appointment.
              </p>
            </div>

            {preselectedDoc && (
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
                {preselectedDoc.photo ? (
                  <img src={preselectedDoc.photo} alt={preselectedDoc.name} className="w-11 h-11 rounded-xl object-cover border border-primary-green/30" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-soft-green text-primary-green font-bold flex items-center justify-center">
                    {preselectedDoc.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-primary-green uppercase tracking-wide">Booking For</p>
                  <p className="font-extrabold text-dark-navy text-xs leading-tight">{preselectedDoc.name}</p>
                  <p className="text-[10px] text-text-grey">{preselectedDoc.speciality}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Main Form Container ── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden">

          {/* Progress Bar Header */}
          <div className="bg-slate-50 border-b border-slate-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-text-grey">
              <span>Step {step} of {STEPS.length}: <strong className="text-dark-navy">{STEPS[step - 1].label}</strong></span>
              <span className="text-primary-green font-extrabold">{Math.round(progress)}% Complete</span>
            </div>
            {/* Progress track */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-green to-accent-green rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            {/* Step icons row */}
            <div className="grid grid-cols-5 gap-2 mt-5">
              {STEPS.map(s => {
                const Icon = s.icon;
                const isCurrent = s.id === step;
                const isDone = s.id < step;

                return (
                  <button
                    key={s.id}
                    onClick={() => { if (s.id < step) { setDirection(-1); setStep(s.id); } }}
                    disabled={s.id > step}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all text-center ${
                      isCurrent
                        ? 'bg-white shadow-md border border-primary-green/30 text-primary-green'
                        : isDone
                          ? 'bg-soft-green text-primary-green cursor-pointer'
                          : 'opacity-50 cursor-not-allowed text-slate-400'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isCurrent ? 'bg-primary-green text-white shadow-sm' : isDone ? 'bg-primary-green/20 text-primary-green' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4 text-primary-green" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] font-extrabold truncate w-full hidden sm:block">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Step Body */}
          <form onSubmit={handleFormSubmit} className="p-6 sm:p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideIn}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* ═══ STEP 1: PATIENT DETAILS ═══ */}
                {step === 1 && (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Patient Full Name" required>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input type="text" placeholder="Enter patient name" value={formData.name}
                            onChange={e => set('name', e.target.value)} className={`${inp()} pl-9`} />
                        </div>
                      </Field>

                      <Field label="Mobile Number" required hint="We'll call you on this number">
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input type="tel" placeholder="10-digit mobile number" value={formData.phone}
                            maxLength={10} onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} className={`${inp()} pl-9`} />
                        </div>
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Age" required>
                        <input type="number" placeholder="Age in years" min={1} max={120} value={formData.age}
                          onChange={e => set('age', e.target.value)} className={inp()} />
                      </Field>

                      <Field label="Gender" required>
                        <select value={formData.gender} onChange={e => set('gender', e.target.value)} className={inp()}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </Field>

                      <Field label="Current City" required>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input type="text" placeholder="e.g. Delhi" value={formData.city}
                            onChange={e => set('city', e.target.value)} className={`${inp()} pl-9`} />
                        </div>
                      </Field>
                    </div>

                    <Field label="Email Address" hint="Optional for booking confirmation PDF">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input type="email" placeholder="patient@example.com" value={formData.email}
                          onChange={e => set('email', e.target.value)} className={`${inp()} pl-9`} />
                      </div>
                    </Field>
                  </div>
                )}

                {/* ═══ STEP 2: HEALTH CONCERN ═══ */}
                {step === 2 && (
                  <div className="flex flex-col gap-5">
                    <Field label="Main Health Problem / Reason for Visit" required hint="e.g. Chronic chest pain, persistent fever, knee joint pain">
                      <textarea rows={3} placeholder="Describe what you are experiencing..." value={formData.mainProblem}
                        onChange={e => set('mainProblem', e.target.value)} className={`${inp()} resize-none`} />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Preferred Medical Speciality" required>
                        <select value={formData.preferredSpeciality}
                          onChange={e => set('preferredSpeciality', e.target.value)} className={inp()}>
                          <option value="">Choose Department</option>
                          {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                      <Field label="Symptom Duration" hint='e.g. "5 days", "3 weeks"'>
                        <div className="relative">
                          <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input type="text" placeholder="How long have you had this?" value={formData.duration}
                            onChange={e => set('duration', e.target.value)} className={`${inp()} pl-9`} />
                        </div>
                      </Field>
                    </div>

                    {/* File upload */}
                    <Field label="Attach Medical Reports" hint="Optional — PDFs, JPGs, DICOM scans">
                      <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2.5 cursor-pointer transition-all relative group ${
                        formData.reports.length > 0 ? 'border-primary-green/40 bg-soft-green/60' : 'border-slate-200 hover:border-primary-green/40 hover:bg-soft-green/30'
                      }`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${formData.reports.length > 0 ? 'bg-soft-green' : 'bg-slate-100'}`}>
                          <Upload className="w-5 h-5 text-primary-green" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-700">Click or drag to upload reports</p>
                        </div>
                        <input type="file" multiple onChange={handleReportUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </Field>
                  </div>
                )}

                {/* ═══ STEP 3: PREFERENCES ═══ */}
                {step === 3 && (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Preferred City" required>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input type="text" placeholder="e.g. Delhi, Mumbai, Bengaluru" value={formData.preferredLocation}
                            onChange={e => set('preferredLocation', e.target.value)} className={`${inp()} pl-9`} />
                        </div>
                      </Field>
                      <Field label="Preferred Date / Time" hint='e.g. "Tomorrow morning", "ASAP"'>
                        <div className="relative">
                          <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input type="text" placeholder="When works for you?" value={formData.preferredDateTime}
                            onChange={e => set('preferredDateTime', e.target.value)} className={`${inp()} pl-9`} />
                        </div>
                      </Field>
                    </div>

                    <Field label="Doctor Gender Preference">
                      <div className="flex gap-2">
                        {['Any', 'Male', 'Female'].map(g => (
                          <button key={g} type="button"
                            onClick={() => set('preferredDoctorGender', g)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                              formData.preferredDoctorGender === g
                                ? 'bg-primary-green border-primary-green text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-primary-green/40 hover:text-primary-green'
                            }`}
                          >
                            {g === 'Any' ? 'No Preference' : `${g} Only`}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}

                {/* ═══ STEP 4: CONSENT & REVIEW ═══ */}
                {step === 4 && (
                  <div className="flex flex-col gap-6">
                    {/* Summary card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 grid grid-cols-2 gap-3">
                      <p className="col-span-2 text-[10px] font-bold text-text-grey uppercase tracking-wider mb-1">Your Request Summary</p>
                      {[
                        { label: 'Patient', value: formData.name },
                        { label: 'Age / Gender', value: `${formData.age} yrs · ${formData.gender}` },
                        { label: 'Concern', value: formData.mainProblem },
                        { label: 'Speciality', value: formData.preferredSpeciality },
                        { label: 'City', value: formData.preferredLocation || formData.city },
                        { label: 'Consultation Fee', value: '₹9 Token Fee' },
                      ].map((item, i) => (
                        <div key={i} className="bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                          <p className="text-[9px] font-bold text-text-grey uppercase tracking-wide">{item.label}</p>
                          <p className="text-xs font-bold text-dark-navy mt-0.5 truncate">{item.value || '—'}</p>
                        </div>
                      ))}
                    </div>

                    {/* Consent checkboxes */}
                    <div className="flex flex-col gap-4">
                      <Checkbox checked={formData.patientDisclaimerConsent} onChange={v => set('patientDisclaimerConsent', v)}>
                        I understand and accept the{' '}
                        <Link href="/disclaimer" target="_blank" className="text-primary-green font-bold hover:underline">Patient Disclaimer</Link>.
                      </Checkbox>
                      <Checkbox checked={formData.dataConsent} onChange={v => set('dataConsent', v)}>
                        I agree to the{' '}
                        <Link href="/data-consent" target="_blank" className="text-primary-green font-bold hover:underline">Data Consent Policy</Link>.
                      </Checkbox>
                    </div>
                  </div>
                )}

                {/* ═══ STEP 5: ₹9 UPI QR PAYMENT STEP ═══ */}
                {step === 5 && (
                  <div className="flex flex-col gap-5">
                    {utrError && (
                      <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold bg-red-500/15 border border-red-500/30 text-red-600">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {utrError}
                      </div>
                    )}

                    {/* QR Code Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
                      <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                        <img src="/payment-qr.png" alt="India Care UPI Payment QR Code" className="w-48 h-48 object-contain mx-auto" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pay ₹9 Consultation Token Fee to Official UPI</p>
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono text-base font-black text-dark-navy">{OFFICIAL_UPI_ID}</span>
                          <button
                            type="button"
                            onClick={copyUpiId}
                            className="px-2.5 py-1 rounded-lg bg-soft-green text-primary-green text-xs font-bold flex items-center gap-1 border border-primary-green/20"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedUpi ? 'Copied' : 'Copy UPI'}
                          </button>
                        </div>
                        <p className="text-[10px] text-text-grey">Scan using PhonePe, Google Pay, Paytm, BHIM, or any UPI app</p>
                      </div>
                    </div>

                    {/* UTR Input */}
                    <Field label="12-Digit UTR / UPI Reference Number" required hint="Found on your UPI payment confirmation receipt screen">
                      <input
                        type="text"
                        value={formData.utrNumber}
                        onChange={e => set('utrNumber', e.target.value)}
                        placeholder="e.g. 420198765432"
                        maxLength={20}
                        className={`${inp(!!utrError)} font-mono font-bold`}
                      />
                    </Field>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* ── Navigation Footer ── */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button type="button" onClick={handlePrevStep}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 border border-slate-200 bg-white px-5 py-3 rounded-2xl hover:bg-slate-50 transition-all">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < STEPS.length ? (
                <button type="button" onClick={handleNextStep}
                  className="flex items-center gap-2 text-xs font-bold text-white gradient-primary px-7 py-3 rounded-2xl shadow-lg glow-green transition-all">
                  {step === 4 ? 'Proceed to ₹9 Payment →' : 'Continue →'}
                </button>
              ) : (
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 text-xs font-black text-white gradient-primary px-8 py-3.5 rounded-2xl shadow-lg glow-green disabled:opacity-60 transition-all">
                  {submitting ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Confirming UTR…</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Confirm Booking &amp; Submit UTR</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default function IntakeFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-light-grey flex items-center justify-center p-10">
        <div className="w-8 h-8 rounded-full border-2 border-primary-green border-t-transparent animate-spin" />
      </div>
    }>
      <IntakeFormContent />
    </Suspense>
  );
}
