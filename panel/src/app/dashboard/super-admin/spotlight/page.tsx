'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Stethoscope, Building2, X, Check, Edit2, IndianRupee, Calendar, Eye, Trash2 } from 'lucide-react';

const PROMOTED = [
  { id: 'DR201', type: 'Doctor', name: 'Dr. Aryan Kapoor', speciality: 'Cardiologist', city: 'Delhi', since: 'Jul 1, 2025', until: 'Jul 30, 2025', paid: 999, tagline: 'Expert heart care with compassion', active: true },
  { id: 'HSP101', type: 'Hospital', name: 'Apollo Spectra Delhi', speciality: 'Multispeciality', city: 'Delhi', since: 'Jun 25, 2025', until: 'Jul 24, 2025', paid: 1499, tagline: 'World-class care, right in your city', active: true },
  { id: 'DR203', type: 'Doctor', name: 'Dr. Manish Kumar', speciality: 'Neurologist', city: 'Hyderabad', since: 'Jun 20, 2025', until: 'Jul 19, 2025', paid: 999, tagline: 'Leading neurology care in Hyderabad', active: false },
];

export default function SpotlightPage() {
  const [spotlightFee, setSpotlightFee] = useState({ doctor: 999, hospital: 1499 });
  const [editFee, setEditFee] = useState<null | 'doctor' | 'hospital'>(null);
  const [draftFee, setDraftFee] = useState('');
  const [promoted, setPromoted] = useState(PROMOTED);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  const remove = (id: string) => { setPromoted(prev => prev.filter(p => p.id !== id)); setRemoveConfirm(null); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Homepage Spotlight</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Manage which doctors and hospitals are featured on the homepage</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Sparkles className="w-3.5 h-3.5" /> {promoted.filter(p => p.active).length} Active Spotlights
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">

        {/* Spotlight Fees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {([
            { key: 'doctor' as const, label: 'Doctor Spotlight Fee', icon: Stethoscope, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
            { key: 'hospital' as const, label: 'Hospital Spotlight Fee', icon: Building2, color: 'text-violet-400', bg: 'bg-violet-500/15' },
          ]).map(item => (
            <motion.div key={item.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
              </div>
              {editFee === item.key ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: '#94A3B8' }}>₹</span>
                  <input autoFocus type="number" value={draftFee} onChange={e => setDraftFee(e.target.value)}
                    className="w-24 text-center text-lg font-extrabold rounded-lg px-2 py-1 focus:outline-none"
                    style={{ background: 'rgba(37,184,154,0.12)', border: '1px solid rgba(37,184,154,0.4)', color: '#25B89A' }} />
                  <span className="text-sm font-bold" style={{ color: '#94A3B8' }}>/30 days</span>
                  <button onClick={() => { if (+draftFee > 0) setSpotlightFee(f => ({ ...f, [item.key]: +draftFee })); setEditFee(null); }}
                    className="w-7 h-7 rounded-md bg-emerald-500/20 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-400" /></button>
                  <button onClick={() => setEditFee(null)} className="w-7 h-7 rounded-md bg-red-500/10 flex items-center justify-center"><X className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditFee(item.key); setDraftFee(String(spotlightFee[item.key])); }}>
                  <span className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{spotlightFee[item.key].toLocaleString('en-IN')}<span className="text-sm font-semibold ml-1" style={{ color: '#64748B' }}>/30 days</span></span>
                  <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </div>
              )}
              <p className="text-[10px] mt-1" style={{ color: '#475569' }}>Click amount to edit spotlight price</p>
            </motion.div>
          ))}
        </div>

        {/* Currently Promoted */}
        <div className="panel-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Currently Promoted</p>
            <span className="text-[10px]" style={{ color: '#64748B' }}>{promoted.length} total</span>
          </div>
          <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {promoted.map((p, i) => {
              const Icon = p.type === 'Doctor' ? Stethoscope : Building2;
              const iconColor = p.type === 'Doctor' ? 'text-emerald-400 bg-emerald-500/15' : 'text-violet-400 bg-violet-500/15';
              return (
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors ${!p.active ? 'opacity-50' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconColor.split(' ')[1]}`}>
                    <Icon className={`w-5 h-5 ${iconColor.split(' ')[0]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border" style={p.active ? { color: '#f59e0b', background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.2)' } : { color: '#475569', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                        {p.active ? '✦ FEATURED' : 'Expired'}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 italic" style={{ color: '#64748B' }}>"{p.tagline}"</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[10px]" style={{ color: '#64748B' }}>{p.speciality} · {p.city}</span>
                      <span className="text-[10px]" style={{ color: '#64748B' }}><Calendar className="w-3 h-3 inline mr-1" />{p.since} → {p.until}</span>
                      <span className="text-[10px] font-bold" style={{ color: '#25B89A' }}>₹{p.paid} paid</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {removeConfirm === p.id ? (
                      <>
                        <button onClick={() => remove(p.id)} className="text-[10px] font-bold px-3 py-1.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>Confirm Remove</button>
                        <button onClick={() => setRemoveConfirm(null)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center" style={{ color: '#64748B' }}><X className="w-3.5 h-3.5" /></button>
                      </>
                    ) : (
                      <button onClick={() => setRemoveConfirm(p.id)} className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
