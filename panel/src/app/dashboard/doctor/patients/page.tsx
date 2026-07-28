'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Eye, Phone, MapPin, Calendar, Heart, FileText,
  MoreVertical, Pill, ClipboardList, X, Check
} from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  city: string;
  lastVisit: string;
  visits: number;
  diagnosis: string;
  status: 'Active' | 'Critical' | 'Monitoring' | 'Stable';
  email?: string;
  bloodGroup?: string;
}

const PATIENTS: Patient[] = [
  { id: 1, name: 'Rahul Sharma',  age: 34, gender: 'Male',   phone: '+91 98765 43299', city: 'Delhi',     lastVisit: 'Jun 18, 2026', visits: 4,  diagnosis: 'Hypertension',     status: 'Active', bloodGroup: 'B+' },
  { id: 2, name: 'Kavya Reddy',   age: 28, gender: 'Female', phone: '+91 65432 10098', city: 'Bengaluru', lastVisit: 'Jun 15, 2026', visits: 2,  diagnosis: 'Arrhythmia',       status: 'Active', bloodGroup: 'O+' },
  { id: 3, name: 'Mohan Verma',   age: 52, gender: 'Male',   phone: '+91 54321 00987', city: 'Hyderabad', lastVisit: 'Jun 12, 2026', visits: 7,  diagnosis: 'Coronary Artery',  status: 'Critical', bloodGroup: 'A+' },
  { id: 4, name: 'Sunita Joshi',  age: 40, gender: 'Female', phone: '+91 43210 09876', city: 'Jaipur',    lastVisit: 'Jun 10, 2026', visits: 1,  diagnosis: 'Palpitations',     status: 'Active', bloodGroup: 'AB+' },
  { id: 5, name: 'Deepak Singh',  age: 45, gender: 'Male',   phone: '+91 32100 98765', city: 'Chennai',   lastVisit: 'Jun 8, 2026',  visits: 3,  diagnosis: 'Heart Failure',    status: 'Monitoring', bloodGroup: 'O-' },
  { id: 6, name: 'Anita Mehta',   age: 37, gender: 'Female', phone: '+91 21009 87654', city: 'Delhi',     lastVisit: 'Jun 5, 2026',  visits: 5,  diagnosis: 'Valve Disorder',   status: 'Stable', bloodGroup: 'B+' },
];

const statusBadge = (s: string) => ({
  Active:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Critical:   'bg-red-500/15 text-red-400 border border-red-500/20',
  Monitoring: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Stable:     'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
}[s] || '');

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeModal, setActiveModal] = useState<'view' | 'prescription' | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.patient-menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>My Patients</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>All patients under your clinical care</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users,    label: 'Total Patients', value: PATIENTS.length,                                    color: 'bg-indigo-500' },
            { icon: Heart,    label: 'Active',         value: PATIENTS.filter(p=>p.status==='Active').length,     color: 'bg-emerald-500' },
            { icon: Heart,    label: 'Critical',       value: PATIENTS.filter(p=>p.status==='Critical').length,   color: 'bg-red-500' },
            { icon: Calendar, label: 'Avg. Visits',    value: Math.round(PATIENTS.reduce((a,p)=>a+p.visits,0)/PATIENTS.length), color: 'bg-amber-500' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="panel-card overflow-visible">
          <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search patients or diagnosis…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <span className="text-xs ml-auto font-medium" style={{ color: 'var(--text-muted)' }}>{filtered.length} patients</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Patient', 'Contact', 'City', 'Diagnosis', 'Visits', 'Last Visit', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs">{p.name[0]}</div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                          <p style={{ color: 'var(--text-muted)' }}>{p.age}y · {p.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Phone className="w-3 h-3 text-emerald-500/70" />{p.phone}</span></td>
                    <td className="px-4 py-3.5"><span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><MapPin className="w-3 h-3 text-emerald-500/70" />{p.city}</span></td>
                    <td className="px-4 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{p.diagnosis}</td>
                    <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>{p.visits}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.lastVisit}</td>
                    <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(p.status)}`}>{p.status}</span></td>
                    
                    {/* 3-DOT ACTION MENU */}
                    <td className="px-4 py-3.5 relative patient-menu-container">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                        style={{ color: 'var(--text-primary)', background: openMenuId === p.id ? 'rgba(37,184,154,0.15)' : 'transparent' }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {openMenuId === p.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-4 top-12 z-50 w-48 rounded-2xl p-1.5 shadow-2xl border backdrop-blur-xl"
                            style={{
                              background: 'rgba(15, 23, 42, 0.96)',
                              borderColor: 'rgba(37, 184, 154, 0.25)',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}
                          >
                            <button
                              onClick={() => { setSelectedPatient(p); setActiveModal('view'); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-left"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-400" /> Patient Medical File
                            </button>

                            <button
                              onClick={() => { setSelectedPatient(p); setActiveModal('prescription'); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-sky-500/10 hover:text-sky-400 transition-all text-left"
                            >
                              <Pill className="w-3.5 h-3.5 text-sky-400" /> Create Digital Rx
                            </button>

                            <a
                              href={`tel:${p.phone}`}
                              onClick={() => setOpenMenuId(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all text-left"
                            >
                              <Phone className="w-3.5 h-3.5 text-indigo-400" /> Call Patient
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>

                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Patient Detail Modal */}
      <AnimatePresence>
        {activeModal === 'view' && selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-4" style={{ background: 'var(--bg-surface)', borderColor: 'rgba(37,184,154,0.3)' }}>
              <div className="flex items-center justify-between border-b pb-3 border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">{selectedPatient.name[0]}</div>
                  <div>
                    <h2 className="font-extrabold text-base text-white">{selectedPatient.name}</h2>
                    <p className="text-xs text-slate-400">{selectedPatient.age}y · {selectedPatient.gender} · Blood Group: {selectedPatient.bloodGroup}</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Primary Diagnosis</p>
                  <p className="font-bold text-white mt-0.5">{selectedPatient.diagnosis}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Visits</p>
                  <p className="font-bold text-emerald-400 mt-0.5">{selectedPatient.visits} Consultations</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Location &amp; Contact</p>
                <p className="text-slate-200">{selectedPatient.phone} · {selectedPatient.city}</p>
                <p className="text-slate-400 text-[11px]">Last Visit Date: {selectedPatient.lastVisit}</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl"
          >
            <Check className="w-4 h-4" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
