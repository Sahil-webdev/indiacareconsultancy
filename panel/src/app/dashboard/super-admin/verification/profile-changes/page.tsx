'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  GitCompare,
  Loader2,
  RefreshCw,
  Search,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { panelApi } from '@/lib/api';
import NotificationBell from '@/components/NotificationBell';

type ChangeStatus = 'Pending' | 'Approved' | 'Rejected';

type ChangeField = {
  id: string;
  fieldName: string;
  label: string;
  oldValue: string | null;
  newValue: string;
};

type ChangeRequestGroup = {
  id: string;
  entityType: 'doctor' | 'hospital';
  entityId: string;
  entityName: string;
  entityUserId: string | null;
  status: ChangeStatus;
  createdAt: string;
  reviewedAt: string | null;
  fields: ChangeField[];
};

function prettyDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatValue(value: string | null) {
  if (!value) return 'Not provided';
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.length ? parsed.join(', ') : 'Not provided';
    }
  } catch {
    return value;
  }
  return value;
}

export default function ProfileChangesPage() {
  const [pending, setPending] = useState<ChangeRequestGroup[]>([]);
  const [history, setHistory] = useState<ChangeRequestGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ChangeStatus | 'All'>('All');
  const [rowLoading, setRowLoading] = useState<Record<string, 'approved' | 'rejected'>>({});
  const [error, setError] = useState('');

  async function loadRequests() {
    try {
      setLoading(true);
      setError('');
      const response = await panelApi<{
        success: boolean;
        pending: ChangeRequestGroup[];
        history: ChangeRequestGroup[];
      }>('/api/profile-change-requests');
      setPending(response.pending || []);
      setHistory(response.history || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile change requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleDecision(item: ChangeRequestGroup, decision: 'approved' | 'rejected') {
    setRowLoading((current) => ({ ...current, [item.id]: decision }));
    try {
      await panelApi(`/api/profile-change-requests/${item.entityType}/${item.entityId}`, {
        method: 'PATCH',
        body: JSON.stringify({ decision }),
      });
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setRowLoading((current) => {
        const updated = { ...current };
        delete updated[item.id];
        return updated;
      });
    }
  }

  const allRequests = useMemo(() => {
    const data = [...pending, ...history];
    return data.filter((item) => {
      const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
      const haystack = `${item.entityName} ${item.fields.map((field) => field.label).join(' ')}`.toLowerCase();
      return matchesStatus && haystack.includes(search.toLowerCase());
    });
  }, [pending, history, filterStatus, search]);

  const stats = {
    pending: pending.length,
    approved: history.filter((item) => item.status === 'Approved').length,
    rejected: history.filter((item) => item.status === 'Rejected').length,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}
      >
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Profile Change Requests</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>
            Review doctor and hospital profile updates, then approve or roll them back.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={loadRequests}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
            {stats.pending} Pending Review
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-500' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'bg-emerald-500' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl mb-5" style={{ background: 'rgba(37,184,154,0.06)', border: '1px solid rgba(37,184,154,0.15)' }}>
          <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            Doctor and hospital edits are saved instantly so they can continue working. If you reject a request here,
            the previous profile data is automatically restored everywhere and the requester gets a notification.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by entity or field..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            />
          </div>
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all"
              style={{
                background: filterStatus === status ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)',
                color: filterStatus === status ? '#25B89A' : '#64748B',
                borderColor: filterStatus === status ? 'rgba(37,184,154,0.3)' : 'rgba(255,255,255,0.08)',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-2xl px-4 py-3 mb-4 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="panel-card p-10 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
          </div>
        ) : allRequests.length === 0 ? (
          <div className="panel-card p-10 text-center">
            <GitCompare className="w-8 h-8 mx-auto mb-3" style={{ color: '#25B89A' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No profile change requests found.</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>New doctor or hospital profile edits will appear here automatically.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {allRequests.map((item, index) => {
              const isDoctor = item.entityType === 'doctor';
              const loadingState = rowLoading[item.id];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="panel-card p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDoctor ? 'bg-emerald-500/15' : 'bg-violet-500/15'}`}>
                        {isDoctor ? <Stethoscope className="w-4 h-4 text-emerald-400" /> : <Building2 className="w-4 h-4 text-violet-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.entityName}</span>
                          <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>{item.entityType.toUpperCase()}-{item.entityId}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${isDoctor ? 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20' : 'text-violet-400 bg-violet-500/12 border-violet-500/20'}`}>
                            {isDoctor ? 'Doctor' : 'Hospital'}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              item.status === 'Pending'
                                ? 'text-amber-400 bg-amber-500/12 border-amber-500/20'
                                : item.status === 'Approved'
                                  ? 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20'
                                  : 'text-red-400 bg-red-500/12 border-red-500/20'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <p className="text-[10px] mt-1.5" style={{ color: '#64748B' }}>
                          {item.status === 'Pending' ? 'Requested' : 'Reviewed'} on {prettyDate(item.reviewedAt || item.createdAt)}
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                          {item.fields.map((field) => (
                            <div key={field.id} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <p className="text-[10px] font-bold mb-2" style={{ color: '#25B89A' }}>{field.label}</p>
                              <div className="grid grid-cols-1 gap-2">
                                <div className="rounded-xl p-2.5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                                  <p className="text-[9px] font-bold mb-1 text-red-400">Previous Value</p>
                                  <p className="text-[11px]" style={{ color: '#94A3B8' }}>{formatValue(field.oldValue)}</p>
                                </div>
                                <div className="rounded-xl p-2.5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                                  <p className="text-[9px] font-bold mb-1 text-emerald-400">Current Requested Value</p>
                                  <p className="text-[11px]" style={{ color: '#94A3B8' }}>{formatValue(field.newValue)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {item.status === 'Pending' && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleDecision(item, 'approved')}
                          disabled={Boolean(loadingState)}
                          className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-xl disabled:opacity-60"
                          style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
                        >
                          {loadingState === 'approved' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Approve All
                        </button>
                        <button
                          onClick={() => handleDecision(item, 'rejected')}
                          disabled={Boolean(loadingState)}
                          className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-xl disabled:opacity-60"
                          style={{ background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.18)' }}
                        >
                          {loadingState === 'rejected' ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                          Reject & Roll Back
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
