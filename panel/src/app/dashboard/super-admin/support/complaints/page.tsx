'use client';
import ComingSoonPage from '@/components/ComingSoonPage';
import { AlertOctagon } from 'lucide-react';
export default function Page() {
  return <ComingSoonPage title="Complaints" description="User complaints and grievances" icon={AlertOctagon} />;
}
