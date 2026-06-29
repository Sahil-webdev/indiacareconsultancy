'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart,
  LayoutDashboard,
  User,
  Users,
  Building,
  Calendar,
  FileText,
  Clock,
  Settings,
  LogOut,
  Sliders,
  DollarSign,
  HeartHandshake,
  ShieldCheck,
  Star,
  Layers,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

type Role = 'patient' | 'doctor' | 'hospital' | 'consultant' | 'admin';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  // Determine role based on pathname
  let role: Role = 'patient';
  if (pathname.includes('/dashboard/doctor')) role = 'doctor';
  else if (pathname.includes('/dashboard/hospital')) role = 'hospital';
  else if (pathname.includes('/dashboard/consultant')) role = 'consultant';
  else if (pathname.includes('/dashboard/admin')) role = 'admin';

  const handleLogout = () => {
    toast('info', 'Logged Out', 'You have been successfully signed out of your portal.');
    router.push('/login');
  };

  // Define links based on roles
  const linksByRole: Record<Role, { name: string; path: string; icon: React.ReactNode }[]> = {
    patient: [
      { name: 'Profile Overview', path: '/dashboard/patient?tab=profile', icon: <User className="w-4 h-4" /> },
      { name: 'My Case Inquiries', path: '/dashboard/patient?tab=requests', icon: <FileText className="w-4 h-4" /> },
      { name: 'Suggested Doctors', path: '/dashboard/patient?tab=doctors', icon: <Users className="w-4 h-4" /> },
      { name: 'Suggested Hospitals', path: '/dashboard/patient?tab=hospitals', icon: <Building className="w-4 h-4" /> },
      { name: 'Appointments', path: '/dashboard/patient?tab=appointments', icon: <Calendar className="w-4 h-4" /> },
      { name: 'Medical Reports', path: '/dashboard/patient?tab=reports', icon: <FileText className="w-4.5 h-4.5" /> },
      { name: 'Support Tickets', path: '/dashboard/patient?tab=support', icon: <MessageSquare className="w-4 h-4" /> },
    ],
    doctor: [
      { name: 'Overview Panel', path: '/dashboard/doctor?tab=overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { name: 'Profile Manager', path: '/dashboard/doctor?tab=profile', icon: <User className="w-4 h-4" /> },
      { name: 'Availability Slots', path: '/dashboard/doctor?tab=availability', icon: <Clock className="w-4 h-4" /> },
      { name: 'Referral Bookings', path: '/dashboard/doctor?tab=requests', icon: <Calendar className="w-4 h-4" /> },
      { name: 'Patient Reports', path: '/dashboard/doctor?tab=reports', icon: <FileText className="w-4.5 h-4.5" /> },
      { name: 'Reviews Feedback', path: '/dashboard/doctor?tab=reviews', icon: <Star className="w-4 h-4" /> },
      { name: 'Subscription Plan', path: '/dashboard/doctor?tab=subscription', icon: <ShieldCheck className="w-4 h-4" /> },
      { name: 'Payment History', path: '/dashboard/doctor?tab=payments', icon: <DollarSign className="w-4 h-4" /> },
    ],
    hospital: [
      { name: 'Overview Portal', path: '/dashboard/hospital?tab=overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { name: 'Hospital Profile', path: '/dashboard/hospital?tab=profile', icon: <Building className="w-4 h-4" /> },
      { name: 'Medical Departments', path: '/dashboard/hospital?tab=departments', icon: <Layers className="w-4 h-4" /> },
      { name: 'Vetted Facilities', path: '/dashboard/hospital?tab=facilities', icon: <ShieldCheck className="w-4 h-4" /> },
      { name: 'Linked Doctors', path: '/dashboard/hospital?tab=doctors', icon: <Users className="w-4 h-4" /> },
      { name: 'OPD Requests', path: '/dashboard/hospital?tab=requests', icon: <Calendar className="w-4 h-4" /> },
      { name: 'Subscription Plan', path: '/dashboard/hospital?tab=subscription', icon: <Sliders className="w-4 h-4" /> },
      { name: 'Billing History', path: '/dashboard/hospital?tab=payments', icon: <DollarSign className="w-4 h-4" /> },
    ],
    consultant: [
      { name: 'Overview Dashboard', path: '/dashboard/consultant?tab=overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { name: 'Assigned Leads List', path: '/dashboard/consultant?tab=leads', icon: <FileText className="w-4 h-4" /> },
      { name: 'Doctor Recommendations', path: '/dashboard/consultant?tab=doc-recs', icon: <Users className="w-4 h-4" /> },
      { name: 'Hospital Referrals', path: '/dashboard/consultant?tab=hosp-recs', icon: <Building className="w-4 h-4" /> },
      { name: 'Appointments Coord', path: '/dashboard/consultant?tab=appointments', icon: <Calendar className="w-4 h-4" /> },
      { name: 'Case Studies Note', path: '/dashboard/consultant?tab=notes', icon: <MessageSquare className="w-4 h-4" /> },
    ],
    admin: [
      { name: 'Admin Overview', path: '/dashboard/admin?tab=overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { name: 'Patient Records', path: '/dashboard/admin?tab=patients', icon: <User className="w-4 h-4" /> },
      { name: 'Inquiry Leads', path: '/dashboard/admin?tab=leads', icon: <FileText className="w-4.5 h-4.5" /> },
      { name: 'Doctor Vetting', path: '/dashboard/admin?tab=doctors', icon: <Users className="w-4 h-4" /> },
      { name: 'Accredited Hospitals', path: '/dashboard/admin?tab=hospitals', icon: <Building className="w-4 h-4" /> },
      { name: 'Staff Consultants', path: '/dashboard/admin?tab=consultants', icon: <HeartHandshake className="w-4 h-4" /> },
      { name: 'All Appointments', path: '/dashboard/admin?tab=appointments', icon: <Calendar className="w-4 h-4" /> },
      { name: 'Subscription Tiers', path: '/dashboard/admin?tab=subscriptions', icon: <Sliders className="w-4 h-4" /> },
      { name: 'Revenue Reports', path: '/dashboard/admin?tab=payments', icon: <DollarSign className="w-4 h-4" /> },
      { name: 'Blog Management', path: '/dashboard/admin?tab=blogs', icon: <FileText className="w-4 h-4" /> },
      { name: 'System Settings', path: '/dashboard/admin?tab=settings', icon: <Settings className="w-4 h-4" /> },
    ]
  };

  const currentLinks = linksByRole[role] || [];

  return (
    <aside className="w-64 bg-slate-900 text-slate-350 p-6 flex flex-col justify-between flex-shrink-0 h-screen sticky top-0 border-r border-slate-800">
      <div className="flex flex-col gap-8">
        
        {/* Brand header */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-wider text-white leading-tight">
              INDIA CARE
            </span>
            <span className="text-[9px] font-semibold text-accent-green tracking-widest leading-none">
              DASHBOARD
            </span>
          </div>
        </Link>

        {/* Links list */}
        <nav className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block px-3 mb-2">
            Portal Navigation
          </span>
          {currentLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                pathname.includes(link.path.split('?')[0])
                  ? 'bg-primary-green text-white shadow-md'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="flex flex-col gap-4">
        <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-accent-green flex-shrink-0" />
          <span>Role: <strong className="text-white capitalize">{role}</strong>. Secure connection active.</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors w-full text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out Portal
        </button>
      </div>
    </aside>
  );
}
