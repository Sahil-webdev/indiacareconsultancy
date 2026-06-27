'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Search, Eye, CheckCircle2, XCircle,
  Clock, AlertCircle, FileText, MessageSquare,
  MoreVertical, MapPin, Star, Stethoscope, Download,
  Building2, Calendar, Phone,
} from 'lucide-react';

const PENDING_DOCTORS = [
  { id: 'DR201', name: 'Dr. Aryan Kapoor',  speciality: 'Cardiology',    hospital: 'Max Hospital Delhi',  exp: 9,  city: 'Delhi',     submitted: 'Jun 19, 2026', phone: '+91 98100 21111', docs: ['MBBS', 'MD', 'Registration'] },
  { id: 'DR202', name: 'Dr. Sheetal Patel', speciality: 'Gynecology',    hospital: 'Cloudnine Bengaluru', exp: 6,  city: 'Bengaluru', submitted: 'Jun 18, 2026', phone: '+91 98100 22222', docs: ['MBBS', 'DGO', 'Registration'] },
  { id: 'DR203', name: 'Dr. Manish Kumar',  speciality: 'Neurology',     hospital: 'KIMS Hyderabad',      exp: 14, city: 'Hyderabad', submitted: 'Jun 18, 2026', phone: '+91 98100 23333', docs: ['MBBS', 'MD', 'DM', 'Registration'] },
  { id: 'DR204', name: 'Dr. Ritu Singh',    speciality: 'Dermatology',   hospital: 'Fortis Noida',        exp: 5,  city: 'Noida',     submitted: 'Jun 17, 2026', phone: '+91 98100 24444', docs: ['MBBS', 'MD Derm'] },
  { id: 'DR205', name: 'Dr. Amit Joshi',    speciality: 'Orthopedic',    hospital: 'Narayana Jaipur',     exp: 11, city: 'Jaipur',    submitted: 'Jun 17, 2026', phone: '+91 98100 25555', docs: ['MBBS', 'MS Ortho', 'Registration'] },
  { id: 'DR206', name: 'Dr. Preethi Rao',   speciality: 'Pediatrics',    hospital: 'Rainbow Hyderabad',   exp: 7,  city: 'Hyderabad', submitted: 'Jun 16, 2026', phone: '+91 98100 26666', docs: ['MBBS', 'DCH', 'Registration'] },
  { id: 'DR207', name: 'Dr. Saurav Roy',    speciality: 'ENT',           hospital: 'Medica Kolkata',      exp: 8,  city: 'Kolkata',   submitted: 'Jun 16, 2026', phone: '+91 98100 27777', docs: ['MBBS', 'MS ENT'] },
  { id: 'DR208', name: 'Dr. Kavita Reddy',  speciality: 'Ophthalmology', hospital: 'LV Prasad Eye',       exp: 10, city: 'Hyderabad', submitted: 'Jun 15, 2026', phone: '+91 98100 28888', docs: ['MBBS', 'MS Ophtha', 'Registration'] },
];

const DOC_ACTIONS = [
  { label: 'View Full Profile',    icon: Eye,          danger: false },
  { label: 'View Documents',       icon: FileText,     danger: false },
  { label: 'Approve',             icon: CheckCircle2, danger: false },
  { label: 'Request Changes',     icon: MessageSquare,danger: false },
  { label: 'Reject',              icon: XCircle,      danger: true  },
];

function ActionMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8" style={{ color: '#64748B' }}>
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 4 }} transition={{ duration: 0.13 }}
            className="absolute right-0 top-full mt-1 z-50 rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', minWidth: 200 }}>
            {DOC_ACTIONS.map((a, i) => {
              const Icon = a.icon;
              return (
                <button key={i} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left hover:bg-white/5"
                  style={{ color: a.danger ? '#f87171' : 'var(--text-secondary)' }} onClick={() => setOpen(false)}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {a.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DoctorApprovalsPage() {
  const [search, setSearch] = useState('');
  const filtered = PENDING_DOCTORS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.speciality.toLowerCase().includes(search.toLowerCase()) ||
    d.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Doctor Approvals</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Review and verify new doctor registrations</p>
          </div>
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
            {PENDING_DOCTORS.length} Pending
          </span>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Clock,        label: 'Awaiting Review',   value: 8,  color: 'bg-amber-500' },
              { icon: CheckCircle2, label: 'Approved Today',    value: 3,  color: 'bg-emerald-500' },
              { icon: XCircle,      label: 'Rejected This Week',value: 1,  color: 'bg-red-500' },
              { icon: AlertCircle,  label: 'Changes Requested', value: 2,  color: 'bg-orange-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="panel-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}><s.icon className="w-4 h-4 text-white" /></div>
                <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
              </motion.div>
            ))}
          </div>

          <div className="panel-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search pending approvals…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} pending</span>
            </div>
            <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                    {d.name.split(' ')[1][0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>{d.id}</span>
                    </div>
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#94A3B8' }}>
                      <Stethoscope className="w-3 h-3" />{d.speciality} · {d.exp}y exp · {d.hospital}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><MapPin className="w-3 h-3" />{d.city}</span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><Phone className="w-3 h-3" />{d.phone}</span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><Calendar className="w-3 h-3" />Submitted {d.submitted}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {d.docs.map((doc, j) => (
                        <span key={j} className="text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                          style={{ background: 'rgba(37,184,154,0.08)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.15)' }}>
                          <FileText className="w-2.5 h-2.5" />{doc}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </button>
                    <button className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <MessageSquare className="w-3 h-3" /> Changes
                    </button>
                    <ActionMenu />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
  );
}
