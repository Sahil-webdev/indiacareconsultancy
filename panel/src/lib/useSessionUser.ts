'use client';

import { useEffect, useState } from 'react';
import { getSessionUser, type PanelUser } from './session';

export function useSessionUser() {
  const [user, setUser] = useState<PanelUser | null>(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  return user;
}
