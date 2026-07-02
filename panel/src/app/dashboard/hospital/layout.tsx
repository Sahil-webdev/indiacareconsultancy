'use client';

import React from 'react';
import PanelSidebar from '@/components/PanelSidebar';
import HospitalSubscriptionGate from '@/components/HospitalSubscriptionGate';
import { useHospitalIdentity } from '@/lib/panelIdentity';

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  const { displayName } = useHospitalIdentity();

  return (
    <HospitalSubscriptionGate>
      <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
        <PanelSidebar role="hospital" userName={displayName} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </HospitalSubscriptionGate>
  );
}
