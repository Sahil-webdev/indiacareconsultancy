'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export interface PatientProfile {
  // Signup fields
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  gender: string;
  profileImage?: string;
  // Complete-profile fields (filled later)
  age?: string;
  height?: string;       // cm
  weight?: string;       // kg
  bloodGroup?: string;
  allergies?: string;
  chronicConditions?: string;
  emergencyContact?: string;
  profileComplete: boolean;
  createdAt: string;
}

interface PatientAuthContextValue {
  patient: PatientProfile | null;
  isLoggedIn: boolean;
  login: (patient: PatientProfile) => void;
  logout: () => void;
  updateProfile: (updates: Partial<PatientProfile>) => void;
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalTab: 'login' | 'signup';
}

const PatientAuthContext = createContext<PatientAuthContextValue | null>(null);

const STORAGE_KEY = 'icc_patient_v1';

/* ─────────────────────────────────────────
   Mock patients (for demo login)
───────────────────────────────────────── */
export const MOCK_PATIENTS: PatientProfile[] = [
  {
    id: 'user_patient',
    name: 'Rahul Sharma',
    email: 'patient@indiacare.com',
    mobile: '+91 98765 43299',
    city: 'Delhi',
    gender: 'Male',
    age: '29',
    height: '175',
    weight: '72',
    bloodGroup: 'B+',
    allergies: 'None',
    chronicConditions: 'None',
    emergencyContact: '+91 98765 00000',
    profileComplete: true,
    createdAt: '2026-06-14T10:00:00Z',
  },
];

export const MOCK_PASSWORD = 'password123';

/* ─────────────────────────────────────────
   Provider
───────────────────────────────────────── */
export function PatientAuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        queueMicrotask(() => setPatient(JSON.parse(stored)));
      }
    } catch { /* ignore */ }
  }, []);

  const login = useCallback((p: PatientProfile) => {
    setPatient(p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }, []);

  const logout = useCallback(() => {
    setPatient(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateProfile = useCallback((updates: Partial<PatientProfile>) => {
    setPatient(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const openAuthModal = useCallback((tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  return (
    <PatientAuthContext.Provider value={{
      patient,
      isLoggedIn: !!patient,
      login,
      logout,
      updateProfile,
      openAuthModal,
      closeAuthModal,
      authModalOpen,
      authModalTab,
    }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const ctx = useContext(PatientAuthContext);
  if (!ctx) throw new Error('usePatientAuth must be used inside PatientAuthProvider');
  return ctx;
}
