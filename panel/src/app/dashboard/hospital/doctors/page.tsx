'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Search, Eye, Star, CheckCircle2, Clock, Plus, Phone,
  User, Mail, Lock, X, Loader2, AlertCircle, Trash2
} from 'lucide-react';
import { panelApi } from '@/lib/api';

interface DoctorItem {
  id: string | number;
  name: string;
  email?: string;
  phone: string;
  speciality: string;
  qualification?: string;
  exp?: number;
  fee: number;
  rating: number;
  status: string;
  shifts: string;
  photo?: string;
  isHospitalManaged?: boolean;
}

const FALLBACK_SPECIALITIES = ['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Gynecology', 'Pediatrics', 'ENT', 'Dentist', 'Urology', 'Gastroenterology'];

const statusBadge = (s: string) => ({
  'Active': 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
  'On Leave': 'bg-amber-500/15 text-amber-500 border border-amber-500/30',
  'Pending Verification': 'bg-sky-500/15 text-sky-500 border border-sky-500/30',
  'Inactive': 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
}[s] || 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30');

export default function HospitalDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewDoctor, setViewDoctor] = useState<DoctorItem | null>(null);
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [docForm, setDocForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'Male',
    speciality: FALLBACK_SPECIALITIES[0],
    qualification: 'MBBS',
    experience: 5,
    consultationFee: 500,
    registrationNo: '',
    opdTimings: 'Mon-Sat 9:00 AM - 5:00 PM',
  });

  // Load doctors from backend
  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await panelApi<{ success: boolean; doctors: DoctorItem[] }>('/api/hospitals/me/doctors');
      if (res.success && Array.isArray(res.doctors)) {
        setDoctors(res.doctors);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  // Load specialities list
  useEffect(() => {
    loadDoctors();
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/specialities`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.specialities)) {
          const names = data.specialities.map((s: { name: string }) => s.name).filter(Boolean);
          setSpecialities(names.length ? names : FALLBACK_SPECIALITIES);
        } else {
          setSpecialities(FALLBACK_SPECIALITIES);
        }
      })
      .catch(() => {
        setSpecialities(FALLBACK_SPECIALITIES);
      });
  }, []);

  useEffect(() => {
    if (!docForm.speciality) {
      setDocForm((current) => ({
        ...current,
        speciality: specialities[0] || FALLBACK_SPECIALITIES[0],
      }));
    }
  }, [docForm.speciality, specialities]);

  // Auto-format doctor name: Capitalize words & prepend Dr.
  const handleDoctorNameChange = (val: string) => {
    const capitalized = val.replace(/\b(\w)/g, (ch) => ch.toUpperCase());
    setDocForm({ ...docForm, name: capitalized });
  };

  const handleDoctorNameBlur = () => {
    let name = docForm.name.trim();
    if (!name) return;
    if (!/^Dr\.\s*/i.test(name)) {
      name = `Dr. ${name}`;
    } else {
      name = name.replace(/^Dr\.?\s*/i, 'Dr. ');
    }
    setDocForm({ ...docForm, name });
  };

  // Submit Add Doctor
  const handleAddDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSpeciality = docForm.speciality || specialities[0] || FALLBACK_SPECIALITIES[0];
    if (!docForm.name.trim() || !docForm.email.trim() || !docForm.phone.trim() || !finalSpeciality) {
      setError('Please fill in doctor name, email, phone, and speciality.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      let finalName = docForm.name.trim();
      if (!/^Dr\.\s*/i.test(finalName)) {
        finalName = `Dr. ${finalName}`;
      }

      await panelApi('/api/hospitals/me/doctors', {
        method: 'POST',
        body: JSON.stringify({ ...docForm, name: finalName, speciality: finalSpeciality }),
      });

      setSuccess(`${finalName} added successfully to your hospital!`);
      setAddModalOpen(false);
      setDocForm({
        name: '', email: '', phone: '', password: '', gender: 'Male',
        speciality: specialities[0] || FALLBACK_SPECIALITIES[0], qualification: 'MBBS', experience: 5,
        consultationFee: 500, registrationNo: '', opdTimings: 'Mon-Sat 9:00 AM - 5:00 PM',
      });
      await loadDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add doctor');
    } finally {
      setSubmitting(false);
    }
  };

  // Remove doctor affiliation
  const handleRemoveDoctor = async (doctorId: string | number, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from your hospital affiliation?`)) return;
    try {
      await panelApi(`/api/hospitals/me/doctors/${doctorId}`, { method: 'DELETE' });
      setSuccess(`${name} unlinked from hospital.`);
      await loadDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove doctor');
    }
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.speciality.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      
      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="font-black text-xl tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Stethoscope className="w-5 h-5" style={{ color: '#25B89A' }} /> Our Doctors
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Specialists &amp; doctors affiliated with your hospital. Hospital-created doctors get no separate doctor panel login.</p>
        </div>
        <button
          type="button"
          onClick={() => { setError(''); setAddModalOpen(true); }}
          className="flex items-center gap-2 text-xs font-black text-white px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #127A6A 0%, #075E52 100%)' }}
        >
          <Plus className="w-4 h-4 text-white" /> Add Doctor
        </button>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto panel-scroll p-6 space-y-6">
        
        {/* Success Alert */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between p-3.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {success}
              </div>
              <button onClick={() => setSuccess('')} className="hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between p-3.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                {error}
              </div>
              <button onClick={() => setError('')} className="hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Stethoscope,  label: 'Total Doctors',  value: doctors.length, color: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' },
            { icon: CheckCircle2, label: 'Active Status',  value: doctors.filter(d => d.status === 'Active').length, color: 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/20' },
            { icon: Clock,        label: 'Pending Verification', value: doctors.filter(d => d.status !== 'Active').length, color: 'bg-amber-500/15 text-amber-500 border border-amber-500/20' },
            { icon: Star,         label: 'Avg Rating',     value: doctors.length > 0 ? (doctors.reduce((a, b) => a + (b.rating || 4.8), 0) / doctors.length).toFixed(1) : '4.8', color: 'bg-violet-500/15 text-violet-500 border border-violet-500/20' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="panel-card p-4 flex items-center gap-3.5"
            >
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── SEARCH & DOCTORS TABLE ── */}
        <div className="panel-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b gap-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search doctors by name or speciality…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all"
                style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{filtered.length} doctors listed</span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-xs flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#25B89A' }} /> Loading affiliated doctors…
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No doctors found. Click <strong>Add Doctor</strong> to register doctors under your hospital.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface-3)' }}>
                    {['Doctor Name', 'Speciality', 'Experience', 'Fee', 'Rating', 'OPD Timings', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs" style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A' }}>
                            {d.name ? d.name.replace(/^Dr\.\s*/i, '')[0]?.toUpperCase() : 'D'}
                          </div>
                          <div>
                            <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
                            {d.isHospitalManaged && (
                              <p className="text-[10px] font-bold" style={{ color: '#25B89A' }}>Hospital Managed · No doctor panel login</p>
                            )}
                            <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                              <Phone className="w-3 h-3 opacity-60" /> {d.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: '#25B89A' }}>{d.speciality}</td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{d.exp || 5} yrs</td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{d.fee || 500}</td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {d.rating || 4.8}
                        </span>
                      </td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{d.shifts || 'Mon-Sat 9AM-5PM'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusBadge(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewDoctor(d)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ color: '#25B89A' }}
                            title="View Doctor Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoctor(d.id, d.name)}
                            className="p-1.5 rounded-lg text-red-500 transition-colors hover:bg-red-500/10"
                            title="Remove Doctor Affiliation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* ── ADD DOCTOR MODAL (LIGHT & DARK MODE READY) ── */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold" style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A' }}>
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>Add Doctor to Hospital</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Register and affiliate a new specialist doctor</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleAddDoctorSubmit} className="p-6 overflow-y-auto panel-scroll space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Doctor Full Name */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={docForm.name}
                        onChange={e => handleDoctorNameChange(e.target.value)}
                        onBlur={handleDoctorNameBlur}
                        placeholder="Dr. Ramesh Kumar"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                        style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="email"
                        value={docForm.email}
                        onChange={e => setDocForm({ ...docForm, email: e.target.value })}
                        placeholder="doctor@hospital.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                        style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="tel"
                        value={docForm.phone}
                        onChange={e => setDocForm({ ...docForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                        style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Login Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={docForm.password}
                        onChange={e => setDocForm({ ...docForm, password: e.target.value })}
                        placeholder="Doctor123! (auto-generated if empty)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                        style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Speciality Dropdown */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Speciality *</label>
                    <select
                      value={docForm.speciality}
                      onChange={e => setDocForm({ ...docForm, speciality: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      {(specialities.length ? specialities : FALLBACK_SPECIALITIES).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Qualification</label>
                    <input
                      type="text"
                      value={docForm.qualification}
                      onChange={e => setDocForm({ ...docForm, qualification: e.target.value })}
                      placeholder="MBBS, MD (Cardiology)"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Experience */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Experience (Years)</label>
                    <input
                      type="number"
                      min={0}
                      value={docForm.experience}
                      onChange={e => setDocForm({ ...docForm, experience: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* Consultation Fee */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Consultation Fee (₹)</label>
                    <input
                      type="number"
                      step={50}
                      value={docForm.consultationFee}
                      onChange={e => setDocForm({ ...docForm, consultationFee: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Gender</label>
                    <select
                      value={docForm.gender}
                      onChange={e => setDocForm({ ...docForm, gender: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* MCI Reg */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>MCI Registration No.</label>
                    <input
                      type="text"
                      value={docForm.registrationNo}
                      onChange={e => setDocForm({ ...docForm, registrationNo: e.target.value })}
                      placeholder="MCI-123456"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* OPD Timings / Shifts */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>OPD Timings / Shift</label>
                    <input
                      type="text"
                      value={docForm.opdTimings}
                      onChange={e => setDocForm({ ...docForm, opdTimings: e.target.value })}
                      placeholder="Mon-Sat 9:00 AM - 5:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold transition-colors hover:opacity-80"
                    style={{ background: 'var(--bg-surface-3)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #127A6A 0%, #075E52 100%)' }}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4 text-white" />}
                    Add Doctor to Hospital
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── VIEW DOCTOR DETAILS MODAL (LIGHT & DARK MODE READY) ── */}
      <AnimatePresence>
        {viewDoctor && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl text-xs"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg" style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A' }}>
                    {viewDoctor.name ? viewDoctor.name.replace(/^Dr\.\s*/i, '')[0]?.toUpperCase() : 'D'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>{viewDoctor.name}</h3>
                    <p className="text-xs font-bold" style={{ color: '#25B89A' }}>{viewDoctor.speciality}</p>
                  </div>
                </div>
                <button onClick={() => setViewDoctor(null)} className="p-1 hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 p-4 rounded-2xl border" style={{ background: 'var(--bg-surface-3)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                <div className="flex justify-between"><span>Phone:</span> <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{viewDoctor.phone}</strong></div>
                {viewDoctor.email && <div className="flex justify-between"><span>Email:</span> <strong style={{ color: 'var(--text-primary)' }}>{viewDoctor.email}</strong></div>}
                <div className="flex justify-between"><span>Qualification:</span> <strong style={{ color: 'var(--text-primary)' }}>{viewDoctor.qualification || 'MBBS'}</strong></div>
                <div className="flex justify-between"><span>Experience:</span> <strong style={{ color: 'var(--text-primary)' }}>{viewDoctor.exp || 5} Years</strong></div>
                <div className="flex justify-between"><span>Consultation Fee:</span> <strong className="font-extrabold" style={{ color: '#25B89A' }}>₹{viewDoctor.fee || 500}</strong></div>
                <div className="flex justify-between"><span>OPD Shift:</span> <strong style={{ color: 'var(--text-primary)' }}>{viewDoctor.shifts || 'Mon-Sat 9AM-5PM'}</strong></div>
                <div className="flex justify-between"><span>Status:</span> <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(viewDoctor.status)}`}>{viewDoctor.status}</span></div>
              </div>

              <button
                type="button"
                onClick={() => setViewDoctor(null)}
                className="w-full py-2.5 rounded-xl font-bold transition-colors hover:opacity-80"
                style={{ background: 'var(--bg-surface-3)', color: 'var(--text-primary)' }}
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
