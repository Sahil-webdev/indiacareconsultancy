'use client';
import ComingSoonPage from '@/components/ComingSoonPage';
import { Flag } from 'lucide-react';
export default function Page() {
  return <ComingSoonPage title="Flagged Profiles" description="Profiles flagged for review or suspicious activity" icon={Flag} />;
}
