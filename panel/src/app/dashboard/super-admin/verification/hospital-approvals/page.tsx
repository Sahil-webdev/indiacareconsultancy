'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, Eye, CheckCircle2, XCircle,
  Clock, AlertCircle, FileText, MessageSquare, Download,
  MapPin, Calendar, Phone, X, Globe, Star,
  Layers, Shield, Bed, Users,
} from 'lucide-react';

const PENDING_HOSPITALS = [
  {
    id: 'HSP101', name: 'Apollo Spectra Delhi', type: 'Multispeciality', beds: 120, tier: 'Premium', city: 'Delhi', submitted: 'Jun 20, 2026',
    phone: '+91 11 4343 4343', email: 'admin@apollospectra-delhi.com',
    regNo: 'DHR/2015/00234', address: 'A-26, Nehru Enclave, Kalkaji, New Delhi – 110019',
    website: 'www.apollospectradelhi.com', emergencyContact: '+91 98100 77777',
    opdTimings: 'Mon–Sat: 9:00 AM – 7:00 PM',
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics', 'Gynecology', 'ENT', 'Dermatology'],
    facilities: ['ICU', '24/7 Emergency', 'Blood Bank', 'Pharmacy', 'Radiology', 'Pathology', 'NICU', 'Operation Theatre'],
    doctors: 34, docs: ['Registration Certificate', 'Fire NOC', 'License', 'Tax Certificate'],
    about: 'Apollo Spectra Delhi is a premier multispeciality hospital with world-class infrastructure and experienced medical professionals. Accredited by NABH, the hospital serves thousands of patients monthly with a patient-first approach.',
  },
  {
    id: 'HSP102', name: 'Narayana Multispeciality Pune', type: 'Multispeciality', beds: 200, tier: 'Premium', city: 'Pune', submitted: 'Jun 19, 2026',
    phone: '+91 20 6734 5678', email: 'info@narayana-pune.com',
    regNo: 'MHR/2013/00567', address: 'S.No. 32, Baner Road, Pune – 411045',
    website: 'www.narayanahealth.org/pune', emergencyContact: '+91 98200 12345',
    opdTimings: 'Mon–Sun: 8:00 AM – 8:00 PM',
    departments: ['Cardiac Surgery', 'Neurosurgery', 'Orthopedics', 'Urology', 'Nephrology', 'Gastroenterology'],
    facilities: ['Cath Lab', 'Robotic Surgery', 'Bone Marrow Transplant', 'ICU', 'PICU', 'Dialysis Center'],
    doctors: 52, docs: ['Registration Certificate', 'NABH Accreditation', 'Fire NOC'],
    about: 'Narayana Health Pune is a center of excellence for cardiac and neurosciences, equipped with the latest robotic surgical systems.',
  },
  {
    id: 'HSP103', name: 'Sunshine Clinic & Hospital', type: 'General', beds: 40, tier: 'Basic', city: 'Jaipur', submitted: 'Jun 18, 2026',
    phone: '+91 141 234 5678', email: 'sunshine@email.com',
    regNo: 'RJR/2020/01123', address: '45, Tonk Road, Jaipur – 302015',
    website: '', emergencyContact: '+91 94130 99999',
    opdTimings: 'Mon–Sat: 10:00 AM – 6:00 PM',
    departments: ['General Medicine', 'Gynecology', 'Pediatrics', 'Surgery'],
    facilities: ['OPD', 'Minor OT', 'Pharmacy', 'Pathology'],
    doctors: 8, docs: ['Registration Certificate', 'Fire NOC'],
    about: 'A community hospital serving the Tonk Road area with affordable, quality healthcare for families.',
  },
];

type Hospital = typeof PENDING_HOSPITALS[0];

function HospitalProfileModal({ hospital, onClose, onApprove, onReject }: { hospital: Hospital; onClose: () => void; onApprove: () => void; onReject: () => void }) {
  const tierColor = hospital.tier === 'Premium' ? 'text-amber-400 bg-amber-500/12 border-amber-500/20' : 'text-slate-400 bg-slate-500/12 border-slate-500/20';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="h-full w-full max-w-2xl overflow-y-auto flex flex-col" style={{ background: 'var(--bg-surface)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/15 text-violet-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>{hospital.name}</h2>
              <p className="text-[10px]" style={{ color: '#64748B' }}>{hospital.id} · Submitted {hospital.submitted}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-white/8 flex items-center justify-center" style={{ color: '#64748B' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-5">

          {/* Basic Info */}
          <section className="panel-card p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Hospital Information</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Type', value: hospital.type },
                { label: 'Plan', value: hospital.tier },
                { label: 'Total Beds', value: `${hospital.beds} beds` },
                { label: 'Doctors', value: `${hospital.doctors} doctors` },
                { label: 'Reg. Number', value: hospital.regNo },
                { label: 'OPD Timings', value: hospital.opdTimings },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>{item.label}</p>
                  <p className="font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="panel-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Contact & Location</p>
            <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Phone className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />{hospital.phone}</p>
            <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Globe className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />{hospital.email}</p>
            {hospital.website && <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Globe className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />{hospital.website}</p>}
            <p className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}><MapPin className="w-3.5 h-3.5 flex-shrink-0 text-violet-400 mt-0.5" />{hospital.address}</p>
            <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Phone className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />Emergency: {hospital.emergencyContact}</p>
          </section>

          {/* About */}
          <section className="panel-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>About</p>
            <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{hospital.about}</p>
          </section>

          {/* Departments */}
          <section className="panel-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Departments ({hospital.departments.length})</p>
            <div className="flex flex-wrap gap-2">
              {hospital.departments.map((d, i) => (
                <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(37,184,154,0.08)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.15)' }}>{d}</span>
              ))}
            </div>
          </section>

          {/* Facilities */}
          <section className="panel-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Facilities ({hospital.facilities.length})</p>
            <div className="flex flex-wrap gap-2">
              {hospital.facilities.map((f, i) => (
                <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>{f}</span>
              ))}
            </div>
          </section>

          {/* Documents */}
          <section className="panel-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Submitted Documents</p>
            <div className="flex flex-wrap gap-2">
              {hospital.docs.map((d, i) => (
                <button key={i} className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-xl"
                  style={{ background: 'rgba(37,184,154,0.08)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.15)' }}>
                  <FileText className="w-3 h-3" />{d} <Download className="w-2.5 h-2.5 opacity-60" />
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 p-4 border-t flex gap-3" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--bg-surface)' }}>
          <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle2 className="w-4 h-4" /> Approve Hospital
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
            <MessageSquare className="w-4 h-4" /> Request Changes
          </button>
          <button onClick={onReject} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            <XCircle className="w-4 h-4" /> Reject
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const tierBadge = (tier: string) => tier === 'Premium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20';

export default function HospitalApprovalsPage() {
  const [search, setSearch] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>(PENDING_HOSPITALS);
  const [profileOpen, setProfileOpen] = useState<Hospital | null>(null);

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase()) ||
    h.type.toLowerCase().includes(search.toLowerCase())
  );

  const approve = (id: string) => { setHospitals(prev => prev.filter(h => h.id !== id)); setProfileOpen(null); };
  const reject = (id: string) => { setHospitals(prev => prev.filter(h => h.id !== id)); setProfileOpen(null); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Hospital Approvals</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Review and verify new hospital partnership applications</p>
        </div>
        <span className="text-xs font-black px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">{hospitals.length} Pending</span>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Clock, label: 'Awaiting Review', value: hospitals.length, color: 'bg-violet-500' },
            { icon: CheckCircle2, label: 'Approved This Week', value: 2, color: 'bg-emerald-500' },
            { icon: XCircle, label: 'Rejected', value: 0, color: 'bg-red-500' },
            { icon: AlertCircle, label: 'Changes Requested', value: 1, color: 'bg-orange-500' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}><s.icon className="w-4 h-4 text-white" /></div>
              <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
            </motion.div>
          ))}
        </div>

        <div className="panel-card overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
              <input type="text" placeholder="Search hospitals…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            </div>
            <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} pending</span>
          </div>
          <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {filtered.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-violet-500/15 text-violet-400 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{h.name}</span>
                    <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>{h.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${tierBadge(h.tier)}`}>{h.tier}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{h.type} · {h.beds} Beds · {h.doctors} Doctors</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><MapPin className="w-3 h-3" />{h.city}</span>
                    <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><Phone className="w-3 h-3" />{h.phone}</span>
                    <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><Calendar className="w-3 h-3" />Submitted {h.submitted}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setProfileOpen(h)}
                    className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(37,184,154,0.12)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
                    <Eye className="w-3 h-3" /> View Profile
                  </button>
                  <button onClick={() => approve(h.id)}
                    className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <CheckCircle2 className="w-3 h-3" /> Approve
                  </button>
                  <button className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <MessageSquare className="w-3 h-3" /> Changes
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {profileOpen && (
          <HospitalProfileModal
            hospital={profileOpen}
            onClose={() => setProfileOpen(null)}
            onApprove={() => approve(profileOpen.id)}
            onReject={() => reject(profileOpen.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
