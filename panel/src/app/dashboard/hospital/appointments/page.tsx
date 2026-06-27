'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, XCircle, Eye, Video, Building2 } from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';

const APPOINTMENTS = [
  { id: 'APT001', patient: 'Rahul Sharma',  doctor: 'Dr. Kiran Mehta',  speciality: 'Cardiology',  date: 'Jun 20, 2026', time: '10:00 AM', mode: 'Clinic', status: 'Confirmed', fee: 1500 },
  { id: 'APT002', patient: 'Priya Nair',    doctor: 'Dr. Anjali Gupta', speciality: 'Gynecology',  date: 'Jun 20, 2026', time: '11:00 AM', mode: 'Video',  status: 'Confirmed', fee: 1100 },
  { id: 'APT003', patient: 'Arjun Patel',   doctor: 'Dr. Rohit Sharma', speciality: 'Orthopedic',  date: 'Jun 20, 2026', time: '02:30 PM', mode: 'Clinic', status: 'Pending',   fee: 1200 },
  { id: 'APT004', patient: 'Kavya Reddy',   doctor: 'Dr. Nidhi Verma',  speciality: 'Pediatrics',  date: 'Jun 21, 2026', time: '09:00 AM', mode: 'Video',  status: 'Confirmed', fee: 700 },
  { id: 'APT005', patient: 'Mohan Verma',   doctor: 'Dr. Suresh Iyer',  speciality: 'Neurology',   date: 'Jun 21, 2026', time: '04:00 PM', mode: 'Clinic', status: 'Completed', fee: 1800 },
  { id: 'APT006', patient: 'Sunita Joshi',  doctor: 'Dr. Priya Nair',   speciality: 'Dermatology', date: 'Jun 22, 2026', time: '11:30 AM', mode: 'Clinic', status: 'Cancelled', fee: 1000 },
];

const statusBadge = (s: string) => ({
  Confirmed:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Pending:    'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Completed:  'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
  Cancelled:  'bg-red-500/15 text-red-400 border border-red-500/20',
}[s] || '');

export default function HospitalAppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const filtered = APPOINTMENTS.filter(a => statusFilter ? a.status === statusFilter : true);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <PanelSidebar role="hospital" userName="Apollo Hospitals" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Appointments</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>All booked consultations at your hospital</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: CheckCircle2, label: 'Confirmed',  value: APPOINTMENTS.filter(a=>a.status==='Confirmed').length,  color: 'bg-emerald-500' },
              { icon: Clock,        label: 'Pending',    value: APPOINTMENTS.filter(a=>a.status==='Pending').length,    color: 'bg-amber-500' },
              { icon: Calendar,     label: 'Completed',  value: APPOINTMENTS.filter(a=>a.status==='Completed').length,  color: 'bg-indigo-500' },
              { icon: XCircle,      label: 'Cancelled',  value: APPOINTMENTS.filter(a=>a.status==='Cancelled').length,  color: 'bg-red-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="panel-card p-4 flex items-center gap-3 cursor-pointer"
                onClick={() => setStatusFilter(s.label === statusFilter ? '' : s.label)}>
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
            <div className="flex flex-wrap items-center gap-2 p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              {['', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                  style={statusFilter === s
                    ? { background: 'rgba(18,122,106,0.25)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                    : { color: 'var(--text-muted)', background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)' }}>
                  {s || 'All'}
                </button>
              ))}
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{filtered.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['ID', 'Patient', 'Doctor', 'Speciality', 'Date & Time', 'Mode', 'Fee', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-4 py-3.5" style={{ color: '#25B89A' }}>{a.id}</td>
                      <td className="px-4 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{a.patient}</td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{a.doctor}</td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{a.speciality}</td>
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
