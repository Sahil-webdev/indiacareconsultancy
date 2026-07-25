'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileWarning,
  Loader2,
  Mail,
  Search,
} from 'lucide-react';
import { panelApi } from '@/lib/api';

type ExpiringRecord = {
  id: string;
  rowId: string;
  entityType: string;
  entityId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerUserId: string | null;
  recordType: string;
  label: string;
  expiresOn: string;
  daysLeft: number;
  urgency: string;
  fileUrl: string | null;
};

const statusInfo: Record<string, { badge: string; bar: string }> = {
  Critical: { badge: 'bg-red-500/15 text-red-400 border border-red-500/20', bar: '#ef4444' },
  Warning: { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/20', bar: '#f59e0b' },
  Moderate: { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/20', bar: '#f97316' },
  Low: { badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', bar: '#22c55e' },
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ExpiringDocsPage() {
  const [records, setRecords] = useState<ExpiringRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadRecords() {
    try {
      setLoading(true);
      const response = await panelApi<{ records: ExpiringRecord[] }>('/api/expiring-docs');
      setRecords(response.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expiring records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(''), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const filtered = useMemo(() => records.filter((record) => {
    const haystack = `${record.ownerName} ${record.label} ${record.recordType}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  }), [records, search]);

  async function sendReminder(record: ExpiringRecord) {
    try {
      setSendingId(record.id);
      await panelApi(`/api/expiring-docs/${record.recordType}/${record.entityType}/${record.entityId}/${record.rowId}/remind`, {
        method: 'POST',
      });
      setSuccess('Reminder sent successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reminder');
    } finally {
      setSendingId(null);
    }
  }

  const criticalCount = records.filter((record) => record.urgency === 'Critical').length;
  const warningCount = records.filter((record) => record.urgency === 'Warning').length;
  const moderateCount = records.filter((record) => record.urgency === 'Moderate').length;
  const lowCount = records.filter((record) => record.urgency === 'Low').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Expiring Documents</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Verification documents and subscription renewals expiring in the next 45 days</p>
        </div>
        <span className="text-xs font-black px-3 py-1.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">{records.length} expiring</span>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        {success && <div className="mb-4 rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>{success}</div>}
        {error && <div className="mb-4 rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>{error}</div>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: AlertCircle, label: 'Critical (≤7 days)', value: criticalCount, color: 'bg-red-500' },
            { icon: FileWarning, label: 'Warning (8–14 days)', value: warningCount, color: 'bg-amber-500' },
            { icon: Clock, label: 'Moderate (15–30 days)', value: moderateCount, color: 'bg-orange-500' },
            { icon: CheckCircle2, label: 'Low (31–45 days)', value: lowCount, color: 'bg-emerald-500' },
          ].map((item) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel-card p-4 flex items-center gap-3">
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

        <div className="panel-card overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
              <input
                type="text"
                placeholder="Search by owner or expiry type..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              />
            </div>
            <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} records</span>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Owner', 'Type', 'Expires On', 'Days Left', 'Urgency', 'Actions'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => {
                    const info = statusInfo[record.urgency] || statusInfo.Low;
                    return (
                      <tr key={record.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{record.ownerName}</p>
                          <p className="text-[10px]" style={{ color: '#64748B' }}>{record.entityType} · {record.recordType === 'subscription' ? 'Subscription' : 'Document'}</p>
                        </td>
                        <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{record.label}</td>
                        <td className="px-4 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{formatDate(record.expiresOn)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <div className="h-full rounded-full" style={{ background: info.bar, width: `${Math.max(8, 100 - (record.daysLeft / 45) * 100)}%` }} />
                            </div>
                            <span className="font-bold" style={{ color: info.bar }}>{record.daysLeft}d</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${info.badge}`}>{record.urgency}</span></td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => sendReminder(record)}
                              disabled={sendingId === record.id}
                              className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg disabled:opacity-60"
                              style={{ background: 'rgba(37,184,154,0.1)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}
                            >
                              <Mail className="w-3 h-3" /> {sendingId === record.id ? 'Sending...' : 'Remind'}
                            </button>
                            <button
                              onClick={() => {
                                if (record.fileUrl) window.open(record.fileUrl, '_blank', 'noopener,noreferrer');
                              }}
                              disabled={!record.fileUrl}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 disabled:opacity-40"
                              style={{ color: '#64748B' }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
