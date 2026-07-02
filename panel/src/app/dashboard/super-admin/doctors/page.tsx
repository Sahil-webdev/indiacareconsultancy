'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { panelApi } from '@/lib/api';
import {
  Loader2, CheckCircle2, Search, UserPlus, X, Eye, EyeOff,
  Copy, Check, Mail, Phone, MapPin, Stethoscope,
  RefreshCw, Shield,
} from 'lucide-react';

type Doctor = {
  id: string;
  name: string;
  speciality: string;
  hospitalName: string;
  location: string;
  consultationFee: number;
  rating: number;
  isApproved: boolean;
  isSubscribed: boolean;
  pendingChangeRequests: number;
  email?: string;
  phone?: string;
};

const SPECIALITIES = [
  'Cardiology','Neurology','Orthopedics','Pediatrics','Dermatology',
  'Gynecology','Ophthalmology','ENT','Oncology','Urology',
  'Gastroenterology','Psychiatry','General Surgery','Nephrology','Endocrinology',
  'General Physician','Dentistry','Radiology','Anesthesiology','Pathology',
];

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

type FormState = {
  name: string; email: string; password: string; phone: string;
  speciality: string; city: string; qualification: string;
  experience: string; consultationFee: string; gender: string;
  registrationNo: string; clinicAddress: string; hospitalName: string;
};

const EMPTY_FORM: FormState = {
  name: '', email: '', password: '', phone: '',
  speciality: 'Cardiology', city: '', qualification: '',
  experience: '', consultationFee: '', gender: 'Male',
  registrationNo: '', clinicAddress: '', hospitalName: '',
};

function AddDoctorModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, password: generatePassword() });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const copyPassword = () => {
    navigator.clipboard.writeText(form.password);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.phone || !form.city || !form.qualification || !form.experience || !form.consultationFee || !form.registrationNo || !form.clinicAddress) {
      setError('Please fill all required fields'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address'); return;
    }
    setError(''); setSaving(true);
    try {
      await panelApi('/api/doctors', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          gender: form.gender,
          medicalRegistrationNumber: form.registrationNo,
          qualification: form.qualification,
          speciality: form.speciality,
          experience: Number(form.experience),
          hospitalName: form.hospitalName || null,
          clinicAddress: form.clinicAddress,
          location: form.city,
          area: '',
          consultationFee: Number(form.consultationFee),
          consultationType: 'Both',
          bio: '',
          rating: 4.5,
          isApproved: false,
          isSubscribed: false,
          availability: [],
          languages: [],
          services: [],
          awards: [],
        }),
      });
      setSuccess(true);
      setTimeout(() => { onAdded(); onClose(); }, 1800);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create doctor account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(37,184,154,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Add New Doctor</p>
              <p className="text-[10px]" style={{ color: '#64748B' }}>Create login credentials for a doctor</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center" style={{ color: '#64748B' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-14 gap-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14 }}
              className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <p className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>Doctor Account Created!</p>
            <p className="text-xs text-center max-w-xs" style={{ color: '#94A3B8' }}>
              Credentials have been noted. Share the email & password with the doctor to let them log in.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">

            {/* Notice */}
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              The email and password you set here will be the doctor&apos;s login credentials for the panel. Please share them securely.
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Full Name *</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Dr. Ramesh Kumar"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                  {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                  <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="doctor@example.com" type="email"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Panel Login Password *</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                  <button onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button onClick={() => set('password', generatePassword())} title="Generate new password"
                  className="px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button onClick={copyPassword} title="Copy password"
                  className="px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold"
                  style={{ background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: copied ? '#22c55e' : '#64748B' }}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] mt-1" style={{ color: '#475569' }}>Auto-generated strong password. You can edit it or copy it to share with the doctor.</p>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Speciality *</label>
                <select value={form.speciality} onChange={e => set('speciality', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                  {SPECIALITIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>City *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                  <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="New Delhi"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Qualification *</label>
                <input value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="MBBS, MD"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Experience (yrs) *</label>
                <input value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="10" type="number" min="0"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Registration No. *</label>
                <input value={form.registrationNo} onChange={e => set('registrationNo', e.target.value)} placeholder="DMC/R/2015/12345"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Consultation Fee (₹) *</label>
                <input value={form.consultationFee} onChange={e => set('consultationFee', e.target.value)} placeholder="500" type="number" min="0"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Hospital Name</label>
                <input value={form.hospitalName} onChange={e => set('hospitalName', e.target.value)} placeholder="Apollo Hospital Delhi"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Clinic Address *</label>
                <input value={form.clinicAddress} onChange={e => set('clinicAddress', e.target.value)} placeholder="A-14, Safdarjung Enclave, New Delhi"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-xs text-red-400">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 py-3 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 text-white"
                style={{ background: saving ? 'rgba(37,184,154,0.5)' : 'linear-gradient(135deg,#25B89A,#127A6A)', boxShadow: saving ? 'none' : '0 6px 20px rgba(37,184,154,0.25)' }}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account…</> : <><UserPlus className="w-4 h-4" /> Create Doctor Account</>}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  async function loadDoctors() {
    try {
      const response = await panelApi<{ doctors: Doctor[] }>('/api/doctors?approval=all');
      setDoctors(response.doctors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => { await loadDoctors(); })();
  }, []);

  async function updateDoctor(id: string, updates: Partial<Doctor>) {
    await panelApi(`/api/doctors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    await loadDoctors();
  }

  const filtered = useMemo(() => doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.speciality.toLowerCase().includes(search.toLowerCase()) ||
    d.location.toLowerCase().includes(search.toLowerCase())
  ), [doctors, search]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Doctors</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Approve, subscribe, and manage doctor accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: 'rgba(37,184,154,0.12)', color: '#25B89A' }}>
            {doctors.length} total
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-sm font-extrabold px-4 py-2.5 rounded-2xl text-white"
            style={{ background: 'linear-gradient(135deg,#25B89A,#127A6A)', boxShadow: '0 4px 16px rgba(37,184,154,0.25)' }}>
            <UserPlus className="w-4 h-4" /> Add Doctor
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="panel-card p-4 mb-5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748B' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctor, speciality, city"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div> : null}
        {error ? <div className="text-red-400 text-sm">{error}</div> : null}

        {!loading && (
          filtered.length === 0 ? (
            <div className="panel-card py-16 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                <Stethoscope className="w-7 h-7" style={{ color: '#475569' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {search ? 'No doctors found for your search' : 'No doctors yet'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                  {search ? 'Try a different keyword' : 'Click "Add Doctor" to create the first doctor account'}
                </p>
              </div>
              {!search && (
                <button onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg,#25B89A,#127A6A)' }}>
                  <UserPlus className="w-4 h-4" /> Add First Doctor
                </button>
              )}
            </div>
          ) : (
            <div className="panel-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {['Doctor', 'Speciality', 'Hospital', 'City', 'Fee', 'Rating', 'Approval', 'Subscription', 'Changes'].map(h => (
                        <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: '#2D4150' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doctor) => (
                      <tr key={doctor.id} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{doctor.name}</p>
                            {doctor.email && <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>{doctor.email}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{doctor.speciality}</td>
                        <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{doctor.hospitalName || 'Independent'}</td>
                        <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{doctor.location}</td>
                        <td className="px-4 py-3.5 text-white font-bold">₹{doctor.consultationFee}</td>
                        <td className="px-4 py-3.5 text-amber-400 font-bold">{doctor.rating}</td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => updateDoctor(doctor.id, { isApproved: !doctor.isApproved } as Partial<Doctor>)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold"
                            style={{ background: doctor.isApproved ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: doctor.isApproved ? '#4ade80' : '#f59e0b' }}>
                            {doctor.isApproved ? '✓ Approved' : 'Approve'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => updateDoctor(doctor.id, { isSubscribed: !doctor.isSubscribed } as Partial<Doctor>)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold"
                            style={{ background: doctor.isSubscribed ? 'rgba(37,184,154,0.12)' : 'rgba(148,163,184,0.12)', color: doctor.isSubscribed ? '#25B89A' : '#94A3B8' }}>
                            {doctor.isSubscribed ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ background: doctor.pendingChangeRequests ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)', color: doctor.pendingChangeRequests ? '#f59e0b' : '#94A3B8' }}>
                            <CheckCircle2 className="w-3 h-3" /> {doctor.pendingChangeRequests}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </main>

      <AnimatePresence>
        {showAddModal && (
          <AddDoctorModal
            onClose={() => setShowAddModal(false)}
            onAdded={() => { void loadDoctors(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
