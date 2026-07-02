'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { panelApi } from '@/lib/api';
import {
  Loader2, Search, Building2, UserPlus, X, Eye, EyeOff,
  Copy, Check, Mail, Phone, MapPin, RefreshCw,
  CheckCircle2, Shield,
} from 'lucide-react';

type Hospital = {
  id: string;
  name: string;
  hospitalType: string;
  location: string;
  doctorCount: number;
  totalBeds: number;
  rating: number;
  isApproved: boolean;
  isSubscribed: boolean;
  pendingChangeRequests: number;
  email?: string;
};

const HOSPITAL_TYPES = [
  'Multispeciality','General','Specialty','Clinic','Nursing Home','Diagnostic Centre',
];

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

type FormState = {
  name: string; email: string; password: string; phone: string;
  hospitalType: string; city: string; registrationNo: string;
  totalBeds: string; emergencyContact: string; website: string; address: string;
};

const EMPTY_FORM: FormState = {
  name: '', email: '', password: '', phone: '',
  hospitalType: 'Multispeciality', city: '',
  registrationNo: '', totalBeds: '', emergencyContact: '', website: '', address: '',
};

function AddHospitalModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
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
    if (!form.name || !form.email || !form.password || !form.phone || !form.city || !form.registrationNo || !form.address) {
      setError('Please fill all required fields'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address'); return;
    }
    setError(''); setSaving(true);
    try {
      await panelApi('/api/hospitals', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          emergencyContact: form.emergencyContact || null,
          website: form.website || null,
          registrationDetails: form.registrationNo,
          hospitalType: form.hospitalType,
          totalBeds: Number(form.totalBeds || 0),
          address: form.address,
          location: form.city,
          opdTimings: '9:00 AM - 6:00 PM',
          about: '',
          rating: 4.5,
          isApproved: false,
          isSubscribed: false,
          departments: [],
          facilities: [],
          accreditations: [],
        }),
      });
      setSuccess(true);
      setTimeout(() => { onAdded(); onClose(); }, 1800);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create hospital account. Please try again.');
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
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(139,92,246,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Add New Hospital</p>
              <p className="text-[10px]" style={{ color: '#64748B' }}>Create login credentials for a hospital</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center" style={{ color: '#64748B' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-14 gap-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14 }}
              className="w-16 h-16 rounded-full bg-violet-500/20 border-2 border-violet-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-violet-400" />
            </motion.div>
            <p className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>Hospital Account Created!</p>
            <p className="text-xs text-center max-w-xs" style={{ color: '#94A3B8' }}>
              Credentials have been noted. Share the email & password with the hospital admin to let them log in.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">

            {/* Notice */}
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
              <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              The email and password you set here will be the hospital&apos;s login credentials for the panel. Please share them securely.
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Hospital Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Apollo Hospital Delhi"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Hospital Type</label>
                <select value={form.hospitalType} onChange={e => set('hospitalType', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                  {HOSPITAL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                  <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="admin@hospital.com" type="email"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 11 2692 5858"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40"
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
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                  <button onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button onClick={() => set('password', generatePassword())}
                  className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button onClick={copyPassword}
                  className="px-3 py-2.5 rounded-xl"
                  style={{ background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: copied ? '#22c55e' : '#64748B' }}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] mt-1" style={{ color: '#475569' }}>Auto-generated strong password. You can edit it or copy it to share with the hospital.</p>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>City *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                  <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="New Delhi"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Registration No. *</label>
                <input value={form.registrationNo} onChange={e => set('registrationNo', e.target.value)} placeholder="DHR/2024/00123"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Total Beds</label>
                <input value={form.totalBeds} onChange={e => set('totalBeds', e.target.value)} placeholder="100" type="number" min="0"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Emergency Contact</label>
                <input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} placeholder="+91 98765 00000"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Website (optional)</label>
              <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="www.hospital.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Address *</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Mathura Road, Sarita Vihar, New Delhi"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 py-3 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 text-white"
                style={{ background: saving ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg,#8B5CF6,#6D28D9)', boxShadow: saving ? 'none' : '0 6px 20px rgba(139,92,246,0.25)' }}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account…</> : <><Building2 className="w-4 h-4" /> Create Hospital Account</>}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  async function loadHospitals() {
    try {
      const response = await panelApi<{ hospitals: Hospital[] }>('/api/hospitals?approval=all');
      setHospitals(response.hospitals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => { await loadHospitals(); })();
  }, []);

  async function updateHospital(id: string, updates: Partial<Hospital>) {
    await panelApi(`/api/hospitals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    await loadHospitals();
  }

  const filtered = useMemo(() => hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.hospitalType.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  ), [hospitals, search]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Hospitals</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Approve, subscribe, and manage hospital accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>
            {hospitals.length} total
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-sm font-extrabold px-4 py-2.5 rounded-2xl text-white"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', boxShadow: '0 4px 16px rgba(139,92,246,0.25)' }}>
            <UserPlus className="w-4 h-4" /> Add Hospital
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="panel-card p-4 mb-5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748B' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hospital, type, city"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div> : null}
        {error ? <div className="text-red-400 text-sm">{error}</div> : null}

        {!loading && (
          filtered.length === 0 ? (
            <div className="panel-card py-16 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                <Building2 className="w-7 h-7" style={{ color: '#475569' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {search ? 'No hospitals found for your search' : 'No hospitals yet'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                  {search ? 'Try a different keyword' : 'Click "Add Hospital" to create the first hospital account'}
                </p>
              </div>
              {!search && (
                <button onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}>
                  <UserPlus className="w-4 h-4" /> Add First Hospital
                </button>
              )}
            </div>
          ) : (
            <div className="panel-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {['Hospital', 'Type', 'City', 'Beds', 'Doctors', 'Rating', 'Approval', 'Subscription', 'Changes'].map(h => (
                        <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: '#2D4150' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((hospital) => (
                      <tr key={hospital.id} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{hospital.name}</p>
                            {hospital.email && <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>{hospital.email}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{hospital.hospitalType}</td>
                        <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{hospital.location}</td>
                        <td className="px-4 py-3.5 text-white font-bold">{hospital.totalBeds || '—'}</td>
                        <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{hospital.doctorCount}</td>
                        <td className="px-4 py-3.5 text-amber-400 font-bold">{hospital.rating}</td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => updateHospital(hospital.id, { isApproved: !hospital.isApproved } as Partial<Hospital>)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold"
                            style={{ background: hospital.isApproved ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: hospital.isApproved ? '#4ade80' : '#f59e0b' }}>
                            {hospital.isApproved ? '✓ Approved' : 'Approve'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => updateHospital(hospital.id, { isSubscribed: !hospital.isSubscribed } as Partial<Hospital>)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold"
                            style={{ background: hospital.isSubscribed ? 'rgba(139,92,246,0.12)' : 'rgba(148,163,184,0.12)', color: hospital.isSubscribed ? '#a78bfa' : '#94A3B8' }}>
                            {hospital.isSubscribed ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ background: hospital.pendingChangeRequests ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)', color: hospital.pendingChangeRequests ? '#f59e0b' : '#94A3B8' }}>
                            <CheckCircle2 className="w-3 h-3" /> {hospital.pendingChangeRequests}
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
          <AddHospitalModal
            onClose={() => setShowAddModal(false)}
            onAdded={() => { void loadHospitals(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
