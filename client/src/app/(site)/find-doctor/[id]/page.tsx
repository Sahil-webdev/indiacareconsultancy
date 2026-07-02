import React from 'react';
import { notFound } from 'next/navigation';
import { DoctorMock } from '@/lib/mockData';
import DoctorProfileClient from './DoctorProfileClient';
import { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function getDoctor(id: string): Promise<DoctorMock | null> {
  try {
    const response = await fetch(`${API_BASE}/api/doctors/${id}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    const doctor = data.doctor;
    return {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      photo: doctor.photo,
      medicalRegistrationNumber: doctor.medicalRegistrationNumber,
      qualification: doctor.qualification,
      speciality: doctor.speciality,
      experience: doctor.experience,
      clinicAddress: doctor.clinicAddress,
      consultationFee: doctor.consultationFee,
      location: doctor.location,
      area: doctor.area,
      rating: doctor.rating,
      gender: doctor.gender,
      availability: doctor.availability || [],
      consultationType: doctor.consultationType,
      isApproved: doctor.isApproved,
      subscriptionPlan: doctor.isSubscribed ? 'Premium' : 'Basic',
      bio: doctor.bio || '',
      languages: doctor.languages || [],
      services: doctor.services || [],
      awards: doctor.awards || [],
      hospitalId: '',
      userId: doctor.userId || undefined,
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
  const doctor = await getDoctor(id);
  
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
  const doctor = await getDoctor(id);

  if (!doctor) {
    notFound();
  }

  return <DoctorProfileClient doctor={doctor} />;
}
