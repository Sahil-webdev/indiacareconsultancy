'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ChevronRight, Scale, CheckCircle2, Clock } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <div className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-text-grey mb-8 font-medium">
          <Link href="/" className="hover:text-primary-green transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark-navy">Patient Disclaimer</span>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-150 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl md:text-3xl text-dark-navy">Patient Disclaimer</h1>
              <p className="text-xs text-text-grey mt-0.5">Last updated: June 14, 2026</p>
            </div>
          </div>

          <div className="bg-red-50/50 border border-red-200/40 p-6 rounded-2xl text-sm text-slate-700 leading-relaxed">
            <strong className="text-red-600 block mb-1">CRITICAL NOTICE:</strong>
            INDIA CARE CONSULTANCY is not a hospital, clinic, or medical treatment provider. We do not employ medical practitioners to diagnose or treat patients. We only provide healthcare guidance, doctor discovery, partner hospital recommendation, and appointment coordination support.
          </div>

          <div className="space-y-6 text-sm text-text-grey leading-relaxed">
            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary-green" />
                1. No Doctor-Patient Relationship
              </h2>
              <p>
                The use of this website, the submission of patient intake forms, and the receipt of suggestions from our healthcare consultants do not establish a doctor-patient relationship. All recommendations are purely directory references.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-green" />
                2. Autonomy of Clinical Decisions
              </h2>
              <p>
                Any decision to consult a recommended doctor or visit a partner hospital is made at the sole discretion of the patient. The patient and their family members must directly coordinate with the medical practitioner for diagnoses, surgeries, prescription medications, and emergency admissions.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary-green" />
                3. Limitation of Liability
              </h2>
              <p>
                India Care Consultancy and its parent company hold no liability for medical malpractice, clinical negligence, diagnosis inaccuracies, or surgical outcomes that occur at partner hospitals or clinics. We do not guarantee treatment outcomes.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-dark-navy text-lg mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-green" />
                4. Emergency Medical Attention
              </h2>
              <p>
                Our services are NOT designed for acute emergency cases. If you or a family member are experiencing a life-threatening medical emergency (such as acute cardiac arrest, stroke, severe trauma, or difficulty breathing), please immediately dial national emergency services or visit the nearest trauma center directly.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400">© 2026 INDIA CARE CONSULTANCY</span>
            <Link href="/book-consultation" className="text-primary-green font-bold hover:underline">
              Speak to a Consultant
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
