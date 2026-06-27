'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Heart, Calendar, ShieldAlert, ChevronRight, ArrowRight,
  ArrowLeft, CheckCircle2, Upload, Clock, MapPin, Building2,
  DollarSign, Phone, Mail, Stethoscope, BadgeCheck, Sparkles,
  Home, Star, X, FileText,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { mockDB } from '@/lib/mockData';

/* ─── step meta ─── */
const STEPS = [
  { id: 1, label: 'Patient Details',  icon: User,        desc: 'Your basic information' },
  { id: 2, label: 'Health Concern',   icon: Heart,       desc: 'Symptoms & condition' },
  { id: 3, label: 'Preferences',      icon: Calendar,    desc: 'Location & budget' },
  { id: 4, label: 'Consent & Submit', icon: ShieldAlert, desc: 'Review & confirm' },
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
  const { toast } = useToast();

  const docId = searchParams.get('doc') || '';
  const preselectedDoc = docId ? mockDB.doctors.find((d) => d.id === docId) : null;

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // +1 forward, -1 back
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', phone: '', whatsappNumber: '', email: '',
    city: '', area: '',
    mainProblem: '', symptoms: '', duration: '',
    preferredSpeciality: preselectedDoc ? preselectedDoc.speciality : '',
    reports: [] as string[],
    preferredLocation: preselectedDoc ? preselectedDoc.location : '',
    budgetRange: preselectedDoc
      ? preselectedDoc.consultationFee < 800 ? 'Low'
        : preselectedDoc.consultationFee <= 1200 ? 'Medium' : 'High'
      : 'Medium',
    preferredDoctorGender: 'Any',
    preferredHospitalClinic: preselectedDoc ? preselectedDoc.clinicAddress : '',
    preferredDateTime: '',
    patientDisclaimerConsent: false,
    dataConsent: false,
  });

  const set = (k: string, v: string | boolean | string[]) =>
    setFormData(prev => ({ ...prev, [k]: v }));

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.age || !formData.phone || !formData.city) {
        toast('error', 'Incomplete Details', 'Please fill Name, Age, Phone Number, and City.');
        return;
      }
    } else if (step === 2) {
      if (!formData.mainProblem || !formData.symptoms || !formData.preferredSpeciality) {
        toast('error', 'Incomplete Details', 'Please fill Main Concern, Symptoms, and Speciality.');
        return;
      }
    } else if (step === 3) {
      if (!formData.preferredLocation || !formData.preferredDateTime) {
        toast('error', 'Incomplete Details', 'Please fill Location and Preferred Date/Time.');
        return;
      }
    }
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientDisclaimerConsent || !formData.dataConsent) {
      toast('error', 'Consent Required', 'Please accept both consent agreements.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      mockDB.createLead({
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
      });
      if (preselectedDoc) {
        mockDB.createAppointment({
          patientName: formData.name, patientPhone: formData.phone,
          patientEmail: formData.email || 'guest@example.com',
          doctorId: preselectedDoc.id, hospitalId: preselectedDoc.hospitalId,
          speciality: preselectedDoc.speciality,
          appointmentDate: formData.preferredDateTime.split(' ')[0] || '2026-06-20',
          appointmentTime: '11:00',
          notes: `Intake Wizard referral. Main concern: ${formData.mainProblem}`,
        });
      }
      setSubmitting(false);
      setSubmitted(true);
      toast('success', 'Request Submitted!', 'Our consultant will contact you shortly.');
    }, 1400);
  };

  /* ── Progress % ── */
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  /* ════════════════ SUCCESS SCREEN ════════════════ */
  if (submitted) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center flex flex-col items-center gap-6"
        >
          {/* Top stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-green to-accent-green rounded-t-3xl" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-soft-green flex items-center justify-center shadow-lg"
          >
            <CheckCircle2 className="w-10 h-10 text-primary-green" />
          </motion.div>

          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest">India Care Consultancy</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-navy mt-2">Request Submitted! 🎉</h2>
              <p className="text-sm text-text-grey mt-3 leading-relaxed max-w-sm mx-auto">
                Our clinical coordinator will contact you on{' '}
                <strong className="text-dark-navy">{formData.phone}</strong> to discuss recommended doctors and confirm your slot.
              </p>
            </motion.div>
          </div>

          {preselectedDoc && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="w-full bg-soft-green border border-primary-green/15 rounded-2xl p-4 flex items-center gap-3 text-left"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white shadow-sm flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preselectedDoc.photo} alt={preselectedDoc.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary-green uppercase tracking-wide">Preferred Specialist</p>
                <p className="text-sm font-extrabold text-dark-navy">{preselectedDoc.name}</p>
                <p className="text-[11px] text-text-grey">{preselectedDoc.speciality}</p>
              </div>
              <BadgeCheck className="w-5 h-5 text-primary-green ml-auto flex-shrink-0" />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 w-full"
          >
            <button
              onClick={() => router.push('/')}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary py-3.5 rounded-2xl shadow-lg glow-green"
            >
              <Home className="w-4 h-4" /> Return to Home
            </button>
            <Link href="/find-doctor"
              className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-primary-green border-2 border-primary-green/20 bg-soft-green py-3.5 rounded-2xl hover:bg-light-mint transition-colors"
            >
              <Stethoscope className="w-4 h-4" /> Browse Doctors
            </Link>
          </motion.div>

          {/* What's next */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left"
          >
            <p className="text-[10px] font-bold text-text-grey uppercase tracking-wide mb-3">What Happens Next</p>
            <div className="flex flex-col gap-2.5">
              {[
                { step: '1', text: 'A clinical coordinator reviews your intake request' },
                { step: '2', text: 'You receive a call within 2–4 hours on your registered number' },
                { step: '3', text: 'Matched doctor & slot recommendations shared with you' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-0.5">{s.step}</div>
                  <p className="text-xs text-text-grey leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ════════════════ MULTI-STEP WIZARD ════════════════ */
  return (
    <div className="min-h-screen bg-light-grey">

      {/* ── Hero Header ── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0A5C4E 0%, #127A6A 55%, #1A9A83 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-white/60 text-xs font-medium mb-6">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">Book Consultation</span>
          </div>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">India Care Consultancy</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 leading-tight">Get a Vetted Recommendation</h1>
            <p className="text-sm text-white/65 mt-1.5 max-w-md">
              Fill in this quick form and our clinical team will match you with the right specialist.
            </p>
          </motion.div>

          {/* Preselected doc pill */}
          {preselectedDoc && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-4 inline-flex items-center gap-2.5 bg-white/15 border border-white/25 rounded-2xl px-3.5 py-2 backdrop-blur"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/30 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preselectedDoc.photo} alt={preselectedDoc.name} className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <p className="text-white font-bold text-xs">{preselectedDoc.name}</p>
                <p className="text-white/60 text-[10px]">{preselectedDoc.speciality}</p>
              </div>
              <BadgeCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            </motion.div>
          )}

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1 flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all ${
                      step > s.id ? 'bg-white border-white text-primary-green' :
                      step === s.id ? 'bg-white/20 border-white text-white' :
                      'bg-white/10 border-white/20 text-white/40'
                    }`}>
                      {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                    </div>
                    <span className={`hidden sm:block text-[9px] font-bold mt-1 whitespace-nowrap ${step >= s.id ? 'text-white' : 'text-white/40'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-1.5 rounded-full bg-white/20 overflow-hidden">
                      <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: step > s.id ? '100%' : '0%' }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Form Card ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">

          {/* Step header */}
          <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-slate-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {(() => {
                  const s = STEPS[step - 1];
                  const Icon = s.icon;
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
                        <Icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-grey uppercase tracking-wider">Step {step} of {STEPS.length}</p>
                        <h2 className="text-lg font-extrabold text-dark-navy leading-tight">{s.label}</h2>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-[10px] font-bold text-text-grey uppercase tracking-wide">Progress</p>
                        <p className="text-sm font-extrabold text-primary-green">{Math.round(((step - 1) / STEPS.length) * 100)}%</p>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step body */}
          <form onSubmit={handleFormSubmit}>
            <div className="px-6 sm:px-8 py-7 min-h-[380px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={{
                    initial: (d: number) => ({ opacity: 0, x: d * 40 }),
                    animate: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
                    exit:    (d: number) => ({ opacity: 0, x: d * -40, transition: { duration: 0.2 } }),
                  }}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >

                  {/* ═══ STEP 1: PATIENT DETAILS ═══ */}
                  {step === 1 && (
                    <div className="flex flex-col gap-5">
                      <p className="text-xs text-text-grey leading-relaxed bg-soft-green border border-primary-green/10 rounded-2xl px-4 py-3">
                        <Sparkles className="w-3.5 h-3.5 text-primary-green inline mr-1.5 -mt-0.5" />
                        All information is kept confidential and only shared with assigned consultants.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Patient Full Name" required>
                          <input type="text" placeholder="Enter full name" value={formData.name}
                            onChange={e => set('name', e.target.value)} className={inp()} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Age" required>
                            <input type="number" placeholder="e.g. 35" value={formData.age}
                              onChange={e => set('age', e.target.value)} className={inp()} />
                          </Field>
                          <Field label="Gender" required>
                            <select value={formData.gender} onChange={e => set('gender', e.target.value)} className={inp()}>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </Field>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Phone Number" required hint="We'll call on this number">
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="tel" placeholder="+91 XXXXX XXXXX" value={formData.phone}
                              onChange={e => {
                                const v = e.target.value;
                                setFormData(prev => ({
                                  ...prev, phone: v,
                                  whatsappNumber: prev.whatsappNumber === prev.phone || !prev.whatsappNumber ? v : prev.whatsappNumber
                                }));
                              }}
                              className={`${inp()} pl-9`} />
                          </div>
                        </Field>
                        <Field label="WhatsApp Number" hint="Leave blank if same as phone">
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="tel" placeholder="WhatsApp number" value={formData.whatsappNumber}
                              onChange={e => set('whatsappNumber', e.target.value)}
                              className={`${inp()} pl-9`} />
                          </div>
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <Field label="Email Address" hint="Optional — for reports and confirmation">
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                              <input type="email" placeholder="you@example.com" value={formData.email}
                                onChange={e => set('email', e.target.value)} className={`${inp()} pl-9`} />
                            </div>
                          </Field>
                        </div>
                        <Field label="City" required>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="text" placeholder="Your city" value={formData.city}
                              onChange={e => set('city', e.target.value)} className={`${inp()} pl-9`} />
                          </div>
                        </Field>
                      </div>

                      <Field label="Area / Locality" hint="Helps us find nearby specialists">
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input type="text" placeholder="e.g. Bandra West, Connaught Place" value={formData.area}
                            onChange={e => set('area', e.target.value)} className={`${inp()} pl-9`} />
                        </div>
                      </Field>
                    </div>
                  )}

                  {/* ═══ STEP 2: HEALTH CONCERN ═══ */}
                  {step === 2 && (
                    <div className="flex flex-col gap-5">
                      <p className="text-xs text-text-grey leading-relaxed bg-soft-green border border-primary-green/10 rounded-2xl px-4 py-3">
                        <Heart className="w-3.5 h-3.5 text-primary-green inline mr-1.5 -mt-0.5" />
                        Describe your health concern clearly — this helps our team match you with the right specialist faster.
                      </p>

                      <Field label="Main Health Problem" required hint='e.g. "Severe knee joint pain", "Chronic acid reflux"'>
                        <input type="text" placeholder="Describe your primary concern" value={formData.mainProblem}
                          onChange={e => set('mainProblem', e.target.value)} className={inp()} />
                      </Field>

                      <Field label="Detailed Symptoms" required hint="Be as specific as possible — include severity, triggers, etc.">
                        <textarea rows={4} placeholder="Describe what you are experiencing — e.g., joint stiffness in the morning, chest tightness while walking, frequent headaches..."
                          value={formData.symptoms}
                          onChange={e => set('symptoms', e.target.value)}
                          className={`${inp()} resize-none`} />
                      </Field>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Preferred Speciality" required>
                          <select value={formData.preferredSpeciality}
                            onChange={e => set('preferredSpeciality', e.target.value)} className={inp()}>
                            <option value="">Choose Department</option>
                            {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </Field>
                        <Field label="Symptom Duration" hint='e.g. "5 days", "3 weeks", "2 months"'>
                          <div className="relative">
                            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="text" placeholder="How long have you had this?" value={formData.duration}
                              onChange={e => set('duration', e.target.value)} className={`${inp()} pl-9`} />
                          </div>
                        </Field>
                      </div>

                      {/* File upload */}
                      <Field label="Attach Medical Reports" hint="Optional — PDFs, JPGs, DICOM scans (max 10MB each)">
                        <div className={`border-2 border-dashed rounded-2xl p-7 flex flex-col items-center gap-2.5 cursor-pointer transition-all relative group ${
                          formData.reports.length > 0 ? 'border-primary-green/40 bg-soft-green/60' : 'border-slate-200 hover:border-primary-green/40 hover:bg-soft-green/30'
                        }`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.reports.length > 0 ? 'bg-soft-green' : 'bg-slate-100 group-hover:bg-soft-green'}`}>
                            <Upload className={`w-5 h-5 transition-colors ${formData.reports.length > 0 ? 'text-primary-green' : 'text-slate-400 group-hover:text-primary-green'}`} />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-slate-700">Click or drag to upload</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">PDFs, JPGs, PNG, DICOM</p>
                          </div>
                          <input type="file" multiple onChange={handleReportUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        {formData.reports.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.reports.map((name, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-soft-green border border-primary-green/15 text-primary-green text-[10px] font-bold px-2.5 py-1.5 rounded-xl">
                                <FileText className="w-3 h-3" /> {name}
                                <button type="button" onClick={() => set('reports', formData.reports.filter((_, i) => i !== idx))}
                                  className="hover:text-red-500 transition-colors ml-0.5">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </Field>
                    </div>
                  )}

                  {/* ═══ STEP 3: PREFERENCES ═══ */}
                  {step === 3 && (
                    <div className="flex flex-col gap-5">
                      <p className="text-xs text-text-grey leading-relaxed bg-soft-green border border-primary-green/10 rounded-2xl px-4 py-3">
                        <MapPin className="w-3.5 h-3.5 text-primary-green inline mr-1.5 -mt-0.5" />
                        These preferences help us narrow down the best doctors and time slots for you.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Preferred City" required>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="text" placeholder="e.g. Delhi, Mumbai, Bengaluru" value={formData.preferredLocation}
                              onChange={e => set('preferredLocation', e.target.value)} className={`${inp()} pl-9`} />
                          </div>
                        </Field>
                        <Field label="Preferred Date / Time" required hint='e.g. "June 25 morning", "ASAP", "Weekends only"'>
                          <div className="relative">
                            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="text" placeholder="When works for you?" value={formData.preferredDateTime}
                              onChange={e => set('preferredDateTime', e.target.value)} className={`${inp()} pl-9`} />
                          </div>
                        </Field>
                      </div>

                      {/* Budget chips */}
                      <Field label="Budget Range">
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { key: 'Low',    label: 'Economy',  desc: '< ₹800 fee' },
                            { key: 'Medium', label: 'Standard', desc: '₹800 – ₹1200' },
                            { key: 'High',   label: 'Premium',  desc: '> ₹1200 fee' },
                          ].map(b => (
                            <button key={b.key} type="button"
                              onClick={() => set('budgetRange', b.key)}
                              className={`flex flex-col items-center py-3.5 px-2 rounded-2xl border-2 transition-all ${
                                formData.budgetRange === b.key
                                  ? 'bg-primary-green border-primary-green text-white shadow-md'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-primary-green/40 hover:text-primary-green'
                              }`}
                            >
                              <DollarSign className="w-4 h-4 mb-1" />
                              <span className="text-xs font-extrabold">{b.label}</span>
                              <span className={`text-[10px] font-medium mt-0.5 ${formData.budgetRange === b.key ? 'text-white/80' : 'text-slate-400'}`}>{b.desc}</span>
                            </button>
                          ))}
                        </div>
                      </Field>

                      {/* Doctor gender preference chips */}
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

                      <Field label="Preferred Hospital / Clinic" hint="Optional — leave blank for ICC to suggest">
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input type="text" placeholder="e.g. Apollo Hospital, AIIMS Delhi" value={formData.preferredHospitalClinic}
                            onChange={e => set('preferredHospitalClinic', e.target.value)} className={`${inp()} pl-9`} />
                        </div>
                      </Field>
                    </div>
                  )}

                  {/* ═══ STEP 4: CONSENT ═══ */}
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
                          { label: 'Budget', value: formData.budgetRange },
                        ].map((item, i) => (
                          <div key={i} className="bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                            <p className="text-[9px] font-bold text-text-grey uppercase tracking-wide">{item.label}</p>
                            <p className="text-xs font-bold text-dark-navy mt-0.5 truncate">{item.value || '—'}</p>
                          </div>
                        ))}
                      </div>

                      {/* Disclaimer box */}
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">Mandatory Clinical Notice</p>
                          <p className="text-[11px] text-amber-800 mt-1.5 leading-relaxed">
                            India Care Consultancy acts purely as a recommendation and search assistant. We do not provide prescription treatments. Always verify clinical registration numbers at the reception before starting any treatment.
                          </p>
                        </div>
                      </div>

                      {/* Consent checkboxes */}
                      <div className="flex flex-col gap-4">
                        <Checkbox checked={formData.patientDisclaimerConsent} onChange={v => set('patientDisclaimerConsent', v)}>
                          I understand and accept the{' '}
                          <Link href="/disclaimer" target="_blank" className="text-primary-green font-bold hover:underline">Patient Disclaimer</Link>
                          . I agree that final medical decisions are between myself and the selected doctor.
                        </Checkbox>
                        <Checkbox checked={formData.dataConsent} onChange={v => set('dataConsent', v)}>
                          I agree to the{' '}
                          <Link href="/data-consent" target="_blank" className="text-primary-green font-bold hover:underline">Data Consent Policy</Link>
                          . I authorise India Care to encrypt and transmit my symptom history to designated consultants and clinical desks.
                        </Checkbox>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Navigation Footer ── */}
            <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button type="button" onClick={handlePrevStep}
                  className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-dark-navy border border-slate-200 bg-white px-5 py-3 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < STEPS.length ? (
                <button type="button" onClick={handleNextStep}
                  className="flex items-center gap-2 text-sm font-bold text-white gradient-primary px-7 py-3 rounded-2xl shadow-lg glow-green hover:opacity-90 transition-all">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 text-sm font-bold text-white gradient-primary px-8 py-3 rounded-2xl shadow-lg glow-green disabled:opacity-60 transition-all">
                  {submitting ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Submitting…</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Submit Request</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {[
            { icon: BadgeCheck, text: '100+ Verified Doctors' },
            { icon: Star,       text: '4.9★ Patient Rating' },
            { icon: Heart,      text: 'Free for Patients' },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-text-grey">
              <t.icon className="w-3.5 h-3.5 text-primary-green" /> {t.text}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   PAGE EXPORT
════════════════════════════════════════ */
export default function BookConsultationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary-green/20 border-t-primary-green animate-spin" />
      </div>
    }>
      <IntakeFormContent />
    </Suspense>
  );
}
