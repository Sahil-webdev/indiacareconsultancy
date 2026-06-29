import React from 'react';
import { notFound } from 'next/navigation';
import { INITIAL_DOCTORS } from '@/lib/mockData';
import DoctorProfileClient from './DoctorProfileClient';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const doctor = INITIAL_DOCTORS.find((d) => d.id === id);
  
  if (!doctor) {
    return {
      title: 'Doctor Not Found - India Care Consultancy',
    };
  }

  return {
    title: `${doctor.name} - ${doctor.speciality} Specialist - India Care Consultancy`,
    description: `Book consultation with ${doctor.name}, ${doctor.qualification} with ${doctor.experience} years experience. Location: ${doctor.clinicAddress}.`,
  };
}

export default async function DoctorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const doctor = INITIAL_DOCTORS.find((d) => d.id === id);

  if (!doctor) {
    notFound();
  }

  return <DoctorProfileClient doctor={doctor} />;
}
