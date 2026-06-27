'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Eye, Edit2, Plus,
  Phone, Mail, MapPin, Calendar, CheckCircle2, Clock, AlertCircle,
  MoreVertical, MessageSquare, UserX, Archive, Trash2,
  ClipboardList, Stethoscope, UserCheck, FileText, X,
  ChevronDown,
} from 'lucide-react';

const PATIENTS = [
  { id: 'P001', name: 'Rahul Sharma',  age: 34, gender: 'Male',   phone: '+91 98XXXX3299', email: 'rahul@email.com', city: 'Delhi',     concern: 'Cardiology',       status: 'Active',   joined: 'Jun 14, 2026', consultant: 'Rahul C.',   lastContact: '2d ago', nextFollowup: 'Jun 23',  source: 'Website' },
  { id: 'P002', name: 'Priya Nair',    age: 28, gender: 'Female', phone: '+91 87XXXX2100', email: 'priya@email.com', city: 'Mumbai',    concern: 'Dermatology',      status: 'Active',   joined: 'Jun 12, 2026', consultant: 'Priya C.',   lastContact: '1d ago', nextFollowup: 'Jun 22',  source: 'Referral' },
  { id: 'P003', name: 'Arjun Patel',   age: 45, gender: 'Male',   phone: '+91 76XXXX1009', email: 'arjun@email.com', city: 'Pune',      concern: 'Orthopedic',       status: 'Inactive', joined: 'Jun 10, 2026', consultant: 'Sanjay C.',  lastContact: '5d ago', nextFollowup: '—',       source: 'Website' },
  { id: 'P004', name: 'Kavya Reddy',   age: 31, gender: 'Female', phone: '+91 65XXXX0098', email: 'kavya@email.com', city: 'Bengaluru', concern: 'Gynecology',       status: 'Active',   joined: 'Jun 8, 2026',  consultant: 'Rahul C.',   lastContact: '3h ago', nextFollowup: 'Jun 24',  source: 'Google Ads' },
  { id: 'P005', name: 'Mohan Verma',   age: 52, gender: 'Male',   phone: '+91 54XXXX0987', email: 'mohan@email.com', city: 'Hyderabad', concern: 'Neurology',        status: 'Active',   joined: 'Jun 6, 2026',  consultant: 'Priya C.',   lastContact: '1h ago', nextFollowup: 'Jun 22',  source: 'Website' },
  { id: 'P006', name: 'Sunita Joshi',  age: 40, gender: 'Female', phone: '+91 43XXXX9876', email: 'sunita@email.com',city: 'Jaipur',    concern: 'Gastroenterology', status: 'Active',   joined: 'Jun 4, 2026',  consultant: 'Sanjay C.',  lastContact: '6h ago', nextFollowup: 'Jun 25',  source: 'Referral' },
  { id: 'P007', name: 'Deepak Singh',  age: 29, gender: 'Male',   phone: '+91 32XXXX8765', email: 'deepak@email.com',city: 'Chennai',   concern: 'ENT',              status: 'Inactive', joined: 'Jun 2, 2026',  consultant: 'Unassigned', lastContact: '7d ago', nextFollowup: '—',       source: 'Social Media' },
  { id: 'P008', name: 'Anita Mehta',   age: 37, gender: 'Female', phone: '+91 21XXXX7654', email: 'anita@email.com', city: 'Delhi',     concern: 'Urology',          status: 'Active',   joined: 'May 30, 2026', consultant: 'Rahul C.',   lastContact: '4h ago', nextFollowup: 'Jun 23',  source: 'Website' },
];

const statusBadge = (s: string) => s === 'Active'
  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
  : 'bg-slate-500/15 text-slate-400 border border-slate-500/20';

const STATUS_FILTERS = ['All', 'Active', 'Inactive'];

/* ── 3-dot Action Menu ── */
const PATIENT_ACTIONS = [
  { label: 'View Full Profile',      icon: Eye,           divider: false, danger: false },
  { label: 'Edit Details',           icon: Edit2,         divider: false, danger: false },
  { label: 'Create Consultation Lead', icon: ClipboardList, divider: false, danger: false },
  { label: 'Suggest Doctors',        icon: Stethoscope,   divider: false, danger: false },
  { label: 'Book Appointment',       icon: Calendar,      divider: false, danger: false },
  { label: 'Assign Consultant',      icon: UserCheck,     divider: false, danger: false },
  { label: 'Send WhatsApp',          icon: MessageSquare, divider: false, danger: false },
  { label: 'Send Email',             icon: Mail,          divider: false, danger: false },
  { label: 'Add Internal Note',      icon: FileText,      divider: true,  danger: false },
  { label: 'Block Account',          icon: UserX,         divider: false, danger: true  },
  { label: 'Archive Patient',        icon: Archive,       divider: false, danger: true  },
  { label: 'Request Permanent Deletion', icon: Trash2,    divider: false, danger: true  },
];

function ThreeDotMenu({ patientName }: { patientName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
        style={{ color: '#64748B' }}
        title="More actions"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.13 }}
            className="absolute right-0 top-full mt-1 z-50 rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', minWidth: 220 }}
          >
            {PATIENT_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <React.Fragment key={i}>
                  {action.divider && <div className="my-1 mx-2 border-t" style={{ borderColor: 'var(--border-color)' }} />}
                  <button
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-white/5"
                    style={{ color: action.danger ? '#f87171' : 'var(--text-secondary)' }}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {action.label}
                  </button>
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = PATIENTS.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.city.toLowerCase().includes(search.toLowerCase()) ||
     p.concern.toLowerCase().includes(search.toLowerCase()) ||
     p.id.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || p.status === statusFilter)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Patients</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>All registered patients · {PATIENTS.length} total</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
            <Plus className="w-3.5 h-3.5" /> Add Patient
          </button>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[
              { icon: Users,        label: 'Total Patients',    value: '527',  color: 'bg-indigo-500' },
              { icon: CheckCircle2, label: 'Active',            value: '438',  color: 'bg-emerald-500' },
              { icon: ClipboardList,label: 'Open Cases',        value: '63',   color: 'bg-amber-500' },
              { icon: Clock,        label: 'Follow-ups Due',    value: '18',   color: 'bg-violet-500' },
              { icon: AlertCircle,  label: 'No Recent Activity',value: '89',   color: 'bg-slate-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
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

          {/* Table */}
          <div className="panel-card overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search patients, ID, city…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              {/* Status filter pills */}
              <div className="flex gap-1.5">
                {STATUS_FILTERS.map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                    style={statusFilter === s
                      ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                      : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {s}
                  </button>
                ))}
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} patients</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['ID', 'Patient', 'Contact', 'City', 'Concern', 'Consultant', 'Last Contact', 'Next Follow-up', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>{p.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs flex-shrink-0">
                            {p.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                            <p style={{ color: '#64748B' }}>{p.age}y · {p.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="flex items-center gap-1" style={{ color: '#94A3B8' }}><Phone className="w-3 h-3" />{p.phone}</p>
                        <p className="flex items-center gap-1 mt-0.5" style={{ color: '#64748B' }}><Mail className="w-3 h-3" />{p.email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 whitespace-nowrap" style={{ color: '#94A3B8' }}><MapPin className="w-3 h-3" />{p.city}</span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{p.concern}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-semibold ${p.consultant === 'Unassigned' ? 'text-rose-400' : ''}`}
                          style={{ color: p.consultant === 'Unassigned' ? undefined : 'var(--text-secondary)' }}>
                          {p.consultant}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#64748B' }}>{p.lastContact}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: p.nextFollowup === '—' ? '#64748B' : '#25B89A' }}>{p.nextFollowup}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(p.status)}`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#64748B' }}>{p.joined}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors" style={{ color: '#25B89A' }}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <ThreeDotMenu patientName={p.name} />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
  );
}
