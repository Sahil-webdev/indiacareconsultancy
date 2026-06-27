'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, CheckCircle2, Clock, XCircle, Eye, Video, Building2, User, Phone, Filter, Search
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';

const APPOINTMENTS = [
  { id: 'APT001', patient: 'Rahul Sharma',  age: 34, phone: '+91 98765 43299', date: 'Jun 20, 2026', time: '10:00 AM', mode: 'Clinic', status: 'Confirmed', reason: 'Chest pain & breathlessness', fee: 1500 },
  { id: 'APT002', patient: 'Kavya Reddy',   age: 28, phone: '+91 65432 10098', date: 'Jun 20, 2026', time: '11:30 AM', mode: 'Video',  status: 'Confirmed', reason: 'Follow-up - ECG report',    fee: 1500 },
  { id: 'APT003', patient: 'Mohan Verma',   age: 52, phone: '+91 54321 00987', date: 'Jun 20, 2026', time: '02:00 PM', mode: 'Clinic', status: 'Pending',   reason: 'Hypertension management',   fee: 1500 },
  { id: 'APT004', patient: 'Sunita Joshi',  age: 40, phone: '+91 43210 09876', date: 'Jun 21, 2026', time: '09:30 AM', mode: 'Video',  status: 'Confirmed', reason: 'Palpitations & anxiety',    fee: 1500 },
  { id: 'APT005', patient: 'Deepak Singh',  age: 45, phone: '+91 32100 98765', date: 'Jun 21, 2026', time: '12:00 PM', mode: 'Clinic', status: 'Completed', reason: 'Annual cardiac check-up',   fee: 1500 },
  { id: 'APT006', patient: 'Anita Mehta',   age: 37, phone: '+91 21009 87654', date: 'Jun 22, 2026', time: '04:00 PM', mode: 'Clinic', status: 'Cancelled', reason: 'Shortness of breath',       fee: 1500 },
];

const statusBadge = (s: string) => ({
  Confirmed:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Pending:    'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Completed:  'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
  Cancelled:  'bg-red-500/15 text-red-400 border border-red-500/20',
}[s] || '');

export default function DoctorAppointmentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = APPOINTMENTS.filter(a =>
    a.patient.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter ? a.status === statusFilter : true)
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <PanelSidebar role="doctor" userName="Dr. Ramesh Kumar" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>My Appointments</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Upcoming and past patient consultations</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Calendar,     label: 'Today',      value: '3',  color: 'bg-indigo-500' },
              { icon: CheckCircle2, label: 'Confirmed',  value: '4',  color: 'bg-emerald-500' },
              { icon: Clock,        label: 'Pending',    value: '1',  color: 'bg-amber-500' },
              { icon: XCircle,      label: 'Cancelled',  value: '1',  color: 'bg-red-500' },
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

          <div className="panel-card overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search patient…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex gap-1.5">
                {['', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                    style={statusFilter === s
                      ? { background: 'rgba(18,122,106,0.25)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                      : { color: 'var(--text-muted)', background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)' }}>
                    {s || 'All'}
                  </button>
                ))}
              </div>
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{filtered.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Patient', 'Contact', 'Date & Time', 'Mode', 'Reason', 'Fee', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{a.patient}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.age}y</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}><Phone className="w-3 h-3" />{a.phone}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{a.date}</p>
                        <p style={{ color: 'var(--text-muted)' }}>{a.time}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={a.mode === 'Video' ? { color: '#38BDF8', background: 'rgba(56,189,248,0.1)' } : { color: '#94A3B8', background: 'rgba(148,163,184,0.1)' }}>
                          {a.mode === 'Video' ? <Video className="w-3 h-3" /> : <Building2 className="w-3 h-3" />} {a.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-[180px] truncate" style={{ color: 'var(--text-secondary)' }}>{a.reason}</td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{a.fee}</td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(a.status)}`}>{a.status}</span></td>
                      <td className="px-4 py-3.5">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: '#25B89A' }}><Eye className="w-3.5 h-3.5" /></button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
