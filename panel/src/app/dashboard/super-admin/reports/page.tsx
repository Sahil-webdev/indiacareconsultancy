'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2, TrendingUp, Users, Stethoscope,
  Building2, DollarSign, ClipboardList, Calendar,
  CheckCircle2, Star, Zap, ArrowUpRight, ArrowDownRight,
  Download, Filter, ChevronDown, Info,
} from 'lucide-react';

const SPECIALITY_DATA = [
  { name: 'Cardiology',    leads: 84, patients: 67, revenue: 112500, pct: 80 },
  { name: 'Orthopedic',    leads: 73, patients: 58, revenue: 89400,  pct: 79 },
  { name: 'Dermatology',   leads: 61, patients: 50, revenue: 74000,  pct: 82 },
  { name: 'Gynecology',    leads: 55, patients: 44, revenue: 62800,  pct: 80 },
  { name: 'Neurology',     leads: 48, patients: 40, revenue: 88200,  pct: 83 },
  { name: 'Pediatrics',    leads: 42, patients: 36, revenue: 31200,  pct: 86 },
];

const CITY_DATA = [
  { city: 'Delhi',     patients: 142, pct: 95 },
  { city: 'Mumbai',    patients: 118, pct: 79 },
  { city: 'Bengaluru', patients: 87,  pct: 58 },
  { city: 'Hyderabad', patients: 74,  pct: 50 },
  { city: 'Gurugram',  patients: 52,  pct: 35 },
  { city: 'Pune',      patients: 38,  pct: 25 },
];

const MONTHLY = [
  { m: 'Jan', leads: 32, conversions: 21 },
  { m: 'Feb', leads: 41, conversions: 28 },
  { m: 'Mar', leads: 55, conversions: 36 },
  { m: 'Apr', leads: 48, conversions: 31 },
  { m: 'May', leads: 68, conversions: 49 },
  { m: 'Jun', leads: 84, conversions: 61 },
];

const DATE_RANGES = ['Weekly', 'Monthly', 'Quarterly', 'This FY'];

const KPI = [
  { icon: Users,         label: 'Total Patients',       value: '527',   change: '+12%', up: true,  color: 'bg-indigo-500',  tooltip: 'Total unique patients registered on the platform' },
  { icon: Stethoscope,   label: 'Active Doctors',       value: '108',   change: '+4%',  up: true,  color: 'bg-emerald-500', tooltip: 'Doctors with Approved status and active subscription' },
  { icon: Building2,     label: 'Partner Hospitals',    value: '34',    change: '+2',   up: true,  color: 'bg-violet-500',  tooltip: 'Hospitals with active partnership agreement' },
  { icon: ClipboardList, label: 'Total Leads',          value: '411',   change: '+19%', up: true,  color: 'bg-sky-500',     tooltip: 'Total consultation lead requests received in the period' },
  { icon: Calendar,      label: 'Appointments',         value: '284',   change: '+22%', up: true,  color: 'bg-teal-500',    tooltip: 'Total appointments booked (all statuses)' },
  { icon: DollarSign,    label: 'Gross Revenue',        value: '₹2.84L',change: '+18%', up: true,  color: 'bg-amber-500',   tooltip: 'Gross revenue = Sum of all successful subscription payments (incl. GST). Period: This Month.' },
  { icon: Zap,           label: 'Active Subscriptions', value: '92',    change: '-3',   up: false, color: 'bg-rose-500',    tooltip: 'Total active subscriptions across Doctors and Hospitals' },
  { icon: Star,          label: 'Avg. Doctor Rating',   value: '4.76',  change: '+0.1', up: true,  color: 'bg-pink-500',    tooltip: 'Average star rating given by patients for completed consultations' },
];

const FUNNEL_REPORT = [
  { stage: 'New Leads',               count: 411, pct: 100 },
  { stage: 'Contacted',               count: 329, pct: 80 },
  { stage: 'Qualified',               count: 247, pct: 60 },
  { stage: 'Doctor Options Sent',     count: 185, pct: 45 },
  { stage: 'Appointment Requested',   count: 130, pct: 32 },
  { stage: 'Appointment Confirmed',   count: 100, pct: 24 },
  { stage: 'Converted',               count: 76,  pct: 18 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState('Monthly');

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Reports & Analytics</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Platform-wide performance metrics and insights</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {DATE_RANGES.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                  style={period === p
                    ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                    : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {p}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
              style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)', border: '1px solid rgba(37,184,154,0.2)' }}>
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {KPI.map((k, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="panel-card p-4" title={k.tooltip}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl ${k.color} flex items-center justify-center`}>
                    <k.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>
                      {k.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{k.change}
                    </span>
                    <span title={k.tooltip}><Info className="w-3 h-3" style={{ color: '#2D4150' }} /></span>
                  </div>
                </div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{k.value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>{k.label}</p>
                <p className="text-[9px] mt-0.5" style={{ color: '#2D4150' }}>Period: {period}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Leads vs Conversions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="panel-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <TrendingUp className="w-4 h-4" style={{ color: '#25B89A' }} /> Leads vs Conversions
                </h3>
                <button className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#25B89A' }}>
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>
              <div className="flex items-end gap-2 h-36">
                {MONTHLY.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-1 items-center" style={{ height: '120px', justifyContent: 'flex-end' }}>
                      <div className="w-full flex gap-0.5">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(m.leads / 84) * 100}px` }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                          className="flex-1 rounded-t-md"
                          style={{ background: 'rgba(99,102,241,0.6)', minHeight: 4 }}
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(m.conversions / 84) * 100}px` }}
                          transition={{ delay: 0.4 + i * 0.08, duration: 0.6 }}
                          className="flex-1 rounded-t-md"
                          style={{ background: '#25B89A', minHeight: 4 }}
                        />
                      </div>
                    </div>
                    <p className="text-[9px] font-semibold" style={{ color: '#2D4150' }}>{m.m}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-indigo-500/60" /><span className="text-[10px]" style={{ color: '#64748B' }}>Leads</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#25B89A' }} /><span className="text-[10px]" style={{ color: '#64748B' }}>Conversions</span></div>
                <span className="text-[9px] ml-auto" style={{ color: '#2D4150' }}>Conversion = Confirmed appointments ÷ Qualified leads</span>
              </div>
            </motion.div>

            {/* City distribution */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="panel-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Building2 className="w-4 h-4" style={{ color: '#25B89A' }} /> Patient Distribution by City
                </h3>
                <button className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#25B89A' }}>
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {CITY_DATA.map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{c.city}</span>
                      <span className="text-xs font-bold" style={{ color: '#94A3B8' }}>{c.patients} patients</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.pct}%` }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.7 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg,#127A6A,#25B89A)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Lead Funnel */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="panel-card p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <ClipboardList className="w-4 h-4" style={{ color: '#25B89A' }} /> Lead Conversion Funnel
                <span title="Shows how many leads progress through each stage. Conversion Rate = Converted ÷ New Leads"><Info className="w-3.5 h-3.5" style={{ color: '#2D4150' }} /></span>
              </h3>
              <button className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#25B89A' }}>
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {FUNNEL_REPORT.map((f, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-xl flex items-end justify-center" style={{ height: 100, background: 'rgba(255,255,255,0.03)' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${f.pct}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.8 }}
                      className="w-full rounded-t-xl"
                      style={{ background: `rgba(18,122,106,${0.4 + (i * 0.08)})` }}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-center" style={{ color: '#25B89A' }}>{f.count}</p>
                  <p className="text-[8px] text-center leading-tight" style={{ color: '#64748B' }}>{f.stage}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Speciality breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="panel-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Stethoscope className="w-4 h-4" style={{ color: '#25B89A' }} /> Performance by Speciality
              </h3>
              <button className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#25B89A' }}>
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Speciality', 'Leads', 'Patients Matched', 'Revenue (Gross)', 'Conversion Rate ÷'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPECIALITY_DATA.map((s, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                      <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{s.leads}</td>
                      <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{s.patients}</td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{s.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', maxWidth: 80 }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${s.pct}%` }}
                              transition={{ delay: 0.5 + i * 0.07, duration: 0.7 }}
                              className="h-full rounded-full"
                              style={{ background: '#25B89A' }}
                            />
                          </div>
                          <span className="text-emerald-400 font-bold">{s.pct}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <p className="text-[9px]" style={{ color: '#2D4150' }}>÷ Conversion Rate = Patients Matched ÷ Total Leads for this speciality</p>
            </div>
          </motion.div>
        </main>
      </div>
  );
}
