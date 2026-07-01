'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Send, Users, Stethoscope, Building2, User, Clock, CheckCircle2, Plus, X, Calendar } from 'lucide-react';

const HISTORY = [
  { id: 1, title: 'System Maintenance Notice', message: 'ICC platform will undergo scheduled maintenance on Jul 2 from 2–4 AM IST.', target: 'All', sentAt: '1 day ago', status: 'Delivered', reach: 1240 },
  { id: 2, title: 'New Feature: Online Consultations', message: 'Patients can now book online consultations directly from the website!', target: 'Patients', sentAt: '3 days ago', status: 'Delivered', reach: 820 },
  { id: 3, title: 'Profile Approval Required', message: 'Please complete your profile verification to stay listed on the platform.', target: 'Doctors', sentAt: '5 days ago', status: 'Delivered', reach: 156 },
  { id: 4, title: 'New Partnership Plans Available', message: 'Updated hospital partnership plans with more features. Check your dashboard.', target: 'Hospitals', sentAt: '1 week ago', status: 'Delivered', reach: 47 },
];

const TARGET_OPTIONS = [
  { value: 'All', label: 'All Users', icon: Users, color: 'text-sky-400' },
  { value: 'Patients', label: 'Patients Only', icon: User, color: 'text-emerald-400' },
  { value: 'Doctors', label: 'Doctors Only', icon: Stethoscope, color: 'text-violet-400' },
  { value: 'Hospitals', label: 'Hospitals Only', icon: Building2, color: 'text-amber-400' },
];

const TARGET_COLORS: Record<string, string> = { All: 'text-sky-400 bg-sky-500/12 border-sky-500/20', Patients: 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20', Doctors: 'text-violet-400 bg-violet-500/12 border-violet-500/20', Hospitals: 'text-amber-400 bg-amber-500/12 border-amber-500/20' };

export default function NotificationsPage() {
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', target: 'All', schedule: false, scheduleDate: '' });
  const [history, setHistory] = useState(HISTORY);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setHistory(prev => [{
      id: Date.now(), title: form.title, message: form.message, target: form.target,
      sentAt: 'Just now', status: 'Delivered', reach: form.target === 'All' ? 1240 : form.target === 'Patients' ? 820 : form.target === 'Doctors' ? 156 : 47,
    }, ...prev]);
    setForm({ title: '', message: '', target: 'All', schedule: false, scheduleDate: '' });
    setShowCompose(false);
    setSending(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Push Notifications</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Send targeted notifications to users, doctors and hospitals</p>
        </div>
        <button onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
          style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.25)' }}>
          <Plus className="w-3.5 h-3.5" /> New Notification
        </button>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {TARGET_OPTIONS.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="panel-card p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${t.color}`} />
                </div>
                <div>
                  <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{history.filter(h => h.target === t.value).length}</p>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>To {t.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Compose Panel */}
        <AnimatePresence>
          {showCompose && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="panel-card p-5 mb-5 overflow-hidden" style={{ border: '1px solid rgba(37,184,154,0.25)' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-sm" style={{ color: '#25B89A' }}>Compose Notification</p>
                <button onClick={() => setShowCompose(false)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center" style={{ color: '#64748B' }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Target Selection */}
              <p className="text-[10px] font-semibold mb-2" style={{ color: '#64748B' }}>Send To</p>
              <div className="flex gap-2 mb-4 flex-wrap">
                {TARGET_OPTIONS.map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.value} onClick={() => setForm(f => ({ ...f, target: t.value }))}
                      className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all"
                      style={{
                        background: form.target === t.value ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)',
                        color: form.target === t.value ? '#25B89A' : '#64748B',
                        borderColor: form.target === t.value ? 'rgba(37,184,154,0.3)' : 'rgba(255,255,255,0.08)',
                      }}>
                      <Icon className="w-3 h-3" /> {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Title */}
              <div className="mb-3">
                <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Notification Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. New Feature Available"
                  className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Message *</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3}
                  placeholder="Write your notification message…"
                  className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>

              <div className="flex gap-2">
                <button onClick={send} disabled={sending}
                  className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl transition-opacity"
                  style={{ background: 'rgba(37,184,154,0.9)', color: '#fff', opacity: sending ? 0.7 : 1 }}>
                  {sending ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {sending ? 'Sending…' : 'Send Now'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        <div className="panel-card overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Sent Notifications</p>
            <span className="text-[10px]" style={{ color: '#64748B' }}>{history.length} total</span>
          </div>
          <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {history.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{n.title}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${TARGET_COLORS[n.target]}`}>{n.target}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border text-emerald-400 bg-emerald-500/12 border-emerald-500/20 ml-auto">{n.status}</span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{n.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px]" style={{ color: '#64748B' }}><Clock className="w-3 h-3 inline mr-1" />{n.sentAt}</span>
                      <span className="text-[10px]" style={{ color: '#64748B' }}>Reached {n.reach.toLocaleString()} users</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
