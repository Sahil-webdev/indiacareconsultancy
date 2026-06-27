'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Search, Eye, Clock, CheckCircle2,
  XCircle, AlertCircle, Stethoscope, Building2,
  MoreVertical, MessageSquare, PhoneCall, RefreshCw,
  FileText, DollarSign, Bell, Archive,
} from 'lucide-react';

/* ── 9-stage appointment lifecycle ── */
const APPOINTMENT_STATUSES = [
  'Requested', 'Awaiting Doctor Confirmation', 'Awaiting Patient Confirmation',
  'Confirmed', 'Rescheduled', 'Completed', 'Cancelled by Patient',
  'Cancelled by Doctor', 'No-show',
];

const statusInfo: Record<string, { badge: string; dot: string }> = {
  'Requested':                      { badge: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',  dot: '#818cf8' },
  'Awaiting Doctor Confirmation':   { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',    dot: '#f59e0b' },
  'Awaiting Patient Confirmation':  { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/20', dot: '#f97316' },
  'Confirmed':                      { badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', dot: '#22c55e' },
  'Rescheduled':                    { badge: 'bg-sky-500/15 text-sky-400 border border-sky-500/20',           dot: '#38bdf8' },
  'Completed':                      { badge: 'bg-teal-500/15 text-teal-400 border border-teal-500/20',        dot: '#2dd4bf' },
  'Cancelled by Patient':           { badge: 'bg-red-500/15 text-red-400 border border-red-500/20',           dot: '#ef4444' },
  'Cancelled by Doctor':            { badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',        dot: '#f43f5e' },
  'No-show':                        { badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',     dot: '#94a3b8' },
};

const modeBadge = (m: string) => m === 'Video'
  ? 'bg-sky-500/10 text-sky-400'
  : 'bg-slate-500/10 text-slate-400';

const APPOINTMENTS = [
  { id: 'APT001', patient: 'Rahul Sharma',  doctor: 'Dr. Ramesh Kumar',   speciality: 'Cardiology',  hospital: 'Apollo Delhi',     date: 'Jun 18, 2026', time: '10:00 AM', mode: 'Clinic', status: 'Confirmed',                    fee: 1500, consultant: 'Rahul C.',  source: 'Website' },
  { id: 'APT002', patient: 'Priya Nair',    doctor: 'Dr. Priya Patel',    speciality: 'Dermatology', hospital: 'Fortis Mumbai',    date: 'Jun 18, 2026', time: '11:30 AM', mode: 'Clinic', status: 'Awaiting Doctor Confirmation',  fee: 1200, consultant: 'Priya C.', source: 'Referral' },
  { id: 'APT003', patient: 'Arjun Patel',   doctor: 'Dr. Suresh Babu',    speciality: 'Orthopedic',  hospital: 'Narayana Blr',     date: 'Jun 18, 2026', time: '02:00 PM', mode: 'Clinic', status: 'Completed',                    fee: 1300, consultant: 'Sanjay C.',source: 'Website' },
  { id: 'APT004', patient: 'Kavya Reddy',   doctor: 'Dr. Anjali Menon',   speciality: 'Gynecology',  hospital: 'Kokilaben Mum',    date: 'Jun 19, 2026', time: '09:00 AM', mode: 'Clinic', status: 'Requested',                    fee: 1100, consultant: 'Rahul C.', source: 'Website' },
  { id: 'APT005', patient: 'Mohan Verma',   doctor: 'Dr. Kiran Sharma',   speciality: 'Neurology',   hospital: 'Medanta Grg',      date: 'Jun 19, 2026', time: '04:00 PM', mode: 'Clinic', status: 'Confirmed',                    fee: 1800, consultant: 'Priya C.', source: 'Google' },
  { id: 'APT006', patient: 'Sunita Joshi',  doctor: 'Dr. Vikranth Reddy', speciality: 'ENT',         hospital: 'KIMS Hyderabad',   date: 'Jun 20, 2026', time: '10:30 AM', mode: 'Clinic', status: 'Awaiting Patient Confirmation', fee: 800,  consultant: 'Sanjay C.',source: 'WhatsApp' },
  { id: 'APT007', patient: 'Deepak Singh',  doctor: 'Dr. Sanjay Gupta',   speciality: 'Dentist',     hospital: 'Max Dental',       date: 'Jun 20, 2026', time: '01:00 PM', mode: 'Clinic', status: 'Cancelled by Patient',         fee: 500,  consultant: 'Rahul C.', source: 'Website' },
  { id: 'APT008', patient: 'Anita Mehta',   doctor: 'Dr. Nidhi Verma',    speciality: 'Pediatrics',  hospital: 'Rainbow Children', date: 'Jun 21, 2026', time: '03:00 PM', mode: 'Clinic', status: 'No-show',                      fee: 700,  consultant: 'Priya C.', source: 'Referral' },
];

const APT_ACTIONS = [
  { label: 'View Appointment',  icon: Eye,          divider: false, danger: false },
  { label: 'Confirm',           icon: CheckCircle2, divider: false, danger: false },
  { label: 'Reschedule',        icon: RefreshCw,    divider: false, danger: false },
  { label: 'Send Reminder',     icon: Bell,         divider: false, danger: false },
  { label: 'Contact Patient',   icon: PhoneCall,    divider: false, danger: false },
  { label: 'Contact Doctor',    icon: MessageSquare,divider: false, danger: false },
  { label: 'Mark Completed',    icon: CheckCircle2, divider: false, danger: false },
  { label: 'Mark No-show',      icon: AlertCircle,  divider: true,  danger: false },
  { label: 'View History',      icon: FileText,     divider: false, danger: false },
  { label: 'Initiate Refund',   icon: DollarSign,   divider: false, danger: false },
  { label: 'Raise Dispute',     icon: AlertCircle,  divider: false, danger: false },
  { label: 'Cancel Appointment',icon: XCircle,      divider: true,  danger: true  },
];

function ThreeDotMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
        style={{ color: '#64748B' }}>
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
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', minWidth: 200 }}
          >
            {APT_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <React.Fragment key={i}>
                  {action.divider && <div className="my-1 mx-2 border-t" style={{ borderColor: 'var(--border-color)' }} />}
                  <button
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-white/5"
                    style={{ color: action.danger ? '#f87171' : 'var(--text-secondary)' }}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {action.label}
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

export default function AppointmentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = APPOINTMENTS.filter(a =>
    (a.patient.toLowerCase().includes(search.toLowerCase()) ||
     a.doctor.toLowerCase().includes(search.toLowerCase()) ||
     a.speciality.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter ? a.status === statusFilter : true)
  );

  const counts: Record<string, number> = {};
  APPOINTMENT_STATUSES.forEach(s => { counts[s] = APPOINTMENTS.filter(a => a.status === s).length; });

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Appointments</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>All booked consultations · 9-stage lifecycle</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: CheckCircle2, label: 'Confirmed',  value: counts['Confirmed'] ?? 0,                 color: 'bg-emerald-500' },
              { icon: Clock,        label: 'Awaiting Confirm', value: (counts['Awaiting Doctor Confirmation'] ?? 0) + (counts['Awaiting Patient Confirmation'] ?? 0), color: 'bg-amber-500' },
              { icon: Calendar,     label: 'Completed',  value: counts['Completed'] ?? 0,                 color: 'bg-teal-500' },
              { icon: XCircle,      label: 'Cancelled / No-show', value: (counts['Cancelled by Patient'] ?? 0) + (counts['Cancelled by Doctor'] ?? 0) + (counts['No-show'] ?? 0), color: 'bg-red-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="panel-card p-4 flex items-center gap-3 cursor-pointer"
                onClick={() => setStatusFilter(s.label === statusFilter ? '' : s.label)}>
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

          {/* Stage filter pills */}
          <div className="panel-card p-4 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>Filter by Status</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setStatusFilter('')}
                className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                style={!statusFilter
                  ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                  : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                All ({APPOINTMENTS.length})
              </button>
              {APPOINTMENT_STATUSES.map(s => (
                <button key={s} onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
                  className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap"
                  style={statusFilter === s
                    ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                    : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {s} ({counts[s] ?? 0})
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="panel-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search appointments…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['ID', 'Patient', 'Doctor', 'Speciality', 'Hospital', 'Date & Time', 'Mode', 'Consultant', 'Source', 'Fee', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => {
                    const si = statusInfo[a.status] ?? { badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/20', dot: '#94a3b8' };
                    return (
                      <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>{a.id}</td>
                        <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{a.patient}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#94A3B8' }}>{a.doctor}</td>
                        <td className="px-4 py-3.5" style={{ color: '#64748B' }}>{a.speciality}</td>
                        <td className="px-4 py-3.5 max-w-[130px] truncate" style={{ color: '#64748B' }}>{a.hospital}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{a.date}</p>
                          <p style={{ color: '#64748B' }}>{a.time}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${modeBadge(a.mode)}`}>
                            {a.mode === 'Video' ? <Stethoscope className="w-3 h-3" /> : <Building2 className="w-3 h-3" />} {a.mode}
                          </span>
                        </td>
                        <td className="px-4 py-3.5" style={{ color: '#64748B' }}>{a.consultant}</td>
                        <td className="px-4 py-3.5" style={{ color: '#64748B' }}>{a.source}</td>
                        <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{a.fee}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: si.dot }} />
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${si.badge}`}>{a.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: '#25B89A' }}>
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <ThreeDotMenu />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
  );
}
