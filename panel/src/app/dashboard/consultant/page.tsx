'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Users, MessageSquare, Calendar, CheckCircle2,
  Clock, ArrowRight, Bell, Phone, MapPin, Star, TrendingUp
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';

const LEADS = [
  { id: 1, name: 'Rahul Sharma',   city: 'Delhi',     concern: 'Cardiologist',          urgency: 'High',   status: 'New',         phone: '+91 98765 43210' },
  { id: 2, name: 'Priya Nair',     city: 'Mumbai',    concern: 'Dermatologist',          urgency: 'Medium', status: 'In Progress', phone: '+91 87654 32109' },
  { id: 3, name: 'Arjun Patel',    city: 'Pune',      concern: 'Orthopedic Surgeon',     urgency: 'Low',    status: 'Completed',   phone: '+91 76543 21098' },
  { id: 4, name: 'Kavya Reddy',    city: 'Bengaluru', concern: 'Gynecologist',           urgency: 'Medium', status: 'New',         phone: '+91 65432 10987' },
];

const statusCls = (s: string) => ({
  'New': 'badge-info', 'In Progress': 'badge-warning', 'Completed': 'badge-success',
}[s] || '');

const urgencyCls = (u: string) => ({
  'High': 'text-red-400 bg-red-400/10', 'Medium': 'text-amber-400 bg-amber-400/10', 'Low': 'text-emerald-400 bg-emerald-400/10',
}[u] || '');

export default function ConsultantDashboard() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <PanelSidebar role="consultant" userName="Ananya Mehta" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-white text-lg">Consultant Dashboard</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Manage patient leads and care referrals</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center border" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
              <Bell className="w-4 h-4" style={{ color: '#64748B' }} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">3</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: ClipboardList, label: 'Active Leads',      value: '12',  color: 'bg-indigo-500' },
              { icon: Users,          label: 'Patient Cases',     value: '47',  color: 'bg-violet-500' },
              { icon: CheckCircle2,   label: 'Resolved Today',    value: '4',   color: 'bg-emerald-500' },
              { icon: TrendingUp,     label: 'Conversion Rate',   value: '72%', color: 'bg-amber-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="panel-card p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Leads table */}
          <div className="panel-card p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4" style={{ color: '#25B89A' }} /> My Patient Leads
              </h3>
              <button className="text-[11px] font-bold flex items-center gap-1" style={{ color: '#25B89A' }}>
                All Leads <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {LEADS.map((lead, i) => (
                <motion.div key={lead.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl border hover:border-brand/20 transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                      style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
                      {lead.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{lead.name}</p>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: '#64748B' }}>
                        <MapPin className="w-2.5 h-2.5 inline mr-0.5" />{lead.city} · {lead.concern}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${urgencyCls(lead.urgency)}`}>{lead.urgency}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusCls(lead.status)}`}>{lead.status}</span>
                    <button className="p-1.5 rounded-lg border hover:text-emerald-400 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#64748B' }}>
                      <Phone className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Today schedule */}
          <div className="panel-card p-5">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4" style={{ color: '#25B89A' }} /> Today&apos;s Schedule
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { time: '10:00 AM', patient: 'Rahul Sharma',   type: 'Initial Call',      duration: '30 min' },
                { time: '11:30 AM', patient: 'Priya Nair',     type: 'Follow-up',          duration: '20 min' },
                { time: '2:00 PM',  patient: 'Mohan Verma',    type: 'Doctor Introduction', duration: '45 min' },
                { time: '4:30 PM',  patient: 'Kavya Reddy',    type: 'Consultation',        duration: '30 min' },
              ].map((apt, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl"
                  style={{ background: 'rgba(18,122,106,0.06)', border: '1px solid rgba(18,122,106,0.12)' }}>
                  <div className="text-[10px] font-bold text-center w-14 flex-shrink-0" style={{ color: '#25B89A' }}>{apt.time}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{apt.patient}</p>
                    <p className="text-[10px]" style={{ color: '#64748B' }}>{apt.type} · {apt.duration}</p>
                  </div>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#64748B' }} />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
