'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, Search, User, Stethoscope, Building2, ChevronDown, MessageSquare, CheckCircle2, Clock, X } from 'lucide-react';

const COMPLAINTS = [
  { id: 'CMP001', from: 'Patient', name: 'Ramesh Kumar', subject: 'Doctor was rude and dismissive', detail: 'Dr. Aryan Kapoor was extremely rude during consultation. Did not listen to my concerns at all.', against: 'Dr. Aryan Kapoor', status: 'Open', priority: 'High', createdAt: '2 hrs ago', assignedTo: 'Priya S.' },
  { id: 'CMP002', from: 'Doctor', name: 'Dr. Sheetal Patel', subject: 'Incorrect information shown on profile', detail: 'My clinic address on the website is wrong. Patients are going to the wrong location.', against: 'ICC Platform', status: 'In Review', priority: 'Medium', createdAt: '5 hrs ago', assignedTo: 'Amit R.' },
  { id: 'CMP003', from: 'Hospital', name: 'Apollo Spectra Delhi', subject: 'Duplicate billing issue', detail: 'We were billed twice for the same month subscription. Requesting immediate refund.', against: 'ICC Billing', status: 'Open', priority: 'High', createdAt: '1 day ago', assignedTo: 'Neha K.' },
  { id: 'CMP004', from: 'Patient', name: 'Anjali Sharma', subject: 'Appointment was cancelled without notice', detail: 'My appointment with Dr. Manish Kumar was cancelled 30 min before the scheduled time.', against: 'Dr. Manish Kumar', status: 'Resolved', priority: 'Low', createdAt: '2 days ago', assignedTo: 'Priya S.' },
  { id: 'CMP005', from: 'Patient', name: 'Sunita Devi', subject: 'Consultation fee charged but no call received', detail: 'I paid ₹199 for consultation but never received a call from the consultant.', against: 'ICC Consultant', status: 'Open', priority: 'High', createdAt: '3 hrs ago', assignedTo: null },
];

const FROM_ICON: Record<string, React.ElementType> = { Patient: User, Doctor: Stethoscope, Hospital: Building2 };
const FROM_COLOR: Record<string, string> = { Patient: 'text-sky-400 bg-sky-500/12 border-sky-500/20', Doctor: 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20', Hospital: 'text-violet-400 bg-violet-500/12 border-violet-500/20' };
const STATUS_COLORS: Record<string, string> = { Open: 'text-red-400 bg-red-500/12 border-red-500/20', 'In Review': 'text-amber-400 bg-amber-500/12 border-amber-500/20', Resolved: 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20', Closed: 'text-slate-400 bg-slate-500/12 border-slate-500/20' };
const PRIORITY_COLORS: Record<string, string> = { High: 'text-red-400', Medium: 'text-amber-400', Low: 'text-slate-400' };

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState(COMPLAINTS);
  const [search, setSearch] = useState('');
  const [fromFilter, setFromFilter] = useState('All');

  const filtered = complaints.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase());
    const matchFrom = fromFilter === 'All' || c.from === fromFilter;
    return matchSearch && matchFrom;
  });

  const updateStatus = (id: string, status: string) => setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Complaints</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Grievances from patients, doctors and hospitals</p>
        </div>
        <span className="text-xs font-black px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
          {complaints.filter(c => c.status === 'Open').length} Open
        </span>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: complaints.length, color: 'bg-slate-500' },
            { label: 'Open', value: complaints.filter(c => c.status === 'Open').length, color: 'bg-red-500' },
            { label: 'In Review', value: complaints.filter(c => c.status === 'In Review').length, color: 'bg-amber-500' },
            { label: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length, color: 'bg-emerald-500' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}><AlertOctagon className="w-4 h-4 text-white" /></div>
              <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
          </div>
          {['All', 'Patient', 'Doctor', 'Hospital'].map(f => (
            <button key={f} onClick={() => setFromFilter(f)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all"
              style={{ background: fromFilter === f ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)', color: fromFilter === f ? '#25B89A' : '#64748B', borderColor: fromFilter === f ? 'rgba(37,184,154,0.3)' : 'rgba(255,255,255,0.08)' }}>
              {f}
            </button>
          ))}
        </div>

        <div className="panel-card overflow-hidden">
          <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {filtered.map((c, i) => {
              const FromIcon = FROM_ICON[c.from];
              return (
                <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${FROM_COLOR[c.from]?.split(' ')[1]} ${FROM_COLOR[c.from]?.split(' ')[2]}`}>
                      <FromIcon className={`w-4 h-4 ${FROM_COLOR[c.from]?.split(' ')[0]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                        <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>{c.id}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${FROM_COLOR[c.from]}`}>{c.from}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ml-auto ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                      </div>
                      <p className="text-xs font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{c.subject}</p>
                      <p className="text-[11px] mt-0.5 italic" style={{ color: '#64748B' }}>{c.detail}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`text-[10px] font-bold ${PRIORITY_COLORS[c.priority]}`}>⬤ {c.priority} Priority</span>
                        <span className="text-[10px]" style={{ color: '#64748B' }}>Against: {c.against}</span>
                        {c.assignedTo && <span className="text-[10px]" style={{ color: '#64748B' }}>Assigned: {c.assignedTo}</span>}
                        <span className="text-[10px]" style={{ color: '#475569' }}>{c.createdAt}</span>
                      </div>
                    </div>
                    {c.status !== 'Resolved' && c.status !== 'Closed' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => updateStatus(c.id, 'In Review')}
                          className="text-[10px] font-bold px-3 py-1.5 rounded-xl"
                          style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                          Review
                        </button>
                        <button onClick={() => updateStatus(c.id, 'Resolved')}
                          className="text-[10px] font-bold px-3 py-1.5 rounded-xl"
                          style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
