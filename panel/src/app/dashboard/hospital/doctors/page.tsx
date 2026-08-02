'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Search, Eye, Star, CheckCircle2, Clock, Plus, MapPin, Phone,
  User, Mail, Lock, FileText, Briefcase, X, Loader2, AlertCircle, Trash2, Sparkles, Check
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
}

const statusBadge = (s: string) => ({
  'Active': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  'On Leave': 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  'Pending Verification': 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
  'Inactive': 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
}[s] || 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30');

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
    speciality: '',
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
          setSpecialities(data.specialities.map((s: { name: string }) => s.name));
        } else {
          setSpecialities(['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Gynecology', 'Pediatrics', 'ENT', 'Dentist', 'Urology', 'Gastroenterology']);
        }
      })
      .catch(() => {
        setSpecialities(['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Gynecology', 'Pediatrics', 'ENT', 'Dentist', 'Urology', 'Gastroenterology']);
      });
  }, []);

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
    if (!docForm.name.trim() || !docForm.email.trim() || !docForm.phone.trim() || !docForm.speciality) {
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
        body: JSON.stringify({ ...docForm, name: finalName }),
      });

      setSuccess(`${finalName} added successfully to your hospital!`);
      setAddModalOpen(false);
      setDocForm({
        name: '', email: '', phone: '', password: '', gender: 'Male',
        speciality: '', qualification: 'MBBS', experience: 5,
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
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-950 text-slate-100">
      
      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90 flex-shrink-0">
        <div>
          <h1 className="font-black text-xl tracking-tight text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-400" /> Our Doctors
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Specialists &amp; doctors affiliated with your hospital</p>
        </div>
        <button
          type="button"
          onClick={() => { setError(''); setAddModalOpen(true); }}
          className="flex items-center gap-2 text-xs font-black text-slate-950 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" /> Add Doctor
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
              className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {success}
              </div>
              <button onClick={() => setSuccess('')} className="text-slate-400 hover:text-white">
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
              className="flex items-center justify-between p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                {error}
              </div>
              <button onClick={() => setError('')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Stethoscope,  label: 'Total Doctors',  value: doctors.length, color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
            { icon: CheckCircle2, label: 'Active Status',  value: doctors.filter(d => d.status === 'Active').length, color: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' },
            { icon: Clock,        label: 'Pending Verification', value: doctors.filter(d => d.status !== 'Active').length, color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
            { icon: Star,         label: 'Avg Rating',     value: doctors.length > 0 ? (doctors.reduce((a, b) => a + (b.rating || 4.8), 0) / doctors.length).toFixed(1) : '4.8', color: 'bg-violet-500/20 text-violet-400 border border-violet-500/30' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5"
            >
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── SEARCH & DOCTORS TABLE ── */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-white/10 gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search doctors by name or speciality…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <span className="text-xs text-slate-400 font-semibold">{filtered.length} doctors listed</span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" /> Loading affiliated doctors…
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <Stethoscope className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                No doctors found. Click <strong>Add Doctor</strong> to register doctors under your hospital.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/60">
                    {['Doctor Name', 'Speciality', 'Experience', 'Fee', 'Rating', 'OPD Timings', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((d, i) => (
                    <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs">
                            {d.name ? d.name.replace(/^Dr\.\s*/i, '')[0]?.toUpperCase() : 'D'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{d.name}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" /> {d.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-emerald-400">{d.speciality}</td>
                      <td className="px-4 py-3.5 text-slate-300">{d.exp || 5} yrs</td>
                      <td className="px-4 py-3.5 font-bold text-white">₹{d.fee || 500}</td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {d.rating || 4.8}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">{d.shifts || 'Mon-Sat 9AM-5PM'}</td>
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
                            className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                            title="View Doctor Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoctor(d.id, d.name)}
                            className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
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

      {/* ── ADD DOCTOR MODAL (UI/UX DESIGN) ── */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/80 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">Add Doctor to Hospital</h3>
                    <p className="text-xs text-slate-400">Register and affiliate a new specialist doctor</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleAddDoctorSubmit} className="p-6 overflow-y-auto panel-scroll space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Doctor Full Name */}
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={docForm.name}
                        onChange={e => handleDoctorNameChange(e.target.value)}
                        onBlur={handleDoctorNameBlur}
                        placeholder="Dr. Ramesh Kumar"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={docForm.email}
                        onChange={e => setDocForm({ ...docForm, email: e.target.value })}
                        placeholder="doctor@hospital.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={docForm.phone}
                        onChange={e => setDocForm({ ...docForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Login Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={docForm.password}
                        onChange={e => setDocForm({ ...docForm, password: e.target.value })}
                        placeholder="Doctor123! (auto-generated if empty)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Speciality Dropdown */}
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Speciality *</label>
                    <select
                      value={docForm.speciality}
                      onChange={e => setDocForm({ ...docForm, speciality: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="">Select Speciality</option>
                      {specialities.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Qualification</label>
                    <input
                      type="text"
                      value={docForm.qualification}
                      onChange={e => setDocForm({ ...docForm, qualification: e.target.value })}
                      placeholder="MBBS, MD (Cardiology)"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Experience */}
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Experience (Years)</label>
                    <input
                      type="number"
                      min={0}
                      value={docForm.experience}
                      onChange={e => setDocForm({ ...docForm, experience: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  {/* Consultation Fee */}
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      step={50}
                      value={docForm.consultationFee}
                      onChange={e => setDocForm({ ...docForm, consultationFee: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Gender</label>
                    <select
                      value={docForm.gender}
                      onChange={e => setDocForm({ ...docForm, gender: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
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
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">MCI Registration No.</label>
                    <input
                      type="text"
                      value={docForm.registrationNo}
                      onChange={e => setDocForm({ ...docForm, registrationNo: e.target.value })}
                      placeholder="MCI-123456"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  {/* OPD Timings / Shifts */}
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">OPD Timings / Shift</label>
                    <input
                      type="text"
                      value={docForm.opdTimings}
                      onChange={e => setDocForm({ ...docForm, opdTimings: e.target.value })}
                      placeholder="Mon-Sat 9:00 AM - 5:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Plus className="w-4 h-4 text-slate-950" />}
                    Add Doctor to Hospital
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── VIEW DOCTOR DETAILS MODAL ── */}
      <AnimatePresence>
        {viewDoctor && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl text-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg">
                    {viewDoctor.name ? viewDoctor.name.replace(/^Dr\.\s*/i, '')[0]?.toUpperCase() : 'D'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">{viewDoctor.name}</h3>
                    <p className="text-xs font-bold text-emerald-400">{viewDoctor.speciality}</p>
                  </div>
                </div>
                <button onClick={() => setViewDoctor(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-white/10 text-slate-300">
                <div className="flex justify-between"><span>Phone:</span> <strong className="text-white font-mono">{viewDoctor.phone}</strong></div>
                {viewDoctor.email && <div className="flex justify-between"><span>Email:</span> <strong className="text-white">{viewDoctor.email}</strong></div>}
                <div className="flex justify-between"><span>Qualification:</span> <strong className="text-white">{viewDoctor.qualification || 'MBBS'}</strong></div>
                <div className="flex justify-between"><span>Experience:</span> <strong className="text-white">{viewDoctor.exp || 5} Years</strong></div>
                <div className="flex justify-between"><span>Consultation Fee:</span> <strong className="text-emerald-400 font-extrabold">₹{viewDoctor.fee || 500}</strong></div>
                <div className="flex justify-between"><span>OPD Shift:</span> <strong className="text-white">{viewDoctor.shifts || 'Mon-Sat 9AM-5PM'}</strong></div>
                <div className="flex justify-between"><span>Status:</span> <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(viewDoctor.status)}`}>{viewDoctor.status}</span></div>
              </div>

              <button
                type="button"
                onClick={() => setViewDoctor(null)}
                className="w-full py-2.5 rounded-xl font-bold bg-white/10 text-white hover:bg-white/15 transition-colors"
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
