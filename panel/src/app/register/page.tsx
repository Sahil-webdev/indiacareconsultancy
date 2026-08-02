'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Stethoscope, Building2, User, Mail, Lock, Phone, MapPin,
  ShieldCheck, ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  FileText, Briefcase, Globe, Bed, ChevronRight, Check, ArrowRight,
  Sparkles, BadgeCheck, Clock, Award, Shield, HeartPulse, Copy,
  CreditCard, Upload, Image as ImageIcon
} from 'lucide-react';
import { panelApi } from '@/lib/api';

type Role = 'doctor' | 'hospital';

const OFFICIAL_UPI_ID = '9024155604@ibl';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('doctor');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [loadingSpecs, setLoadingSpecs] = useState(true);

  // Form Fields - Doctor
  const [docForm, setDocForm] = useState({
    name: '', email: '', password: '', phone: '', gender: 'Male',
    medicalRegistrationNumber: '', qualification: '', speciality: '',
    experience: 0, clinicAddress: '', location: '', consultationFee: 500,
    consultationType: 'Both', bio: '', hospitalName: ''
  });

  // Form Fields - Hospital
  const [hospForm, setHospForm] = useState({
    name: '', email: '', password: '', phone: '', emergencyContact: '',
    website: '', registrationNo: '', hospitalType: 'Multispeciality',
    totalBeds: 50, address: '', city: '', opdTimings: '9:00 AM - 6:00 PM',
    about: ''
  });

  // Payment State
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const subscriptionFee = role === 'doctor' ? 999 : 1999;

  // Auto-format doctor name: capitalize words & ensure Dr. prefix
  const formatDoctorName = (raw: string): string => {
    if (!raw) return '';
    // Capitalize each word
    const capitalized = raw.replace(/\b(\w)/g, (ch) => ch.toUpperCase());
    // If user hasn't started with Dr. or DR., auto-prepend it
    if (!/^Dr\.\s*/i.test(capitalized.trimStart())) {
      return `Dr. ${capitalized.trimStart()}`;
    }
    // Normalize so prefix is always exactly "Dr. "
    return capitalized.replace(/^Dr\.?\s*/i, 'Dr. ');
  };

  const handleDoctorNameChange = (raw: string) => {
    // Allow user to freely type; we only format on blur to avoid cursor issues
    // But we DO capitalize mid-type and ensure prefix once they start the name part
    const words = raw.split(' ');
    const formatted = words
      .map((w, i) => {
        // Keep "Dr." exactly if it's the first token
        if (i === 0 && /^dr\.?$/i.test(w)) return 'Dr.';
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ');
    setDocForm({ ...docForm, name: formatted });
  };

  const handleDoctorNameBlur = () => {
    setDocForm((prev) => ({ ...prev, name: formatDoctorName(prev.name) }));
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(OFFICIAL_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Receipt screenshot size should be less than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      if (base64) setScreenshotUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  // Fetch dynamic specialities for Doctor selection dropdown
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/specialities`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.specialities)) {
          setSpecialities(data.specialities.map((s: { name: string }) => s.name));
        } else {
          setSpecialities(['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Gynecology', 'Pediatrics', 'ENT', 'Dentist', 'Urology', 'Gastroenterology']);
        }
      })
      .catch(() => {
        setSpecialities(['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Gynecology', 'Pediatrics', 'ENT', 'Dentist', 'Urology', 'Gastroenterology']);
      })
      .finally(() => setLoadingSpecs(false));
  }, []);

  // Validation per step
  const validateStep = (currentStep: number): boolean => {
    setError('');
    if (role === 'doctor') {
      if (currentStep === 1) {
        if (!docForm.name.trim() || !docForm.email.trim() || !docForm.password || !docForm.phone.trim()) {
          setError('Please fill in your name, email, password, and phone number.');
          return false;
        }
      } else if (currentStep === 2) {
        if (!docForm.medicalRegistrationNumber.trim() || !docForm.qualification.trim() || !docForm.speciality) {
          setError('Please fill in your MCI registration number, qualification, and speciality.');
          return false;
        }
      } else if (currentStep === 3) {
        if (!docForm.location.trim() || !docForm.clinicAddress.trim()) {
          setError('Please enter your city and clinic address.');
          return false;
        }
      } else if (currentStep === 4) {
        if (!utrNumber.trim() || utrNumber.trim().length < 6) {
          setError('Please enter a valid 12-digit UTR / UPI Reference Number from your payment app.');
          return false;
        }
      }
    } else {
      if (currentStep === 1) {
        if (!hospForm.name.trim() || !hospForm.email.trim() || !hospForm.password || !hospForm.phone.trim()) {
          setError('Please fill in hospital name, email, password, and phone number.');
          return false;
        }
      } else if (currentStep === 2) {
        if (!hospForm.registrationNo.trim()) {
          setError('Please fill in your hospital license / registration number.');
          return false;
        }
      } else if (currentStep === 3) {
        if (!hospForm.city.trim() || !hospForm.address.trim()) {
          setError('Please enter your city and complete hospital address.');
          return false;
        }
      } else if (currentStep === 4) {
        if (!utrNumber.trim() || utrNumber.trim().length < 6) {
          setError('Please enter a valid 12-digit UTR / UPI Reference Number from your payment app.');
          return false;
        }
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(s => (s < 4 ? (s + 1) as 2 | 3 | 4 : s));
    }
  };

  const handlePrevStep = () => {
    setError('');
    setStep(s => (s > 1 ? (s - 1) as 1 | 2 | 3 : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    setError('');
    try {
      const payload = role === 'doctor'
        ? { ...docForm, utrNumber: utrNumber.trim(), screenshotUrl, subscriptionFee }
        : { ...hospForm, utrNumber: utrNumber.trim(), screenshotUrl, subscriptionFee };

      if (role === 'doctor') {
        await panelApi('/api/auth/register-doctor', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else {
        await panelApi('/api/auth/register-hospital', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #03070D 0%, #080E18 50%, #040B13 100%)' }}>

      {/* ── LEFT SHOWCASE PANEL (Desktop) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden border-r"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'linear-gradient(160deg, rgba(8,20,32,0.9) 0%, rgba(4,13,24,0.95) 100%)' }}>
        
        {/* Background ambient lighting */}
        <div className="dot-grid absolute inset-0 opacity-20 pointer-events-none" />
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none"
          style={{ background: role === 'doctor' ? 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full blur-[140px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ICC Logo" className="h-12 w-auto object-contain drop-shadow-md" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
            style={{
              background: role === 'doctor' ? 'rgba(14,165,233,0.1)' : 'rgba(16,185,129,0.1)',
              borderColor: role === 'doctor' ? 'rgba(14,165,233,0.25)' : 'rgba(16,185,129,0.25)',
              color: role === 'doctor' ? '#38bdf8' : '#34d399',
            }}>
            <Sparkles className="w-3 h-3" /> {role === 'doctor' ? 'Physician Portal' : 'Hospital Network'}
          </span>
        </div>

        {/* Center Live Interactive Preview Card */}
        <div className="relative z-10 my-auto py-8">
          <div className="text-left mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">Live Profile Preview</h2>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>See how your verified profile will appear on the ICC platform once approved.</p>
          </div>

          <motion.div
            key={role}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl p-6 relative overflow-hidden shadow-2xl backdrop-blur-xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              borderColor: role === 'doctor' ? 'rgba(56,189,248,0.2)' : 'rgba(52,211,153,0.2)',
              boxShadow: role === 'doctor' ? '0 20px 50px rgba(14,165,233,0.1)' : '0 20px 50px rgba(16,185,129,0.1)',
            }}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0 ${role === 'doctor' ? 'bg-gradient-to-br from-sky-400 to-blue-600' : 'bg-gradient-to-br from-emerald-400 to-teal-600'}`}>
                {role === 'doctor'
                  ? (docForm.name ? docForm.name.replace(/^Dr\.\s*/i,'')[0]?.toUpperCase() : <Stethoscope className="w-7 h-7" />)
                  : (hospForm.name ? hospForm.name[0]?.toUpperCase() : <Building2 className="w-7 h-7" />)
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white truncate">
                    {role === 'doctor' ? (docForm.name || 'Dr. Your Name') : (hospForm.name || 'Hospital / Clinic Name')}
                  </h3>
                  <span className="flex-shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    Pending Verification
                  </span>
                </div>
                <p className="text-xs mt-1 font-medium" style={{ color: role === 'doctor' ? '#38bdf8' : '#34d399' }}>
                  {role === 'doctor'
                    ? (docForm.speciality || 'Speciality (e.g. Cardiology)')
                    : (hospForm.hospitalType || 'Multispeciality Facility')
                  }
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: '#64748B' }}>
                  {role === 'doctor'
                    ? (docForm.qualification ? `${docForm.qualification} · ${docForm.experience || 0} yrs exp` : 'Qualification & Experience')
                    : (`${hospForm.totalBeds || 0} Beds · Reg: ${hospForm.registrationNo || 'Lic-Pending'}`)
                  }
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-[11px]">
              <div className="flex items-center gap-2" style={{ color: '#94A3B8' }}>
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{role === 'doctor' ? (docForm.location || 'City / Location') : (hospForm.city || 'City / Location')}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: '#94A3B8' }}>
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{role === 'doctor' ? (docForm.phone || '+91 Contact') : (hospForm.phone || '+91 Contact')}</span>
              </div>
            </div>

            {/* Plan Badge */}
            <div className="mt-3 bg-white/5 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
              <span style={{ color: '#64748B' }}>Monthly Subscription</span>
              <span className="font-extrabold text-emerald-400">₹{subscriptionFee} / mo</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-3 border-t pt-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {[
            { icon: ShieldCheck, title: 'MCI Checked', sub: 'Verified Credentials' },
            { icon: HeartPulse,  title: 'Direct Leads', sub: 'Patient Enquiries' },
            { icon: Award,       title: 'Zero Commission', sub: 'Flat Subscription' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <item.icon className="w-4 h-4 text-emerald-400 mb-1" />
              <p className="text-xs font-bold text-white">{item.title}</p>
              <p className="text-[10px]" style={{ color: '#64748B' }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM WIZARD PANEL ── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        <div className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-between">

          {/* Top Bar: Back Link & Role Selector Switch */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <Link href="/login" className="inline-flex items-center gap-2 text-xs font-medium hover:text-white transition-colors" style={{ color: '#64748B' }}>
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Panel Login
              </Link>

              {/* Role Toggle Switch */}
              <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => { setRole('doctor'); setError(''); }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    role === 'doctor'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" /> Doctor
                </button>
                <button
                  type="button"
                  onClick={() => { setRole('hospital'); setError(''); }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    role === 'hospital'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Hospital
                </button>
              </div>
            </div>

            {/* Step Stepper Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {role === 'doctor' ? 'Doctor Partner Registration' : 'Hospital Partner Registration'}
                  </h1>
                  <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                    {step === 1 && 'Step 1 of 4: Account & Contact Details'}
                    {step === 2 && 'Step 2 of 4: Medical License & Credentials'}
                    {step === 3 && 'Step 3 of 4: Clinical Practice & Location'}
                    {step === 4 && 'Step 4 of 4: Monthly Subscription & UPI QR Payment'}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  Step {step} / 4
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                <motion.div
                  className={`h-full ${role === 'doctor' ? 'bg-gradient-to-r from-sky-400 to-blue-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                  initial={{ width: '25%' }}
                  animate={{ width: `${(step / 4) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="my-auto">
            <AnimatePresence mode="wait">
              {success ? (
                /* Success Animated State */
                <motion.div
                  key="success-screen"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl p-8 flex flex-col items-center text-center gap-5 shadow-2xl border"
                  style={{ background: 'rgba(10,18,30,0.8)', borderColor: 'rgba(34,197,94,0.25)', backdropFilter: 'blur(20px)' }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <h2 className="text-2xl font-black text-white">Registration &amp; UTR Payment Submitted! 🎉</h2>
                  <p className="text-xs leading-relaxed max-w-sm" style={{ color: '#94A3B8' }}>
                    Your partner registration for <strong className="text-white">{role === 'doctor' ? docForm.name : hospForm.name}</strong> along with UTR <span className="font-mono font-bold text-emerald-400">{utrNumber}</span> has been submitted to Super Admin.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                    <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Login screen…
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  
                  {/* Error Alert */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2.5 rounded-2xl px-4 py-3 mb-6 text-xs font-semibold border"
                        style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', color: '#ef4444' }}
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── STEP 1: ACCOUNT DETAILS ── */}
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>
                            {role === 'doctor' ? 'Full Name *' : 'Hospital Name *'}
                          </label>
                          <div className="relative">
                            {role === 'doctor' ? <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /> : <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />}
                            <input
                              type="text"
                              value={role === 'doctor' ? docForm.name : hospForm.name}
                              onChange={e => role === 'doctor'
                                ? handleDoctorNameChange(e.target.value)
                                : setHospForm({ ...hospForm, name: e.target.value })
                              }
                              onBlur={() => role === 'doctor' && handleDoctorNameBlur()}
                              placeholder={role === 'doctor' ? 'Dr. Ramesh Kumar' : 'Apollo Spectra Hospital'}
                              className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Email Address *</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="email"
                              value={role === 'doctor' ? docForm.email : hospForm.email}
                              onChange={e => role === 'doctor' ? setDocForm({ ...docForm, email: e.target.value }) : setHospForm({ ...hospForm, email: e.target.value })}
                              placeholder="contact@domain.com"
                              className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Password *</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="password"
                              value={role === 'doctor' ? docForm.password : hospForm.password}
                              onChange={e => role === 'doctor' ? setDocForm({ ...docForm, password: e.target.value }) : setHospForm({ ...hospForm, password: e.target.value })}
                              placeholder="••••••••"
                              className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Phone Number *</label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="tel"
                              value={role === 'doctor' ? docForm.phone : hospForm.phone}
                              onChange={e => role === 'doctor' ? setDocForm({ ...docForm, phone: e.target.value }) : setHospForm({ ...hospForm, phone: e.target.value })}
                              placeholder="+91 98765 43210"
                              className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {role === 'doctor' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Gender</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Male', 'Female', 'Other'].map(g => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setDocForm({ ...docForm, gender: g })}
                                className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                                  docForm.gender === g
                                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                                    : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ── STEP 2: CREDENTIALS ── */}
                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      {role === 'doctor' ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* MCI Reg */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>MCI / State Reg No. *</label>
                              <div className="relative">
                                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                  type="text"
                                  value={docForm.medicalRegistrationNumber}
                                  onChange={e => setDocForm({ ...docForm, medicalRegistrationNumber: e.target.value })}
                                  placeholder="MCI-123456"
                                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                              </div>
                            </div>

                            {/* Qualification */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Qualification *</label>
                              <div className="relative">
                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                  type="text"
                                  value={docForm.qualification}
                                  onChange={e => setDocForm({ ...docForm, qualification: e.target.value })}
                                  placeholder="MBBS, MD, DM (Cardiology)"
                                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Speciality Dropdown */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Speciality *</label>
                              <select
                                value={docForm.speciality}
                                onChange={e => setDocForm({ ...docForm, speciality: e.target.value })}
                                className="w-full px-4 py-3 rounded-2xl text-xs text-white bg-slate-900 border border-white/[0.1] focus:outline-none focus:border-emerald-500/50 transition-all"
                              >
                                <option value="">Select Speciality</option>
                                {specialities.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>

                            {/* Experience */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Years of Experience</label>
                              <input
                                type="number"
                                min={0}
                                max={60}
                                value={docForm.experience}
                                onChange={e => setDocForm({ ...docForm, experience: Number(e.target.value) })}
                                className="w-full px-4 py-3 rounded-2xl text-xs text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Hospital Reg No */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Hospital License / Reg No. *</label>
                              <div className="relative">
                                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                  type="text"
                                  value={hospForm.registrationNo}
                                  onChange={e => setHospForm({ ...hospForm, registrationNo: e.target.value })}
                                  placeholder="HOSP-REG-9876"
                                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                              </div>
                            </div>

                            {/* Hospital Type */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Facility Type</label>
                              <select
                                value={hospForm.hospitalType}
                                onChange={e => setHospForm({ ...hospForm, hospitalType: e.target.value })}
                                className="w-full px-4 py-3 rounded-2xl text-xs text-white bg-slate-900 border border-white/[0.1] focus:outline-none focus:border-emerald-500/50 transition-all"
                              >
                                <option value="Multispeciality">Multispeciality Hospital</option>
                                <option value="Super Speciality">Super Speciality Center</option>
                                <option value="Clinic & Diagnostic">Clinic &amp; Diagnostic</option>
                                <option value="Nursing Home">Nursing Home</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Total Beds */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Total Beds</label>
                              <div className="relative">
                                <Bed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                  type="number"
                                  min={1}
                                  value={hospForm.totalBeds}
                                  onChange={e => setHospForm({ ...hospForm, totalBeds: Number(e.target.value) })}
                                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                              </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Emergency Contact (Optional)</label>
                              <input
                                type="tel"
                                value={hospForm.emergencyContact}
                                onChange={e => setHospForm({ ...hospForm, emergencyContact: e.target.value })}
                                placeholder="+91 Emergency Hotline"
                                className="w-full px-4 py-3 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* ── STEP 3: PRACTICE & LOCATION ── */}
                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      {role === 'doctor' ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* City / Location */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>City / Primary Location *</label>
                              <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                  type="text"
                                  value={docForm.location}
                                  onChange={e => setDocForm({ ...docForm, location: e.target.value })}
                                  placeholder="e.g. New Delhi"
                                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                              </div>
                            </div>

                            {/* Consultation Fee */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Consultation Fee (₹)</label>
                              <input
                                type="number"
                                step={50}
                                value={docForm.consultationFee}
                                onChange={e => setDocForm({ ...docForm, consultationFee: Number(e.target.value) })}
                                className="w-full px-4 py-3 rounded-2xl text-xs text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                              />
                            </div>
                          </div>

                          {/* Clinic Address */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Clinic / OPD Address *</label>
                            <textarea
                              value={docForm.clinicAddress}
                              onChange={e => setDocForm({ ...docForm, clinicAddress: e.target.value })}
                              rows={2}
                              placeholder="Complete address of primary clinic..."
                              className="w-full px-4 py-2.5 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 resize-none transition-all"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* City */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>City *</label>
                              <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                  type="text"
                                  value={hospForm.city}
                                  onChange={e => setHospForm({ ...hospForm, city: e.target.value })}
                                  placeholder="e.g. Pune"
                                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                              </div>
                            </div>

                            {/* Website */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Website (Optional)</label>
                              <div className="relative">
                                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                  type="url"
                                  value={hospForm.website}
                                  onChange={e => setHospForm({ ...hospForm, website: e.target.value })}
                                  placeholder="www.apollospectra.com"
                                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Address */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Complete Address *</label>
                            <textarea
                              value={hospForm.address}
                              onChange={e => setHospForm({ ...hospForm, address: e.target.value })}
                              rows={2}
                              placeholder="Full location address of the hospital..."
                              className="w-full px-4 py-2.5 rounded-2xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 resize-none transition-all"
                            />
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* ── STEP 4: MONTHLY SUBSCRIPTION & UPI PAYMENT (NEW DESIGN) ── */}
                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      
                      {/* Plan Summary Badge */}
                      <div className="p-4 rounded-2xl border-2 border-emerald-500/40 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.05) 100%)' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-white">
                                {role === 'doctor' ? 'Doctor Partner Subscription' : 'Hospital Network Membership'}
                              </h4>
                              <p className="text-[10px] text-slate-400">30 Days Full Access · Verified Partner Badge · Direct Patient Leads</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-emerald-400">₹{subscriptionFee}</span>
                            <span className="text-[10px] text-slate-400 block">/ Month</span>
                          </div>
                        </div>
                      </div>

                      {/* Official QR Code Box */}
                      <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 text-center space-y-3">
                        <div className="inline-block p-3 bg-white rounded-2xl shadow-xl border border-white/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/payment-qr.png" alt="ICC Official Payment QR" className="w-40 h-40 object-contain mx-auto" />
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official UPI ID</p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono text-sm font-black text-emerald-400">{OFFICIAL_UPI_ID}</span>
                            <button
                              type="button"
                              onClick={copyUpiId}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-500/25 transition-all"
                            >
                              {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              {copiedUpi ? 'Copied' : 'Copy UPI'}
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500">Scan via PhonePe, Google Pay, Paytm, BHIM, or any UPI app</p>
                        </div>
                      </div>

                      {/* UTR Entry Form */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                            12-Digit UTR / UPI Ref Number *
                          </label>
                          <input
                            type="text"
                            value={utrNumber}
                            onChange={e => setUtrNumber(e.target.value)}
                            placeholder="e.g. 420198765432"
                            maxLength={20}
                            className="w-full px-3.5 py-3 rounded-2xl text-xs text-white bg-slate-900 border border-white/10 font-mono font-bold focus:outline-none focus:border-emerald-500/50"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">Found on your UPI payment confirmation receipt screen</p>
                        </div>

                        {/* Upload Receipt */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                            Payment Receipt Screenshot (Optional)
                          </label>
                          <input
                            type="file"
                            ref={screenshotInputRef}
                            onChange={handleScreenshotChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => screenshotInputRef.current?.click()}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5 text-emerald-400" />
                              {screenshotUrl ? 'Change Receipt' : 'Upload Receipt'}
                            </button>
                            {screenshotUrl && (
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                <ImageIcon className="w-3.5 h-3.5" /> Attached
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* Wizard Step Controls */}
                  <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-white/5">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-all"
                      >
                        Back
                      </button>
                    ) : (
                      <div />
                    )}

                    {step < 4 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-white shadow-lg transition-all ${
                          role === 'doctor'
                            ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500'
                        }`}
                      >
                        Continue to Payment <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-black text-slate-950 shadow-xl transition-all disabled:opacity-50 ${
                          role === 'doctor'
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-emerald-500/20'
                        }`}
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                        Submit Partner Application &amp; UTR Payment
                      </button>
                    )}
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] mt-6" style={{ color: '#475569' }}>
            🔒 Verified &amp; Encrypted Portal · India Care Consultancy
          </div>

        </div>
      </div>
    </div>
  );
}
