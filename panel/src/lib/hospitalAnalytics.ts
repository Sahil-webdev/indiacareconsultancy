'use client';

import { useEffect, useState } from 'react';
import { panelApi } from '@/lib/api';

export type HospitalAnalyticsDoctor = {
  id: string | number;
  user_id?: string | number;
  name: string;
  email?: string;
  phone: string;
  speciality: string;
  qualification?: string;
  exp?: number;
  fee: number;
  rating: number;
  status: string;
  shifts: string;
  photo?: string;
  city?: string;
  isHospitalManaged?: boolean;
};

export type HospitalAnalyticsAppointment = {
  id: string;
  patient: string;
  patientPhone: string;
  patientEmail: string;
  doctor: string;
  speciality: string;
  date: string;
  dateLabel: string;
  time: string;
  mode: string;
  status: string;
  fee: number;
  platformFee: number;
  hospitalNet: number;
  concern: string;
  adminNote: string;
  createdAt: string;
};

export type HospitalAnalyticsPayment = {
  id: string;
  sourceType: string;
  patient: string;
  doctor: string;
  dept: string;
  date: string;
  dateLabel: string;
  amount: number;
  platform: number;
  hospital: number;
  method: string;
  status: string;
  transactionRef: string;
};

export type HospitalAnalyticsDepartment = {
  name: string;
  appointments: number;
  revenue: number;
  rating: number;
  fillRate: number;
  doctorCount: number;
};

export type HospitalAnalyticsMonthly = {
  month: string;
  appointments: number;
  revenue: number;
};

export type HospitalAnalyticsOpd = {
  id: string;
  dept: string;
  doctor: string;
  days: string;
  start: string;
  end: string;
  slots: number;
  booked: number;
  status: 'Open' | 'Full' | 'Closed' | string;
  consultationFee?: number;
  isHospitalManaged?: boolean;
};

export type HospitalAnalytics = {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    emergencyContact: string;
    website: string;
    image: string;
    registrationDetails: string;
    hospitalType: string;
    address: string;
    googleMapsLink?: string;
    location: string;
    city: string;
    rating: number;
    departments: string[];
    facilities: string[];
    accreditations: string[];
    isApproved: boolean;
    isSubscribed: boolean;
    opdTimings: string;
    gallery: string[];
    about: string;
    totalBeds: number;
    doctorCount: number;
  };
  doctors: HospitalAnalyticsDoctor[];
  appointments: HospitalAnalyticsAppointment[];
  todayAppointments: {
    id: string;
    patient: string;
    doctor: string;
    dept: string;
    time: string;
    status: string;
  }[];
  stats: {
    totalDoctors: number;
    activeDoctors: number;
    totalAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    todayAppointments: number;
    patientsServed: number;
    averageRating: number;
    monthlyRevenue: number;
    pendingRevenue: number;
  };
  departments: HospitalAnalyticsDepartment[];
  monthly: HospitalAnalyticsMonthly[];
  payments: HospitalAnalyticsPayment[];
  opdSchedules: HospitalAnalyticsOpd[];
};

export function useHospitalAnalytics() {
  const [analytics, setAnalytics] = useState<HospitalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await panelApi<{ analytics: HospitalAnalytics }>('/api/hospitals/me/analytics');
      setAnalytics(response.analytics);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hospital analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    reload: loadAnalytics,
  };
}
