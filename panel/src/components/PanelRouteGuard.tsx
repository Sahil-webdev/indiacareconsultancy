'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { panelApi } from '@/lib/api';
import { clearSession, getSessionToken, getSessionUser, saveSessionUser, type PanelUser } from '@/lib/session';

type Role = PanelUser['role'];

function getDashboardPath(role: Role) {
  if (role === 'super_admin') return '/dashboard/super-admin';
  if (role === 'consultant') return '/dashboard/consultant';
  if (role === 'doctor') return '/dashboard/doctor';
  return '/dashboard/hospital';
}

interface PanelRouteGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export default function PanelRouteGuard({ allowedRoles, children }: PanelRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifyAccess() {
      const token = getSessionToken();
      const user = getSessionUser();

      if (!token || !user) {
        router.replace(`/login?next=${encodeURIComponent(pathname || '/login')}`);
        return;
      }

      try {
        const response = await panelApi<{ success: boolean; user: PanelUser }>('/api/auth/me');
        if (!active) return;

        saveSessionUser(response.user);

        if (!allowedRoles.includes(response.user.role)) {
          router.replace(getDashboardPath(response.user.role));
          return;
        }

        setAuthorized(true);
      } catch {
        clearSession();
        if (active) {
          router.replace('/login');
        }
      }
    }

    verifyAccess();

    return () => {
      active = false;
    };
  }, [allowedRoles, pathname, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#25B89A' }} />
      </div>
    );
  }

  return <>{children}</>;
}
