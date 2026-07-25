'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  ClipboardList,
  CreditCard,
  FileWarning,
  Flag,
  Loader2,
  RefreshCw,
  Target,
  Ticket,
  UserCheck,
  Bell,
} from 'lucide-react';
import { panelApi } from '@/lib/api';
import NotificationBell from '@/components/NotificationBell';

type Urgency = 'high' | 'medium' | 'low';

type ActionItem = {
  key: string;
  icon: string;
  label: string;
  count: number;
  urgency: Urgency;
  href: string;
  note: string;
};

type ActionSection = {
  title: string;
  color: string;
  items: ActionItem[];
};

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

const ICONS = {
  UserCheck,
  Building2,
  RefreshCw,
  ClipboardList,
  Calendar,
  CreditCard,
  Ticket,
  FileWarning,
  AlertCircle,
  Flag,
} as const;

const urgencyDot = (urgency: Urgency) => urgency === 'high' ? 'bg-red-400' : urgency === 'medium' ? 'bg-amber-400' : 'bg-emerald-400';
const urgencyText = (urgency: Urgency) => urgency === 'high' ? 'text-red-400' : urgency === 'medium' ? 'text-amber-400' : 'text-emerald-400';
const urgencyBg = (urgency: Urgency) => urgency === 'high' ? 'bg-red-400/10' : urgency === 'medium' ? 'bg-amber-400/10' : 'bg-emerald-400/10';

function categoryColor(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes('security')) return 'text-red-400 bg-red-500/10';
  if (normalized.includes('revenue')) return 'text-violet-400 bg-violet-500/10';
  if (normalized.includes('verification')) return 'text-amber-400 bg-amber-500/10';
  if (normalized.includes('operations')) return 'text-indigo-400 bg-indigo-500/10';
  return 'text-emerald-400 bg-emerald-500/10';
}

export default function ActionCentrePage() {
  const [sections, setSections] = useState<ActionSection[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadActionCentre() {
    try {
      setLoading(true);
      setError('');
      const response = await panelApi<{
        success: boolean;
        sections: ActionSection[];
        activities: ActivityItem[];
      }>('/api/action-centre/summary');
      setSections(response.sections || []);
      setActivities(response.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load action centre');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActionCentre();
  }, []);

  const totalPending = useMemo(
    () => sections.flatMap((section) => section.items).reduce((sum, item) => sum + item.count, 0),
    [sections]
  );

  const urgentCount = useMemo(
    () => sections.flatMap((section) => section.items).filter((item) => item.urgency === 'high').reduce((sum, item) => sum + item.count, 0),
    [sections]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5" style={{ color: '#25B89A' }} />
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Action Centre</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>
              Live admin work queue plus recent actions across consultant, doctor, hospital and super admin panels
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={loadActionCentre}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
            style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)', border: '1px solid rgba(37,184,154,0.2)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
            {totalPending} Total Pending
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="panel-card p-4 mb-6 flex items-start gap-3" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-400">
              {urgentCount} items currently need immediate attention
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
              Ye page ab live backend data use karta hai. Yahan pending approvals, overdue operations aur recent panel actions sab ek jagah milenge.
            </p>
          </div>
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
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
              {sections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.08 }}
                  className={`panel-card border ${section.color} overflow-hidden`}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <h2 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
                  </div>
                  <div className="flex flex-col">
                    {section.items.map((item) => {
                      const Icon = ICONS[item.icon as keyof typeof ICONS] || Bell;
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-3.5 border-b last:border-0 hover:bg-white/[0.025] transition-colors"
                          style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${urgencyBg(item.urgency)}`}>
                            <Icon className={`w-3.5 h-3.5 ${urgencyText(item.urgency)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                            <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{item.note}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot(item.urgency)}`} />
                              <span className={`text-lg font-extrabold ${urgencyText(item.urgency)}`}>{item.count}</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5" style={{ color: '#2D4150' }} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="panel-card overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div>
                  <h2 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Panel Actions</h2>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>
                    Consultant, doctor, hospital aur super admin panel ke latest successful actions
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(37,184,154,0.1)', color: '#25B89A' }}>
                  {activities.length} recent events
                </span>
              </div>

              <div className="flex flex-col">
                {activities.length === 0 ? (
                  <div className="p-8 text-center text-sm" style={{ color: '#64748B' }}>
                    Koi recent panel activity abhi record nahi hui hai.
                  </div>
                ) : (
                  activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="px-4 py-3 border-b last:border-0"
                      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{activity.actorName}</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}>
                              {activity.actorRole}
                            </span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ color: '#25B89A', background: 'rgba(37,184,154,0.10)' }}>
                              {activity.entityType}
                              {activity.entityId ? ` #${activity.entityId}` : ''}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${categoryColor(activity.category)}`}>
                              {activity.category}
                            </span>
                          </div>
                          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{activity.action}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: '#64748B' }}>
                            {activity.description || 'Action completed successfully.'}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[10px]" style={{ color: '#64748B' }}>
                            <span>{activity.timeAgo || new Date(activity.createdAt).toLocaleString('en-IN')}</span>
                            {activity.device && <span className="truncate max-w-[320px]">{activity.device}</span>}
                          </div>
                        </div>
                        {activity.dashboardHref ? (
                          <Link
                            href={activity.dashboardHref}
                            className="text-[10px] font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
                            style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)', border: '1px solid rgba(37,184,154,0.18)' }}
                          >
                            Open
                          </Link>
                        ) : null}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
