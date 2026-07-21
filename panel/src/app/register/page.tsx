'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Stethoscope, Building2, User, Mail, Lock, Phone, MapPin,
  ShieldCheck, ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  FileText, Briefcase, Globe, Bed
} from 'lucide-react';
import { panelApi } from '@/lib/api';

type Tab = 'doctor' | 'hospital';

export default function RegisterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('doctor');
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
    
    // Quick validation
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

    // Quick validation
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
      style={{ background: 'linear-gradient(135deg, #060C14 0%, #0E1623 50%, #0A1620 100%)' }}>
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(18,122,106,0.06) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,184,154,0.04) 0%, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10 my-8">
        
        {/* Back Link */}
        <Link href="/login" className="inline-flex items-center gap-2 text-xs mb-6 hover:text-white transition-colors" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

        {/* Form Container */}
        <div className="rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)' }}>
          
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Partner Registration</h1>
            <p className="text-xs" style={{ color: '#64748B' }}>Submit your details to self-register on India Care Consultancy.</p>
          </div>

          {/* Success screen */}
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-4 py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-extrabold text-white">Registration Submitted!</h2>
                <p className="text-xs max-w-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                  Your request has been sent to the Super Admin. You can log in using your credentials after approval to activate your monthly subscription.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirecting to login…
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-2xl bg-white/[0.02]" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  {[
                    { id: 'doctor', label: 'Doctor', icon: Stethoscope },
                    { id: 'hospital', label: 'Hospital', icon: Building2 },
                  ].map(t => {
                    const Icon = t.icon;
                    const active = activeTab === t.id;
                    return (
                      <button key={t.id} onClick={() => { setActiveTab(t.id as Tab); setError(''); }}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: active ? 'rgba(37,184,154,0.12)' : 'transparent',
                          color: active ? '#25B89A' : '#64748B',
                        }}>
                        <Icon className="w-4 h-4" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-start gap-2 rounded-2xl px-4 py-3 mb-5 text-xs font-medium border"
                    style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* DOCTOR FORM */}
                {activeTab === 'doctor' && (
                  <form onSubmit={handleDocRegister} className="flex flex-col gap-4">
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
                      style={{ background: 'linear-gradient(135deg, #25B89A, #127A6A)', color: '#fff' }}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Register as Doctor
                    </button>
                  </form>
                )}

                {/* HOSPITAL FORM */}
                {activeTab === 'hospital' && (
                  <form onSubmit={handleHospRegister} className="flex flex-col gap-4">
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
                      style={{ background: 'linear-gradient(135deg, #25B89A, #127A6A)', color: '#fff' }}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Register as Hospital
                    </button>
                  </form>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
