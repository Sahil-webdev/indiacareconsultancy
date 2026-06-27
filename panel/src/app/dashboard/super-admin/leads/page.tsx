'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Search, Eye, MessageSquare,
  Clock, CheckCircle2, AlertCircle, Phone, MapPin, Calendar,
  MoreVertical, UserCheck, Flag, Archive, Stethoscope,
  Send, PhoneCall, Star, XCircle, FileText,
} from 'lucide-react';

/* ── 12-stage pipeline ── */
const PIPELINE_STAGES = [
  'New', 'Contact Attempted', 'Contacted', 'Qualified',
  'Matching in Progress', 'Doctor Options Sent', 'Patient Decision Pending',
  'Appointment Requested', 'Appointment Confirmed', 'Follow-up', 'Converted', 'Lost',
];

const stageColor: Record<string, string> = {
  'New':                       'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  'Contact Attempted':         'bg-sky-500/15 text-sky-400 border-sky-500/20',
  'Contacted':                 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  'Qualified':                 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  'Matching in Progress':      'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'Doctor Options Sent':       'bg-violet-500/15 text-violet-400 border-violet-500/20',
  'Patient Decision Pending':  'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'Appointment Requested':     'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'Appointment Confirmed':     'bg-green-500/15 text-green-400 border-green-500/20',
  'Follow-up':                 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  'Converted':                 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30',
  'Lost':                      'bg-red-500/15 text-red-400 border-red-500/20',
  'Spam':                      'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

const LEADS = [
  { id: 'L001', name: 'Rahul Sharma',  phone: '+91 98765 43299', city: 'Delhi',     speciality: 'Cardiology',       budget: 'High',   stage: 'New',                   time: '2m ago',  assigned: 'Unassigned',  priority: 'High',   source: 'Website',    sla: '22h' },
  { id: 'L002', name: 'Priya Nair',    phone: '+91 87654 32100', city: 'Mumbai',    speciality: 'Dermatology',      budget: 'Medium', stage: 'Contacted',             time: '15m ago', assigned: 'Rahul C.',    priority: 'Medium', source: 'Google Ads', sla: '6h' },
  { id: 'L003', name: 'Arjun Patel',   phone: '+91 76543 21009', city: 'Pune',      speciality: 'Orthopedic',       budget: 'Medium', stage: 'Doctor Options Sent',   time: '1h ago',  assigned: 'Priya C.',    priority: 'Low',    source: 'Referral',   sla: '18h' },
  { id: 'L004', name: 'Kavya Reddy',   phone: '+91 65432 10098', city: 'Bengaluru', speciality: 'Gynecology',       budget: 'High',   stage: 'New',                   time: '2h ago',  assigned: 'Unassigned',  priority: 'High',   source: 'Website',    sla: '20h' },
  { id: 'L005', name: 'Mohan Verma',   phone: '+91 54321 00987', city: 'Hyderabad', speciality: 'Neurology',        budget: 'High',   stage: 'Qualified',             time: '3h ago',  assigned: 'Sanjay C.',   priority: 'High',   source: 'WhatsApp',   sla: '4h' },
  { id: 'L006', name: 'Sunita Joshi',  phone: '+91 43210 09876', city: 'Jaipur',    speciality: 'Gastroenterology', budget: 'Low',    stage: 'Contact Attempted',     time: '5h ago',  assigned: 'Unassigned',  priority: 'Medium', source: 'Website',    sla: '14h' },
  { id: 'L007', name: 'Deepak Singh',  phone: '+91 32100 98765', city: 'Chennai',   speciality: 'ENT',              budget: 'Low',    stage: 'Converted',             time: '1d ago',  assigned: 'Priya C.',    priority: 'Low',    source: 'Referral',   sla: '—' },
  { id: 'L008', name: 'Anita Mehta',   phone: '+91 21009 87654', city: 'Delhi',     speciality: 'Urology',          budget: 'Medium', stage: 'Appointment Confirmed', time: '1d ago',  assigned: 'Rahul C.',    priority: 'Medium', source: 'Google Ads', sla: '—' },
];

const budgetBadge = (b: string) => ({
  'High':   'bg-violet-500/10 text-violet-400',
  'Medium': 'bg-sky-500/10 text-sky-400',
  'Low':    'bg-slate-500/10 text-slate-400',
}[b] || '');

const priorityColor: Record<string, string> = {
  'High':   'text-red-400',
  'Medium': 'text-amber-400',
  'Low':    'text-slate-400',
};

const LEAD_ACTIONS = [
  { label: 'View Lead',               icon: Eye,          divider: false, danger: false },
  { label: 'Assign Consultant',       icon: UserCheck,    divider: false, danger: false },
  { label: 'Change Stage',            icon: Flag,         divider: false, danger: false },
  { label: 'Add Note',                icon: FileText,     divider: false, danger: false },
  { label: 'Suggest Doctors',         icon: Stethoscope,  divider: false, danger: false },
  { label: 'Send Options to Patient', icon: Send,         divider: false, danger: false },
  { label: 'Schedule Follow-up',      icon: Calendar,     divider: false, danger: false },
  { label: 'Call Patient',            icon: PhoneCall,    divider: false, danger: false },
  { label: 'Send WhatsApp',           icon: MessageSquare,divider: false, danger: false },
  { label: 'Create Appointment',      icon: Calendar,     divider: true,  danger: false },
  { label: 'Mark Converted',          icon: CheckCircle2, divider: false, danger: false },
  { label: 'Mark Lost',               icon: XCircle,      divider: false, danger: true  },
  { label: 'Mark Spam',               icon: AlertCircle,  divider: false, danger: true  },
  { label: 'Archive',                 icon: Archive,      divider: false, danger: true  },
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
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', minWidth: 220 }}
          >
            {LEAD_ACTIONS.map((action, i) => {
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

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const filtered = LEADS.filter(l =>
    (l.name.toLowerCase().includes(search.toLowerCase()) ||
     l.speciality.toLowerCase().includes(search.toLowerCase()) ||
     l.city.toLowerCase().includes(search.toLowerCase())) &&
    (stageFilter ? l.stage === stageFilter : true)
  );

  const stageCounts = Object.fromEntries(
    PIPELINE_STAGES.map(s => [s, LEADS.filter(l => l.stage === s).length])
  );
  const unassigned = LEADS.filter(l => l.assigned === 'Unassigned').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Consultation Leads</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>All patient intake requests · 12-stage pipeline</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: ClipboardList, label: 'Total Leads',     value: LEADS.length,   color: 'bg-indigo-500' },
              { icon: AlertCircle,   label: 'Unassigned',      value: unassigned,     color: 'bg-rose-500' },
              { icon: Clock,         label: 'Active / In Work', value: LEADS.filter(l => !['Converted','Lost','Spam'].includes(l.stage)).length, color: 'bg-amber-500' },
              { icon: CheckCircle2,  label: 'Converted',       value: stageCounts['Converted'] ?? 0, color: 'bg-emerald-500' },
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

          {/* Pipeline stage pills */}
          <div className="panel-card p-4 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>Filter by Stage</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStageFilter('')}
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                style={!stageFilter
                  ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                  : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                All ({LEADS.length})
              </button>
              {PIPELINE_STAGES.map(s => (
                <button key={s} onClick={() => setStageFilter(s === stageFilter ? '' : s)}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                  style={stageFilter === s
                    ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                    : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {s} {stageCounts[s] ? `(${stageCounts[s]})` : '(0)'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="panel-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search leads…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} leads</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['ID', 'Patient', 'Contact', 'City', 'Speciality', 'Budget', 'Priority', 'Assigned', 'Stage', 'Source', 'SLA', 'Time', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l, i) => (
                    <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>{l.id}</td>
                      <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{l.name}</td>
                      <td className="px-4 py-3.5"><span className="flex items-center gap-1" style={{ color: '#94A3B8' }}><Phone className="w-3 h-3" />{l.phone}</span></td>
                      <td className="px-4 py-3.5"><span className="flex items-center gap-1" style={{ color: '#94A3B8' }}><MapPin className="w-3 h-3" />{l.city}</span></td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#94A3B8' }}>{l.speciality}</td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${budgetBadge(l.budget)}`}>{l.budget}</span></td>
                      <td className="px-4 py-3.5 font-bold text-[10px]">
                        <span className={priorityColor[l.priority]}>{l.priority}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-semibold ${l.assigned === 'Unassigned' ? 'text-rose-400' : ''}`}
                          style={{ color: l.assigned === 'Unassigned' ? undefined : 'var(--text-secondary)' }}>
                          {l.assigned}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${stageColor[l.stage] ?? ''}`}>{l.stage}</span>
                      </td>
                      <td className="px-4 py-3.5" style={{ color: '#64748B' }}>{l.source}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold ${l.sla === '—' ? '' : parseInt(l.sla) <= 4 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {l.sla}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#64748B' }}>{l.time}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: '#25B89A' }}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <ThreeDotMenu />
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
