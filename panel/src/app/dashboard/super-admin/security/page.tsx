'use client';
import ComingSoonPage from '@/components/ComingSoonPage';
import { Lock } from 'lucide-react';
export default function Page() {
  return <ComingSoonPage title="Security" description="Login logs, 2FA settings and security controls" icon={Lock} />;
}
