import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock, ArrowLeft, ArrowRight, Calendar, User, Tag, Home, BookOpen, Heart, Share2 } from 'lucide-react';
import { INITIAL_BLOGS } from '@/lib/mockData';
import { Metadata } from 'next';

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const blog = INITIAL_BLOGS.find(b => b.id === id);
  if (!blog) return { title: 'Article Not Found - India Care Consultancy' };
  return { title: `${blog.title} - India Care Consultancy`, description: blog.excerpt };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const blog = INITIAL_BLOGS.find(b => b.id === id);
  if (!blog) notFound();

  const relatedArticles = INITIAL_BLOGS.filter(b => b.category === blog.category && b.id !== blog.id).slice(0, 2);
  const allOthers = INITIAL_BLOGS.filter(b => b.id !== blog.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-light-grey">

      {/* ── Hero banner ── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0A5C4E 0%, #127A6A 55%, #1A9A83 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-white/60 text-xs font-medium mb-6">
            <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors"><Home className="w-3 h-3" /> Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold line-clamp-1">{blog.title}</span>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="flex items-center gap-1.5 bg-white/20 border border-white/25 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
              <Tag className="w-3 h-3" /> {blog.category}
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 border border-white/20 text-white/80 text-[10px] font-bold px-3 py-1.5 rounded-full">
              <Clock className="w-3 h-3" /> {blog.readTime}
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 border border-white/20 text-white/80 text-[10px] font-bold px-3 py-1.5 rounded-full">
              <Calendar className="w-3 h-3" /> {blog.date}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {blog.title}
          </h1>

          {/* Author row */}
          <div className="flex items-center gap-3 mt-5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-sm shadow-md border border-white/20">
              {blog.author[0]}
            </div>
            <div>
              <p className="text-white font-bold text-xs">{blog.author}</p>
              <p className="text-white/60 text-[10px]">Medical Contributor · India Care Consultancy</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Back link */}
        <Link href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-green transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

          {/* Article body */}
          <article className="lg:col-span-2">
            {/* Hero image */}
            <div className="relative aspect-video rounded-3xl overflow-hidden mb-8 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
            </div>

            {/* Excerpt highlight */}
            <div className="bg-soft-green border-l-4 border-primary-green rounded-r-2xl px-5 py-4 mb-8">
              <p className="text-sm text-primary-green font-semibold leading-relaxed italic">{blog.excerpt}</p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <div className="prose max-w-none text-sm text-slate-700 leading-loose space-y-5">
                {blog.content.split('\n\n').map((para, i) => {
                  if (para.startsWith('### ')) {
                    return (
                      <h3 key={i} className="font-extrabold text-lg text-dark-navy pt-4 pb-1 border-b border-slate-100">
                        {para.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (para.startsWith('- ')) {
                    return (
                      <ul key={i} className="list-none space-y-2 my-3">
                        {para.split('\n').map((li, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-green mt-2.5 flex-shrink-0" />
                            <span>{li.replace('- ', '')}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i} className="text-slate-600">{para}</p>;
                })}
              </div>
            </div>

            {/* Tags / Share row */}
            <div className="flex items-center justify-between flex-wrap gap-3 mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-text-grey uppercase tracking-wider">Category:</span>
                <span className="flex items-center gap-1 bg-soft-green border border-primary-green/15 text-primary-green text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <Tag className="w-2.5 h-2.5" /> {blog.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] text-text-grey font-semibold">Medically reviewed</span>
                <Share2 className="w-3.5 h-3.5 text-slate-400 ml-2" />
                <span className="text-[10px] text-text-grey font-semibold">Share</span>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="flex flex-col gap-5">
            {/* CTA */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="gradient-primary p-5">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Need Help?</p>
                <h4 className="font-extrabold text-white text-sm leading-tight">Speak to a Medical Consultant</h4>
                <p className="text-white/75 text-[11px] mt-2 leading-relaxed">Get personalised guidance from our verified clinical team.</p>
              </div>
              <div className="p-4">
                <Link href="/book-consultation"
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white gradient-primary py-3 rounded-xl shadow-md glow-green"
                >
                  Book Consultation
                </Link>
                <Link href="/find-doctor"
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-primary-green bg-soft-green border border-primary-green/15 py-3 rounded-xl mt-2 hover:bg-light-mint transition-colors"
                >
                  Find a Doctor
                </Link>
              </div>
            </div>

            {/* Author card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-[10px] font-bold text-text-grey uppercase tracking-wider mb-3">About the Author</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-sm">
                  {blog.author[0]}
                </div>
                <div>
                  <p className="font-bold text-dark-navy text-sm">{blog.author}</p>
                  <p className="text-[10px] text-text-grey">Medical Contributor</p>
                </div>
              </div>
              <p className="text-[11px] text-text-grey leading-relaxed">Certified specialist contributing medically reviewed health content for India Care Consultancy.</p>
            </div>

            {/* More articles */}
            {allOthers.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-[10px] font-bold text-text-grey uppercase tracking-wider mb-3 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> More Articles
                </p>
                <div className="flex flex-col gap-3">
                  {allOthers.map(b => (
                    <Link key={b.id} href={`/blog/${b.id}`}
                      className="flex gap-3 group hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-primary-green uppercase tracking-wide">{b.category}</p>
                        <p className="text-[11px] font-bold text-dark-navy group-hover:text-primary-green transition-colors line-clamp-2 leading-snug mt-0.5">{b.title}</p>
                        <p className="text-[9px] text-text-grey mt-1 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{b.readTime}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="font-extrabold text-dark-navy text-lg mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-green" /> Related Health Guides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {relatedArticles.map(rel => (
                <Link key={rel.id} href={`/blog/${rel.id}`}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex gap-4 p-4 hover:shadow-md hover:border-primary-green/15 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-primary-green uppercase tracking-wide flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> {rel.category}
                    </span>
                    <h4 className="font-bold text-sm text-dark-navy group-hover:text-primary-green transition-colors line-clamp-2 mt-1 leading-snug">{rel.title}</h4>
                    <p className="text-[10px] text-text-grey mt-1.5 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {rel.readTime}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-green transition-colors flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
