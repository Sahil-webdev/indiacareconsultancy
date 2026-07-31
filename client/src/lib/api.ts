const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function siteApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data as T;
}

function looksLikeJwt(value: string) {
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value);
}

export function getPanelToken(): string | null {
  if (typeof window === 'undefined') return null;

  const directKeys = [
    'token',
    'authToken',
    'accessToken',
    'panelToken',
    'iccToken',
    'iccPanelToken',
    'icc_auth_token',
  ];

  for (const key of directKeys) {
    const value = window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    if (value && looksLikeJwt(value)) {
      return value;
    }
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;
    const value = window.localStorage.getItem(key);
    if (value && looksLikeJwt(value)) {
      return value;
    }
  }

  for (let index = 0; index < window.sessionStorage.length; index += 1) {
    const key = window.sessionStorage.key(index);
    if (!key) continue;
    const value = window.sessionStorage.getItem(key);
    if (value && looksLikeJwt(value)) {
      return value;
    }
  }

  return null;
}

export async function panelApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getPanelToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data as T;
}

export { API_BASE };
