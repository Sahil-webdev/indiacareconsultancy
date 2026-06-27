'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  city: string;
  rating: number;
  review: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Rajesh Mehta',
    city: 'Delhi',
    rating: 5,
    review: 'India Care Consultancy saved us hours of stress. When my father needed a cardiologist, they recommended Dr. Ramesh Kumar. The appointment was booked in a click, and the care was outstanding.',
  },
  {
    id: 2,
    name: 'Priyanka Sen',
    city: 'Kolkata',
    rating: 5,
    review: 'The consultant I spoke to was incredibly patient. She walked me through different options for joint replacement within my budget. The transparency they offer is amazing.',
  },
  {
    id: 3,
    name: 'Sandeep Reddy',
    city: 'Hyderabad',
    rating: 4.8,
    review: 'Highly professional guidance! They helped me compare facilities at three different partner hospitals. Super helpful service for anyone confused about where to go.',
  },
  {
    id: 4,
    name: 'Meenakshi Iyer',
    city: 'Chennai',
    rating: 5,
    review: 'A trustworthy healthcare consultancy. They respect data privacy, and the doctor recommendation was spot on. Highly recommended for family healthcare decisions!',
  }
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 md:px-12 py-10">
      <div className="absolute top-0 left-6 text-slate-100 hidden md:block select-none pointer-events-none">
        <Quote className="w-24 h-24 stroke-[1]" />
      </div>

      <div className="relative overflow-hidden min-h-[200px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full text-center px-4 md:px-8"
          >
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(testimonials[index].rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>

            <p className="text-base md:text-lg lg:text-xl text-slate-600 font-medium italic leading-relaxed mb-6">
              &quot;{testimonials[index].review}&quot;
            </p>

            <h5 className="font-bold text-dark-navy text-sm md:text-base">
              {testimonials[index].name}
            </h5>
            <p className="text-xs text-text-grey mt-0.5">{testimonials[index].city}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-6 mt-8">
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-full bg-white border border-slate-150 hover:bg-slate-50 text-slate-600 shadow-sm transition-colors duration-150"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-primary-green' : 'w-2.5 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2.5 rounded-full bg-white border border-slate-150 hover:bg-slate-50 text-slate-600 shadow-sm transition-colors duration-150"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
