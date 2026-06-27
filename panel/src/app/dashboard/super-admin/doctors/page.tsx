'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Search, Filter, Eye, Edit2, CheckCircle2,
  Plus, Star, DollarSign, MapPin, Zap, MoreVertical,
  UserCheck, Badge, FileWarning, UserX, Archive,
  MessageSquare, Lock, FileText, Download, Building2,
  AlertCircle, Clock,
} from 'lucide-react';

const DOCTORS = [
  { id: 'DR101', name: 'Dr. Ramesh Kumar',   speciality: 'Cardiology',  hospital: 'Apollo Delhi',       fee: 1500, rating: 4.9, exp: 18, plan: 'Elite',   status: 'Approved',          city: 'Delhi',     phone: '+91 98100 11111' },
  { id: 'DR102', name: 'Dr. Priya Patel',    speciality: 'Dermatology', hospital: 'Fortis Mumbai',      fee: 1200, rating: 4.7, exp: 12, plan: 'Premium', status: 'Approved',          city: 'Mumbai',    phone: '+91 98100 22222' },
  { id: 'DR103', name: 'Dr. Sanjay Gupta',   speciality: 'Dentist',     hospital: 'Max Dental Clinic',  fee: 500,  rating: 4.5, exp: 8,  plan: 'Basic',   status: 'Under Review',      city: 'Delhi',     phone: '+91 98100 33333' },
  { id: 'DR104', name: 'Dr. Vikranth Reddy', speciality: 'ENT',         hospital: 'KIMS Hyderabad',     fee: 800,  rating: 4.6, exp: 10, plan: 'Basic',   status: 'Approved',          city: 'Hyderabad', phone: '+91 98100 44444' },
  { id: 'DR105', name: 'Dr. Anjali Menon',   speciality: 'Gynecology',  hospital: 'Kokilaben Mumbai',   fee: 1100, rating: 4.8, exp: 15, plan: 'Premium', status: 'Approved',          city: 'Mumbai',    phone: '+91 98100 55555' },
  { id: 'DR106', name: 'Dr. Kiran Sharma',   speciality: 'Neurology',   hospital: 'Medanta Gurugram',   fee: 1800, rating: 4.9, exp: 22, plan: 'Elite',   status: 'Approved',          city: 'Gurugram',  phone: '+91 98100 66666' },
  { id: 'DR107', name: 'Dr. Suresh Babu',    speciality: 'Orthopedic',  hospital: 'Narayana Bengaluru', fee: 1300, rating: 4.7, exp: 14, plan: 'Premium', status: 'Changes Requested', city: 'Bengaluru', phone: '+91 98100 77777' },
  { id: 'DR108', name: 'Dr. Nidhi Verma',    speciality: 'Pediatrics',  hospital: 'Rainbow Children',   fee: 700,  rating: 4.8, exp: 9,  plan: 'Basic',   status: 'Document Expired',  city: 'Hyderabad', phone: '+91 98100 88888' },
];

const planBadge = (p: string) => ({
  'Elite':   'bg-amber-400/15 text-amber-400 border border-amber-400/20',
  'Premium': 'bg-violet-400/15 text-violet-400 border border-violet-400/20',
  'Basic':   'bg-slate-400/15 text-slate-400 border border-slate-400/20',
}[p] || '');

const statusInfo: Record<string, { badge: string; dot: string }> = {
  'Approved':          { badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', dot: '#22c55e' },
  'Under Review':      { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',       dot: '#f59e0b' },
  'Changes Requested': { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',    dot: '#f97316' },
  'Document Expired':  { badge: 'bg-red-500/15 text-red-400 border border-red-500/20',             dot: '#ef4444' },
  'Pending':           { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',       dot: '#f59e0b' },
  'Suspended':         { badge: 'bg-red-500/15 text-red-400 border border-red-500/20',             dot: '#ef4444' },
  'Rejected':          { badge: 'bg-red-500/15 text-red-400 border border-red-500/20',             dot: '#ef4444' },
};

const DOCTOR_ACTIONS = [
  { label: 'View Profile',              icon: Eye,          divider: false, danger: false },
  { label: 'Preview Public Profile',    icon: Building2,    divider: false, danger: false },
  { label: 'Approve',                   icon: CheckCircle2, divider: false, danger: false },
  { label: 'Reject',                    icon: AlertCircle,  divider: false, danger: false },
  { label: 'Request Changes',           icon: MessageSquare,divider: false, danger: false },
  { label: 'Edit Profile',              icon: Edit2,        divider: false, danger: false },
  { label: 'View Documents',            icon: FileText,     divider: false, danger: false },
  { label: 'View Profile Change History', icon: Clock,      divider: false, danger: false },
  { label: 'Assign Subscription',       icon: Zap,          divider: false, danger: false },
  { label: 'Send Message',              icon: MessageSquare,divider: true,  danger: false },
  { label: 'Reset Password',            icon: Lock,         divider: false, danger: false },
  { label: 'Export Data',               icon: Download,     divider: false, danger: false },
  { label: 'Pause Public Listing',      icon: AlertCircle,  divider: true,  danger: true  },
  { label: 'Suspend Doctor',            icon: UserX,        divider: false, danger: true  },
  { label: 'Archive',                   icon: Archive,      divider: false, danger: true  },
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
            {DOCTOR_ACTIONS.map((action, i) => {
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

const STATUSES = ['All', 'Approved', 'Under Review', 'Changes Requested', 'Document Expired', 'Suspended'];

export default function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = DOCTORS.filter(d =>
    (d.name.toLowerCase().includes(search.toLowerCase()) ||
     d.speciality.toLowerCase().includes(search.toLowerCase()) ||
     d.city.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || d.status === statusFilter)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Doctors</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Verified specialists in the ICC network</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
            <Plus className="w-3.5 h-3.5" /> Add Doctor
          </button>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
            {[
              { icon: Stethoscope, label: 'Unique Doctors',          value: '108', color: 'bg-emerald-500' },
              { icon: Clock,       label: 'Pending Verification',    value: '9',   color: 'bg-amber-500' },
              { icon: CheckCircle2,label: 'Approved',                value: '94',  color: 'bg-indigo-500' },
              { icon: UserX,       label: 'Suspended',               value: '2',   color: 'bg-red-500' },
              { icon: FileWarning, label: 'Expiring Documents',      value: '7',   color: 'bg-orange-500' },
              { icon: AlertCircle, label: 'Profile < 80% Complete',  value: '14',  color: 'bg-slate-500' },
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
            <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search doctors…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap"
                    style={statusFilter === s
                      ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                      : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {s}
                  </button>
                ))}
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} doctors</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['ID', 'Doctor', 'Speciality', 'Hospital', 'City', 'Fee', 'Rating', 'Plan', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => {
                    const si = statusInfo[d.status] ?? { badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/20', dot: '#94a3b8' };
                    return (
                      <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>{d.id}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs flex-shrink-0">
                              {d.name.split(' ')[1][0]}
                            </div>
                            <div>
                              <p className="font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
                              <p style={{ color: '#64748B' }}>{d.exp}y exp</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{d.speciality}</td>
                        <td className="px-4 py-3.5 font-medium max-w-[150px] truncate" style={{ color: 'var(--text-primary)' }}>{d.hospital}</td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1" style={{ color: '#94A3B8' }}><MapPin className="w-3 h-3" />{d.city}</span>
                        </td>
                        <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{d.fee}</td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1 text-amber-400 font-bold"><Star className="w-3 h-3 fill-amber-400" />{d.rating}</span>
                        </td>
                        <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${planBadge(d.plan)}`}>{d.plan}</span></td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: si.dot }} />
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${si.badge}`}>{d.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: '#25B89A' }}>
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <ThreeDotMenu />
                          </div>
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
