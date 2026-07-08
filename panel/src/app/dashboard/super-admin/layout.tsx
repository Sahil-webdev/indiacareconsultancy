'use client';

import PanelSidebar from '@/components/PanelSidebar';
import PanelRouteGuard from '@/components/PanelRouteGuard';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelRouteGuard allowedRoles={['super_admin']}>
      <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
        <PanelSidebar role="super_admin" userName="Vikram Singh" />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </PanelRouteGuard>
  );
}
