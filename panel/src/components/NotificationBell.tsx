'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { panelApi } from '@/lib/api';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  category: string;
  actionUrl: string | null;
  createdAt: string;
  isRead: boolean;
};

function timeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadNotifications() {
    try {
      setLoading(true);
      const response = await panelApi<{
        success: boolean;
        notifications: NotificationItem[];
        unreadCount: number;
      }>('/api/notifications?limit=10');
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadIds = useMemo(
    () => notifications.filter((item) => !item.isRead).map((item) => item.id),
    [notifications]
  );

  async function markAsRead(id: string) {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
    setUnreadCount((current) => Math.max(0, current - 1));
    try {
      await panelApi(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch {
      loadNotifications();
    }
  }

  async function handleOpenItem(item: NotificationItem) {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    if (item.actionUrl) {
      router.push(item.actionUrl);
    }
    setOpen(false);
  }

  async function markAllRead() {
    if (!unreadIds.length) return;
    setMarkingAll(true);
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await panelApi('/api/notifications/read-all', { method: 'POST' });
    } catch {
      loadNotifications();
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((current) => !current)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center border transition-colors"
        style={{
          borderColor: open ? 'rgba(37,184,154,0.35)' : 'rgba(255,255,255,0.08)',
          background: open ? 'rgba(37,184,154,0.08)' : 'rgba(255,255,255,0.04)',
        }}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" style={{ color: open ? '#25B89A' : '#64748B' }} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 z-50 rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', width: 360 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" style={{ color: '#25B89A' }} />
                <span className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={loadNotifications} className="text-[10px] font-bold" style={{ color: '#25B89A' }}>
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-[10px]" style={{ color: '#64748B' }}>Latest account and review updates</span>
              <button
                onClick={markAllRead}
                disabled={!unreadIds.length || markingAll}
                className="text-[10px] font-bold disabled:opacity-50"
                style={{ color: '#25B89A' }}
              >
                {markingAll ? 'Updating...' : 'Mark all read'}
              </button>
            </div>

            <div className="overflow-y-auto panel-scroll" style={{ maxHeight: 360 }}>
              {loading ? (
                <div className="px-4 py-8 text-center text-xs" style={{ color: '#64748B' }}>Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs" style={{ color: '#64748B' }}>No notifications yet.</div>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleOpenItem(item)}
                    className="w-full text-left flex items-start gap-3 px-4 py-3 border-b transition-colors hover:bg-white/[0.02]"
                    style={{
                      borderColor: 'rgba(255,255,255,0.04)',
                      background: item.isRead ? 'transparent' : 'rgba(37,184,154,0.03)',
                    }}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.isRead ? 'bg-white/5' : 'bg-emerald-500/12'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: item.isRead ? '#64748B' : '#25B89A' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                        {!item.isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-[10px] mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{timeAgo(item.createdAt)}</span>
                        {item.actionUrl && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)' }}>
                            Open
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
