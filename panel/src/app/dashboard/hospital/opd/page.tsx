'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Edit2, Save, CheckCircle2, Plus, Trash2 } from 'lucide-react';

const INIT_OPD = [
  { id: 1, dept: 'Cardiology',      doctor: 'Dr. Kiran Mehta',    days: 'Mon–Fri',    start: '09:00 AM', end: '05:00 PM', slots: 20, booked: 14, status: 'Open' },
  { id: 2, dept: 'Gynecology',      doctor: 'Dr. Anjali Gupta',   days: 'Mon–Fri',    start: '09:00 AM', end: '03:00 PM', slots: 15, booked: 10, status: 'Open' },
  { id: 3, dept: 'Orthopedic',      doctor: 'Dr. Rohit Sharma',   days: 'Tue–Sat',    start: '11:00 AM', end: '06:00 PM', slots: 18, booked: 18, status: 'Full' },
  { id: 4, dept: 'Neurology',       doctor: 'Dr. Suresh Iyer',    days: 'Mon,Wed,Fri',start: '10:00 AM', end: '02:00 PM', slots: 10, booked: 6,  status: 'Open' },
  { id: 5, dept: 'Dermatology',     doctor: 'Dr. Priya Nair',     days: 'Mon–Sat',    start: '10:00 AM', end: '04:00 PM', slots: 16, booked: 9,  status: 'Open' },
  { id: 6, dept: 'Pediatrics',      doctor: 'Dr. Nidhi Verma',    days: 'Daily',      start: '09:00 AM', end: '01:00 PM', slots: 12, booked: 7,  status: 'Open' },
];

const statusBadge = (s: string) => ({
  Open:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Full:   'bg-red-500/15 text-red-400 border border-red-500/20',
  Closed: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
}[s] || '');

export default function HospitalOPDPage() {
  const [editing, setEditing] = useState<number | null>(null);

  return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>OPD Timings</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Manage outpatient department schedules</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
            <Plus className="w-3.5 h-3.5" /> Add OPD Slot
          </button>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: FileText,    label: 'Departments', value: INIT_OPD.length,                               color: 'bg-indigo-500' },
              { icon: CheckCircle2,label: 'Open',        value: INIT_OPD.filter(o=>o.status==='Open').length,  color: 'bg-emerald-500' },
              { icon: Clock,       label: 'Full',        value: INIT_OPD.filter(o=>o.status==='Full').length,  color: 'bg-red-500' },
              { icon: Clock,       label: 'Total Slots', value: INIT_OPD.reduce((a,o)=>a+o.slots,0),           color: 'bg-amber-500' },
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

          <div className="flex flex-col gap-4">
            {INIT_OPD.map((opd, i) => {
              const fillPct = Math.round((opd.booked / opd.slots) * 100);
              return (
                <motion.div key={opd.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="panel-card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>{opd.dept}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusBadge(opd.status)}`}>{opd.status}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{opd.doctor}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditing(editing === opd.id ? null : opd.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5"
                        style={{ color: editing === opd.id ? '#25B89A' : 'var(--text-muted)' }}>
                        {editing === opd.id ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    {[
                      { label: 'Days',        value: opd.days },
                      { label: 'Start Time',  value: opd.start },
                      { label: 'End Time',    value: opd.end },
                      { label: 'Daily Slots', value: `${opd.booked} / ${opd.slots}` },
                    ].map((f, j) => (
                      <div key={j} className="rounded-xl p-3" style={{ background: 'var(--bg-surface-3)' }}>
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                        <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Fill indicator */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Booking fill rate</span>
                      <span className="text-[10px] font-bold" style={{ color: fillPct >= 100 ? '#ef4444' : 'var(--text-primary)' }}>{fillPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-surface-3)' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${fillPct}%` }}
                        transition={{ delay: 0.3 + i * 0.07, duration: 0.7 }}
                        className="h-full rounded-full"
                        style={{ background: fillPct >= 100 ? '#ef4444' : 'linear-gradient(90deg,#127A6A,#25B89A)' }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    );
}
