'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Plus, Edit2, Trash2, Check, X,
  ToggleLeft, ToggleRight, Search, Loader2, AlertCircle,
  Tag, RefreshCw, Sparkles,
} from 'lucide-react';
import { panelApi } from '@/lib/api';

// ── 10-colour preset palette (maps to website gradients)
const COLOR_PRESETS = [
  { label: 'Rose',    from: '#f43f5e', to: '#dc2626' },
  { label: 'Violet',  from: '#8b5cf6', to: '#7c3aed' },
  { label: 'Amber',   from: '#f59e0b', to: '#ea580c' },
  { label: 'Pink',    from: '#ec4899', to: '#c026d3' },
  { label: 'Emerald', from: '#10b981', to: '#0d9488' },
  { label: 'Sky',     from: '#0ea5e9', to: '#2563eb' },
  { label: 'Cyan',    from: '#06b6d4', to: '#0d9488' },
  { label: 'Indigo',  from: '#6366f1', to: '#1d4ed8' },
  { label: 'Slate',   from: '#64748b', to: '#334155' },
  { label: 'Orange',  from: '#f97316', to: '#ef4444' },
];

type Speciality = {
  id: number;
  name: string;
  icon: string;
  description: string;
  symptoms: string[];
  color_preset: number;
  doctor_count: number;
  is_active: boolean;
};

type Draft = {
  name: string;
  icon: string;
  description: string;
  symptoms: string[];
  color_preset: number;
};

const EMPTY_DRAFT: Draft = { name: '', icon: '🏥', description: '', symptoms: [], color_preset: 0 };

// ── Tag Input component ──────────────────────────────────
function SymptomTagInput({ value, onChange, onAutoFill, specName }: {
  value: string[];
  onChange: (tags: string[]) => void;
  onAutoFill: () => void;
  specName: string;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const removeTag = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-semibold" style={{ color: '#64748B' }}>
          Common Symptoms <span className="text-[9px]">(press Enter or comma to add)</span>
        </label>
        {specName.trim() && (
          <button type="button" onClick={onAutoFill}
            className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-lg"
            style={{ background: 'rgba(37,184,154,0.1)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
            <Sparkles className="w-2.5 h-2.5" /> Auto-fill
          </button>
        )}
      </div>
      <div
        className="flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-xl min-h-[42px] cursor-text"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg"
            style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
            <Tag className="w-2.5 h-2.5" />
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="ml-0.5 opacity-70 hover:opacity-100">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={addTag}
          placeholder={value.length === 0 ? 'Type a symptom…' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-xs focus:outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────
export default function SpecialitiesPage() {
  const [specs, setSpecs]             = useState<Speciality[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [showAdd, setShowAdd]         = useState(false);
  const [editId, setEditId]           = useState<number | null>(null);
  const [draft, setDraft]             = useState<Draft>(EMPTY_DRAFT);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState('');

  // ── Load from API
  const loadSpecs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await panelApi<{ success: boolean; specialities: Speciality[] }>('/api/specialities/all');
      setSpecs(res.specialities);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load specialities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadSpecs(); }, [loadSpecs]);

  // ── Auto-fill symptoms from API suggest
  const autoFillSymptoms = async (name: string) => {
    try {
      const res = await panelApi<{ success: boolean; symptoms: string[] }>(`/api/specialities/suggest?name=${encodeURIComponent(name)}`);
      if (res.symptoms.length) setDraft(d => ({ ...d, symptoms: res.symptoms }));
    } catch { /* silent */ }
  };

  const filtered = specs.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  // ── Toggle active
  const toggle = async (id: number) => {
    try {
      const res = await panelApi<{ success: boolean; is_active: boolean }>(`/api/specialities/${id}/toggle`, { method: 'PATCH' });
      setSpecs(prev => prev.map(s => s.id === id ? { ...s, is_active: res.is_active } : s));
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed to toggle'); }
  };

  // ── Start edit
  const startEdit = (s: Speciality) => {
    setEditId(s.id);
    setDraft({ name: s.name, icon: s.icon, description: s.description, symptoms: [...s.symptoms], color_preset: s.color_preset });
    setSaveError('');
  };

  // ── Save edit
  const saveEdit = async () => {
    if (!draft.name.trim()) { setSaveError('Name is required'); return; }
    setSaving(true); setSaveError('');
    try {
      const res = await panelApi<{ success: boolean; speciality: Speciality }>(`/api/specialities/${editId}`, {
        method: 'PUT', body: JSON.stringify(draft),
      });
      setSpecs(prev => prev.map(s => s.id === editId ? res.speciality : s));
      setEditId(null);
    } catch (e) { setSaveError(e instanceof Error ? e.message : 'Failed to save'); }
    finally { setSaving(false); }
  };

  // ── Add new
  const addNew = async () => {
    if (!draft.name.trim()) { setSaveError('Name is required'); return; }
    setSaving(true); setSaveError('');
    try {
      const res = await panelApi<{ success: boolean; speciality: Speciality }>('/api/specialities', {
        method: 'POST', body: JSON.stringify({ ...draft, is_active: true }),
      });
      setSpecs(prev => [...prev, res.speciality]);
      setDraft(EMPTY_DRAFT);
      setShowAdd(false);
    } catch (e) { setSaveError(e instanceof Error ? e.message : 'Failed to create'); }
    finally { setSaving(false); }
  };

  // ── Delete
  const deleteSpec = async (id: number) => {
    try {
      await panelApi(`/api/specialities/${id}`, { method: 'DELETE' });
      setSpecs(prev => prev.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed to delete'); }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Medical Specialities</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Manage specialities shown on the website</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadSpecs} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setShowAdd(true); setDraft(EMPTY_DRAFT); setSaveError(''); }}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
            style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.25)' }}>
            <Plus className="w-3.5 h-3.5" /> Add Speciality
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Specialities', value: specs.length,                      color: 'text-sky-400' },
            { label: 'Active',             value: specs.filter(s => s.is_active).length,  color: 'text-emerald-400' },
            { label: 'Inactive',           value: specs.filter(s => !s.is_active).length, color: 'text-slate-400' },
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
              <p className="font-bold text-sm mb-4" style={{ color: '#25B89A' }}>Add New Speciality</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Icon (emoji)</label>
                  <input value={draft.icon} onChange={e => setDraft(d => ({ ...d, icon: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-lg text-center focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Name *</label>
                  <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Cardiology"
                    className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Card Colour</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {COLOR_PRESETS.map((c, idx) => (
                      <button key={idx} type="button" onClick={() => setDraft(d => ({ ...d, color_preset: idx }))}
                        title={c.label}
                        className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                          outline: draft.color_preset === idx ? '2px solid white' : '2px solid transparent',
                          outlineOffset: '1px',
                        }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Description</label>
                <textarea value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                  placeholder="Short description shown on the speciality card…" rows={2}
                  className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div className="mb-4">
                <SymptomTagInput
                  value={draft.symptoms}
                  onChange={tags => setDraft(d => ({ ...d, symptoms: tags }))}
                  specName={draft.name}
                  onAutoFill={() => autoFillSymptoms(draft.name)}
                />
              </div>
              {saveError && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 mb-3">
                  <AlertCircle className="w-3.5 h-3.5" /> {saveError}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={addNew} disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#25B89A' }} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-2 text-sm text-red-400 py-6">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="panel-card overflow-hidden">
            <div className="grid gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b"
              style={{ gridTemplateColumns: '40px 1fr 2fr auto 70px 90px', color: '#64748B', borderColor: 'rgba(255,255,255,0.05)' }}>
              <span>Icon</span><span>Name</span><span>Description &amp; Symptoms</span><span>Doctors</span><span>Status</span><span>Actions</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.length === 0 && (
                <p className="text-xs text-center py-10" style={{ color: '#64748B' }}>No specialities found</p>
              )}
              {filtered.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  {editId === s.id ? (
                    /* ── Edit Row ── */
                    <div className="px-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Icon</label>
                          <input value={draft.icon} onChange={e => setDraft(d => ({ ...d, icon: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-xl text-lg text-center focus:outline-none"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(37,184,154,0.3)', color: 'var(--text-primary)' }} />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Name *</label>
                          <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-xl text-xs focus:outline-none"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(37,184,154,0.3)', color: 'var(--text-primary)' }} />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Card Colour</label>
                          <div className="flex gap-1.5 flex-wrap mt-1">
                            {COLOR_PRESETS.map((c, idx) => (
                              <button key={idx} type="button" onClick={() => setDraft(d => ({ ...d, color_preset: idx }))}
                                title={c.label}
                                className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                                style={{
                                  background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                                  outline: draft.color_preset === idx ? '2px solid white' : '2px solid transparent',
                                  outlineOffset: '1px',
                                }} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Description</label>
                        <textarea value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} rows={2}
                          className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none resize-none"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(37,184,154,0.3)', color: 'var(--text-primary)' }} />
                      </div>
                      <div className="mb-3">
                        <SymptomTagInput
                          value={draft.symptoms}
                          onChange={tags => setDraft(d => ({ ...d, symptoms: tags }))}
                          specName={draft.name}
                          onAutoFill={() => autoFillSymptoms(draft.name)}
                        />
                      </div>
                      {saveError && <p className="text-xs text-red-400 mb-2">{saveError}</p>}
                      <div className="flex gap-2">
                        <button onClick={saveEdit} disabled={saving}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                        </button>
                        <button onClick={() => { setEditId(null); setSaveError(''); }}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── View Row ── */
                    <div className={`grid gap-3 px-4 py-3 items-start hover:bg-white/[0.02] transition-colors ${!s.is_active ? 'opacity-50' : ''}`}
                      style={{ gridTemplateColumns: '40px 1fr 2fr auto 70px 90px' }}>
                      <span className="text-xl mt-0.5">{s.icon}</span>
                      <div>
                        <p className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>{s.doctor_count} doctors</p>
                      </div>
                      <div>
                        <p className="text-[11px] leading-relaxed mb-1.5" style={{ color: '#94A3B8' }}>{s.description || '—'}</p>
                        {s.symptoms && s.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {s.symptoms.slice(0, 4).map((sym, si) => (
                              <span key={si} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                                style={{ background: 'rgba(37,184,154,0.1)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.15)' }}>
                                {sym}
                              </span>
                            ))}
                            {s.symptoms.length > 4 && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md" style={{ color: '#64748B' }}>
                                +{s.symptoms.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div
                        className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${COLOR_PRESETS[s.color_preset]?.from ?? '#64748b'}, ${COLOR_PRESETS[s.color_preset]?.to ?? '#334155'})` }}
                        title={COLOR_PRESETS[s.color_preset]?.label}
                      />
                      <button onClick={() => toggle(s.id)} className="flex items-center gap-1 text-[10px] font-bold">
                        {s.is_active
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
        )}
      </main>
    </div>
  );
}
