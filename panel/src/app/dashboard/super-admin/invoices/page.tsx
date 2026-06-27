'use client';
import ComingSoonPage from '@/components/ComingSoonPage';
import { FileText } from 'lucide-react';
export default function Page() {
  return <ComingSoonPage title="Invoices" description="Generated invoices for all subscriptions" icon={FileText} />;
}
