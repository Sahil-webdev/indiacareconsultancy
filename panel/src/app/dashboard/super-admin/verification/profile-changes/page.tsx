'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompare, Search, CheckCircle2, XCircle, Clock,
  Stethoscope, Building2, ChevronRight, AlertCircle,
} from 'lucide-react';

type ChangeStatus = 'Pending' | 'Approved' | 'Rejected';

interface ProfileChange {
  id: string;
  entityType: 'Doctor' | 'Hospital';
  entityName: string;
  entityId: string;
  field: string;
  oldValue: string;
  newValue: string;
  requestedAt: string;
  status: ChangeStatus;
}

const INITIAL_CHANGES: ProfileChange[] = [
  { id: 'PC001', entityType: 'Doctor', entityName: 'Dr. Aryan Kapoor', entityId: 'DR201', field: 'Consultation Fee', oldValue: '₹600', newValue: '₹800', requestedAt: '2 hrs ago', status: 'Pending' },
  { id: 'PC002', entityType: 'Doctor', entityName: 'Dr. Sheetal Patel', entityId: 'DR202', field: 'Clinic Address', oldValue: '45, Indiranagar, Bengaluru', newValue: '12, Koramangala 4th Block, Bengaluru – 560034', requestedAt: '4 hrs ago', status: 'Pending' },
  { id: 'PC003', entityType: 'Hospital', entityName: 'Apollo Spectra Delhi', entityId: 'HSP101', field: 'OPD Timings', oldValue: '9:00 AM – 6:00 PM', newValue: '8:00 AM – 8:00 PM', requestedAt: '6 hrs ago', status: 'Pending' },
  { id: 'PC004', entityType: 'Doctor', entityName: 'Dr. Manish Kumar', entityId: 'DR203', field: 'Speciality', oldValue: 'Neurology', newValue: 'Neurology & Psychiatry', requestedAt: '1 day ago', status: 'Pending' },
  { id: 'PC005', entityType: 'Hospital', entityName: 'Narayana Pune', entityId: 'HSP102', field: 'Emergency Contact', oldValue: '+91 98200 12345', newValue: '+91 98200 99999', requestedAt: '1 day ago', status: 'Pending' },
  { id: 'PC006', entityType: 'Doctor', entityName: 'Dr. Ritu Singh', entityId: 'DR204', field: 'Availability', oldValue: 'Mon, Wed, Sat', newValue: 'Mon, Tue, Wed, Fri, Sat', requestedAt: '2 days ago', status: 'Approved' },
  { id: 'PC007', entityType: 'Doctor', entityName: 'Dr. Amit Joshi', entityId: 'DR205', field: 'Bio', oldValue: 'Experienced orthopedic surgeon.', newValue: 'Senior orthopedic surgeon with 11 years of expertise in joint replacement, sports injury, and spine surgeries. Trained at AIIMS New Delhi.', requestedAt: '2 days ago', status: 'Rejected' },
];

const STATUS_STYLES: Record<ChangeStatus, string> = {
  Pending: 'text-amber-400 bg-amber-500/12 border-amber-500/20',
  Approved: 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20',
  Rejected: 'text-red-400 bg-red-500/12 border-red-500/20',
};

export default function ProfileChangesPage() {
  const [changes, setChanges] = useState<ProfileChange[]>(INITIAL_CHANGES);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ChangeStatus | 'All'>('All');

  const filtered = changes.filter(c => {
    const matchSearch = c.entityName.toLowerCase().includes(search.toLowerCase()) ||
      c.field.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: ChangeStatus) =>
    setChanges(prev => prev.map(c => c.id === id ? { ...c, status } : c));

  const pendingCount = changes.filter(c => c.status === 'Pending').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Profile Change Requests</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Approve or reject profile edits before they go live on the website</p>
        </div>
        <span className="text-xs font-black px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
          {pendingCount} Pending Review
        </span>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending', value: changes.filter(c => c.status === 'Pending').length, icon: Clock, color: 'bg-amber-500' },
            { label: 'Approved', value: changes.filter(c => c.status === 'Approved').length, icon: CheckCircle2, color: 'bg-emerald-500' },
            { label: 'Rejected', value: changes.filter(c => c.status === 'Rejected').length, icon: XCircle, color: 'bg-red-500' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}><s.icon className="w-4 h-4 text-white" /></div>
              <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
            </motion.div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl mb-5" style={{ background: 'rgba(37,184,154,0.06)', border: '1px solid rgba(37,184,154,0.15)' }}>
          <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            Changes from doctors and hospitals will <strong style={{ color: '#25B89A' }}>only go live on the website after super admin approval</strong>. Rejected changes are permanently discarded and the profile stays unchanged.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or field…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
          </div>
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all"
              style={{
                background: filterStatus === s ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)',
                color: filterStatus === s ? '#25B89A' : '#64748B',
                borderColor: filterStatus === s ? 'rgba(37,184,154,0.3)' : 'rgba(255,255,255,0.08)',
              }}>
              {s}
            </button>
          ))}
        </div>

        {/* Change Requests List */}
        <div className="panel-card overflow-hidden">
          <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {filtered.map((change, i) => (
              <motion.div key={change.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className={`p-4 hover:bg-white/[0.02] transition-colors ${change.status !== 'Pending' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Entity icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${change.entityType === 'Doctor' ? 'bg-emerald-500/15' : 'bg-violet-500/15'}`}>
                      {change.entityType === 'Doctor'
                        ? <Stethoscope className="w-4 h-4 text-emerald-400" />
                        : <Building2 className="w-4 h-4 text-violet-400" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{change.entityName}</span>
                        <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>{change.entityId}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${change.entityType === 'Doctor' ? 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20' : 'text-violet-400 bg-violet-500/12 border-violet-500/20'}`}>
                          {change.entityType}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ml-auto ${STATUS_STYLES[change.status]}`}>
                          {change.status}
                        </span>
                      </div>

                      {/* Field being changed */}
                      <p className="text-[10px] font-bold mt-1.5 mb-2" style={{ color: '#64748B' }}>Field: <span style={{ color: 'var(--text-primary)' }}>{change.field}</span></p>

                      {/* Old vs New value comparison */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl p-2.5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                          <p className="text-[9px] font-bold mb-1 text-red-400">CURRENT (live on website)</p>
                          <p className="text-[11px]" style={{ color: '#94A3B8' }}>{change.oldValue}</p>
                        </div>
                        <div className="rounded-xl p-2.5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                          <p className="text-[9px] font-bold mb-1 text-emerald-400">REQUESTED CHANGE</p>
                          <p className="text-[11px]" style={{ color: '#94A3B8' }}>{change.newValue}</p>
                        </div>
                      </div>

                      <p className="text-[10px] mt-2" style={{ color: '#475569' }}>Requested {change.requestedAt}</p>
                    </div>
                  </div>

                  {/* Action buttons — only for pending */}
                  {change.status === 'Pending' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => updateStatus(change.id, 'Approved')}
                        className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => updateStatus(change.id, 'Rejected')}
                        className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                        style={{ background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.18)' }}>
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
