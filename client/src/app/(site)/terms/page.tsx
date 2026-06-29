'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ChevronRight, Scale, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-text-grey mb-8 font-medium">
          <Link href="/" className="hover:text-primary-green transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark-navy">Terms & Conditions</span>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-150 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl md:text-3xl text-dark-navy">Terms & Conditions</h1>
              <p className="text-xs text-text-grey mt-0.5">Last updated: June 14, 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-text-grey leading-relaxed">
            <p>
              Welcome to India Care Consultancy. By accessing our portal, filling out patient intake details, or registering as a medical partner, you agree to comply with the following terms and guidelines.
            </p>

            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary-green" />
                1. Scope of Referral Services
              </h2>
              <p>
                India Care Consultancy provides a matching engine and consultant support to suggest appropriate doctors and hospitals. We do not practice medicine, prescribe treatments, or hold clinical licenses. The patient remains responsible for verifying credentials before starting clinical treatments.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-green" />
                2. Partner Registrations & Accounts
              </h2>
              <p>
                Doctors and hospitals registering on our network must provide accurate, active registration numbers, clinic details, and fee structures. Providing false certifications or misleading clinical credentials will lead to immediate account termination and reporting to the State Medical Council.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-green" />
                3. Subscription Fees & Payments
              </h2>
              <p>
                Registered doctors and partner hospitals are billed subscription fees (Basic, Premium, Elite) in accordance with the signed service level agreements. Patients do not pay consultation booking fees to India Care Consultancy; patients directly pay doctors at the clinics.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400">© 2026 INDIA CARE CONSULTANCY</span>
            <Link href="/disclaimer" className="text-primary-green font-bold hover:underline">
              Read Patient Disclaimer
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
