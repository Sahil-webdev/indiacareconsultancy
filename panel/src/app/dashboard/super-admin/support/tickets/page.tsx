'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket, Search, MessageSquare, Clock, CheckCircle2,
  AlertCircle, Eye, User, Stethoscope, Building2, MoreVertical,
} from 'lucide-react';

const TICKETS = [
  { id: 'TKT001', user: 'Dr. Ramesh Kumar',  type: 'Doctor',   category: 'Profile Visibility', priority: 'High',   status: 'Open',        created: '2h ago',  lastReply: '30m ago', assignedTo: 'Rahul C.' },
  { id: 'TKT002', user: 'Rahul Sharma',       type: 'Patient',  category: 'Appointment Issue',  priority: 'High',   status: 'Open',        created: '4h ago',  lastReply: '1h ago',  assignedTo: 'Priya C.' },
  { id: 'TKT003', user: 'Fortis Healthcare',  type: 'Hospital', category: 'Billing',            priority: 'Medium', status: 'In Progress', created: '6h ago',  lastReply: '2h ago',  assignedTo: 'Sanjay C.' },
  { id: 'TKT004', user: 'Dr. Priya Patel',   type: 'Doctor',   category: 'Technical Issue',    priority: 'Low',    status: 'In Progress', created: '1d ago',  lastReply: '3h ago',  assignedTo: 'Rahul C.' },
  { id: 'TKT005', user: 'Priya Nair',         type: 'Patient',  category: 'Doctor Match',       priority: 'Medium', status: 'Resolved',    created: '2d ago',  lastReply: '1d ago',  assignedTo: 'Priya C.' },
];

const statusBadge = (s: string) => ({ 'Open': 'bg-red-500/15 text-red-400 border border-red-500/20', 'In Progress': 'bg-amber-500/15 text-amber-400 border border-amber-500/20', 'Resolved': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' }[s] || '');
const priorityColor = (p: string) => ({ 'High': 'text-red-400', 'Medium': 'text-amber-400', 'Low': 'text-slate-400' }[p] || '');
const typeIcon = (t: string) => t === 'Doctor' ? Stethoscope : t === 'Hospital' ? Building2 : User;

export default function SupportTicketsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const filtered = TICKETS.filter(t =>
    (t.user.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || t.status === statusFilter)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Support Tickets</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>All user support requests and queries</p>
          </div>
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
            {TICKETS.filter(t => t.status === 'Open').length} Open
          </span>
        </header>
        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: AlertCircle,  label: 'Open',        value: TICKETS.filter(t => t.status === 'Open').length,        color: 'bg-red-500' },
              { icon: Clock,        label: 'In Progress', value: TICKETS.filter(t => t.status === 'In Progress').length,  color: 'bg-amber-500' },
              { icon: CheckCircle2, label: 'Resolved',    value: TICKETS.filter(t => t.status === 'Resolved').length,    color: 'bg-emerald-500' },
              { icon: Ticket,       label: 'Total',       value: TICKETS.length,                                          color: 'bg-indigo-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="panel-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}><s.icon className="w-4 h-4 text-white" /></div>
                <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
              </motion.div>
            ))}
          </div>

          <div className="panel-card overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex gap-1.5">
                {['All', 'Open', 'In Progress', 'Resolved'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                    style={statusFilter === s
                      ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                      : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['ID', 'User', 'Type', 'Category', 'Priority', 'Status', 'Created', 'Last Reply', 'Assigned', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const TypeIcon = typeIcon(t.type);
                    return (
                      <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>{t.id}</td>
                        <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{t.user}</td>
                        <td className="px-4 py-3.5"><span className="flex items-center gap-1 text-[10px]" style={{ color: '#94A3B8' }}><TypeIcon className="w-3 h-3" />{t.type}</span></td>
                        <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#94A3B8' }}>{t.category}</td>
                        <td className="px-4 py-3.5 font-bold text-[10px]"><span className={priorityColor(t.priority)}>{t.priority}</span></td>
                        <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(t.status)}`}>{t.status}</span></td>
                        <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#64748B' }}>{t.created}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#64748B' }}>{t.lastReply}</td>
                        <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{t.assignedTo}</td>
                        <td className="px-4 py-3.5">
                          <button className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                            style={{ background: 'rgba(37,184,154,0.1)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
                            <Eye className="w-3 h-3" /> View
                          </button>
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
