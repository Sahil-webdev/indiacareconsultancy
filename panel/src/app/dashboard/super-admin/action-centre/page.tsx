'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Target, UserCheck, Building2, RefreshCw,
  ClipboardList, Calendar, CreditCard, Ticket, FileWarning,
  ArrowRight, AlertCircle, Clock, Flag,
} from 'lucide-react';

const ACTION_SECTIONS = [
  {
    title: 'Verification Queue',
    color: 'border-amber-500/25',
    items: [
      { icon: UserCheck,    label: 'Doctors Awaiting Approval',      count: 8,  urgency: 'high',   href: '/dashboard/super-admin/verification/doctor-approvals',   note: 'Oldest submission: 6 days ago' },
      { icon: Building2,    label: 'Hospitals Awaiting Approval',    count: 3,  urgency: 'high',   href: '/dashboard/super-admin/verification/hospital-approvals',  note: 'Oldest submission: 4 days ago' },
      { icon: RefreshCw,    label: 'Profile Changes Pending',        count: 5,  urgency: 'medium', href: '/dashboard/super-admin/verification/profile-changes',     note: 'Including 1 speciality change' },
      { icon: FileWarning,  label: 'Documents Expiring in 7 Days',   count: 2,  urgency: 'high',   href: '/dashboard/super-admin/verification/expiring-docs',      note: 'Immediate action required' },
    ],
  },
  {
    title: 'Operations',
    color: 'border-indigo-500/25',
    items: [
      { icon: ClipboardList,label: 'Unassigned Consultation Leads',  count: 14, urgency: 'high',   href: '/dashboard/super-admin/leads',                            note: 'Oldest lead: 3 days unassigned' },
      { icon: Calendar,     label: 'Appointments Awaiting Confirm',  count: 6,  urgency: 'medium', href: '/dashboard/super-admin/appointments',                     note: 'Awaiting doctor/patient confirm' },
      { icon: Flag,         label: 'Follow-ups Overdue',             count: 4,  urgency: 'medium', href: '/dashboard/super-admin/follow-ups',                       note: 'Past scheduled contact date' },
    ],
  },
  {
    title: 'Revenue & Payments',
    color: 'border-red-500/25',
    items: [
      { icon: CreditCard,   label: 'Failed Payments',                count: 2,  urgency: 'high',   href: '/dashboard/super-admin/payments',                        note: 'Total ₹12,678 at risk' },
      { icon: AlertCircle,  label: 'Subscriptions in Grace Period',  count: 3,  urgency: 'medium', href: '/dashboard/super-admin/subscriptions',                   note: 'Grace period ending soon' },
    ],
  },
  {
    title: 'Support',
    color: 'border-rose-500/25',
    items: [
      { icon: Ticket,       label: 'Open Support Tickets',           count: 5,  urgency: 'medium', href: '/dashboard/super-admin/support/tickets',                 note: '2 tickets older than 24h' },
      { icon: AlertCircle,  label: 'Open Complaints',                count: 4,  urgency: 'high',   href: '/dashboard/super-admin/support/complaints',              note: '1 escalated complaint' },
    ],
  },
];

const urgencyDot = (u: string) => u === 'high' ? 'bg-red-400' : u === 'medium' ? 'bg-amber-400' : 'bg-emerald-400';
const urgencyText = (u: string) => u === 'high' ? 'text-red-400' : u === 'medium' ? 'text-amber-400' : 'text-emerald-400';
const urgencyBg = (u: string) => u === 'high' ? 'bg-red-400/10' : u === 'medium' ? 'bg-amber-400/10' : 'bg-emerald-400/10';

const totalPending = ACTION_SECTIONS.flatMap(s => s.items).reduce((a, i) => a + i.count, 0);

export default function ActionCentrePage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5" style={{ color: '#25B89A' }} />
            <div>
              <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Action Centre</h1>
              <p className="text-[11px]" style={{ color: '#64748B' }}>All pending tasks requiring your attention</p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
            {totalPending} Total Pending
          </span>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Priority banner */}
          <div className="panel-card p-4 mb-6 flex items-start gap-3" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-400">
                {ACTION_SECTIONS.flatMap(s => s.items).filter(i => i.urgency === 'high').reduce((a, i) => a + i.count, 0)} items require immediate attention
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                High-priority tasks are highlighted in red. Unaddressed verifications can affect doctor/hospital listings. Overdue leads reduce conversion rates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {ACTION_SECTIONS.map((section, si) => (
              <motion.div key={si} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}
                className={`panel-card border ${section.color} overflow-hidden`}>
                <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <h2 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
                </div>
                <div className="flex flex-col">
                  {section.items.map((item, ii) => {
                    const Icon = item.icon;
                    return (
                      <Link key={ii} href={item.href}
                        className="flex items-center gap-3 px-4 py-3.5 border-b last:border-0 hover:bg-white/[0.025] transition-colors"
                        style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${urgencyBg(item.urgency)}`}>
                          <Icon className={`w-3.5 h-3.5 ${urgencyText(item.urgency)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                          <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{item.note}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot(item.urgency)}`} />
                            <span className={`text-lg font-extrabold ${urgencyText(item.urgency)}`}>{item.count}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5" style={{ color: '#2D4150' }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
  );
}
