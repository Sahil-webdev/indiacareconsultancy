import React from 'react';
import { notFound } from 'next/navigation';
import { HospitalMock } from '@/lib/mockData';
import HospitalProfileClient from './HospitalProfileClient';
import { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function getHospital(id: string): Promise<HospitalMock | null> {
  try {
    const response = await fetch(`${API_BASE}/api/hospitals/${id}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    const hospital = data.hospital;
    return {
      id: hospital.id,
      name: hospital.name,
      email: hospital.email,
      phone: hospital.phone,
      image: hospital.image,
      registrationDetails: hospital.registrationDetails,
      address: hospital.address,
      location: hospital.location,
      rating: hospital.rating,
      departments: hospital.departments || [],
      facilities: hospital.facilities || [],
      isApproved: hospital.isApproved,
      subscriptionPlan: hospital.isSubscribed ? 'Premium' : 'Basic',
      opdTimings: hospital.opdTimings || '',
      emergencyContact: hospital.emergencyContact || '',
      gallery: hospital.gallery || [],
      userId: hospital.userId || undefined,
      doctors: [],
    };
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const hospital = await getHospital(id);

  if (!hospital) {
    return {
      title: 'Hospital Not Found - India Care Consultancy',
    };
  }

  return {
    title: `${hospital.name} - Vetted Partner Hospital - India Care Consultancy`,
    description: `Contact and admissions support for ${hospital.name} in ${hospital.location}. Vetted rating: ${hospital.rating}/5. Emergency contact: ${hospital.emergencyContact}.`,
  };
}

export default async function HospitalProfilePage({ params }: PageProps) {
  const { id } = await params;
  const hospital = await getHospital(id);

  if (!hospital) {
    notFound();
  }

  return <HospitalProfileClient hospital={hospital} />;
}
