'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Clock, ArrowRight, BookOpen, ChevronRight, Home, Tag, TrendingUp } from 'lucide-react';
import { INITIAL_BLOGS } from '@/lib/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

export default function BlogListingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = useMemo(() => Array.from(new Set(INITIAL_BLOGS.map(b => b.category))), []);

  const filteredBlogs = useMemo(() =>
    INITIAL_BLOGS.filter(blog => {
      const matchSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch && (selectedCategory ? blog.category === selectedCategory : true);
    }), [searchTerm, selectedCategory]);

  const featured = filteredBlogs[0];
  const rest = filteredBlogs.slice(1);

  return (
    <div className="min-h-screen bg-light-grey">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0A5C4E 0%, #127A6A 55%, #1A9A83 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-white/60 text-xs font-medium mb-7"
          >
            <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors"><Home className="w-3 h-3" /> Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">Health Blog & Guides</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">India Care Consultancy</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Health Advice &<br className="hidden sm:block" /> Medical Guides
            </h1>
            <p className="text-white/65 text-sm mt-3 max-w-xl leading-relaxed">
              Medically reviewed articles written by certified specialists in our consultant network.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-7 relative max-w-lg"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Search articles, symptoms, specialities…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-white/20 pl-11 pr-4 py-3.5 rounded-2xl text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-lg"
            />
          </motion.div>

          {/* Category filters */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-5 flex gap-2 overflow-x-auto no-scrollbar pb-1"
          >
            {['', ...categories].map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 border transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-primary-green border-white shadow-sm'
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                }`}
              >
                {cat || 'All Articles'}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-soft-green flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary-green/50" />
            </div>
            <h3 className="font-bold text-dark-navy text-lg">No Articles Found</h3>
            <p className="text-sm text-text-grey max-w-sm">Try a different keyword or reset the category filter.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
              className="text-sm font-bold text-white gradient-primary px-6 py-2.5 rounded-xl shadow-md"
            >Reset Filters</button>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-10">
                <Link href={`/blog/${featured.id}`}
                  className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2 hover:shadow-lg hover:border-primary-green/20 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-navy/10 lg:from-transparent" />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="bg-primary-green text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Featured</span>
                      <span className="bg-white/90 text-primary-green text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-100">{featured.category}</span>
                    </div>
                  </div>
                  <div className="p-7 lg:p-10 flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-3 text-[11px] text-text-grey font-semibold">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.readTime}</span>
                      <span>·</span>
                      <span>{featured.date}</span>
                    </div>
                    <h2 className="text-xl lg:text-2xl font-extrabold text-dark-navy leading-tight group-hover:text-primary-green transition-colors">{featured.title}</h2>
                    <p className="text-sm text-text-grey leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500">By {featured.author}</span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-primary-green">
                        Read Full Article <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-extrabold text-dark-navy">
                    {selectedCategory ? selectedCategory : 'More Articles'}
                    <span className="ml-2 text-xs font-bold text-text-grey bg-slate-100 px-2 py-0.5 rounded-full">{rest.length}</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((blog, i) => (
                    <motion.article
                      key={blog.id}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-primary-green/15 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 bg-white/95 text-primary-green text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-100 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" /> {blog.category}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-[10px] text-text-grey font-semibold mb-2.5">
                          <span>{blog.date}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blog.readTime}</span>
                        </div>
                        <h3 className="font-extrabold text-dark-navy text-sm leading-snug group-hover:text-primary-green transition-colors line-clamp-2 flex-1">
                          <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
                        </h3>
                        <p className="text-[11px] text-text-grey mt-2 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400">By {blog.author}</span>
                          <Link href={`/blog/${blog.id}`}
                            className="flex items-center gap-1 text-[11px] font-bold text-primary-green hover:text-dark-green transition-colors"
                          >
                            Read <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
