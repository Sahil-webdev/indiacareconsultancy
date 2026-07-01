'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Edit2, Check, X, Star, BadgeCheck, MapPin, Phone, Mail,
  Award, Clock, Plus, Trash2, Languages, Stethoscope, IndianRupee,
  FileText, Globe, Shield, KeyRound, Send, Eye, EyeOff,
} from 'lucide-react';

/* ── Types ─────────────────────── */
type ConsultationType = 'Online' | 'Offline' | 'Both';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ── Initial Profile State ──────── */
const INITIAL = {
  name: 'Dr. Ramesh Kumar',
  gender: 'Male',
  phone: '+91 98100 11111',
  email: 'dr.ramesh@apollo.com',
  speciality: 'Cardiology',
  qualification: 'MBBS, MD (Cardiology)',
  experience: '18',
  regNo: 'MCI-2005-DL-12345',
  hospital: 'Apollo Hospitals',
  fee: '1500',
  consultationType: 'Both' as ConsultationType,
  clinicAddress: 'A-Block, Saket, New Delhi',
  city: 'New Delhi',
  bio: 'Senior cardiologist with 18+ years of clinical expertise in interventional cardiology, heart failure management, and advanced cardiac imaging. Trained at AIIMS Delhi and fellowship from Cleveland Clinic, USA.',
  languages: ['Hindi', 'English'],
  services: ['Echocardiography', 'Angiography', 'Holter Monitoring', 'Pacemaker Implantation'],
  awards: ['Best Cardiologist Award 2023 – Apollo Hospitals', 'Young Doctor of the Year 2021'],
  availability: ['Mon', 'Wed', 'Fri', 'Sat'],
};

/* ── Tag Input helper ───────────── */
function TagInput({ label, tags, onAdd, onRemove, placeholder }: {
  label: string; tags: string[]; onAdd: (t: string) => void; onRemove: (t: string) => void; placeholder: string;
}) {
  const [val, setVal] = useState('');
  const add = () => { const t = val.trim(); if (t && !tags.includes(t)) { onAdd(t); setVal(''); } };
  return (
    <div>
      <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(37,184,154,0.1)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
            {t}
            <button onClick={() => onRemove(t)}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
        <button onClick={add} className="px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Password Change Modal ─────── */
function PasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'email' | 'otp' | 'newpass' | 'done'>('email');
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep('otp');
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) { setError('Enter valid 6-digit OTP'); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep('newpass');
  };

  const savePassword = async () => {
    if (newPass.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep('done');
    setTimeout(onClose, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)' }}>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-violet-400" />
            </div>
            <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Change Password</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center" style={{ color: '#64748B' }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-5">
          {['Email', 'OTP', 'New Password'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${
                i === 0 && (step === 'email' || step === 'otp' || step === 'newpass' || step === 'done') ? 'text-emerald-400' :
                i === 1 && (step === 'otp' || step === 'newpass' || step === 'done') ? 'text-emerald-400' :
                i === 2 && (step === 'newpass' || step === 'done') ? 'text-emerald-400' : 'text-slate-600'
              }`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                  (i === 0 && (step === 'otp' || step === 'newpass' || step === 'done')) ||
                  (i === 1 && (step === 'newpass' || step === 'done')) ||
                  (i === 2 && step === 'done') ? 'bg-emerald-500 text-white' : 'border border-current'
                }`}>{i + 1}</div>
                {s}
              </div>
              {i < 2 && <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />}
            </React.Fragment>
          ))}
        </div>

        {step === 'done' ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Password Updated!</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>Your new password is now active.</p>
          </div>
        ) : step === 'email' ? (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#94A3B8' }}>We'll send a 6-digit OTP to your registered email to verify your identity.</p>
            <div className="px-3.5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>
              dr.ramesh@apollo.com
            </div>
            <button onClick={sendOtp} disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #25B89A, #127A6A)', color: '#fff' }}>
              {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Sending OTP…' : 'Send OTP to Email'}
            </button>
          </div>
        ) : step === 'otp' ? (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#94A3B8' }}>Enter the 6-digit OTP sent to your email.</p>
            <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP" maxLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <button onClick={verifyOtp} disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #25B89A, #127A6A)', color: '#fff' }}>
              {loading ? <Clock className="w-4 h-4 animate-spin" /> : 'Verify OTP'}
            </button>
            <button onClick={() => setStep('email')} className="w-full text-xs text-center" style={{ color: '#64748B' }}>← Resend OTP</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#94A3B8' }}>Enter your new password (min 8 characters).</p>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="New password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              <button onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <button onClick={savePassword} disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #25B89A, #127A6A)', color: '#fff' }}>
              {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {loading ? 'Saving…' : 'Save New Password'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Field helper ───────────────── */
function Field({ label, value, editing, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; editing: boolean; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>{label}</label>
      {editing ? (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} />
      ) : (
        <p className="text-sm py-2.5 px-3.5 rounded-xl" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)' }}>{value || '—'}</p>
      )}
    </div>
  );
}

/* ── Main Page ──────────────────── */
export default function DoctorProfilePage() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(INITIAL);
  const [saved, setSaved] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const set = <K extends keyof typeof INITIAL>(k: K, v: typeof INITIAL[K]) =>
    setProfile(p => ({ ...p, [k]: v }));

  const addTag = (field: 'languages' | 'services' | 'awards') => (tag: string) =>
    set(field, [...profile[field], tag] as any);
  const removeTag = (field: 'languages' | 'services' | 'awards') => (tag: string) =>
    set(field, (profile[field] as string[]).filter(t => t !== tag) as any);

  const toggleDay = (day: string) =>
    set('availability', profile.availability.includes(day)
      ? profile.availability.filter(d => d !== day)
      : [...profile.availability, day]);

  const saveProfile = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Manage your public listing — changes go live after super admin approval</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
            <KeyRound className="w-3.5 h-3.5" /> Change Password
          </button>
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={saveProfile}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #25B89A, #127A6A)' }}>
                <Check className="w-3.5 h-3.5" /> Save & Request Review
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #127A6A, #075E52)' }}>
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>
      </header>

      {/* Approval notice when editing */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-6 py-2 text-xs"
            style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" />
            Changes you save will be sent for Super Admin review before going live on the website.
          </motion.div>
        )}
        {saved && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-6 py-2 text-xs"
            style={{ background: 'rgba(34,197,94,0.08)', borderBottom: '1px solid rgba(34,197,94,0.15)', color: '#22c55e' }}>
            <Check className="w-3.5 h-3.5 flex-shrink-0" />
            Profile update submitted for review. It will go live after super admin approval.
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-5">

            {/* Avatar Card */}
            <div className="panel-card p-6 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                  {profile.name.split(' ').find(w => w.startsWith('Dr.') === false)?.[0] ?? 'D'}
                </div>
                {editing && (
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-white">
                    <Camera className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>
              <div className="text-center">
                <p className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>{profile.name}</p>
                <p className="text-sm" style={{ color: '#25B89A' }}>{profile.speciality}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-400/15 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-amber-400" /> 4.9 Rating
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <BadgeCheck className="w-3 h-3" /> MCI Verified
                </span>
              </div>
            </div>

            {/* Quick Info Read-only */}
            <div className="panel-card p-5 flex flex-col gap-3">
              {[
                { icon: FileText, label: 'Registration No.', value: profile.regNo },
                { icon: MapPin,   label: 'City',             value: profile.city },
                { icon: Phone,    label: 'Phone',            value: profile.phone },
                { icon: Mail,     label: 'Email',            value: profile.email },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <row.icon className="w-3.5 h-3.5" style={{ color: '#25B89A' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px]" style={{ color: '#64748B' }}>{row.label}</p>
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Availability */}
            <div className="panel-card p-5">
              <p className="text-[11px] font-bold mb-3" style={{ color: '#64748B' }}>AVAILABILITY</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => {
                  const active = profile.availability.includes(day);
                  return (
                    <button key={day} onClick={() => editing && toggleDay(day)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${editing ? 'cursor-pointer' : 'cursor-default'}`}
                      style={{
                        background: active ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)',
                        borderColor: active ? 'rgba(37,184,154,0.35)' : 'rgba(255,255,255,0.08)',
                        color: active ? '#25B89A' : '#475569',
                      }}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (2/3) ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Identity */}
            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: '#25B89A' }}>Identity</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" value={profile.name} editing={editing} onChange={v => set('name', v)} />
                <div>
                  <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Gender</label>
                  {editing ? (
                    <select value={profile.gender} onChange={e => set('gender', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  ) : (
                    <p className="text-sm py-2.5 px-3.5 rounded-xl" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)' }}>{profile.gender}</p>
                  )}
                </div>
                <Field label="Phone Number" value={profile.phone} editing={editing} onChange={v => set('phone', v)} />
                <div>
                  <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Email (set by admin)</label>
                  <p className="text-sm py-2.5 px-3.5 rounded-xl" style={{ color: '#64748B', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>{profile.email}</p>
                </div>
              </div>
            </div>

            {/* Professional */}
            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: '#25B89A' }}>Professional Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Speciality" value={profile.speciality} editing={editing} onChange={v => set('speciality', v)} />
                <Field label="Qualification" value={profile.qualification} editing={editing} onChange={v => set('qualification', v)} placeholder="MBBS, MD (Cardiology)" />
                <Field label="Experience (years)" value={profile.experience} editing={editing} onChange={v => set('experience', v)} type="number" />
                <Field label="MCI Registration No." value={profile.regNo} editing={editing} onChange={v => set('regNo', v)} />
                <div className="sm:col-span-2">
                  <Field label="Hospital / Clinic Name" value={profile.hospital} editing={editing} onChange={v => set('hospital', v)} />
                </div>
              </div>
            </div>

            {/* Consultation */}
            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: '#25B89A' }}>Consultation Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Consultation Fee (₹)" value={profile.fee} editing={editing} onChange={v => set('fee', v)} type="number" />
                <div>
                  <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Consultation Type</label>
                  {editing ? (
                    <div className="flex gap-2">
                      {(['Online', 'Offline', 'Both'] as ConsultationType[]).map(t => (
                        <button key={t} onClick={() => set('consultationType', t)}
                          className="flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all"
                          style={{
                            background: profile.consultationType === t ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)',
                            borderColor: profile.consultationType === t ? 'rgba(37,184,154,0.35)' : 'rgba(255,255,255,0.08)',
                            color: profile.consultationType === t ? '#25B89A' : '#64748B',
                          }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm py-2.5 px-3.5 rounded-xl" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)' }}>{profile.consultationType}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Field label="Clinic Address" value={profile.clinicAddress} editing={editing} onChange={v => set('clinicAddress', v)} />
                </div>
                <Field label="City" value={profile.city} editing={editing} onChange={v => set('city', v)} />
              </div>
            </div>

            {/* Bio */}
            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#25B89A' }}>About / Bio</p>
              {editing ? (
                <textarea value={profile.bio} onChange={e => set('bio', e.target.value)} rows={4}
                  placeholder="Write about your expertise, background, and approach…"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40 resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{profile.bio}</p>
              )}
            </div>

            {/* Languages */}
            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#25B89A' }}>Languages Spoken</p>
              {editing ? (
                <TagInput label="" tags={profile.languages} onAdd={addTag('languages')} onRemove={removeTag('languages')} placeholder="e.g. Punjabi, Tamil…" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((l, i) => (
                    <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>{l}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Services */}
            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#25B89A' }}>Services Offered</p>
              {editing ? (
                <TagInput label="" tags={profile.services} onAdd={addTag('services')} onRemove={removeTag('services')} placeholder="e.g. ECG, Bypass Surgery…" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.services.map((s, i) => (
                    <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(37,184,154,0.08)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.15)' }}>{s}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Awards */}
            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#25B89A' }}>Awards & Recognition</p>
              {editing ? (
                <TagInput label="" tags={profile.awards} onAdd={addTag('awards')} onRemove={removeTag('awards')} placeholder="e.g. Best Cardiologist 2023…" />
              ) : (
                <div className="space-y-2">
                  {profile.awards.map((a, i) => (
                    <p key={i} className="text-xs flex items-start gap-2" style={{ color: '#94A3B8' }}>
                      <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />{a}
                    </p>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
