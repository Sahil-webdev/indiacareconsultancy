'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ChevronRight, Lock, Eye } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-text-grey mb-8 font-medium">
          <Link href="/" className="hover:text-primary-green transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark-navy">Privacy Policy</span>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-150 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-soft-green flex items-center justify-center text-primary-green shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl md:text-3xl text-dark-navy">Privacy Policy</h1>
              <p className="text-xs text-text-grey mt-0.5">Last updated: June 14, 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-text-grey leading-relaxed">
            <p>
              At India Care Consultancy, we prioritize the confidentiality and safety of your personal and health records. This Privacy Policy details how we collect, store, share, and protect your information when using our portal.
            </p>

            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-green" />
                1. Information We Collect
              </h2>
              <p className="mb-2">
                To coordinate doctor recommendations and clinic appointments, we may collect:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Patient Details: Name, age, gender, contact number, email, location.</li>
                <li>Clinical Details: Main health concerns, symptoms, duration, specialty preferences.</li>
                <li>Uploaded Documents: Lab reports, scan files, doctor prescriptions.</li>
                <li>Budget and Availability preferences.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-green" />
                2. How We Store & Secure Data
              </h2>
              <p>
                All data, especially medical histories and uploaded lab records, is stored using industry-standard database encryption protocols. Our internal consultants access records solely to provide clinical recommendations, and we enforce periodic access control reviews.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-green" />
                3. Sharing Vetted Information
              </h2>
              <p>
                We **NEVER** sell or lease your healthcare records to pharmaceutical companies or advertising agencies. Your records are only shared with:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Our internally assigned medical consultants.</li>
                <li>Vetted doctors and clinic receptionists chosen by you to coordinate slot bookings.</li>
                <li>Partner hospital referral desks to coordinate admission paperwork.</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400">© 2026 INDIA CARE CONSULTANCY</span>
            <Link href="/data-consent" className="text-primary-green font-bold hover:underline">
              Read Data Consent Policy
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
