'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Filter,
  Loader2,
  LogIn,
  MessageSquare,
  RefreshCw,
  Stethoscope,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { panelApi } from '@/lib/api';
import NotificationBell from '@/components/NotificationBell';

type ActivityItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorName: string;
  actorRole: string;
  createdAt: string;
  timeAgo: string | null;
  description: string | null;
  category: string;
  dashboardHref: string | null;
  device: string | null;
};

const CATEGORY_OPTIONS = ['All', 'Security', 'Verification', 'Operations', 'Revenue', 'General'];

const CATEGORY_ICONS = {
  Security: LogIn,
  Verification: UserCheck,
  Operations: ClipboardList,
  Revenue: CreditCard,
  General: Bell,
} as const;

function resolveVisuals(category: string, entityType: string) {
  const normalizedCategory = category.toLowerCase();
  const normalizedEntity = entityType.toLowerCase();

  if (normalizedCategory.includes('security')) return { icon: LogIn, color: 'bg-slate-500/20 text-slate-300' };
  if (normalizedCategory.includes('verification')) {
    if (normalizedEntity.includes('hospital')) return { icon: Building2, color: 'bg-violet-500/20 text-violet-400' };
    if (normalizedEntity.includes('doctor')) return { icon: Stethoscope, color: 'bg-emerald-500/20 text-emerald-400' };
    return { icon: UserCheck, color: 'bg-sky-500/20 text-sky-400' };
  }
  if (normalizedCategory.includes('operations')) {
    if (normalizedEntity.includes('appointment')) return { icon: Calendar, color: 'bg-emerald-500/20 text-emerald-400' };
    if (normalizedEntity.includes('lead')) return { icon: ClipboardList, color: 'bg-amber-500/20 text-amber-400' };
    return { icon: Users, color: 'bg-indigo-500/20 text-indigo-400' };
  }
  if (normalizedCategory.includes('revenue')) return { icon: CreditCard, color: 'bg-violet-500/20 text-violet-400' };
  if (normalizedEntity.includes('doctor')) return { icon: Stethoscope, color: 'bg-emerald-500/20 text-emerald-400' };
  if (normalizedEntity.includes('hospital')) return { icon: Building2, color: 'bg-violet-500/20 text-violet-400' };
  return { icon: Activity, color: 'bg-teal-500/20 text-teal-400' };
}

export default function LiveActivityPage() {
  const [events, setEvents] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadEvents(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const query = filter === 'All'
        ? '/api/action-centre/activities?limit=80'
        : `/api/action-centre/activities?limit=80&category=${encodeURIComponent(filter)}`;

      const response = await panelApi<{ success: boolean; activities: ActivityItem[] }>(query);
      setEvents(response.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load live activity');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, [filter]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadEvents({ silent: true });
    }, 15000);
    return () => window.clearInterval(interval);
  }, [filter]);

  const stats = useMemo(() => {
    const verification = events.filter((event) => event.category === 'Verification').length;
    const operations = events.filter((event) => event.category === 'Operations').length;
    const security = events.filter((event) => event.category === 'Security').length;
    const revenue = events.filter((event) => event.category === 'Revenue').length;
    return { verification, operations, security, revenue };
  }, [events]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5" style={{ color: '#25B89A' }} />
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Live Activity</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>
              Real panel activity stream for consultant, doctor, hospital and super admin actions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={() => loadEvents({ silent: true })}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
            style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)', border: '1px solid rgba(37,184,154,0.2)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}>
              {events.length} events
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Verification', value: stats.verification, icon: UserCheck, color: 'bg-amber-500' },
            { label: 'Operations', value: stats.operations, icon: ClipboardList, color: 'bg-indigo-500' },
            { label: 'Revenue', value: stats.revenue, icon: CreditCard, color: 'bg-violet-500' },
            { label: 'Security', value: stats.security, icon: AlertTriangle, color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORY_OPTIONS.map((category) => {
            const CategoryIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Filter;
            return (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5"
                style={filter === category
                  ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                  : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <CategoryIcon className="w-3 h-3" />
                {category}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="rounded-2xl px-4 py-3 mb-4 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="panel-card p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <AnimatePresence mode="popLayout">
              {events.map((event) => {
                const visual = resolveVisuals(event.category, event.entityType);
                const Icon = visual.icon;

                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, x: -12, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border hover:bg-white/[0.02] transition-colors"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${visual.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{event.action}</p>
                        <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: '#64748B' }}>
                          {event.category}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(37,184,154,0.08)', color: '#25B89A' }}>
                          {event.entityType}
                          {event.entityId ? ` #${event.entityId}` : ''}
                        </span>
                      </div>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: '#64748B' }}>
                        {(event.description || `${event.actorName} performed an action`) + ` · ${event.actorName} (${event.actorRole})`}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: '#64748B' }}>
                        <span>{event.timeAgo || new Date(event.createdAt).toLocaleString('en-IN')}</span>
                        {event.device ? <span className="truncate max-w-[320px]">{event.device}</span> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {event.dashboardHref ? (
                        <Link
                          href={event.dashboardHref}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                          style={{ color: '#25B89A', background: 'rgba(37,184,154,0.10)' }}
                        >
                          Open
                        </Link>
                      ) : null}
                      <span className="text-[10px]" style={{ color: '#64748B' }}>{event.timeAgo}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {events.length === 0 && (
              <div className="panel-card p-12 text-center">
                <Activity className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>No live activity found</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {filter === 'All' ? 'Panel activity yahan automatically dikhne lagegi.' : `Abhi ${filter} category me koi recent event nahi hai.`}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
