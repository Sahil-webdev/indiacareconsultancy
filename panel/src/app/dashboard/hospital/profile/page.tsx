'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Edit2, Check, X, Star, BadgeCheck, MapPin, Phone, Mail,
  Plus, Building2, Clock, Globe, Shield,
  KeyRound, Send, Eye, EyeOff, FileText, Ambulance,
} from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const INITIAL = {
  name: 'Apollo Hospital Indraprastha',
  type: 'Multispeciality',
  beds: '710',
  registrationNo: 'DHR/2001/00123',
  phone: '+91 11 2692 5858',
  email: 'info@apollodelhi.com',
  emergencyContact: '+91 98100 77777',
  website: 'www.apollohospitals.com/delhi',
  address: 'Sarita Vihar, Delhi Mathura Road, New Delhi',
  city: 'New Delhi',
  opdTimings: '8:00 AM – 8:00 PM',
  opdDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  about: 'Apollo Hospital Indraprastha is a NABH-accredited multispeciality hospital with world-class infrastructure. With over 52 specialities, 710 beds, and 300+ experienced doctors, we provide cutting-edge medical care with a compassionate touch.',
  departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics', 'Gynecology', 'Urology', 'Nephrology'],
  facilities: ['ICU (100+ Beds)', '24/7 Emergency', 'Blood Bank', 'Pharmacy', 'NICU', 'Cath Lab', 'Robotic Surgery'],
  accreditations: ['NABH Accredited', 'JCI Accredited', 'ISO 9001:2015'],
};

function TagInput({ tags, onAdd, onRemove, placeholder, accent = '#a78bfa', accentBg = 'rgba(139,92,246,0.1)', accentBorder = 'rgba(139,92,246,0.2)' }: {
  tags: string[]; onAdd: (t: string) => void; onRemove: (t: string) => void; placeholder: string;
  accent?: string; accentBg?: string; accentBorder?: string;
}) {
  const [val, setVal] = useState('');
  const add = () => { const t = val.trim(); if (t && !tags.includes(t)) { onAdd(t); setVal(''); } };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: accentBg, color: accent, border: `1px solid ${accentBorder}` }}>
            {t}<button onClick={() => onRemove(t)}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
        <button onClick={add} className="px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: accentBg, color: accent, border: `1px solid ${accentBorder}` }}>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'email'|'otp'|'newpass'|'done'>('email');
  const [otp, setOtp] = useState(''); const [newPass, setNewPass] = useState(''); const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('');

  const run = async (fn: () => void) => { setLoading(true); await new Promise(r => setTimeout(r, 1200)); setLoading(false); fn(); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
        className="w-full max-w-sm rounded-3xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center"><KeyRound className="w-4 h-4 text-violet-400" /></div>
            <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Change Password</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center" style={{ color: '#64748B' }}><X className="w-3.5 h-3.5" /></button>
        </div>

        {step === 'done' ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-3"><Check className="w-7 h-7 text-emerald-400" /></div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Password Updated!</p>
          </div>
        ) : step === 'email' ? (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#94A3B8' }}>A 6-digit OTP will be sent to your registered email.</p>
            <div className="px-3.5 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>info@apollodelhi.com</div>
            <button onClick={() => run(() => setStep('otp'))} disabled={loading} className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', color: '#fff' }}>
              {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </div>
        ) : step === 'otp' ? (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#94A3B8' }}>Enter the 6-digit OTP sent to your email.</p>
            <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/,'').slice(0,6))} placeholder="• • • • • •" maxLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-violet-500/40"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <button onClick={() => { if (otp.length!==6){setError('Enter valid 6-digit OTP');return;} setError(''); run(() => setStep('newpass')); }} disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', color: '#fff' }}>
              {loading ? <Clock className="w-4 h-4 animate-spin" /> : 'Verify OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password (min 8 chars)"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              <button onClick={() => setShowPass(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm password"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <button onClick={() => { if(newPass.length<8){setError('Min 8 characters');return;} if(newPass!==confirmPass){setError('Passwords do not match');return;} setError(''); run(()=>setStep('done')); }} disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', color: '#fff' }}>
              {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} {loading ? 'Saving…' : 'Save Password'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Field({ label, value, editing, onChange, type='text', placeholder='' }: { label:string;value:string;editing:boolean;onChange:(v:string)=>void;type?:string;placeholder?:string }) {
  return (
    <div>
      <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>{label}</label>
      {editing
        ? <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} />
        : <p className="text-sm py-2.5 px-3.5 rounded-xl" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)' }}>{value||'—'}</p>
      }
    </div>
  );
}

export default function HospitalProfilePage() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(INITIAL);
  const [saved, setSaved] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);

  const set = <K extends keyof typeof INITIAL>(k: K, v: typeof INITIAL[K]) => setProfile(p => ({ ...p, [k]: v }));
  const addTag = (f: 'departments'|'facilities'|'accreditations') => (t: string) => set(f, [...profile[f], t] as any);
  const removeTag = (f: 'departments'|'facilities'|'accreditations') => (t: string) => set(f, (profile[f] as string[]).filter(x => x !== t) as any);
  const toggleDay = (d: string) => set('opdDays', profile.opdDays.includes(d) ? profile.opdDays.filter(x=>x!==d) : [...profile.opdDays, d]);
  const saveProfile = () => { setSaved(true); setEditing(false); setTimeout(()=>setSaved(false), 2500); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Hospital Profile</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Manage your listing — changes go live after super admin approval</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPwModal(true)}
            className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
            <KeyRound className="w-3.5 h-3.5" /> Change Password
          </button>
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={saveProfile} className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}>
                <Check className="w-3.5 h-3.5" /> Save & Request Review
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg,#6D28D9,#4C1D95)' }}>
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>
      </header>

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

          {/* LEFT */}
          <div className="flex flex-col gap-5">
            <div className="panel-card p-6 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-xl">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                {editing && (
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-white">
                    <Camera className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>
              <div className="text-center">
                <p className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>{profile.name}</p>
                <p className="text-sm" style={{ color: '#a78bfa' }}>{profile.type}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-400/15 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-amber-400" /> 4.8 Rating
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold bg-violet-500/15 text-violet-400 border border-violet-500/20 px-2.5 py-1 rounded-full">
                  <BadgeCheck className="w-3 h-3" /> NABH Verified
                </span>
              </div>
            </div>

            <div className="panel-card p-5 flex flex-col gap-3">
              {[
                { icon: FileText, label: 'Reg. Number', value: profile.registrationNo },
                { icon: MapPin,   label: 'City',        value: profile.city },
                { icon: Phone,    label: 'Phone',       value: profile.phone },
                { icon: Ambulance,label: 'Emergency',   value: profile.emergencyContact },
                { icon: Mail,     label: 'Email',       value: profile.email },
                { icon: Globe,    label: 'Website',     value: profile.website },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <row.icon className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px]" style={{ color: '#64748B' }}>{row.label}</p>
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="panel-card p-5">
              <p className="text-[11px] font-bold mb-3" style={{ color: '#64748B' }}>OPD DAYS</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => {
                  const active = profile.opdDays.includes(day);
                  return (
                    <button key={day} onClick={() => editing && toggleDay(day)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${editing ? 'cursor-pointer' : 'cursor-default'}`}
                      style={{ background: active ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)', borderColor: active ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.08)', color: active ? '#a78bfa' : '#475569' }}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: '#a78bfa' }}>Hospital Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Hospital Name" value={profile.name} editing={editing} onChange={v => set('name', v)} />
                <div>
                  <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Hospital Type</label>
                  {editing ? (
                    <select value={profile.type} onChange={e => set('type', e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
                      {['Multispeciality','General','Specialty','Clinic','Nursing Home','Diagnostic Centre'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  ) : <p className="text-sm py-2.5 px-3.5 rounded-xl" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)' }}>{profile.type}</p>}
                </div>
                <Field label="Total Beds" value={profile.beds} editing={editing} onChange={v => set('beds', v)} type="number" />
                <Field label="Registration No." value={profile.registrationNo} editing={editing} onChange={v => set('registrationNo', v)} />
                <Field label="OPD Timings" value={profile.opdTimings} editing={editing} onChange={v => set('opdTimings', v)} placeholder="9:00 AM – 6:00 PM" />
              </div>
            </div>

            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: '#a78bfa' }}>Contact & Location</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Phone" value={profile.phone} editing={editing} onChange={v => set('phone', v)} />
                <Field label="Emergency Contact" value={profile.emergencyContact} editing={editing} onChange={v => set('emergencyContact', v)} />
                <div>
                  <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Email (set by admin)</label>
                  <p className="text-sm py-2.5 px-3.5 rounded-xl" style={{ color: '#64748B', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>{profile.email}</p>
                </div>
                <Field label="Website" value={profile.website} editing={editing} onChange={v => set('website', v)} />
                <div className="sm:col-span-2"><Field label="Full Address" value={profile.address} editing={editing} onChange={v => set('address', v)} /></div>
                <Field label="City" value={profile.city} editing={editing} onChange={v => set('city', v)} />
              </div>
            </div>

            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#a78bfa' }}>About / Description</p>
              {editing
                ? <textarea value={profile.about} onChange={e => set('about', e.target.value)} rows={4} placeholder="Describe your hospital…"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none focus:ring-1 focus:ring-violet-500/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} />
                : <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{profile.about}</p>
              }
            </div>

            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#a78bfa' }}>Departments</p>
              {editing
                ? <TagInput tags={profile.departments} onAdd={addTag('departments')} onRemove={removeTag('departments')} placeholder="e.g. ENT, Dermatology…" />
                : <div className="flex flex-wrap gap-2">{profile.departments.map((d,i) => <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.15)' }}>{d}</span>)}</div>
              }
            </div>

            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#a78bfa' }}>Facilities</p>
              {editing
                ? <TagInput tags={profile.facilities} onAdd={addTag('facilities')} onRemove={removeTag('facilities')} placeholder="e.g. MRI, Dialysis…" accent="#94A3B8" accentBg="rgba(255,255,255,0.06)" accentBorder="rgba(255,255,255,0.08)" />
                : <div className="flex flex-wrap gap-2">{profile.facilities.map((f,i) => <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>{f}</span>)}</div>
              }
            </div>

            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#a78bfa' }}>Accreditations</p>
              {editing
                ? <TagInput tags={profile.accreditations} onAdd={addTag('accreditations')} onRemove={removeTag('accreditations')} placeholder="e.g. NABH, ISO…" accent="#22c55e" accentBg="rgba(34,197,94,0.08)" accentBorder="rgba(34,197,94,0.15)" />
                : <div className="flex flex-wrap gap-2">{profile.accreditations.map((a,i) => <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5" style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.15)' }}><BadgeCheck className="w-3 h-3" />{a}</span>)}</div>
              }
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showPwModal && <PasswordModal onClose={() => setShowPwModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
