'use client';

import PanelSettingsPage from '@/components/PanelSettingsPage';
import { useHospitalIdentity } from '@/lib/panelIdentity';

export default function HospitalSettings() {
  const { displayName, displayEmail, displayPhone } = useHospitalIdentity();

  return (
    <PanelSettingsPage
      key={`${displayName}-${displayEmail}-${displayPhone}`}
      role="hospital"
      userName={displayName}
      userEmail={displayEmail}
      userPhone={displayPhone}
    />
  );
}
