'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Stethoscope, Building2, Crown, BarChart2,
  TrendingUp, DollarSign, ClipboardList, Calendar,
  CheckCircle2, Clock, AlertCircle, Eye, ArrowRight,
  Bell, Settings, Zap, MessageSquare, UserCheck,
  AlertTriangle, FileWarning, X, ChevronRight,
  ArrowUpRight, Activity, Target,
  CreditCard, Ticket, RefreshCw,
  Filter, ChevronDown,
} from 'lucide-react';

/* ── Animated counter ── */
function Counter({ target, prefix = '' }: { target: number; prefix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => { s = Math.min(s + step, target); setN(s); if (s >= target) clearInterval(t); }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <>{prefix}{n.toLocaleString()}</>;
}

/* ── Date range options ── */
const DATE_RANGES = ['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'Last 30 Days', 'This FY'];

/* ── Notification data ── */
const NOTIFICATIONS = [
  { id: 1, tab: 'Approvals',    icon: UserCheck,     color: 'text-amber-400 bg-amber-400/10',   title: 'Doctor Approval Pending', entity: 'Dr. Sanjay Gupta', time: '5m ago',  priority: 'high',   action: 'Review' },
  { id: 2, tab: 'Approvals',    icon: Building2,     color: 'text-violet-400 bg-violet-400/10', title: 'Hospital Verification', entity: 'Kokilaben Mumbai', time: '12m ago', priority: 'high',   action: 'Review' },
  { id: 3, tab: 'Approvals',    icon: UserCheck,     color: 'text-sky-400 bg-sky-400/10',       title: 'Profile Change Request', entity: 'Dr. Ramesh Kumar', time: '1h ago',  priority: 'medium', action: 'Compare' },
  { id: 4, tab: 'Payments',     icon: CreditCard,    color: 'text-red-400 bg-red-400/10',       title: 'Payment Failed', entity: 'Fortis Healthcare', time: '2h ago',  priority: 'high',   action: 'View' },
  { id: 5, tab: 'Appointments', icon: Calendar,      color: 'text-emerald-400 bg-emerald-400/10',title: 'Appointment Confirmed', entity: 'Rahul Sharma → Dr. Ramesh', time: '3h ago', priority: 'low', action: 'View' },
  { id: 6, tab: 'Security',     icon: AlertTriangle, color: 'text-red-400 bg-red-400/10',       title: 'Suspicious Login Detected', entity: 'Admin Panel', time: '5h ago',  priority: 'high',   action: 'View' },
  { id: 7, tab: 'System',       icon: FileWarning,   color: 'text-amber-400 bg-amber-400/10',   title: '7 Documents Expiring Soon', entity: 'Various Doctors', time: '1d ago', priority: 'medium', action: 'View' },
];

const NOTIF_TABS = ['All', 'Approvals', 'Appointments', 'Payments', 'Security', 'System'];

/* ── Action Centre items ── */
const ACTION_ITEMS = [
  { icon: UserCheck,    label: 'Doctors Awaiting Approval',    count: 8,  href: '/dashboard/super-admin/verification/doctor-approvals', color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
  { icon: Building2,    label: 'Hospitals Awaiting Approval',  count: 3,  href: '/dashboard/super-admin/verification/hospital-approvals',color: 'text-violet-400',  bg: 'bg-violet-400/10',  border: 'border-violet-400/20' },
  { icon: RefreshCw,    label: 'Profile Changes Pending',      count: 5,  href: '/dashboard/super-admin/verification/profile-changes',  color: 'text-sky-400',     bg: 'bg-sky-400/10',     border: 'border-sky-400/20' },
  { icon: ClipboardList,label: 'Unassigned Leads',             count: 14, href: '/dashboard/super-admin/leads',                        color: 'text-indigo-400',  bg: 'bg-indigo-400/10',  border: 'border-indigo-400/20' },
  { icon: Calendar,     label: 'Appointments Awaiting Confirm',count: 6,  href: '/dashboard/super-admin/appointments',                 color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { icon: CreditCard,   label: 'Failed Payments',              count: 2,  href: '/dashboard/super-admin/payments',                     color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20' },
  { icon: Ticket,       label: 'Open Complaints',              count: 4,  href: '/dashboard/super-admin/support/complaints',           color: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/20' },
  { icon: FileWarning,  label: 'Documents Expiring Soon',      count: 7,  href: '/dashboard/super-admin/verification/expiring-docs',   color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20' },
];

/* ── Lead funnel stages ── */
const FUNNEL = [
  { stage: 'New',                   count: 14, pct: 100 },
  { stage: 'Contacted',             count: 11, pct: 79 },
  { stage: 'Qualified',             count: 9,  pct: 64 },
  { stage: 'Doctor Options Sent',   count: 7,  pct: 50 },
  { stage: 'Appointment Confirmed', count: 5,  pct: 36 },
  { stage: 'Converted',             count: 4,  pct: 29 },
];

/* ── Appointment overview ── */
const APT_OVERVIEW = [
  { label: "Today's Total",    value: 38, color: '#25B89A' },
  { label: 'Confirmed',        value: 24, color: '#22c55e' },
  { label: 'Awaiting Confirm', value: 6,  color: '#f59e0b' },
  { label: 'Completed',        value: 7,  color: '#6366f1' },
  { label: 'Cancelled',        value: 1,  color: '#ef4444' },
];

/* ── Live activity ── */
const LIVE_ACTIVITY = [
  { icon: Users,        color: 'bg-indigo-500/20 text-indigo-400',   text: 'New patient registered', name: 'Sunita Joshi',    time: '2m ago' },
  { icon: ClipboardList,color: 'bg-amber-500/20 text-amber-400',     text: 'Lead created',           name: 'Orthopedic – Pune', time: '5m ago' },
  { icon: Calendar,     color: 'bg-emerald-500/20 text-emerald-400', text: 'Appointment booked',     name: 'Rahul → Dr. Ramesh', time: '8m ago' },
  { icon: CreditCard,   color: 'bg-violet-500/20 text-violet-400',   text: 'Payment received ₹4,999',name: 'Dr. Nidhi Verma', time: '14m ago' },
  { icon: CheckCircle2, color: 'bg-teal-500/20 text-teal-400',       text: 'Consultation completed', name: 'Arjun Patel',      time: '22m ago' },
  { icon: UserCheck,    color: 'bg-sky-500/20 text-sky-400',         text: 'Doctor profile updated', name: 'Dr. Priya Patel',  time: '35m ago' },
  { icon: Zap,          color: 'bg-amber-500/20 text-amber-400',     text: 'Subscription renewed',   name: 'Apollo Hospitals', time: '1h ago' },
];

const statusBadge = (s: string) => ({
  'New': 'badge-info', 'In Progress': 'badge-warning', 'Completed': 'badge-success',
  'Approved': 'badge-success', 'Pending': 'badge-warning', 'Rejected': 'badge-danger',
}[s] || 'badge-info');

export default function SuperAdminDashboard() {
  const [dateRange, setDateRange] = useState('This Month');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState('All');
  const [readIds, setReadIds] = useState<number[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  const filteredNotifs = notifTab === 'All' ? NOTIFICATIONS : NOTIFICATIONS.filter(n => n.tab === notifTab);
  const unreadCount = NOTIFICATIONS.filter(n => !readIds.includes(n.id)).length;

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDateDropdown(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Top Bar ── */}
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-white text-lg">Super Admin Dashboard</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>India Care Consultancy · Full Platform Overview</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date range picker */}
            <div className="relative" ref={dateRef}>
              <button
                onClick={() => setShowDateDropdown(v => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}
              >
                <Filter className="w-3 h-3" />
                {dateRange}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showDateDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 z-50 rounded-2xl border overflow-hidden shadow-2xl"
                    style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border-color)', minWidth: 160 }}
                  >
                    {DATE_RANGES.map(d => (
                      <button key={d} onClick={() => { setDateRange(d); setShowDateDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-white/5"
                        style={{ color: d === dateRange ? '#25B89A' : 'var(--text-secondary)' }}
                      >
                        {d}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center border transition-colors"
                style={{ borderColor: notifOpen ? 'rgba(37,184,154,0.4)' : 'rgba(255,255,255,0.08)', background: notifOpen ? 'rgba(37,184,154,0.08)' : 'rgba(255,255,255,0.04)' }}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" style={{ color: notifOpen ? '#25B89A' : '#64748B' }} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 z-50 rounded-2xl border shadow-2xl overflow-hidden"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', width: 380 }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" style={{ color: '#25B89A' }} />
                        <span className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">{unreadCount} new</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReadIds(NOTIFICATIONS.map(n => n.id))}
                          className="text-[10px] font-bold transition-colors"
                          style={{ color: '#25B89A' }}
                        >
                          Mark all read
                        </button>
                        <button onClick={() => setNotifOpen(false)} style={{ color: 'var(--text-muted)' }}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-1 px-3 py-2 border-b overflow-x-auto" style={{ borderColor: 'var(--border-color)' }}>
                      {NOTIF_TABS.map(tab => (
                        <button
                          key={tab}
                          onClick={() => setNotifTab(tab)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all"
                          style={notifTab === tab
                            ? { background: 'rgba(18,122,106,0.25)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.25)' }
                            : { color: 'var(--text-muted)', border: '1px solid transparent' }}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    {/* Notifications list */}
                    <div className="overflow-y-auto panel-scroll" style={{ maxHeight: 360 }}>
                      {filteredNotifs.length === 0 ? (
                        <p className="text-center text-xs py-8" style={{ color: 'var(--text-muted)' }}>No notifications</p>
                      ) : (
                        filteredNotifs.map(n => {
                          const Icon = n.icon;
                          const isRead = readIds.includes(n.id);
                          return (
                            <div
                              key={n.id}
                              className="flex items-start gap-3 px-4 py-3 border-b transition-colors hover:bg-white/[0.02] cursor-pointer"
                              style={{ borderColor: 'rgba(255,255,255,0.04)', background: isRead ? 'transparent' : 'rgba(37,184,154,0.02)' }}
                              onClick={() => setReadIds(prev => [...prev, n.id])}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-[11px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {n.priority === 'high' && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                    )}
                                    {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                                  </div>
                                </div>
                                <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{n.entity}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{n.time}</span>
                                  <button
                                    className="text-[9px] font-bold px-2 py-0.5 rounded-md transition-colors"
                                    style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)' }}
                                  >
                                    {n.action}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="px-4 py-2.5 text-center border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <button className="text-[11px] font-bold" style={{ color: '#25B89A' }}>View All Notifications →</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Vikram Singh</span>
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto panel-scroll p-6">

          {/* ─── Action Centre ─── */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4" style={{ color: '#25B89A' }} />
              <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>Action Centre</h2>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                {ACTION_ITEMS.reduce((s, a) => s + a.count, 0)} pending
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACTION_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`panel-card p-3.5 flex items-center gap-3 border hover:border-opacity-60 transition-all group block ${item.border}`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.border} border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xl font-extrabold ${item.color}`}>{item.count}</p>
                        <p className="text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ─── KPI Stats ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Users,       label: 'Total Patients',    value: 527,    change: '+12%', color: 'bg-indigo-500',  prefix: '' },
              { icon: Stethoscope, label: 'Active Doctors',    value: 108,    change: '+4%',  color: 'bg-emerald-500', prefix: '' },
              { icon: Building2,   label: 'Partner Hospitals', value: 34,     change: '+2',   color: 'bg-violet-500',  prefix: '' },
              { icon: DollarSign,  label: `Gross Revenue · ${dateRange}`, value: 284000, change: '+18%', color: 'bg-amber-500', prefix: '₹' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="panel-card p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{s.change}</span>
                </div>
                <div>
                  <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    <Counter target={s.value} prefix={s.prefix} />
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── Quick Stats row ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: ClipboardList, label: 'Unassigned Leads',         value: '14', color: 'bg-indigo-500/15 text-indigo-400',   href: '/dashboard/super-admin/leads' },
              { icon: UserCheck,     label: 'Pending Profile Changes',  value: '5',  color: 'bg-sky-500/15 text-sky-400',         href: '/dashboard/super-admin/verification/profile-changes' },
              { icon: Calendar,     label: 'Appts. Need Confirmation',  value: '6',  color: 'bg-amber-500/15 text-amber-400',     href: '/dashboard/super-admin/appointments' },
              { icon: AlertCircle,  label: 'Failed Renewals',           value: '2',  color: 'bg-red-500/15 text-red-400',         href: '/dashboard/super-admin/payments' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07 }}>
                <Link href={s.href} className="panel-card rounded-2xl p-4 flex items-center gap-3 hover:border-white/10 transition-all block">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color.split(' ')[0]}`}>
                    <s.icon className={`w-4 h-4 ${s.color.split(' ')[1]}`} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* ─── Lead Funnel ─── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="panel-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <TrendingUp className="w-4 h-4" style={{ color: '#25B89A' }} /> Lead Funnel
                </h3>
                <Link href="/dashboard/super-admin/leads" className="text-[10px] font-bold flex items-center gap-1" style={{ color: '#25B89A' }}>
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {FUNNEL.map((f, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{f.stage}</span>
                      <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{f.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${f.pct}%` }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.7 }}
                        className="h-full rounded-full"
                        style={{ background: `hsl(${165 - i * 10}, 70%, ${50 - i * 4}%)` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ─── Appointment Overview ─── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="panel-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Calendar className="w-4 h-4" style={{ color: '#25B89A' }} /> Appointments Today
                </h3>
                <Link href="/dashboard/super-admin/appointments" className="text-[10px] font-bold flex items-center gap-1" style={{ color: '#25B89A' }}>
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex flex-col gap-2.5">
                {APT_OVERVIEW.map((a, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{a.label}</span>
                    </div>
                    <span className="text-[12px] font-extrabold" style={{ color: 'var(--text-primary)' }}>{a.value}</span>
                  </div>
                ))}
              </div>
              {/* Mini donut visual */}
              <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                  {APT_OVERVIEW.slice(1).map((a, i) => (
                    <div key={i} className="h-full" style={{ background: a.color, flex: a.value }} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ─── Live Activity ─── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="panel-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Activity className="w-4 h-4" style={{ color: '#25B89A' }} /> Live Activity
                </h3>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <div className="flex flex-col gap-0">
                {LIVE_ACTIVITY.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <div key={i} className="flex items-start gap-2.5 py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${a.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{a.text}</p>
                        <p className="text-[9px] truncate" style={{ color: 'var(--text-secondary)' }}>{a.name}</p>
                      </div>
                      <span className="text-[9px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{a.time}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ─── Recent Leads ─── */}
          <div className="panel-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <MessageSquare className="w-4 h-4" style={{ color: '#25B89A' }} /> Recent Consultation Leads
              </h3>
              <Link href="/dashboard/super-admin/leads" className="text-[11px] font-bold flex items-center gap-1 transition-colors" style={{ color: '#25B89A' }}>
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Patient', 'Speciality', 'City', 'Assigned', 'Status', 'Time', 'Action'].map(h => (
                      <th key={h} className="pb-2.5 text-[10px] font-black uppercase tracking-widest pr-4" style={{ color: '#2D4150' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, name: 'Rahul Sharma',  speciality: 'Cardiology',      city: 'Delhi',     status: 'New',         time: '2m ago',  assigned: 'Unassigned' },
                    { id: 2, name: 'Priya Nair',    speciality: 'Dermatology',     city: 'Mumbai',    status: 'In Progress', time: '15m ago', assigned: 'Rahul C.' },
                    { id: 3, name: 'Arjun Patel',   speciality: 'Orthopedic',      city: 'Pune',      status: 'Completed',   time: '1h ago',  assigned: 'Priya C.' },
                    { id: 4, name: 'Kavya Reddy',   speciality: 'Gynecology',      city: 'Bengaluru', status: 'New',         time: '2h ago',  assigned: 'Unassigned' },
                    { id: 5, name: 'Mohan Verma',   speciality: 'Neurology',       city: 'Hyderabad', status: 'In Progress', time: '3h ago',  assigned: 'Sanjay C.' },
                  ].map((lead, i) => (
                    <motion.tr key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="text-xs border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="py-3 pr-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{lead.name}</td>
                      <td className="py-3 pr-4" style={{ color: '#94A3B8' }}>{lead.speciality}</td>
                      <td className="py-3 pr-4" style={{ color: '#64748B' }}>{lead.city}</td>
                      <td className="py-3 pr-4">
                        <span className={`font-semibold text-[10px] ${lead.assigned === 'Unassigned' ? 'text-rose-400' : ''}`} style={{ color: lead.assigned === 'Unassigned' ? undefined : 'var(--text-primary)' }}>
                          {lead.assigned}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(lead.status)}`}>{lead.status}</span>
                      </td>
                      <td className="py-3 pr-4" style={{ color: '#64748B' }}>{lead.time}</td>
                      <td className="py-3">
                        <Link href="/dashboard/super-admin/leads" className="text-[10px] font-bold flex items-center gap-1 transition-colors" style={{ color: '#25B89A' }}>
                          <Eye className="w-3 h-3" /> View
                        </Link>
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
