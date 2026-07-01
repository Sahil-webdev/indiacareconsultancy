'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Building2, Users, Edit2, Check, X,
  IndianRupee, TrendingUp, CheckCircle2, Crown,
} from 'lucide-react';

/* ─── Editable Amount Component ─────────────────────── */
function EditableAmount({ value, onSave, prefix = '₹', suffix = '' }: {
  value: number; onSave: (v: number) => void; prefix?: string; suffix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const commit = () => {
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n > 0) { onSave(n); setEditing(false); }
  };
  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-sm font-bold" style={{ color: '#94A3B8' }}>{prefix}</span>
        <input
          autoFocus
          type="number"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
          className="w-24 text-center text-lg font-extrabold rounded-lg px-2 py-0.5 focus:outline-none"
          style={{ background: 'rgba(37,184,154,0.12)', border: '1px solid rgba(37,184,154,0.4)', color: '#25B89A' }}
        />
        <span className="text-sm font-bold" style={{ color: '#94A3B8' }}>{suffix}</span>
        <button onClick={commit} className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-400" /></button>
        <button onClick={() => setEditing(false)} className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center"><X className="w-3.5 h-3.5 text-red-400" /></button>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 group cursor-pointer" onClick={() => { setDraft(String(value)); setEditing(true); }}>
      <span className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{prefix}{value.toLocaleString('en-IN')}{suffix}</span>
      <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#25B89A' }} />
    </span>
  );
}

/* ─── Mock active subscribers ────────────────────────── */
const DOCTOR_SUBS = [
  { name: 'Dr. Anand Sharma', city: 'Delhi', since: 'Jun 2025', status: 'Active' },
  { name: 'Dr. Priya Mehta', city: 'Mumbai', since: 'May 2025', status: 'Active' },
  { name: 'Dr. Rajan Verma', city: 'Pune', since: 'Jul 2025', status: 'Pending' },
];
const HOSPITAL_SUBS = [
  { name: 'Apollo Spectra Delhi', city: 'Delhi', since: 'Apr 2025', status: 'Active' },
  { name: 'Narayana Multispeciality', city: 'Bengaluru', since: 'Jun 2025', status: 'Active' },
];

export default function SubscriptionsPage() {
  const [doctorFee, setDoctorFee] = useState(300);
  const [hospitalFee, setHospitalFee] = useState(500);
  const [consultFee, setConsultFee] = useState(199);
  const [savedToast, setSavedToast] = useState('');

  const showToast = (msg: string) => { setSavedToast(msg); setTimeout(() => setSavedToast(''), 2500); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Plans & Subscriptions</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Manage pricing for doctors, hospitals and patient consultations</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(37,184,154,0.1)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
          <TrendingUp className="w-3.5 h-3.5" />
          {DOCTOR_SUBS.length + HOSPITAL_SUBS.length} Active Plans
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Doctors Subscribed', value: DOCTOR_SUBS.filter(d => d.status === 'Active').length, icon: Stethoscope, color: 'bg-emerald-500' },
            { label: 'Hospitals Subscribed', value: HOSPITAL_SUBS.filter(h => h.status === 'Active').length, icon: Building2, color: 'bg-violet-500' },
            { label: 'Monthly Revenue', value: `₹${((DOCTOR_SUBS.length * doctorFee) + (HOSPITAL_SUBS.length * hospitalFee)).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-amber-500' },
            { label: 'Pending Payments', value: 1, icon: Crown, color: 'bg-orange-500' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Doctor Plan */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="panel-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Doctor Plan</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>One plan for all doctors</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold mb-1" style={{ color: '#64748B' }}>Monthly Fee <span className="text-amber-400">(click to edit)</span></p>
              <EditableAmount value={doctorFee} onSave={(v) => { setDoctorFee(v); showToast('Doctor fee updated'); }} suffix="/month" />
            </div>
            <ul className="space-y-1.5">
              {['Verified profile on website', 'Lead inbox access', 'Appointment requests', 'Single clinic listing', 'Basic support'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px]" style={{ color: '#94A3B8' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px]" style={{ color: '#64748B' }}>{DOCTOR_SUBS.length} doctors subscribed</p>
            </div>
          </motion.div>

          {/* Hospital Plan */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="panel-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/15 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Hospital Plan</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>One plan for all hospitals</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold mb-1" style={{ color: '#64748B' }}>Monthly Fee <span className="text-amber-400">(click to edit)</span></p>
              <EditableAmount value={hospitalFee} onSave={(v) => { setHospitalFee(v); showToast('Hospital fee updated'); }} suffix="/month" />
            </div>
            <ul className="space-y-1.5">
              {['Verified hospital listing', 'Department & doctor roster', 'Lead routing', 'Gallery & media uploads', 'Priority support'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px]" style={{ color: '#94A3B8' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px]" style={{ color: '#64748B' }}>{HOSPITAL_SUBS.length} hospitals subscribed</p>
            </div>
          </motion.div>

          {/* Patient Consultation Fee */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="panel-card p-6 flex flex-col gap-4" style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Patient Consultation</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>Fee patients pay to ICC</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold mb-1" style={{ color: '#64748B' }}>Consultation Fee <span className="text-amber-400">(click to edit)</span></p>
              <EditableAmount value={consultFee} onSave={(v) => { setConsultFee(v); showToast('Consultation fee updated'); }} suffix="/session" />
            </div>
            <ul className="space-y-1.5">
              {['Doctor matching & recommendation', 'Appointment scheduling', 'Follow-up coordination', 'Health record storage', 'ICC consultant support'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px]" style={{ color: '#94A3B8' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px]" style={{ color: '#64748B' }}>Charged when consultation is booked</p>
            </div>
          </motion.div>
        </div>

        {/* Active Subscribers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Doctor Subscribers */}
          <div className="panel-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Doctor Subscribers</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{DOCTOR_SUBS.length} total</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {DOCTOR_SUBS.map((d, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
                    <p className="text-[10px]" style={{ color: '#64748B' }}>{d.city} · Since {d.since}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${d.status === 'Active' ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/12 text-amber-400 border-amber-500/20'}`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hospital Subscribers */}
          <div className="panel-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Hospital Subscribers</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">{HOSPITAL_SUBS.length} total</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {HOSPITAL_SUBS.map((h, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{h.name}</p>
                    <p className="text-[10px]" style={{ color: '#64748B' }}>{h.city} · Since {h.since}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${h.status === 'Active' ? 'bg-violet-500/12 text-violet-400 border-violet-500/20' : 'bg-amber-500/12 text-amber-400 border-amber-500/20'}`}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {savedToast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl text-sm font-bold"
            style={{ background: '#25B89A', color: '#fff' }}>
            <Check className="w-4 h-4" /> {savedToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
