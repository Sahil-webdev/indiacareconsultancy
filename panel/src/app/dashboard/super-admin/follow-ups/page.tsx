'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Search,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { panelApi } from '@/lib/api';

const STATUS_OPTIONS = ['All', 'Not Called', 'Called', 'Interested', 'Appointment Fixed', 'Not Interested'] as const;

const PRIORITY_COLORS: Record<string, string> = {
  High: 'text-red-400 bg-red-500/12 border-red-500/20',
  Medium: 'text-amber-400 bg-amber-500/12 border-amber-500/20',
  Low: 'text-sky-400 bg-sky-500/12 border-sky-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  'Not Called': 'text-slate-400 bg-slate-500/12 border-slate-500/20',
  Called: 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20',
  Interested: 'text-sky-400 bg-sky-500/12 border-sky-500/20',
  'Appointment Fixed': 'text-violet-400 bg-violet-500/12 border-violet-500/20',
  'Not Interested': 'text-rose-400 bg-rose-500/12 border-rose-500/20',
};

type FollowUp = {
  id: string;
  leadId: string | null;
  patientName: string;
  patientPhone: string;
  concern: string;
  city: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  consultantName: string;
  notes: string;
  nextFollowUp: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatSchedule(value: string | null) {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isOverdue(value: string | null, status: string) {
  if (!value) return false;
  if (['Appointment Fixed', 'Not Interested'].includes(status)) return false;
  return new Date(value).getTime() < Date.now();
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function loadFollowUps() {
    try {
      setLoading(true);
      setError('');
      const response = await panelApi<{ followUps: FollowUp[] }>('/api/follow-ups');
      setFollowUps(response.followUps || []);
      setScheduleDrafts(
        Object.fromEntries((response.followUps || []).map((item) => [item.id, item.nextFollowUp ? item.nextFollowUp.slice(0, 16) : '']))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load follow-ups');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFollowUps();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(''), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const filtered = useMemo(() => {
    return followUps.filter((item) => {
      const haystack = `${item.patientName} ${item.concern} ${item.city} ${item.consultantName}`.toLowerCase();
      const matchSearch = haystack.includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [followUps, search, statusFilter]);

  async function patchFollowUp(id: string, payload: Record<string, unknown>, message: string) {
    try {
      setSavingId(id);
      setError('');
      const response = await panelApi<{ followUp: FollowUp }>(`/api/follow-ups/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setFollowUps((prev) => prev.map((item) => (item.id === id ? response.followUp : item)));
      setScheduleDrafts((prev) => ({
        ...prev,
        [id]: response.followUp.nextFollowUp ? response.followUp.nextFollowUp.slice(0, 16) : '',
      }));
      setSuccess(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update follow-up');
    } finally {
      setSavingId(null);
    }
  }

  async function saveNote(id: string) {
    const note = (noteDrafts[id] || '').trim();
    if (!note) return;

    try {
      setSavingId(id);
      setError('');
      const response = await panelApi<{ followUp: FollowUp }>(`/api/follow-ups/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
      setFollowUps((prev) => prev.map((item) => (item.id === id ? response.followUp : item)));
      setNoteDrafts((prev) => ({ ...prev, [id]: '' }));
      setNoteOpen(null);
      setSuccess('Follow-up note saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSavingId(null);
    }
  }

  const urgentPending = followUps.filter((item) => item.priority === 'High' && item.status === 'Not Called').length;
  const overdueCount = followUps.filter((item) => isOverdue(item.nextFollowUp, item.status)).length;
  const calledCount = followUps.filter((item) => item.status === 'Called').length;
  const scheduledCount = followUps.filter((item) => item.nextFollowUp && !['Appointment Fixed', 'Not Interested'].includes(item.status)).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Follow-ups</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Live follow-up queue synced from consultation leads and team actions</p>
        </div>
        <span className="text-xs font-black px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
          {urgentPending} High Priority Pending
        </span>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        {success && (
          <div className="mb-4 rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Follow-ups', value: followUps.length, icon: Clock, color: 'bg-sky-500' },
            { label: 'Overdue', value: overdueCount, icon: AlertCircle, color: 'bg-red-500' },
            { label: 'Called', value: calledCount, icon: CheckCircle2, color: 'bg-emerald-500' },
            { label: 'Scheduled', value: scheduledCount, icon: Calendar, color: 'bg-violet-500' },
          ].map((item, index) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patient, concern, city..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className="text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all"
                style={{
                  background: statusFilter === status ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)',
                  color: statusFilter === status ? '#25B89A' : '#64748B',
                  borderColor: statusFilter === status ? 'rgba(37,184,154,0.3)' : 'rgba(255,255,255,0.08)',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="panel-card overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Clock className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No follow-ups found</p>
              <p className="text-xs mt-1" style={{ color: '#64748B' }}>Leads page se jo bhi follow-up schedule hoga, wo yahan live dikhega.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.map((item, index) => {
                const overdue = isOverdue(item.nextFollowUp, item.status);
                return (
                  <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}>
                    <div className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                        {item.patientName[0]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.patientName}</span>
                          <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>FU-{item.id}</span>
                          {item.leadId && <span className="text-[10px]" style={{ color: '#64748B' }}>Lead L{item.leadId}</span>}
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Medium}`}>
                            {item.priority}
                          </span>
                          {overdue && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-red-500/12 text-red-400 border-red-500/20">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#94A3B8' }}>
                          <Stethoscope className="w-3 h-3" />{item.concern || 'No concern added'} · {item.city || 'City pending'}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}>
                            <Phone className="w-3 h-3" />{item.patientPhone}
                          </span>
                          <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}>
                            <User className="w-3 h-3" />Assigned: {item.consultantName}
                          </span>
                          <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}>
                            <Clock className="w-3 h-3" />Next: {formatSchedule(item.nextFollowUp)}
                          </span>
                        </div>
                        {item.notes && (
                          <div className="mt-2 rounded-xl px-3 py-2 text-[11px] whitespace-pre-line" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#94A3B8' }}>
                            {item.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[170px]">
                        <select
                          value={item.status}
                          onChange={(event) => patchFollowUp(item.id, { status: event.target.value }, 'Follow-up status updated successfully')}
                          disabled={savingId === item.id}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none ${STATUS_COLORS[item.status] || STATUS_COLORS['Not Called']}`}
                          style={{ background: 'transparent' }}
                        >
                          {STATUS_OPTIONS.filter((status) => status !== 'All').map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>

                        <input
                          type="datetime-local"
                          value={scheduleDrafts[item.id] || ''}
                          onChange={(event) => setScheduleDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))}
                          onBlur={() => {
                            if ((scheduleDrafts[item.id] || '') !== (item.nextFollowUp ? item.nextFollowUp.slice(0, 16) : '')) {
                              patchFollowUp(item.id, { nextFollowUp: scheduleDrafts[item.id] || null }, 'Follow-up schedule updated successfully');
                            }
                          }}
                          className="w-full rounded-xl px-2.5 py-1.5 text-[10px]"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                        />

                        <div className="flex gap-1.5">
                          <a
                            href={`tel:${item.patientPhone}`}
                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl"
                            style={{ background: 'rgba(37,184,154,0.12)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}
                          >
                            <Phone className="w-3 h-3" /> Call
                          </a>
                          <button
                            onClick={() => {
                              setNoteOpen(noteOpen === item.id ? null : item.id);
                              setNoteDrafts((prev) => ({ ...prev, [item.id]: '' }));
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            <MessageSquare className="w-3 h-3" /> Note
                          </button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {noteOpen === item.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4 overflow-hidden"
                        >
                          <div className="rounded-xl p-3 flex gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <textarea
                              value={noteDrafts[item.id] || ''}
                              onChange={(event) => setNoteDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))}
                              rows={3}
                              placeholder="Add follow-up note..."
                              className="flex-1 text-xs resize-none focus:outline-none bg-transparent"
                              style={{ color: 'var(--text-primary)' }}
                            />
                            <div className="flex flex-col gap-1">
                              <button onClick={() => saveNote(item.id)} disabled={savingId === item.id || !(noteDrafts[item.id] || '').trim()} className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center disabled:opacity-60">
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              </button>
                              <button onClick={() => setNoteOpen(null)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                                <X className="w-3.5 h-3.5" style={{ color: '#64748B' }} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
