'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Phone, Mail, MapPin, Globe, Activity, Shield, MessageSquare } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Doctor', path: '/find-doctor' },
    { name: 'Hospitals', path: '/hospitals' },
    { name: 'Specialities', path: '/specialities' },
    { name: 'About Us', path: '/about' },
    { name: 'Blogs & News', path: '/blog' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const specialties = [
    { name: 'Cardiology', path: '/find-doctor?speciality=Cardiology' },
    { name: 'Neurology', path: '/find-doctor?speciality=Neurology' },
    { name: 'Orthopedic', path: '/find-doctor?speciality=Orthopedic' },
    { name: 'Dermatology', path: '/find-doctor?speciality=Dermatology' },
    { name: 'Gynecology', path: '/find-doctor?speciality=Gynecology' },
    { name: 'Pediatrics', path: '/find-doctor?speciality=Pediatrics' },
  ];

  const legalLinks = [
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Patient Disclaimer', path: '/disclaimer' },
    { name: 'Data Consent Policy', path: '/data-consent' },
  ];

  return (
    <footer className="bg-dark-navy text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo and Brand details */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-wider text-white leading-tight">
                  INDIA CARE
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-accent-green tracking-widest leading-none">
                  CONSULTANCY
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              India Care Consultancy is a premium healthcare recommendation and consultation portal helping patients find the best suited medical help.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-green hover:text-white transition-colors duration-200" aria-label="Social Link">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-green hover:text-white transition-colors duration-200" aria-label="Social Link">
                <Activity className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-green hover:text-white transition-colors duration-200" aria-label="Social Link">
                <Shield className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-green hover:text-white transition-colors duration-200" aria-label="Social Link">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-6 tracking-wide">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="text-sm text-slate-400 hover:text-accent-green transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="h-1 w-1 bg-primary-green/40 rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Specialties */}
          <div>
            <h4 className="text-white font-bold text-base mb-6 tracking-wide">Top Specialities</h4>
            <ul className="space-y-3">
              {specialties.map((spec) => (
                <li key={spec.name}>
                  <Link
                    href={spec.path}
                    className="text-sm text-slate-400 hover:text-accent-green transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="h-1 w-1 bg-primary-green/40 rounded-full"></span>
                    {spec.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact details */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white font-bold text-base mb-1 tracking-wide">Contact Details</h4>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <MapPin className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
              <span>
                12th Floor, Statesman House, Barakhamba Road, Connaught Place, New Delhi - 110001
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Phone className="w-5 h-5 text-accent-green flex-shrink-0" />
              <a href="tel:+919876543210" className="hover:text-white transition-colors">
                +91 98765 43210
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Mail className="w-5 h-5 text-accent-green flex-shrink-0" />
              <a href="mailto:info@indiacareconsultancy.com" className="hover:text-white transition-colors">
                info@indiacareconsultancy.com
              </a>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="border-t border-slate-800 pt-8 mt-8">
          <div className="bg-primary-green/10 rounded-2xl p-6 border border-primary-green/20 text-xs text-slate-400 leading-relaxed">
            <span className="text-accent-green font-semibold block mb-1 tracking-wide">
              IMPORTANT LEGAL DISCLAIMER:
            </span>
            INDIA CARE CONSULTANCY is not a hospital, clinic, or medical treatment provider. We only provide healthcare guidance, doctor discovery, hospital recommendation, and appointment coordination. Final medical decisions and treatments are strictly between the patient and the medical practitioner.
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} INDIA CARE CONSULTANCY. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link key={link.name} href={link.path} className="hover:text-slate-300 transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
