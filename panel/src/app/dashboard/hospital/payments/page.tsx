'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';

const PAYMENTS = [
  { id: 'PAY001', patient: 'Rahul Sharma', doctor: 'Dr. Kiran Mehta',  dept: 'Cardiology',  date: 'Jun 18, 2026', amount: 1500, platform: 150, hospital: 1350, method: 'UPI',        status: 'Settled' },
  { id: 'PAY002', patient: 'Priya Nair',   doctor: 'Dr. Anjali Gupta', dept: 'Gynecology',  date: 'Jun 17, 2026', amount: 1100, platform: 110, hospital: 990,  method: 'Card',        status: 'Settled' },
  { id: 'PAY003', patient: 'Arjun Patel',  doctor: 'Dr. Rohit Sharma', dept: 'Orthopedic',  date: 'Jun 16, 2026', amount: 1200, platform: 120, hospital: 1080, method: 'Net Banking',  status: 'Pending' },
  { id: 'PAY004', patient: 'Kavya Reddy',  doctor: 'Dr. Nidhi Verma',  dept: 'Pediatrics',  date: 'Jun 15, 2026', amount: 700,  platform: 70,  hospital: 630,  method: 'UPI',         status: 'Settled' },
  { id: 'PAY005', patient: 'Mohan Verma',  doctor: 'Dr. Suresh Iyer',  dept: 'Neurology',   date: 'Jun 14, 2026', amount: 1800, platform: 180, hospital: 1620, method: 'UPI',         status: 'Settled' },
  { id: 'PAY006', patient: 'Sunita Joshi', doctor: 'Dr. Priya Nair',   dept: 'Dermatology', date: 'Jun 13, 2026', amount: 1000, platform: 100, hospital: 900,  method: 'Card',        status: 'Refunded' },
];

const statusBadge = (s: string) => ({
  Settled:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Pending:  'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Refunded: 'bg-red-500/15 text-red-400 border border-red-500/20',
}[s] || '');

export default function HospitalPaymentsPage() {
  const totalEarned = PAYMENTS.filter(p => p.status === 'Settled').reduce((a, p) => a + p.hospital, 0);
  const pending = PAYMENTS.filter(p => p.status === 'Pending').reduce((a, p) => a + p.hospital, 0);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <PanelSidebar role="hospital" userName="Apollo Hospitals" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Payments</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Revenue from consultations after platform fee</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
            style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)', border: '1px solid rgba(37,184,154,0.2)' }}>
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: TrendingUp,  label: 'Net Earned (Jun)', value: `₹${totalEarned.toLocaleString()}`, color: 'bg-emerald-500' },
              { icon: CheckCircle2,label: 'Settled',          value: PAYMENTS.filter(p=>p.status==='Settled').length, color: 'bg-indigo-500' },
              { icon: Clock,       label: 'Pending',          value: `₹${pending.toLocaleString()}`,     color: 'bg-amber-500' },
              { icon: CreditCard,  label: 'Platform Fee',     value: '10%',                              color: 'bg-violet-500' },
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

          <div className="panel-card overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['ID', 'Patient', 'Doctor', 'Dept', 'Date', 'Total', 'Platform', 'Hospital Net', 'Method', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAYMENTS.map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-4 py-3.5" style={{ color: '#25B89A' }}>{p.id}</td>
                      <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{p.patient}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.doctor}</td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{p.dept}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.date}</td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{p.amount}</td>
                      <td className="px-4 py-3.5 text-red-400">-₹{p.platform}</td>
                      <td className="px-4 py-3.5 font-extrabold text-emerald-400">₹{p.hospital}</td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{p.method}</td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(p.status)}`}>{p.status}</span></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
