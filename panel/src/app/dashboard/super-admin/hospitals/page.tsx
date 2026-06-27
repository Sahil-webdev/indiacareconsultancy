'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, Eye, Edit2, Plus,
  MapPin, Stethoscope, CheckCircle2, Star,
  MoreVertical, UserCheck, AlertCircle, Archive,
  FileWarning, MessageSquare, Download, UserX, FileText,
  RefreshCw, Clock, Flag,
} from 'lucide-react';

const HOSPITALS = [
  { id: 'H001', name: 'Apollo Hospitals',    city: 'Delhi',     type: 'Multi-Specialty', doctors: 42, rating: 4.8, status: 'Active',  tier: 'Platinum', phone: '+91 11 2692 5858', pendingChanges: 0 },
  { id: 'H002', name: 'Fortis Healthcare',   city: 'Mumbai',    type: 'Multi-Specialty', doctors: 38, rating: 4.7, status: 'Active',  tier: 'Gold',     phone: '+91 22 6600 7676', pendingChanges: 1 },
  { id: 'H003', name: 'KIMS Hospital',       city: 'Hyderabad', type: 'Multi-Specialty', doctors: 30, rating: 4.6, status: 'Active',  tier: 'Gold',     phone: '+91 40 4488 5000', pendingChanges: 0 },
  { id: 'H004', name: 'Narayana Health',     city: 'Bengaluru', type: 'Cardiac Care',    doctors: 25, rating: 4.9, status: 'Active',  tier: 'Platinum', phone: '+91 80 7122 2222', pendingChanges: 0 },
  { id: 'H005', name: 'Medanta',             city: 'Gurugram',  type: 'Multi-Specialty', doctors: 48, rating: 4.8, status: 'Active',  tier: 'Platinum', phone: '+91 124 441 4141', pendingChanges: 2 },
  { id: 'H006', name: 'Max Super Specialty', city: 'Delhi',     type: 'Multi-Specialty', doctors: 35, rating: 4.7, status: 'Active',  tier: 'Gold',     phone: '+91 11 2651 5050', pendingChanges: 0 },
  { id: 'H007', name: 'Kokilaben Hospital',  city: 'Mumbai',    type: 'Multi-Specialty', doctors: 28, rating: 4.8, status: 'Pending', tier: 'Silver',   phone: '+91 22 3061 5000', pendingChanges: 1 },
  { id: 'H008', name: 'Rainbow Children',    city: 'Hyderabad', type: 'Pediatrics',      doctors: 18, rating: 4.9, status: 'Active',  tier: 'Gold',     phone: '+91 40 4489 5555', pendingChanges: 0 },
];

const tierBadge = (t: string) => ({
  'Platinum': 'bg-sky-400/15 text-sky-400 border border-sky-400/20',
  'Gold':     'bg-amber-400/15 text-amber-400 border border-amber-400/20',
  'Silver':   'bg-slate-400/15 text-slate-400 border border-slate-400/20',
}[t] || '');

const statusBadge = (s: string) => s === 'Active'
  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
  : 'bg-amber-500/15 text-amber-400 border border-amber-500/20';

const HOSPITAL_ACTIONS = [
  { label: 'View Hospital',          icon: Eye,          divider: false, danger: false },
  { label: 'Preview Public Profile', icon: Building2,    divider: false, danger: false },
  { label: 'Approve',                icon: CheckCircle2, divider: false, danger: false },
  { label: 'Reject',                 icon: AlertCircle,  divider: false, danger: false },
  { label: 'Request Changes',        icon: MessageSquare,divider: false, danger: false },
  { label: 'Manage Branches',        icon: Flag,         divider: false, danger: false },
  { label: 'Manage Doctors',         icon: Stethoscope,  divider: false, danger: false },
  { label: 'View Documents',         icon: FileText,     divider: false, danger: false },
  { label: 'Manage Subscription',    icon: RefreshCw,    divider: false, danger: false },
  { label: 'View Change History',    icon: Clock,        divider: false, danger: false },
  { label: 'Export',                 icon: Download,     divider: true,  danger: false },
  { label: 'Pause Listing',          icon: AlertCircle,  divider: false, danger: true  },
  { label: 'Suspend Hospital',       icon: UserX,        divider: false, danger: true  },
  { label: 'Archive',                icon: Archive,      divider: false, danger: true  },
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
            {HOSPITAL_ACTIONS.map((action, i) => {
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

export default function HospitalsPage() {
  const [search, setSearch] = useState('');
  const filtered = HOSPITALS.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase()) ||
    h.type.toLowerCase().includes(search.toLowerCase())
  );

  const pendingChangeTotal = HOSPITALS.reduce((s, h) => s + h.pendingChanges, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Hospitals</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Partner hospitals and clinics in the ICC network</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
            <Plus className="w-3.5 h-3.5" /> Add Hospital
          </button>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Operational stats */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
            {[
              { icon: Building2,   label: 'Total Hospitals',         value: '34',              color: 'bg-violet-500' },
              { icon: Clock,       label: 'Pending Verification',    value: '2',               color: 'bg-amber-500' },
              { icon: CheckCircle2,label: 'Active Partners',         value: '31',              color: 'bg-emerald-500' },
              { icon: FileWarning, label: 'Expiring Documents',      value: '4',               color: 'bg-orange-500' },
              { icon: AlertCircle, label: 'Incomplete Profiles',     value: '6',               color: 'bg-slate-500' },
              { icon: RefreshCw,   label: 'Pending Change Requests', value: String(pendingChangeTotal), color: 'bg-sky-500' },
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

          <div className="panel-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search hospitals…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} hospitals</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['ID', 'Hospital', 'City', 'Type', 'Doctors', 'Rating', 'Partnership Plan', 'Pending Changes', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h, i) => (
                    <motion.tr key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>{h.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{h.name}</p>
                            <p style={{ color: '#64748B' }}>{h.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><span className="flex items-center gap-1" style={{ color: '#94A3B8' }}><MapPin className="w-3 h-3" />{h.city}</span></td>
                      <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{h.type}</td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>{h.doctors}</td>
                      <td className="px-4 py-3.5"><span className="flex items-center gap-1 text-amber-400 font-bold"><Star className="w-3 h-3 fill-amber-400" />{h.rating}</span></td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tierBadge(h.tier)}`}>{h.tier}</span></td>
                      <td className="px-4 py-3.5 text-center">
                        {h.pendingChanges > 0
                          ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/20">{h.pendingChanges}</span>
                          : <span style={{ color: '#64748B' }}>—</span>
                        }
                      </td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(h.status)}`}>{h.status}</span></td>
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
