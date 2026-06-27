'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Users, ClipboardList, Calendar,
  CreditCard, CheckCircle2, UserCheck, Building2,
  Stethoscope, MessageSquare, Zap, LogIn, AlertTriangle,
  Filter, X,
} from 'lucide-react';

const INITIAL_EVENTS = [
  { id: 1,  icon: Users,        color: 'bg-indigo-500/20 text-indigo-400',    category: 'Patients',       text: 'New patient registered',       detail: 'Sunita Joshi · Delhi',         time: '2m ago' },
  { id: 2,  icon: ClipboardList,color: 'bg-amber-500/20 text-amber-400',      category: 'Leads',          text: 'Lead created',                 detail: 'Orthopedic · Pune',            time: '5m ago' },
  { id: 3,  icon: Calendar,     color: 'bg-emerald-500/20 text-emerald-400',  category: 'Appointments',   text: 'Appointment confirmed',        detail: 'Rahul → Dr. Ramesh',           time: '8m ago' },
  { id: 4,  icon: CreditCard,   color: 'bg-violet-500/20 text-violet-400',    category: 'Payments',       text: 'Payment received ₹5,899',      detail: 'Dr. Ramesh Kumar · Elite',     time: '14m ago' },
  { id: 5,  icon: CheckCircle2, color: 'bg-teal-500/20 text-teal-400',        category: 'Appointments',   text: 'Consultation completed',       detail: 'Arjun Patel → Dr. Suresh',    time: '22m ago' },
  { id: 6,  icon: UserCheck,    color: 'bg-sky-500/20 text-sky-400',          category: 'Verification',   text: 'Doctor profile updated',       detail: 'Dr. Priya Patel',             time: '35m ago' },
  { id: 7,  icon: Zap,          color: 'bg-amber-500/20 text-amber-400',      category: 'Payments',       text: 'Subscription renewed',         detail: 'Apollo Hospitals · Platinum', time: '1h ago' },
  { id: 8,  icon: Building2,    color: 'bg-violet-500/20 text-violet-400',    category: 'Verification',   text: 'Hospital verified',            detail: 'Narayana Health Bengaluru',   time: '1h ago' },
  { id: 9,  icon: AlertTriangle,color: 'bg-red-500/20 text-red-400',          category: 'Support',        text: 'Complaint filed',              detail: 'Refund dispute by Kavya R.',  time: '2h ago' },
  { id: 10, icon: LogIn,        color: 'bg-slate-500/20 text-slate-400',      category: 'Security',       text: 'Admin login',                  detail: 'Vikram Singh · Chrome/macOS', time: '2h ago' },
  { id: 11, icon: Stethoscope,  color: 'bg-emerald-500/20 text-emerald-400',  category: 'Verification',   text: 'Doctor approval pending',      detail: 'Dr. Aryan Kapoor · Cardiology',time: '3h ago' },
  { id: 12, icon: MessageSquare,color: 'bg-pink-500/20 text-pink-400',        category: 'Leads',          text: 'Lead stage updated',           detail: 'L005: Contacted → Qualified', time: '3h ago' },
  { id: 13, icon: Users,        color: 'bg-indigo-500/20 text-indigo-400',    category: 'Patients',       text: 'Patient lead converted',       detail: 'Deepak Singh → Converted',    time: '4h ago' },
  { id: 14, icon: CreditCard,   color: 'bg-red-500/20 text-red-400',          category: 'Payments',       text: 'Payment failed',               detail: 'KIMS Hospital · ₹11,799',     time: '5h ago' },
  { id: 15, icon: Calendar,     color: 'bg-rose-500/20 text-rose-400',        category: 'Appointments',   text: 'Appointment cancelled',        detail: 'Deepak Singh · Cancelled',    time: '6h ago' },
];

const CATEGORIES = ['All', 'Patients', 'Leads', 'Appointments', 'Payments', 'Verification', 'Support', 'Security'];

export default function LiveActivityPage() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [filter, setFilter] = useState('All');
  const [ticker, setTicker] = useState(0);

  /* Simulate new events every 8 seconds */
  useEffect(() => {
    const NEW_EVENTS = [
      { icon: Users,        color: 'bg-indigo-500/20 text-indigo-400',   category: 'Patients',     text: 'New patient registered', detail: 'Arjun Mehta · Mumbai', time: 'just now' },
      { icon: ClipboardList,color: 'bg-amber-500/20 text-amber-400',     category: 'Leads',        text: 'New lead received',      detail: 'Neurology · Chennai',  time: 'just now' },
      { icon: CreditCard,   color: 'bg-violet-500/20 text-violet-400',   category: 'Payments',     text: 'Subscription payment',   detail: 'Dr. Kiran Sharma · ₹4,999', time: 'just now' },
      { icon: Calendar,     color: 'bg-emerald-500/20 text-emerald-400', category: 'Appointments', text: 'Appointment booked',     detail: 'Priya → Dr. Anjali',   time: 'just now' },
    ];
    const interval = setInterval(() => {
      const newEvent = { ...NEW_EVENTS[Math.floor(Math.random() * NEW_EVENTS.length)], id: Date.now() };
      setEvents(prev => [newEvent, ...prev.slice(0, 29)]);
      setTicker(t => t + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'All' ? events : events.filter(e => e.category === filter);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5" style={{ color: '#25B89A' }} />
            <div>
              <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Live Activity</h1>
              <p className="text-[11px]" style={{ color: '#64748B' }}>Real-time platform event stream</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}>{events.length} events</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={filter === cat
                  ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                  : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Event stream */}
          <div className="flex flex-col gap-1.5">
            <AnimatePresence mode="popLayout">
              {filtered.map((event, i) => {
                const Icon = event.icon;
                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, x: -12, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border hover:bg-white/[0.02] transition-colors"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${event.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{event.text}</p>
                      <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{event.detail}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: '#64748B' }}>{event.category}</span>
                      <span className="text-[10px]" style={{ color: '#64748B' }}>{event.time}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </main>
      </div>
  );
}
