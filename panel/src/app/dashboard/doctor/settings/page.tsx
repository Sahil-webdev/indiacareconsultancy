'use client';

import PanelSettingsPage from '@/components/PanelSettingsPage';
import { useDoctorIdentity } from '@/lib/panelIdentity';

export default function DoctorSettings() {
  const { displayName, displayEmail, displayPhone } = useDoctorIdentity();

  return (
    <PanelSettingsPage
      key={`${displayName}-${displayEmail}-${displayPhone}`}
      role="doctor"
      userName={displayName}
      userEmail={displayEmail}
      userPhone={displayPhone}
    />
  );
}
