export interface PanelUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'consultant' | 'doctor' | 'hospital';
  profile?: {
    entityId: string;
    isSubscribed: boolean;
    isApproved: boolean;
  } | null;
}

const TOKEN_KEY = 'icc_panel_token';
const USER_KEY = 'icc_panel_user';

export function saveSession(token: string, user: PanelUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSessionToken() {
  return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
}

export function getSessionUser(): PanelUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PanelUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
