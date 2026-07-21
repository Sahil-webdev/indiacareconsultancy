'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Stethoscope, Building2, User, Mail, Lock, Phone, MapPin,
  ShieldCheck, ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  FileText, Briefcase, Globe, Bed, ChevronRight, Check
} from 'lucide-react';
import { panelApi } from '@/lib/api';

type Tab = 'doctor' | 'hospital';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [activeRole, setActiveRole] = useState<Tab>('doctor');
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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleDocRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!docForm.name || !docForm.email || !docForm.password || !docForm.phone || !docForm.medicalRegistrationNumber || !docForm.speciality || !docForm.location) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await panelApi('/api/auth/register-doctor', {
        method: 'POST',
        body: JSON.stringify(docForm),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHospRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hospForm.name || !hospForm.email || !hospForm.password || !hospForm.phone || !hospForm.registrationNo || !hospForm.address || !hospForm.city) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await panelApi('/api/auth/register-hospital', {
        method: 'POST',
        body: JSON.stringify(hospForm),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #04090F 0%, #0B111A 50%, #050E16 100%)' }}>
      
      {/* Premium Background Overlays */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,184,154,0.06) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }} />

      <AnimatePresence mode="wait">
        {success ? (
          /* Success Screen */
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-md rounded-3xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl relative z-10"
            style={{ background: 'rgba(10,18,30,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-white">Registration Submitted!</h2>
            <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
              Your partnership request has been forwarded to the Super Admin. You can log in using your registered credentials to activate your monthly plan once verified.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirecting to login…
            </div>
          </motion.div>
        ) : step === 'select' ? (
          /* Selection Screen */
          <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl relative z-10 my-8 flex flex-col items-center">
            
            <Link href="/login" className="self-start inline-flex items-center gap-2 text-xs mb-6 hover:text-white transition-colors" style={{ color: '#64748B' }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>

            <div className="text-center mb-10 max-w-lg">
              <span className="text-[10px] font-black tracking-widest text-[#25B89A] uppercase bg-[#25B89A]/10 border border-[#25B89A]/20 px-3 py-1 rounded-full">Partnership Program</span>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight leading-tight">Choose Your Onboarding</h1>
              <p className="text-xs mt-2" style={{ color: '#64748B' }}>Select the partnership profile that best represents your medical practice to get started.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Doctor Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => { setActiveRole('doctor'); setStep('form'); }}
                className="rounded-3xl p-8 cursor-pointer flex flex-col gap-6 transition-all shadow-xl group text-left relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(13,27,42,0.8) 0%, rgba(10,18,30,0.85) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(14,165,233,0.15)'
                }}
              >
                <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/10 transition-colors" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">Doctor Partner</h3>
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#94A3B8' }}>For independent specialists, clinical practitioners, and consulting physicians looking to list profiles and manage consultations.</p>
                </div>
                <div className="border-t border-white/5 pt-4 mt-auto">
                  <ul className="space-y-2.5 text-[11px]" style={{ color: '#64748B' }}>
                    {['Receive live consultation leads', 'List in the ICC doctor directories', 'Manage patient appointments'].map((b, i) => (
                      <li key={i} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-400" /> {b}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mt-4 group-hover:translate-x-1.5 transition-transform">
                  Register as Doctor <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>

              {/* Hospital Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => { setActiveRole('hospital'); setStep('form'); }}
                className="rounded-3xl p-8 cursor-pointer flex flex-col gap-6 transition-all shadow-xl group text-left relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(13,27,42,0.8) 0%, rgba(10,18,30,0.85) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16,185,129,0.15)'
                }}
              >
                <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">Hospital Partner</h3>
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#94A3B8' }}>For healthcare centers, multi-speciality complexes, and private nursing homes wishing to configure departments and manage rosters.</p>
                </div>
                <div className="border-t border-white/5 pt-4 mt-auto">
                  <ul className="space-y-2.5 text-[11px]" style={{ color: '#64748B' }}>
                    {['Manage entire departments & beds', 'Onboard multiple doctors', 'Promote hospital facility listings'].map((b, i) => (
                      <li key={i} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> {b}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mt-4 group-hover:translate-x-1.5 transition-transform">
                  Register as Hospital <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* Form Screen */
          <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="w-full max-w-2xl relative z-10 my-8">
            
            <button onClick={() => { setStep('select'); setError(''); }}
              className="inline-flex items-center gap-2 text-xs mb-6 hover:text-white transition-colors" style={{ color: '#64748B' }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Selection
            </button>

            <div className="rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden"
              style={{
                background: 'rgba(10,18,30,0.8)',
                backdropFilter: 'blur(20px)',
                border: activeRole === 'doctor' ? '1px solid rgba(14,165,233,0.2)' : '1px solid rgba(16,185,129,0.2)'
              }}>
              
              {/* Profile specific side glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                style={{ background: activeRole === 'doctor' ? 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />

              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${activeRole === 'doctor' ? 'bg-gradient-to-br from-sky-400 to-blue-600' : 'bg-gradient-to-br from-emerald-400 to-teal-600'}`}>
                  {activeRole === 'doctor' ? <Stethoscope className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{activeRole === 'doctor' ? 'Doctor Registration' : 'Hospital Registration'}</h2>
                  <p className="text-xs" style={{ color: '#64748B' }}>Fill in the credentials and operational details below.</p>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="flex items-start gap-2 rounded-2xl px-4 py-3 mb-2 text-xs font-medium border"
                  style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* DOCTOR FORM */}
              {activeRole === 'doctor' && (
                <form onSubmit={handleDocRegister} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })}
                          placeholder="Dr. Ramesh Kumar" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="email" value={docForm.email} onChange={e => setDocForm({ ...docForm, email: e.target.value })}
                          placeholder="ramesh@indiacare.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="password" value={docForm.password} onChange={e => setDocForm({ ...docForm, password: e.target.value })}
                          placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="tel" value={docForm.phone} onChange={e => setDocForm({ ...docForm, phone: e.target.value })}
                          placeholder="+91 98765 43210" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Gender</label>
                      <select value={docForm.gender} onChange={e => setDocForm({ ...docForm, gender: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/[0.08] focus:outline-none focus:border-emerald-500/50">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* MCI Registration No */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>MCI Registration No *</label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" value={docForm.medicalRegistrationNumber} onChange={e => setDocForm({ ...docForm, medicalRegistrationNumber: e.target.value })}
                          placeholder="MCI-34521" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Qualification */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Qualification *</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" value={docForm.qualification} onChange={e => setDocForm({ ...docForm, qualification: e.target.value })}
                          placeholder="e.g. MBBS, MD (Cardiology)" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Speciality */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Speciality *</label>
                      <select value={docForm.speciality} onChange={e => setDocForm({ ...docForm, speciality: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/[0.08] focus:outline-none focus:border-emerald-500/50">
                        <option value="">Select Speciality</option>
                        {specialities.map((s, idx) => (
                          <option key={idx} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Experience */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Experience (Years)</label>
                      <input type="number" value={docForm.experience || ''} onChange={e => setDocForm({ ...docForm, experience: Number(e.target.value) })}
                        placeholder="e.g. 10" className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                    </div>

                    {/* Location (City) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>City *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" value={docForm.location} onChange={e => setDocForm({ ...docForm, location: e.target.value })}
                          placeholder="e.g. Delhi" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Fee */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Consultation Fee (₹)</label>
                      <input type="number" value={docForm.consultationFee || ''} onChange={e => setDocForm({ ...docForm, consultationFee: Number(e.target.value) })}
                        placeholder="e.g. 500" className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                    </div>

                    {/* Consultation Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Consultation Type</label>
                      <select value={docForm.consultationType} onChange={e => setDocForm({ ...docForm, consultationType: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/[0.08] focus:outline-none focus:border-emerald-500/50">
                        <option value="Both">Both (Online &amp; In-Clinic)</option>
                        <option value="Online">Online Only</option>
                        <option value="Offline">In-Clinic Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Hospital Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Hospital Name (Optional)</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" value={docForm.hospitalName} onChange={e => setDocForm({ ...docForm, hospitalName: e.target.value })}
                        placeholder="e.g. Max Hospital" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                    </div>
                  </div>

                  {/* Clinic Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Clinic Address *</label>
                    <textarea value={docForm.clinicAddress} onChange={e => setDocForm({ ...docForm, clinicAddress: e.target.value })} rows={2}
                      placeholder="Complete address of your clinic/hospital ward…" className="w-full px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 resize-none" />
                  </div>

                  {/* Bio */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Short Bio</label>
                    <textarea value={docForm.bio} onChange={e => setDocForm({ ...docForm, bio: e.target.value })} rows={2}
                      placeholder="Tell patients about your medical experience and credentials…" className="w-full px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 resize-none" />
                  </div>

                  {/* Submit Button */}
                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 mt-2 transition-all shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', boxShadow: '0 8px 24px rgba(14,165,233,0.2)' }}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Register as Doctor
                  </button>
                </form>
              )}

              {/* HOSPITAL FORM */}
              {activeRole === 'hospital' && (
                <form onSubmit={handleHospRegister} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Hospital Name *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" value={hospForm.name} onChange={e => setHospForm({ ...hospForm, name: e.target.value })}
                          placeholder="Apollo Spectra Hospital" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="email" value={hospForm.email} onChange={e => setHospForm({ ...hospForm, email: e.target.value })}
                          placeholder="admin@apollospectra.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="password" value={hospForm.password} onChange={e => setHospForm({ ...hospForm, password: e.target.value })}
                          placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="tel" value={hospForm.phone} onChange={e => setHospForm({ ...hospForm, phone: e.target.value })}
                          placeholder="+91 11 4343 4343" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Registration No */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Reg. License Number *</label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" value={hospForm.registrationNo} onChange={e => setHospForm({ ...hospForm, registrationNo: e.target.value })}
                          placeholder="DHR/2015/00234" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Hospital Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Hospital Type</label>
                      <select value={hospForm.hospitalType} onChange={e => setHospForm({ ...hospForm, hospitalType: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/[0.08] focus:outline-none focus:border-emerald-500/50">
                        <option value="Multispeciality">Multispeciality</option>
                        <option value="General">General Clinic</option>
                        <option value="Specialty">Specialty Center</option>
                        <option value="Nursing Home">Nursing Home</option>
                        <option value="Diagnostic Centre">Diagnostic Center</option>
                      </select>
                    </div>

                    {/* Total Beds */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Total Beds</label>
                      <div className="relative">
                        <Bed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="number" value={hospForm.totalBeds || ''} onChange={e => setHospForm({ ...hospForm, totalBeds: Number(e.target.value) })}
                          placeholder="e.g. 100" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>City *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" value={hospForm.city} onChange={e => setHospForm({ ...hospForm, city: e.target.value })}
                          placeholder="e.g. Noida" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Website */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Website (Optional)</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="url" value={hospForm.website} onChange={e => setHospForm({ ...hospForm, website: e.target.value })}
                          placeholder="www.apollospectra.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Emergency Contact No</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        <input type="tel" value={hospForm.emergencyContact} onChange={e => setHospForm({ ...hospForm, emergencyContact: e.target.value })}
                          placeholder="+91 98100 77777" className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Complete Address *</label>
                    <textarea value={hospForm.address} onChange={e => setHospForm({ ...hospForm, address: e.target.value })} rows={2}
                      placeholder="Complete location address of the hospital building…" className="w-full px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 resize-none" />
                  </div>

                  {/* About */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>About / Overview</label>
                    <textarea value={hospForm.about} onChange={e => setHospForm({ ...hospForm, about: e.target.value })} rows={2}
                      placeholder="Describe your hospital facilities, departments, and credentials…" className="w-full px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-600 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 resize-none" />
                  </div>

                  {/* Submit Button */}
                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 mt-2 transition-all shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 8px 24px rgba(16,185,129,0.2)' }}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Register as Hospital
                  </button>
                </form>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
