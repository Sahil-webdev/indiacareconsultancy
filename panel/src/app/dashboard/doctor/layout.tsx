'use client';

import React from 'react';
import PanelSidebar from '@/components/PanelSidebar';
import SubscriptionGate from '@/components/SubscriptionGate';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionGate>
      <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
        <PanelSidebar role="doctor" userName="Dr. Ramesh Kumar" />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </SubscriptionGate>
  );
}
