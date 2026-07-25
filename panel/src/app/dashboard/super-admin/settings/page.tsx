'use client';

import PanelSettingsPage from '@/components/PanelSettingsPage';
import { useSessionUser } from '@/lib/useSessionUser';

export default function SuperAdminSettings() {
  const user = useSessionUser();

  return (
    <PanelSettingsPage
      role="super_admin"
      userName={user?.name || 'Super Admin'}
      userEmail={user?.email || 'pushpendra12@gmail.com'}
      userPhone="+91 98765 00001"
    />
  );
}
