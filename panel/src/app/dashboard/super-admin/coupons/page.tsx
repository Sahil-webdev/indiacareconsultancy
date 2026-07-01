'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Trash2, Check, X, Copy, ToggleLeft, ToggleRight, User, Stethoscope, Building2 } from 'lucide-react';

const INITIAL_COUPONS = [
  { id: 1, code: 'WELCOME50', discount: 50, type: 'Percentage', target: 'Patients', maxUses: 100, used: 23, expiry: '2025-08-31', active: true },
  { id: 2, code: 'DOCJOIN300', discount: 300, type: 'Flat', target: 'Doctors', maxUses: 50, used: 12, expiry: '2025-07-31', active: true },
  { id: 3, code: 'HOSP2025', discount: 25, type: 'Percentage', target: 'Hospitals', maxUses: 20, used: 8, expiry: '2025-09-30', active: true },
  { id: 4, code: 'HEALTH20', discount: 20, type: 'Percentage', target: 'Patients', maxUses: 200, used: 200, expiry: '2025-06-30', active: false },
];

const TARGET_ICON: Record<string, React.ElementType> = { Patients: User, Doctors: Stethoscope, Hospitals: Building2 };
const TARGET_COLOR: Record<string, string> = { Patients: 'text-sky-400', Doctors: 'text-emerald-400', Hospitals: 'text-violet-400' };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [showAdd, setShowAdd] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [draft, setDraft] = useState({ code: '', discount: '', type: 'Percentage', target: 'Patients', maxUses: '', expiry: '' });

  const toggle = (id: number) => setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const del = (id: number) => setCoupons(prev => prev.filter(c => c.id !== id));
  const copy = (code: string) => { navigator.clipboard.writeText(code).catch(() => {}); setCopied(code); setTimeout(() => setCopied(null), 1500); };

  const addCoupon = () => {
    if (!draft.code || !draft.discount || !draft.maxUses || !draft.expiry) return;
    setCoupons(prev => [...prev, { id: Date.now(), code: draft.code.toUpperCase(), discount: +draft.discount, type: draft.type as any, target: draft.target, maxUses: +draft.maxUses, used: 0, expiry: draft.expiry, active: true }]);
    setDraft({ code: '', discount: '', type: 'Percentage', target: 'Patients', maxUses: '', expiry: '' });
    setShowAdd(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Coupons & Discounts</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Create promotional codes for patients, doctors and hospitals</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl" style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.25)' }}>
          <Plus className="w-3.5 h-3.5" /> Create Coupon
        </button>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ label: 'Total Coupons', value: coupons.length }, { label: 'Active', value: coupons.filter(c => c.active).length }, { label: 'Total Uses', value: coupons.reduce((a, c) => a + c.used, 0) }].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="panel-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center"><Tag className="w-4 h-4 text-amber-400" /></div>
              <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="panel-card p-5 mb-4 overflow-hidden" style={{ border: '1px solid rgba(37,184,154,0.25)' }}>
              <p className="font-bold text-sm mb-3" style={{ color: '#25B89A' }}>Create New Coupon</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[{ key: 'code', label: 'Coupon Code *', placeholder: 'SAVE50' }, { key: 'discount', label: 'Discount *', placeholder: '50' }, { key: 'maxUses', label: 'Max Uses *', placeholder: '100' }, { key: 'expiry', label: 'Expiry Date *', placeholder: '', inputType: 'date' }].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>{f.label}</label>
                    <input type={f.inputType ?? 'text'} value={(draft as any)[f.key]} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))} placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Type</label>
                  <select value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                    <option>Percentage</option><option>Flat</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Target</label>
                  <select value={draft.target} onChange={e => setDraft(d => ({ ...d, target: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                    <option>Patients</option><option>Doctors</option><option>Hospitals</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={addCoupon} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}><Check className="w-3.5 h-3.5" /> Save</button>
                <button onClick={() => setShowAdd(false)} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}><X className="w-3.5 h-3.5" /> Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="panel-card overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_80px_90px_80px_80px_80px] gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b" style={{ color: '#64748B', borderColor: 'rgba(255,255,255,0.05)' }}>
            <span>Code</span><span>Discount</span><span>For</span><span>Usage</span><span>Expiry</span><span>Status</span><span>Actions</span>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {coupons.map((c, i) => {
              const Icon = TARGET_ICON[c.target];
              const expired = new Date(c.expiry) < new Date();
              return (
                <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className={`grid grid-cols-[1fr_80px_80px_90px_80px_80px_80px] gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors ${!c.active || expired ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-extrabold tracking-wider px-2.5 py-1 rounded-lg" style={{ background: 'rgba(37,184,154,0.1)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>{c.code}</code>
                    <button onClick={() => copy(c.code)} className="w-5 h-5 rounded flex items-center justify-center" style={{ color: copied === c.code ? '#22c55e' : '#475569' }}>
                      {copied === c.code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{c.type === 'Percentage' ? `${c.discount}%` : `₹${c.discount}`}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold ${TARGET_COLOR[c.target]}`}><Icon className="w-3 h-3" />{c.target}</span>
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-0.5" style={{ color: '#64748B' }}><span>{c.used}/{c.maxUses}</span></div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min((c.used / c.maxUses) * 100, 100)}%`, background: c.used >= c.maxUses ? '#f87171' : '#25B89A' }} />
                    </div>
                  </div>
                  <span className="text-[10px]" style={{ color: expired ? '#f87171' : '#64748B' }}>{c.expiry}</span>
                  <button onClick={() => toggle(c.id)}>
                    {c.active && !expired ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6" style={{ color: '#475569' }} />}
                  </button>
                  <button onClick={() => del(c.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center" style={{ color: '#64748B' }}><Trash2 className="w-3.5 h-3.5" /></button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
