import React from 'react';
import { notFound } from 'next/navigation';
import { INITIAL_HOSPITALS } from '@/lib/mockData';
import HospitalProfileClient from './HospitalProfileClient';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const hospital = INITIAL_HOSPITALS.find((h) => h.id === id);

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
  const hospital = INITIAL_HOSPITALS.find((h) => h.id === id);

  if (!hospital) {
    notFound();
  }

  return <HospitalProfileClient hospital={hospital} />;
}
