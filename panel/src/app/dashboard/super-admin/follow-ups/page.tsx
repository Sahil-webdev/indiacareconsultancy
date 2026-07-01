'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Phone, MessageSquare, CheckCircle2, AlertCircle,
  Search, Filter, Plus, ChevronDown, X, Check, Calendar,
  User, Stethoscope,
} from 'lucide-react';

const LEADS = [
  { id: 'L001', patient: 'Ramesh Kumar', age: 52, phone: '98765 43210', concern: 'Chest pain & breathlessness', speciality: 'Cardiology', city: 'Delhi', status: 'Not Called', priority: 'Urgent', consultant: 'Priya S.', dueDate: 'Today', submittedAt: '2 hrs ago' },
  { id: 'L002', patient: 'Sunita Devi', age: 34, phone: '91234 56789', concern: 'Back pain for 3 months', speciality: 'Orthopedics', city: 'Noida', status: 'Called', priority: 'Normal', consultant: 'Amit R.', dueDate: 'Tomorrow', submittedAt: '5 hrs ago' },
  { id: 'L003', patient: 'Vikram Mehra', age: 45, phone: '97890 12345', concern: 'Skin rashes & itching', speciality: 'Dermatology', city: 'Gurgaon', status: 'Follow-up Scheduled', priority: 'Normal', consultant: 'Priya S.', dueDate: 'Jul 3', submittedAt: '1 day ago' },
  { id: 'L004', patient: 'Anjali Sharma', age: 28, phone: '99001 23456', concern: 'Irregular periods & PCOS', speciality: 'Gynecology', city: 'Delhi', status: 'No Answer', priority: 'High', consultant: 'Neha K.', dueDate: 'Today', submittedAt: '3 hrs ago' },
  { id: 'L005', patient: 'Mohan Lal', age: 67, phone: '98112 34567', concern: 'Diabetic foot ulcer', speciality: 'Endocrinology', city: 'Faridabad', status: 'Not Called', priority: 'Urgent', consultant: 'Amit R.', dueDate: 'Today', submittedAt: '1 hr ago' },
  { id: 'L006', patient: 'Kavita Rao', age: 41, phone: '96543 21098', concern: 'Migraine & severe headaches', speciality: 'Neurology', city: 'Delhi', status: 'Called', priority: 'Normal', consultant: 'Neha K.', dueDate: 'Jul 4', submittedAt: '2 days ago' },
];

const STATUS_OPTIONS = ['All', 'Not Called', 'Called', 'No Answer', 'Follow-up Scheduled'];
const PRIORITY_COLORS: Record<string, string> = {
  Urgent: 'text-red-400 bg-red-500/12 border-red-500/20',
  High: 'text-amber-400 bg-amber-500/12 border-amber-500/20',
  Normal: 'text-sky-400 bg-sky-500/12 border-sky-500/20',
};
const STATUS_COLORS: Record<string, string> = {
  'Not Called': 'text-slate-400 bg-slate-500/12 border-slate-500/20',
  'Called': 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20',
  'No Answer': 'text-amber-400 bg-amber-500/12 border-amber-500/20',
  'Follow-up Scheduled': 'text-violet-400 bg-violet-500/12 border-violet-500/20',
};

type Lead = typeof LEADS[0];

export default function FollowUpsPage() {
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const filtered = leads.filter(l => {
    const matchSearch = l.patient.toLowerCase().includes(search.toLowerCase()) ||
      l.speciality.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: string) =>
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));

  const saveNote = (id: string) => {
    // In real app: POST to API
    setNoteOpen(null);
    setNote('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Follow-ups</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Track and manage patient lead follow-up tasks</p>
        </div>
        <span className="text-xs font-black px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
          {leads.filter(l => l.priority === 'Urgent' && l.status === 'Not Called').length} Urgent Pending
        </span>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Follow-ups', value: leads.length, icon: Clock, color: 'bg-sky-500' },
            { label: 'Not Called', value: leads.filter(l => l.status === 'Not Called').length, icon: AlertCircle, color: 'bg-red-500' },
            { label: 'Called Today', value: leads.filter(l => l.status === 'Called').length, icon: CheckCircle2, color: 'bg-emerald-500' },
            { label: 'Scheduled', value: leads.filter(l => l.status === 'Follow-up Scheduled').length, icon: Calendar, color: 'bg-violet-500' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
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

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, speciality…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all"
                style={{
                  background: statusFilter === s ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)',
                  color: statusFilter === s ? '#25B89A' : '#64748B',
                  borderColor: statusFilter === s ? 'rgba(37,184,154,0.3)' : 'rgba(255,255,255,0.08)',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="panel-card overflow-hidden">
          <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {filtered.map((lead, i) => (
              <motion.div key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <div className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                    {lead.patient[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{lead.patient}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>{lead.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[lead.priority]}`}>
                        {lead.priority}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#94A3B8' }}>
                      <Stethoscope className="w-3 h-3" />{lead.speciality} · {lead.city} · Age {lead.age}
                    </p>
                    <p className="text-[11px] mt-1 italic" style={{ color: '#64748B' }}>"{lead.concern}"</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}>
                        <Phone className="w-3 h-3" />{lead.phone}
                      </span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}>
                        <User className="w-3 h-3" />Assigned: {lead.consultant}
                      </span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}>
                        <Clock className="w-3 h-3" />Due: {lead.dueDate}
                      </span>
                      <span className="text-[10px]" style={{ color: '#475569' }}>Submitted {lead.submittedAt}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {/* Status dropdown */}
                    <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none ${STATUS_COLORS[lead.status]}`}
                      style={{ background: 'transparent' }}>
                      {STATUS_OPTIONS.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <div className="flex gap-1.5">
                      <a href={`tel:${lead.phone}`}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl"
                        style={{ background: 'rgba(37,184,154,0.12)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
                        <Phone className="w-3 h-3" /> Call
                      </a>
                      <button onClick={() => { setNoteOpen(lead.id); setNote(''); }}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <MessageSquare className="w-3 h-3" /> Note
                      </button>
                    </div>
                  </div>
                </div>

                {/* Note panel */}
                <AnimatePresence>
                  {noteOpen === lead.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-4 overflow-hidden">
                      <div className="rounded-xl p-3 flex gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Add follow-up note…"
                          className="flex-1 text-xs resize-none focus:outline-none bg-transparent" style={{ color: 'var(--text-primary)' }} />
                        <div className="flex flex-col gap-1">
                          <button onClick={() => saveNote(lead.id)} className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-400" /></button>
                          <button onClick={() => setNoteOpen(null)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><X className="w-3.5 h-3.5" style={{ color: '#64748B' }} /></button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
