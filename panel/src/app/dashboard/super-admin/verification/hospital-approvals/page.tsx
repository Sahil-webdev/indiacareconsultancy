'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, CheckCircle2, XCircle, Clock,
  AlertCircle, FileText, MessageSquare, MoreVertical,
  MapPin, Phone, Calendar, BadgeCheck,
} from 'lucide-react';

const PENDING_HOSPITALS = [
  { id: 'H101', name: 'Manipal Hospital', city: 'Mangaluru', type: 'Multi-Specialty', beds: 350, phone: '+91 824 422 4242', submitted: 'Jun 20, 2026', docs: ['Registration Cert', 'Accreditation', 'NABH'], tier: 'Gold' },
  { id: 'H102', name: 'Sunrise Hospital',  city: 'Nagpur',    type: 'General',        beds: 120, phone: '+91 712 233 1001', submitted: 'Jun 19, 2026', docs: ['Registration Cert', 'Fire NOC'],            tier: 'Silver' },
  { id: 'H103', name: 'Care Hospital',     city: 'Bhubaneswar',type: 'Multi-Specialty',beds: 280, phone: '+91 674 233 4567', submitted: 'Jun 18, 2026', docs: ['Registration Cert', 'NABH', 'Accreditation'],tier: 'Platinum' },
];

const HOSP_ACTIONS = [
  { label: 'View Profile',        icon: Building2,    danger: false },
  { label: 'View Documents',      icon: FileText,     danger: false },
  { label: 'Approve',            icon: CheckCircle2, danger: false },
  { label: 'Request Changes',    icon: MessageSquare,danger: false },
  { label: 'Reject',             icon: XCircle,      danger: true  },
];

function ActionMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8" style={{ color: '#64748B' }}>
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 4 }} transition={{ duration: 0.13 }}
            className="absolute right-0 top-full mt-1 z-50 rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', minWidth: 200 }}>
            {HOSP_ACTIONS.map((a, i) => {
              const Icon = a.icon;
              return (
                <button key={i} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left hover:bg-white/5"
                  style={{ color: a.danger ? '#f87171' : 'var(--text-secondary)' }} onClick={() => setOpen(false)}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {a.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const tierBadge = (t: string) => ({ 'Platinum': 'bg-sky-400/15 text-sky-400 border-sky-400/20', 'Gold': 'bg-amber-400/15 text-amber-400 border-amber-400/20', 'Silver': 'bg-slate-400/15 text-slate-400 border-slate-400/20' }[t] || '');

export default function HospitalApprovalsPage() {
  const [search, setSearch] = useState('');
  const filtered = PENDING_HOSPITALS.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Hospital Approvals</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Review and verify new hospital partnership applications</p>
          </div>
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">{PENDING_HOSPITALS.length} Pending</span>
        </header>
        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Clock,        label: 'Awaiting Review',    value: 3, color: 'bg-violet-500' },
              { icon: CheckCircle2, label: 'Approved This Week', value: 2, color: 'bg-emerald-500' },
              { icon: XCircle,      label: 'Rejected',           value: 0, color: 'bg-red-500' },
              { icon: AlertCircle,  label: 'Changes Requested',  value: 1, color: 'bg-orange-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="panel-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}><s.icon className="w-4 h-4 text-white" /></div>
                <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
              </motion.div>
            ))}
          </div>
          <div className="panel-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search hospitals…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} pending</span>
            </div>
            <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.map((h, i) => (
                <motion.div key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/15 text-violet-400 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{h.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>{h.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${tierBadge(h.tier)}`}>{h.tier} Plan</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{h.type} · {h.beds} Beds</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><MapPin className="w-3 h-3" />{h.city}</span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><Phone className="w-3 h-3" />{h.phone}</span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><Calendar className="w-3 h-3" />Submitted {h.submitted}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {h.docs.map((doc, j) => (
                        <span key={j} className="text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                          style={{ background: 'rgba(37,184,154,0.08)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.15)' }}>
                          <FileText className="w-2.5 h-2.5" />{doc}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </button>
                    <button className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <MessageSquare className="w-3 h-3" /> Changes
                    </button>
                    <ActionMenu />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
  );
}
