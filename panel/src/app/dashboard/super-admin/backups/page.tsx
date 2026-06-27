'use client';
import ComingSoonPage from '@/components/ComingSoonPage';
import { Database } from 'lucide-react';
export default function Page() {
  return <ComingSoonPage title="Backup Logs" description="System backup history and data recovery" icon={Database} />;
}
