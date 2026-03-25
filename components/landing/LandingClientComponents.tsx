'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Animated Section (Intersection Observer) ---
export function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

// --- FAQ Accordion Item ---
export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-lg font-medium text-zinc-900 group-hover:text-blue-600 transition-colors">
          {q}
        </span>
        <svg
          className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}
      >
        <p className="text-zinc-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

// --- Mobile Navigation ---
export function MobileNav() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileMenu(!mobileMenu)}
        className="md:hidden p-2 text-zinc-600 hover:text-zinc-900"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          {mobileMenu ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          )}
        </svg>
      </button>
      {mobileMenu && (
        <div className="md:hidden absolute top-full left-0 right-0 border-t border-zinc-100 bg-white px-6 py-4 space-y-3 shadow-lg">
          <a href="#come-funziona" onClick={() => setMobileMenu(false)} className="block text-sm text-zinc-600 hover:text-zinc-900">Come funziona</a>
          <a href="#funzionalita" onClick={() => setMobileMenu(false)} className="block text-sm text-zinc-600 hover:text-zinc-900">Funzionalità</a>
          <a href="#template" onClick={() => setMobileMenu(false)} className="block text-sm text-zinc-600 hover:text-zinc-900">Template</a>
          <a href="#faq" onClick={() => setMobileMenu(false)} className="block text-sm text-zinc-600 hover:text-zinc-900">FAQ</a>
          <Link href="/blog" onClick={() => setMobileMenu(false)} className="block text-sm text-zinc-600 hover:text-zinc-900">Blog</Link>
          <Link href="/editor" className="block w-full text-center px-5 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-medium mt-2">
            Crea il tuo sito
          </Link>
        </div>
      )}
    </>
  );
}
