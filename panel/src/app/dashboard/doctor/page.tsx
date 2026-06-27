'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, Star, DollarSign, Clock, CheckCircle2,
  XCircle, Bell, ChevronDown, MapPin, Phone, Video
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';

const APPOINTMENTS = [
  { id: 1, patient: 'Rahul Sharma',  age: 32, concern: 'Chest pain evaluation',    date: 'Jun 18, 2026', time: '10:30 AM', type: 'In-Person', status: 'Confirmed' },
  { id: 2, patient: 'Sunita Devi',   age: 58, concern: 'Cardiac follow-up',         date: 'Jun 18, 2026', time: '12:00 PM', type: 'Video',     status: 'Confirmed' },
  { id: 3, patient: 'Mohan Gupta',   age: 45, concern: 'Hypertension management',   date: 'Jun 19, 2026', time: '9:00 AM',  type: 'In-Person', status: 'Pending' },
  { id: 4, patient: 'Kavya Nair',    age: 28, concern: 'Echo cardiogram review',    date: 'Jun 20, 2026', time: '2:30 PM',  type: 'Video',     status: 'Confirmed' },
];

const statusCls = (s: string) => ({
  'Confirmed': 'badge-success', 'Pending': 'badge-warning', 'Cancelled': 'badge-danger',
}[s] || '');

export default function DoctorDashboard() {
  const [filter, setFilter] = useState<'All' | 'Today' | 'Upcoming'>('All');

  const filtered = APPOINTMENTS.filter(a => {
    if (filter === 'Today') return a.date === 'Jun 18, 2026';
    if (filter === 'Upcoming') return a.date !== 'Jun 18, 2026';
    return true;
  });

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <PanelSidebar role="doctor" userName="Dr. Ramesh Kumar" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-white text-lg">Doctor Dashboard</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Dr. Ramesh Kumar · Cardiology · AIIMS Delhi</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold text-emerald-400"
              style={{ borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.08)' }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Available Today
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">

          {/* Profile summary */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="panel-card p-5 mb-6 flex items-center gap-5"
            style={{ background: 'linear-gradient(135deg, rgba(18,122,106,0.12) 0%, rgba(7,94,82,0.08) 100%)', border: '1px solid rgba(18,122,106,0.2)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>R</div>
            <div className="flex-1 min-w-0">
              <h2 className="font-extrabold text-white text-base">Dr. Ramesh Kumar</h2>
              <p className="text-xs" style={{ color: '#25B89A' }}>MBBS, MD · Cardiologist · 12 Years Experience</p>
              <div className="flex flex-wrap gap-3 mt-2 text-[10px]" style={{ color: '#64748B' }}>
                <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />AIIMS Delhi</span>
                <span className="flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />4.9 Rating</span>
                <span className="flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" />₹1,500 Fee</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-lg font-extrabold text-white">4</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>Today</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Calendar,     label: 'Total Appointments', value: '18',  color: 'bg-indigo-500' },
              { icon: Users,        label: 'My Patients',        value: '124', color: 'bg-violet-500' },
              { icon: CheckCircle2, label: 'Completed Today',    value: '6',   color: 'bg-emerald-500' },
              { icon: DollarSign,   label: 'This Month',         value: '₹48K',color: 'bg-amber-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="panel-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                  <s.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-white">{s.value}</p>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Appointments */}
          <div className="panel-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: '#25B89A' }} /> Appointments
              </h3>
              <div className="flex gap-1 p-0.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {(['All', 'Today', 'Upcoming'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${filter === f ? 'text-white' : 'text-[#64748B] hover:text-white'}`}
                    style={{ background: filter === f ? 'linear-gradient(135deg,#127A6A,#075E52)' : 'transparent' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {filtered.map((apt, i) => (
                  <motion.div key={apt.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:border-brand/20"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>{apt.patient[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{apt.patient}</p>
                      <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{apt.concern} · Age {apt.age}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] font-bold text-white">{apt.date}</p>
                      <p className="text-[10px] flex items-center gap-1 justify-end mt-0.5" style={{ color: '#64748B' }}>
                        <Clock className="w-2.5 h-2.5" />{apt.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {apt.type === 'Video' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ color: '#6366f1', background: 'rgba(99,102,241,0.12)' }}>
                          <Video className="w-2.5 h-2.5 inline mr-0.5" />Video
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ color: '#25B89A', background: 'rgba(37,184,154,0.12)' }}>
                          <MapPin className="w-2.5 h-2.5 inline mr-0.5" />In-Person
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusCls(apt.status)}`}>{apt.status}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
