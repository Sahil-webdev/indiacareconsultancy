'use client';

import { useEffect, useState } from 'react';
import { panelApi } from '@/lib/api';
import { getSessionUser, type PanelUser } from '@/lib/session';

export interface DoctorIdentityProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  speciality: string;
  experience: number;
  consultationFee: number;
  location: string;
  city: string;
  clinicAddress: string;
  hospitalName: string;
  rating: number;
  isSubscribed: boolean;
}

export interface HospitalIdentityProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  hospitalType: string;
  totalBeds: number;
  address: string;
  location: string;
  city: string;
  rating: number;
  doctorCount: number;
  accreditations: string[];
  departments: string[];
  isSubscribed?: boolean;
}

function getInitial(name?: string | null) {
  const match = name?.trim().match(/[A-Za-z0-9]/);
  return match ? match[0].toUpperCase() : '?';
}

function usePanelIdentity<T>(path: string) {
  const [sessionUser, setSessionUser] = useState<PanelUser | null>(null);
  const [profile, setProfile] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadIdentity() {
      const user = getSessionUser();
      if (active) {
        setSessionUser(user);
      }

      try {
        const response = await panelApi<Record<string, T>>(path);
        const value = Object.values(response).find((item) => item && typeof item === 'object') ?? null;
        if (active) {
          setProfile((value as T | null) ?? null);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load identity');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadIdentity();

    return () => {
      active = false;
    };
  }, [path]);

  return { sessionUser, profile, loading, error };
}

export function useDoctorIdentity() {
  const identity = usePanelIdentity<DoctorIdentityProfile>('/api/doctors/me/profile');
  const displayName = identity.profile?.name || identity.sessionUser?.name || 'Doctor';

  return {
    ...identity,
    displayName,
    displayEmail: identity.profile?.email || identity.sessionUser?.email || '',
    displayPhone: identity.profile?.phone || '',
    initial: getInitial(displayName),
  };
}

export function useHospitalIdentity() {
  const identity = usePanelIdentity<HospitalIdentityProfile>('/api/hospitals/me/profile');
  const displayName = identity.profile?.name || identity.sessionUser?.name || 'Hospital';

  return {
    ...identity,
    displayName,
    displayEmail: identity.profile?.email || identity.sessionUser?.email || '',
    displayPhone: identity.profile?.phone || '',
    initial: getInitial(displayName),
  };
}
