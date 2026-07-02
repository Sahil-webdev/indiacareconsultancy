'use client';

import React from 'react';
import PanelSidebar from '@/components/PanelSidebar';
import SubscriptionGate from '@/components/SubscriptionGate';
import { useDoctorIdentity } from '@/lib/panelIdentity';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { displayName } = useDoctorIdentity();

  return (
    <SubscriptionGate>
      <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
        <PanelSidebar role="doctor" userName={displayName} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </SubscriptionGate>
  );
}
