'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PanelSidebar from '@/components/PanelSidebar';

interface ComingSoonPageProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
}

export default function ComingSoonPage({ title, description, icon: Icon }: ComingSoonPageProps) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <PanelSidebar role="super_admin" userName="Vikram Singh" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}
        >
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>{title}</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>{description ?? 'Super Admin · India Care Consultancy'}</p>
          </div>
          <Link
            href="/dashboard/super-admin"
            className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl"
            style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)', border: '1px solid rgba(37,184,154,0.2)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(18,122,106,0.12)', border: '1px solid rgba(37,184,154,0.2)' }}
            >
              {Icon ? (
                <Icon className="w-9 h-9" style={{ color: '#25B89A' }} />
              ) : (
                <Construction className="w-9 h-9" style={{ color: '#25B89A' }} />
              )}
            </div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <p className="text-sm mb-1 font-semibold" style={{ color: '#25B89A' }}>Coming Soon</p>
            <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
              This module is currently being developed and will be available in the next release. All core functionality is being built to production standards.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['Design Complete', 'Backend Integration', 'QA Testing'].map((s, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: i === 0 ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                    color: i === 0 ? '#22c55e' : '#64748B',
                    border: `1px solid ${i === 0 ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {i === 0 ? '✓' : '○'} {s}
                </span>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
