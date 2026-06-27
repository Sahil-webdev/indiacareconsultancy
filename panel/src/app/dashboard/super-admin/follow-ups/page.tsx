'use client';
import ComingSoonPage from '@/components/ComingSoonPage';
import { Clock } from 'lucide-react';
export default function Page() {
  return <ComingSoonPage title="Follow-ups" description="Scheduled and overdue patient follow-up tasks" icon={Clock} />;
}
