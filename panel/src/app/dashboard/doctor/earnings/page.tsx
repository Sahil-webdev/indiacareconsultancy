'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, Download, CreditCard } from 'lucide-react';

const EARNINGS = [
  { id: 'PAY001', patient: 'Rahul Sharma',  date: 'Jun 18, 2026', type: 'Clinic',  fee: 1500, platform: 150, net: 1350, status: 'Settled' },
  { id: 'PAY002', patient: 'Kavya Reddy',   date: 'Jun 17, 2026', type: 'Video',   fee: 1500, platform: 150, net: 1350, status: 'Settled' },
  { id: 'PAY003', patient: 'Deepak Singh',  date: 'Jun 15, 2026', type: 'Clinic',  fee: 1500, platform: 150, net: 1350, status: 'Settled' },
  { id: 'PAY004', patient: 'Mohan Verma',   date: 'Jun 12, 2026', type: 'Clinic',  fee: 1500, platform: 150, net: 1350, status: 'Pending' },
  { id: 'PAY005', patient: 'Sunita Joshi',  date: 'Jun 10, 2026', type: 'Video',   fee: 1500, platform: 150, net: 1350, status: 'Settled' },
  { id: 'PAY006', patient: 'Anita Mehta',   date: 'Jun 8, 2026',  type: 'Clinic',  fee: 1500, platform: 150, net: 1350, status: 'Settled' },
];

const MONTHLY = [
  { m: 'Jan', amt: 21000 },
  { m: 'Feb', amt: 28500 },
  { m: 'Mar', amt: 34200 },
  { m: 'Apr', amt: 30000 },
  { m: 'May', amt: 42000 },
  { m: 'Jun', amt: 8100 },
];

const statusBadge = (s: string) => s === 'Settled'
  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
  : 'bg-amber-500/15 text-amber-400 border border-amber-500/20';

export default function DoctorEarningsPage() {
  const totalNet = EARNINGS.filter(e => e.status === 'Settled').reduce((a, e) => a + e.net, 0);
  const pending  = EARNINGS.filter(e => e.status === 'Pending').reduce((a, e) => a + e.net, 0);
  const maxAmt   = Math.max(...MONTHLY.map(m => m.amt));

  return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Earnings</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Your consultation revenue and payout history</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl" style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)', border: '1px solid rgba(37,184,154,0.2)' }}>
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: DollarSign,  label: 'Settled (Jun)',   value: `₹${totalNet.toLocaleString()}`, color: 'bg-emerald-500' },
              { icon: Calendar,    label: 'Consultations',   value: EARNINGS.length,                  color: 'bg-indigo-500' },
              { icon: TrendingUp,  label: 'Pending Payout',  value: `₹${pending.toLocaleString()}`,  color: 'bg-amber-500' },
              { icon: CreditCard,  label: 'Platform Fee',    value: '10%',                            color: 'bg-violet-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="panel-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="panel-card p-5 mb-6">
            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Monthly Earnings (Net)
            </h3>
            <div className="flex items-end gap-3" style={{ height: '120px' }}>
              {MONTHLY.map((m, i) => {
                const pct = (m.amt / maxAmt) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-[9px] font-bold" style={{ color: '#25B89A' }}>₹{(m.amt/1000).toFixed(0)}k</p>
                    <div className="w-full rounded-t-xl relative" style={{ height: '80px', background: 'var(--bg-surface-3)' }}>
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }}
                        className="absolute bottom-0 left-0 right-0 rounded-t-xl"
                        style={{ background: 'linear-gradient(180deg,#25B89A,#127A6A)' }}
                      />
                    </div>
                    <p className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>{m.m}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions */}
          <div className="panel-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['ID', 'Patient', 'Date', 'Type', 'Fee', 'ICC Fee (10%)', 'Net Earned', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EARNINGS.map((e, i) => (
                    <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-4 py-3.5" style={{ color: '#25B89A' }}>{e.id}</td>
                      <td className="px-4 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{e.patient}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{e.date}</td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{e.type}</td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{e.fee}</td>
                      <td className="px-4 py-3.5 text-red-400 font-semibold">-₹{e.platform}</td>
                      <td className="px-4 py-3.5 font-extrabold text-emerald-400">₹{e.net}</td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(e.status)}`}>{e.status}</span></td>
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
