'use client';
import ComingSoonPage from '@/components/ComingSoonPage';
import { AlertTriangle } from 'lucide-react';
export default function Page() {
  return <ComingSoonPage title="Disputes" description="Payment and service dispute resolution" icon={AlertTriangle} />;
}
