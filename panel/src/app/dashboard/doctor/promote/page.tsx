'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Award, Star, MapPin, Eye, MousePointerClick, 
  CreditCard, Calendar, ShieldCheck, CheckCircle2, ChevronRight,
  TrendingUp, ArrowRight, Loader2, QrCode
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';

const MOCK_DOCTOR = {
  id: 'doc_1',
  name: 'Dr. Ramesh Kumar',
  type: 'doctor',
  photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
  speciality: 'Cardiology',
  rating: 4.9,
  experience: 18,
  city: 'Delhi',
  consultationFee: 1500,
};

export default function DoctorPromotePage() {
  const [loading, setLoading] = useState(true);
  const [activePromotion, setActivePromotion] = useState<any | null>(null);
  const [tagline, setTagline] = useState('Leading Senior Cardiologist · 18+ Years Expert AIIMS Alumnus');
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('upi');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // Card Payment States
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Fetch current promotions from website API
  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/promote`);
      const data = await res.json();
      const currentPromo = data.find((item: any) => item.id === MOCK_DOCTOR.id);
      if (currentPromo) {
        setActivePromotion(currentPromo);
        setTagline(currentPromo.tagline);
      } else {
        setActivePromotion(null);
      }
    } catch (err) {
      console.error('Failed to load promotions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handlePromote = async () => {
    setProcessingPayment(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      const payload = {
        action: 'promote',
        item: {
          ...MOCK_DOCTOR,
          tagline
        }
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setStep('success');
        await fetchPromotions();
      }
    } catch (err) {
      alert('Error connecting to website API. Please make sure the main website is running on port 3000.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your homepage spotlight promotion?')) return;
    setCanceling(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', id: MOCK_DOCTOR.id })
      });
      
      if (res.ok) {
        setActivePromotion(null);
        setStep('info');
        fetchPromotions();
      }
    } catch (err) {
      console.error('Error canceling promotion', err);
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <PanelSidebar role="doctor" userName={MOCK_DOCTOR.name} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Promote Profile</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Get featured on the homepage to gain maximum visibility</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
            <Sparkles className="w-3.5 h-3.5" /> Spotlight Listing
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs text-slate-400">Syncing with Homepage API...</p>
            </div>
          ) : activePromotion ? (
            /* --- ACTIVE PROMOTION STATE --- */
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              {/* Promo Banner Card */}
              <div className="panel-card p-6 border-amber-400/20 bg-gradient-to-br from-amber-400/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-400/5 blur-3xl" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      Spotlight Live
                    </span>
                    <h2 className="text-xl font-black text-white mt-3">Your Profile is Live on the Homepage!</h2>
                    <p className="text-xs text-slate-400 mt-1">Your spotlight listing is active. You are currently receiving maximum homepage visibility.</p>
                  </div>
                  <button 
                    onClick={handleCancel}
                    disabled={canceling}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all flex items-center gap-1.5"
                  >
                    {canceling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Cancel Feature'}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Plan</p>
                    <p className="text-sm font-extrabold text-white mt-1">Spotlight Elite</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fee</p>
                    <p className="text-sm font-extrabold text-white mt-1">₹4,999 / month</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Promoted On</p>
                    <p className="text-sm font-extrabold text-white mt-1">
                      {new Date(activePromotion.promotedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Auto-Renewal</p>
                    <p className="text-sm font-extrabold text-emerald-400 mt-1">Active</p>
                  </div>
                </div>
              </div>

              {/* Promo Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 panel-card p-6">
                  <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" /> Spotlight Performance (Live)
                  </h3>
                  
                  {/* Mock Analytics Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-semibold">Total Impressions</span>
                        <Eye className="w-4 h-4 text-sky-400" />
                      </div>
                      <p className="text-2xl font-black text-white mt-2">1,248</p>
                      <p className="text-[10px] text-emerald-400 font-bold mt-1">↑ 14% vs yesterday</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-semibold">Card Clicks</span>
                        <MousePointerClick className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-2xl font-black text-white mt-2">184</p>
                      <p className="text-[10px] text-emerald-400 font-bold mt-1">↑ 8% CTR</p>
                    </div>
                  </div>

                  {/* SVG line chart mock */}
                  <div className="h-44 w-full bg-white/5 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Impressions Trend (Last 7 Days)</span>
                      <span>Avg: 178/day</span>
                    </div>
                    <div className="h-28 flex items-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2"/>
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path d="M 0 80 Q 50 60 100 70 T 200 30 T 300 20 L 300 100 L 0 100 Z" fill="url(#chartGrad)" />
                        <path d="M 0 80 Q 50 60 100 70 T 200 30 T 300 20" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
                        <circle cx="300" cy="20" r="4" fill="#fbbf24" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-400 pt-1 font-mono">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                  </div>
                </div>

                <div className="panel-card p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white mb-3">Live Tagline</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">This tagline appears in the highlighted spotlight card just below the main homepage hero search:</p>
                    <div className="mt-4 p-4 rounded-2xl bg-amber-400/5 border border-amber-400/10 italic text-center text-xs font-bold text-white">
                      "{tagline}"
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 mt-4">
                    <p className="text-[10px] text-slate-400">To edit your tagline, cancel the active promotion and reactivate it with a new tagline.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* --- SUBSCRIPTION FORM / CREATION STATE --- */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT & CENTER: Form & Preview */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Step 1 or Step 2 */}
                <AnimatePresence mode="wait">
                  {step === 'info' && (
                    <motion.div
                      key="info-step"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      className="flex flex-col gap-6"
                    >
                      {/* Promo Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { icon: Award, title: 'Top Homepage Listing', desc: 'Featured card appears directly below the search bar where 95% of patients interact.' },
                          { icon: Sparkles, title: 'Spotlight Highlights', desc: 'Premium border animations and gold spotlight accents to make your profile stand out.' },
                          { icon: ShieldCheck, title: 'Enhanced Trust', desc: 'Displays an exclusive partner tag assuring patients of premium medical service.' }
                        ].map((b, i) => (
                          <div key={i} className="panel-card p-4 flex flex-col gap-2 bg-white/5">
                            <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center">
                              <b.icon className="w-4.5 h-4.5 text-amber-400" />
                            </div>
                            <h4 className="text-xs font-bold text-white mt-1">{b.title}</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{b.desc}</p>
                          </div>
                        ))}
                      </div>

                      {/* Customize Card section */}
                      <div className="panel-card p-6">
                        <h3 className="text-sm font-extrabold text-white mb-3">1. Customise Your Homepage Tagline</h3>
                        <p className="text-xs text-slate-400 mb-4">Write a brief, high-impact tagline summarizing your specialty, credentials, or achievements. This tagline will be displayed on the homepage spotlight.</p>
                        
                        <input
                          type="text"
                          value={tagline}
                          onChange={e => setTagline(e.target.value.slice(0, 75))}
                          placeholder="e.g. Senior Interventional Cardiologist · 18+ Years Expert AIIMS Alumnus"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50 transition-all font-semibold"
                        />
                        <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
                          <span>Recommend professional credentials</span>
                          <span>{tagline.length}/75 characters</span>
                        </div>
                      </div>

                      {/* Pricing Select Card */}
                      <div className="panel-card p-6 border-amber-400/30 bg-amber-400/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">Elite Subscription</p>
                          <h4 className="text-base font-black text-white mt-1">Homepage Spotlight Listing</h4>
                          <p className="text-xs text-slate-400">Includes homepage featuring, higher listing ranks, and basic impression metrics.</p>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <span className="text-lg font-black text-white">₹4,999</span>
                            <span className="text-[10px] text-slate-400">/ month</span>
                          </div>
                          <button
                            onClick={() => setStep('payment')}
                            disabled={!tagline.trim()}
                            className="px-5 py-3 rounded-xl text-xs font-bold text-white gradient-primary hover-lift flex items-center gap-1.5"
                          >
                            Select Plan <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 'payment' && (
                    <motion.div
                      key="payment-step"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      className="panel-card p-6"
                    >
                      <h3 className="text-sm font-extrabold text-white mb-4">2. Safe Payment Checkout</h3>
                      
                      {/* Payment Tabs */}
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        {[
                          { id: 'upi', label: 'UPI QR', icon: QrCode },
                          { id: 'card', label: 'Credit Card', icon: CreditCard },
                          { id: 'netbanking', label: 'Net Banking', icon: Calendar }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setPaymentMethod(tab.id as any)}
                            className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                              paymentMethod === tab.id 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Payment Details Container */}
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-6">
                        {paymentMethod === 'upi' && (
                          <div className="flex flex-col items-center justify-center py-2 gap-4">
                            <div className="relative p-2.5 bg-white rounded-xl">
                              <svg className="w-36 h-36 text-slate-900" viewBox="0 0 100 100">
                                <rect width="100" height="100" fill="white"/>
                                <path d="M 10 10 H 30 V 30 H 10 Z" fill="black"/>
                                <path d="M 70 10 H 90 V 30 H 70 Z" fill="black"/>
                                <path d="M 10 70 H 30 V 90 H 10 Z" fill="black"/>
                                <path d="M 40 40 H 60 V 60 H 40 Z" fill="black"/>
                                <rect x="15" y="15" width="10" height="10" fill="white"/>
                                <rect x="75" y="15" width="10" height="10" fill="white"/>
                                <rect x="15" y="75" width="10" height="10" fill="white"/>
                                {/* Mock QR details */}
                                <rect x="45" y="15" width="10" height="15" fill="black"/>
                                <rect x="15" y="45" width="15" height="10" fill="black"/>
                                <rect x="75" y="45" width="10" height="25" fill="black"/>
                                <rect x="45" y="75" width="20" height="10" fill="black"/>
                              </svg>
                              <div className="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-xl border border-emerald-400/20" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold text-white">Scan QR with BHIM UPI App</p>
                              <p className="text-[10px] text-slate-400 mt-1">Transaction ID: TXN_DEMO_99214</p>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'card' && (
                          <div className="flex flex-col gap-3">
                            <div>
                              <label className="text-[9px] font-black uppercase text-slate-400">Card Number</label>
                              <input 
                                type="text" 
                                placeholder="4111 2222 3333 4444" 
                                value={cardNumber}
                                onChange={e => setCardNumber(e.target.value.replace(/\D/g,'').slice(0,16))}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white mt-1 focus:outline-none focus:border-emerald-500/50" 
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] font-black uppercase text-slate-400">Expiry</label>
                                <input 
                                  type="text" 
                                  placeholder="MM/YY" 
                                  value={cardExpiry}
                                  onChange={e => setCardExpiry(e.target.value.slice(0,5))}
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white mt-1 focus:outline-none focus:border-emerald-500/50" 
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-black uppercase text-slate-400">CVV</label>
                                <input 
                                  type="password" 
                                  placeholder="***" 
                                  value={cardCvv}
                                  onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))}
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white mt-1 focus:outline-none focus:border-emerald-500/50" 
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'netbanking' && (
                          <div className="grid grid-cols-2 gap-2 py-2">
                            {['SBI', 'HDFC', 'ICICI', 'Axis'].map(b => (
                              <button key={b} className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white font-bold hover:bg-white/10 hover:border-emerald-500/30 transition-all text-center">
                                {b} Bank
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Payment Actions */}
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setStep('info')}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                        >
                          Back
                        </button>
                        <button
                          onClick={handlePromote}
                          disabled={processingPayment}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-primary hover-lift flex items-center gap-1.5"
                        >
                          {processingPayment ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Processing Payment...
                            </>
                          ) : (
                            <>
                              Pay ₹4,999 Now
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 'success' && (
                    <motion.div
                      key="success-step"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="panel-card p-8 flex flex-col items-center justify-center text-center gap-4 border-emerald-500/30 bg-emerald-500/5"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Payment Successful!</h3>
                        <p className="text-xs text-slate-400 mt-1.5 max-w-sm">Congratulations! Your profile has been promoted to the Spotlight section on the India Care homepage.</p>
                      </div>
                      <button
                        onClick={() => {
                          setStep('info');
                          fetchPromotions();
                        }}
                        className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-brand flex items-center gap-1.5 hover-lift"
                      >
                        View Active Promotion <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* RIGHT: Homepage Spotlight Card Live Preview */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Homepage Card Live Preview</h3>
                
                {/* Live Card */}
                <div className="relative group bg-white border border-slate-100 rounded-3xl p-5 shadow-lg flex flex-col justify-between overflow-hidden text-slate-900 text-left">
                  {/* Spotlight border shine */}
                  <div className="absolute inset-0 border-2 border-amber-400/20 rounded-3xl pointer-events-none" />
                  
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Award className="w-2.5 h-2.5" /> Promoted Partner
                      </span>
                      <div className="flex items-center gap-0.5 text-[10px] font-black text-slate-900">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {MOCK_DOCTOR.rating}
                      </div>
                    </div>

                    {/* Profile */}
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 relative">
                        <img 
                          src={MOCK_DOCTOR.photo} 
                          alt={MOCK_DOCTOR.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 leading-tight truncate">
                          {MOCK_DOCTOR.name}
                        </h4>
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                          {MOCK_DOCTOR.speciality}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-semibold">
                          <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {MOCK_DOCTOR.city}</span>
                          <span>•</span>
                          <span>{MOCK_DOCTOR.experience} Yrs</span>
                        </div>
                      </div>
                    </div>

                    {/* Tagline */}
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-400/5 border border-amber-400/10 relative min-h-[50px] flex items-center justify-center">
                      <p className="text-[10px] font-bold text-slate-700 leading-relaxed italic text-center">
                        "{tagline || 'Your tagline will appear here...'}"
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <span className="flex-1 text-center text-[10px] font-bold text-slate-500 bg-slate-50 py-2 rounded-lg border border-slate-200">
                      View Details
                    </span>
                    <span className="flex-1 text-center text-[10px] font-bold text-white gradient-primary py-2 rounded-lg shadow-sm flex items-center justify-center gap-1">
                      Book Slot <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5">
                    <span className="text-amber-400 mt-0.5">★</span>
                    Previews match the exact font sizes, spacing, and glass effects featured on the main website portal.
                  </p>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
