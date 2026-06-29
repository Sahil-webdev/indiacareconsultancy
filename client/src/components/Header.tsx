'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, PhoneCall, LogIn, Heart, User, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePatientAuth } from '@/lib/patientAuth';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoggedIn, patient, openAuthModal } = usePatientAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Doctor', path: '/find-doctor' },
    { name: 'Hospitals', path: '/hospitals' },
    { name: 'Specialities', path: '/specialities' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6">

            {/* ── LEFT: Logo – lives in its own column, can be any size ── */}
            <Link href="/" className="flex items-center group shrink-0">
              <img
                src="/logo.png"
                alt="India Care Consultancy"
                className="h-20 w-auto object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-md"
              />
            </Link>

            {/* ── CENTER: Desktop Navigation ── */}
            <nav className="hidden lg:flex items-center justify-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary-green relative py-1 ${
                    isActive(link.path) ? 'text-primary-green font-semibold' : 'text-text-grey'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-green rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── RIGHT: CTA Buttons ── */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              {isLoggedIn && patient ? (
                /* Logged-in: user avatar button */
                <button
                  onClick={() => router.push('/my-health')}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-primary-green/20 bg-soft-green hover:bg-light-mint transition-colors group"
                >
                  <div className="w-7 h-7 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-xs shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                    {patient.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={patient.profileImage} alt={patient.name} className="w-full h-full object-cover" />
                    ) : patient.name[0]}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-bold text-dark-navy leading-tight truncate max-w-[100px]">{patient.name.split(' ')[0]}</span>
                    <span className="text-[9px] font-semibold text-primary-green">My Health Dashboard</span>
                  </div>
                  {!patient.profileComplete && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>
              ) : (
                /* Guest: Login button → opens AuthModal */
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-2 text-sm font-semibold text-primary-green hover:text-dark-green px-4 py-2 rounded-xl hover:bg-soft-green transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              )}
              <Link
                href="/book-consultation"
                className="flex items-center gap-2 text-sm font-semibold text-white gradient-primary px-5 py-2.5 rounded-xl shadow-sm glow-green"
              >
                <PhoneCall className="w-4 h-4" />
                Get Consultation
              </Link>
            </div>

            {/* Mobile Right Controls */}
            <div className="flex items-center gap-2 lg:hidden">
              {isLoggedIn && patient && (
                <button
                  onClick={() => router.push('/my-health')}
                  className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-sm shadow-sm overflow-hidden"
                >
                  {patient.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={patient.profileImage} alt={patient.name} className="w-full h-full object-cover" />
                  ) : patient.name[0]}
                </button>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-dark-navy hover:text-primary-green p-2 rounded-lg focus:outline-none transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black lg:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-full bg-white shadow-2xl p-6 flex flex-col justify-between lg:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="India Care Consultancy" className="h-12 w-auto object-contain" />
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isLoggedIn && patient && (
                  <div className="mt-4 mb-2 flex items-center gap-3 bg-soft-green rounded-2xl p-3 border border-primary-green/10">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-sm overflow-hidden">
                      {patient.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={patient.profileImage} alt={patient.name} className="w-full h-full object-cover" />
                      ) : patient.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-dark-navy text-sm truncate">{patient.name}</p>
                      <p className="text-[10px] text-text-grey truncate">{patient.email}</p>
                    </div>
                    {!patient.profileComplete && (
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-4 py-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      onClick={() => setIsOpen(false)}
                      href={link.path}
                      className={`text-base font-semibold py-2 transition-colors ${
                        isActive(link.path) ? 'text-primary-green' : 'text-slate-600 hover:text-primary-green'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
                {isLoggedIn ? (
                  <button
                    onClick={() => { setIsOpen(false); router.push('/my-health'); }}
                    className="flex items-center justify-center gap-2 text-base font-bold text-primary-green border border-primary-green/20 bg-soft-green py-3 rounded-xl hover:bg-light-mint transition-colors"
                  >
                    <User className="w-4 h-4" /> My Health Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => { setIsOpen(false); openAuthModal('login'); }}
                    className="flex items-center justify-center gap-2 text-base font-bold text-primary-green border border-primary-green/20 bg-soft-green py-3 rounded-xl hover:bg-light-mint transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> Login
                  </button>
                )}
                <Link
                  href="/book-consultation"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 text-base font-bold text-white gradient-primary py-3 rounded-xl shadow-md glow-green"
                >
                  <PhoneCall className="w-4 h-4" /> Get Consultation
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
