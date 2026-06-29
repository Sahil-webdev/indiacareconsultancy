'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronRight, Lock, Eye } from 'lucide-react';

export default function DataConsentPage() {
  return (
    <div className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-text-grey mb-8 font-medium">
          <Link href="/" className="hover:text-primary-green transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark-navy">Data Consent Policy</span>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-150 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-primary-green shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl md:text-3xl text-dark-navy">Data Consent Policy</h1>
              <p className="text-xs text-text-grey mt-0.5">Last updated: June 14, 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-text-grey leading-relaxed">
            <p>
              Before you submit your symptoms, clinical history, or diagnostic reports, we request your explicit consent for processing this data. This document outlines your rights under digital healthcare standards.
            </p>

            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-green" />
                1. Explicit Diagnostic Records Sharing
              </h2>
              <p>
                By checking the &quot;Data Consent&quot; checkbox on our consultation booking form, you grant India Care Consultancy the authority to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Forward your symptom history, age, gender, and area to our assigned consulting experts.</li>
                <li>Securely transmit your uploaded lab records and diagnostic scan files to the clinics or hospitals you select.</li>
                <li>Send booking request details (such as contact name, number) to the doctor’s desk to coordinate slots.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-green" />
                2. Revocability of Data Consent
              </h2>
              <p>
                You retain complete authority over your clinical records. You can log into your Patient Dashboard at any time to delete uploaded reports, request to archive older leads, or email us to purge your account record completely from our database.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400">© 2026 INDIA CARE CONSULTANCY</span>
            <Link href="/privacy" className="text-primary-green font-bold hover:underline">
              Read Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
