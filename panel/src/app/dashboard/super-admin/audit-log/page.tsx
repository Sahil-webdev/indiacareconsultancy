'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText, Search, Filter, Download,
  Users, Stethoscope, Building2, Calendar,
  DollarSign, ClipboardList, UserCheck, Shield,
  CheckCircle2, XCircle, Edit2, Eye, Trash2,
  Monitor, Smartphone, ChevronDown,
} from 'lucide-react';

const AUDIT_LOGS = [
  {
    id: 'AL001', admin: 'Vikram Singh',     role: 'Super Admin',   action: 'Status Changed',   entity: 'Doctor',       entityId: 'DR103',   prev: 'Under Review', next: 'Approved',
    time: 'Jun 21, 2026 · 4:32 PM', ip: '103.21.44.5', device: 'Chrome / macOS', reason: 'All documents verified', success: true, icon: UserCheck, color: 'text-emerald-400 bg-emerald-400/10',
  },
  {
    id: 'AL002', admin: 'Rahul Consultant', role: 'Consultant',     action: 'Lead Assigned',    entity: 'Lead',         entityId: 'L006',    prev: 'Unassigned',   next: 'Rahul C.',
    time: 'Jun 21, 2026 · 4:15 PM', ip: '182.64.10.2', device: 'Chrome / Windows', reason: '', success: true, icon: ClipboardList, color: 'text-indigo-400 bg-indigo-400/10',
  },
  {
    id: 'AL003', admin: 'Vikram Singh',     role: 'Super Admin',   action: 'Refund Initiated', entity: 'Payment',      entityId: 'PAY004',  prev: 'Success',      next: 'Refunded',
    time: 'Jun 21, 2026 · 3:58 PM', ip: '103.21.44.5', device: 'Chrome / macOS', reason: 'Customer request — service not rendered', success: true, icon: DollarSign, color: 'text-red-400 bg-red-400/10',
  },
  {
    id: 'AL004', admin: 'Priya Manager',    role: 'Verification Mgr', action: 'Profile Change Rejected', entity: 'Doctor', entityId: 'DR107', prev: 'Cardiologist', next: 'Rejected',
    time: 'Jun 21, 2026 · 3:22 PM', ip: '49.36.120.5', device: 'Safari / iOS', reason: 'Insufficient supporting documents for speciality change', success: true, icon: XCircle, color: 'text-amber-400 bg-amber-400/10',
  },
  {
    id: 'AL005', admin: 'Vikram Singh',     role: 'Super Admin',   action: 'Sensitive Doc Viewed', entity: 'Patient',   entityId: 'P003',    prev: '—',            next: 'Medical Report',
    time: 'Jun 21, 2026 · 2:48 PM', ip: '103.21.44.5', device: 'Chrome / macOS', reason: 'Dispute investigation #DIS-004', success: true, icon: Eye, color: 'text-violet-400 bg-violet-400/10',
  },
  {
    id: 'AL006', admin: 'Sanjay Consultant',role: 'Consultant',    action: 'Stage Updated',    entity: 'Lead',         entityId: 'L005',    prev: 'Contacted',    next: 'Qualified',
    time: 'Jun 21, 2026 · 1:30 PM', ip: '157.33.45.8', device: 'Firefox / Ubuntu', reason: '', success: true, icon: Edit2, color: 'text-sky-400 bg-sky-400/10',
  },
  {
    id: 'AL007', admin: 'Vikram Singh',     role: 'Super Admin',   action: 'Hospital Suspended', entity: 'Hospital',   entityId: 'H007',    prev: 'Active',       next: 'Suspended',
    time: 'Jun 21, 2026 · 11:15 AM', ip: '103.21.44.5', device: 'Chrome / macOS', reason: 'Accreditation expired; pending renewal', success: true, icon: Building2, color: 'text-rose-400 bg-rose-400/10',
  },
  {
    id: 'AL008', admin: 'Vikram Singh',     role: 'Super Admin',   action: 'Login Attempt',    entity: 'Admin Panel',  entityId: 'SYS',     prev: '—',            next: 'Blocked',
    time: 'Jun 21, 2026 · 9:04 AM', ip: '196.52.38.20', device: 'Unknown Browser', reason: 'Multiple failed attempts from unrecognized IP', success: false, icon: Shield, color: 'text-red-400 bg-red-400/10',
  },
];

const ENTITY_FILTERS = ['All', 'Doctor', 'Hospital', 'Patient', 'Lead', 'Payment', 'Admin Panel'];
const ROLE_FILTERS = ['All Roles', 'Super Admin', 'Consultant', 'Verification Mgr', 'Finance Mgr'];

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = AUDIT_LOGS.filter(l =>
    (l.admin.toLowerCase().includes(search.toLowerCase()) ||
     l.action.toLowerCase().includes(search.toLowerCase()) ||
     l.entityId.toLowerCase().includes(search.toLowerCase())) &&
    (entityFilter === 'All' || l.entity === entityFilter)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Audit Logs</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Permanent record of all admin and system actions</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
            style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)', border: '1px solid rgba(37,184,154,0.2)' }}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Actions Today',    value: AUDIT_LOGS.length, color: 'bg-indigo-500',  icon: ScrollText },
              { label: 'Admin Actions',          value: AUDIT_LOGS.filter(l => l.role === 'Super Admin').length, color: 'bg-amber-500', icon: Shield },
              { label: 'Sensitive Doc Views',    value: AUDIT_LOGS.filter(l => l.action.includes('Sensitive')).length, color: 'bg-violet-500', icon: Eye },
              { label: 'Failed / Blocked',       value: AUDIT_LOGS.filter(l => !l.success).length, color: 'bg-red-500', icon: XCircle },
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

          {/* Important notice */}
          <div className="panel-card p-4 mb-4 flex items-start gap-3" style={{ borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.05)' }}>
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-amber-400">Audit Log is read-only</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                All entries are immutable and cannot be deleted or edited. Every admin action, login, profile change, sensitive document access and system event is permanently recorded here.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="panel-card p-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search by admin, action, entity ID…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ENTITY_FILTERS.map(f => (
                  <button key={f} onClick={() => setEntityFilter(f)}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                    style={entityFilter === f
                      ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                      : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {f}
                  </button>
                ))}
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} entries</span>
            </div>
          </div>

          {/* Audit log entries */}
          <div className="flex flex-col gap-2">
            {filtered.map((log, i) => {
              const Icon = log.icon;
              const expanded = expandedId === log.id;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="panel-card overflow-hidden"
                  style={{ borderColor: log.success ? 'var(--border-color)' : 'rgba(239,68,68,0.2)' }}
                >
                  {/* Main row */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : log.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${log.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-black" style={{ color: 'var(--text-primary)' }}>{log.admin}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>{log.role}</span>
                        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{log.action}</span>
                        <span className="text-[10px] font-bold" style={{ color: '#25B89A' }}>{log.entity}</span>
                        <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{log.entityId}</span>
                      </div>
                      {log.prev !== '—' && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded border" style={{ color: '#94A3B8', borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                            {log.prev}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>→</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border" style={{ color: '#25B89A', borderColor: 'rgba(37,184,154,0.2)', background: 'rgba(37,184,154,0.08)' }}>
                            {log.next}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${log.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {log.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                      <span className="text-[10px] whitespace-nowrap" style={{ color: '#64748B' }}>{log.time}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {expanded && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#2D4150' }}>IP Address</p>
                          <p className="text-[11px] font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{log.ip}</p>
                        </div>
                        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#2D4150' }}>Device</p>
                          <p className="text-[11px] font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                            {log.device.includes('iOS') || log.device.includes('Android')
                              ? <Smartphone className="w-3 h-3" />
                              : <Monitor className="w-3 h-3" />}
                            {log.device}
                          </p>
                        </div>
                        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#2D4150' }}>Request ID</p>
                          <p className="text-[11px] font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{log.id}</p>
                        </div>
                        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#2D4150' }}>Reason / Note</p>
                          <p className="text-[11px] font-semibold" style={{ color: log.reason ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {log.reason || '(No reason provided)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="panel-card p-12 text-center">
                <ScrollText className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>No audit log entries found</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </main>
      </div>
  );
}
