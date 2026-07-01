'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Plus, Edit2, Trash2, Check, X, ToggleLeft, ToggleRight, Search } from 'lucide-react';

const INITIAL_SPECIALITIES = [
  { id: 1, name: 'Cardiology', icon: '❤️', description: 'Heart and cardiovascular system', active: true, doctors: 12 },
  { id: 2, name: 'Neurology', icon: '🧠', description: 'Brain and nervous system', active: true, doctors: 8 },
  { id: 3, name: 'Orthopedics', icon: '🦴', description: 'Bones, joints and muscles', active: true, doctors: 15 },
  { id: 4, name: 'Dermatology', icon: '🧴', description: 'Skin, hair and nails', active: true, doctors: 7 },
  { id: 5, name: 'Pediatrics', icon: '👶', description: 'Children\'s health and development', active: true, doctors: 10 },
  { id: 6, name: 'Gynecology', icon: '🌸', description: 'Women\'s reproductive health', active: true, doctors: 9 },
  { id: 7, name: 'Ophthalmology', icon: '👁️', description: 'Eye care and vision', active: true, doctors: 5 },
  { id: 8, name: 'ENT', icon: '👂', description: 'Ear, nose and throat', active: true, doctors: 6 },
  { id: 9, name: 'Psychiatry', icon: '🧘', description: 'Mental health and wellness', active: false, doctors: 4 },
  { id: 10, name: 'Oncology', icon: '🔬', description: 'Cancer diagnosis and treatment', active: true, doctors: 3 },
  { id: 11, name: 'Gastroenterology', icon: '🫁', description: 'Digestive system disorders', active: true, doctors: 6 },
  { id: 12, name: 'Urology', icon: '💊', description: 'Urinary tract and kidney health', active: false, doctors: 4 },
];

type Spec = typeof INITIAL_SPECIALITIES[0];

export default function SpecialitiesPage() {
  const [specs, setSpecs] = useState<Spec[]>(INITIAL_SPECIALITIES);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ name: '', icon: '🏥', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filtered = specs.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: number) => setSpecs(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));

  const startEdit = (s: Spec) => { setEditId(s.id); setDraft({ name: s.name, icon: s.icon, description: s.description }); };

  const saveEdit = () => {
    if (!draft.name.trim()) return;
    setSpecs(prev => prev.map(s => s.id === editId ? { ...s, ...draft } : s));
    setEditId(null);
  };

  const addNew = () => {
    if (!draft.name.trim()) return;
    const newSpec: Spec = { id: Date.now(), ...draft, active: true, doctors: 0 };
    setSpecs(prev => [...prev, newSpec]);
    setDraft({ name: '', icon: '🏥', description: '' });
    setShowAdd(false);
  };

  const deleteSpec = (id: number) => { setSpecs(prev => prev.filter(s => s.id !== id)); setDeleteConfirm(null); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Medical Specialities</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Manage specialities available on the website</p>
        </div>
        <button onClick={() => { setShowAdd(true); setDraft({ name: '', icon: '🏥', description: '' }); }}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
          style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.25)' }}>
          <Plus className="w-3.5 h-3.5" /> Add Speciality
        </button>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Specialities', value: specs.length, color: 'text-sky-400' },
            { label: 'Active', value: specs.filter(s => s.active).length, color: 'text-emerald-400' },
            { label: 'Inactive', value: specs.filter(s => !s.active).length, color: 'text-slate-400' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="panel-card p-4 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search specialities…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
        </div>

        {/* Add New Form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="panel-card p-5 mb-4 overflow-hidden" style={{ border: '1px solid rgba(37,184,154,0.25)' }}>
              <p className="font-bold text-sm mb-3" style={{ color: '#25B89A' }}>Add New Speciality</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Icon (emoji)</label>
                  <input value={draft.icon} onChange={e => setDraft(d => ({ ...d, icon: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Name *</label>
                  <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Cardiology"
                    className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Description</label>
                  <input value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} placeholder="Short description"
                    className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={addNew} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => setShowAdd(false)} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="panel-card overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_2fr_80px_70px_90px] gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b"
            style={{ color: '#64748B', borderColor: 'rgba(255,255,255,0.05)' }}>
            <span>Icon</span><span>Name</span><span>Description</span><span>Doctors</span><span>Status</span><span>Actions</span>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {filtered.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                {editId === s.id ? (
                  <div className="grid grid-cols-[40px_1fr_2fr_80px_70px_90px] gap-3 px-4 py-2.5 items-center">
                    <input value={draft.icon} onChange={e => setDraft(d => ({ ...d, icon: e.target.value }))}
                      className="text-xl text-center focus:outline-none bg-transparent" style={{ color: 'var(--text-primary)' }} />
                    <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                      className="px-2 py-1 rounded-lg text-xs focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(37,184,154,0.3)', color: 'var(--text-primary)' }} />
                    <input value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                      className="px-2 py-1 rounded-lg text-xs focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(37,184,154,0.3)', color: 'var(--text-primary)' }} />
                    <span className="text-xs" style={{ color: '#64748B' }}>{s.doctors} docs</span>
                    <span />
                    <div className="flex gap-1.5">
                      <button onClick={saveEdit} className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-400" /></button>
                      <button onClick={() => setEditId(null)} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center"><X className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                ) : (
                  <div className={`grid grid-cols-[40px_1fr_2fr_80px_70px_90px] gap-3 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors ${!s.active ? 'opacity-50' : ''}`}>
                    <span className="text-xl">{s.icon}</span>
                    <span className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                    <span className="text-[11px]" style={{ color: '#94A3B8' }}>{s.description}</span>
                    <span className="text-[11px]" style={{ color: '#64748B' }}>{s.doctors} doctors</span>
                    <button onClick={() => toggle(s.id)} className="flex items-center gap-1 text-[10px] font-bold">
                      {s.active
                        ? <><ToggleRight className="w-5 h-5 text-emerald-400" /><span className="text-emerald-400">Active</span></>
                        : <><ToggleLeft className="w-5 h-5" style={{ color: '#475569' }} /><span style={{ color: '#475569' }}>Off</span></>
                      }
                    </button>
                    <div className="flex gap-1.5">
                      <button onClick={() => startEdit(s)} className="w-7 h-7 rounded-lg hover:bg-white/8 flex items-center justify-center" style={{ color: '#64748B' }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirm === s.id ? (
                        <>
                          <button onClick={() => deleteSpec(s.id)} className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-red-400" /></button>
                          <button onClick={() => setDeleteConfirm(null)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><X className="w-3.5 h-3.5" style={{ color: '#64748B' }} /></button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(s.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center" style={{ color: '#64748B' }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
