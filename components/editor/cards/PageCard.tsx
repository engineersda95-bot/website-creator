'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Clock, Globe, Loader2, Trash2, Search } from 'lucide-react';
import { Page } from '@/types/editor';

interface PageCardProps {
  page: Page;
  projectId: string;
  formatDate: (d: string) => string;
  onOpenSeo: (id: string) => void;
  onOpenTranslate: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  onInternalNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function PageCard({ page, projectId, formatDate, onOpenSeo, onOpenTranslate, onDelete, isDeleting, onInternalNavigate }: PageCardProps) {
  const langEmoji: Record<string, string> = {
    it: '🇮🇹',
    en: '🇬🇧',
    fr: '🇫🇷',
    de: '🇩🇪',
    es: '🇪🇸',
  };

  return (
    <div
      className={`group relative bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all flex flex-col ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <Link 
        href={`/editor/${projectId}/${page.id}`} 
        onClick={onInternalNavigate}
        className="flex-1 p-5 pb-3"
      >
        <div className="flex items-start justify-between mb-3 text-zinc-400 group-hover:text-blue-600 transition-colors">
          <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center">
            <FileText size={18} />
          </div>
          {page.language && (
            <div className="flex items-center justify-center w-8 h-8 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold text-zinc-600 uppercase">
              {langEmoji[page.language] || page.language}
            </div>
          )}
        </div>
        <h3 className="text-sm font-bold text-zinc-900 transition-colors">
          {page.title}
        </h3>
        <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1.5 uppercase font-bold">
          <Clock size={10} />
          Modificata {formatDate(page.updated_at)}
        </p>
      </Link>

      <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/30">
        <span className="text-[11px] text-zinc-400 font-mono">/{page.slug}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenSeo(page.id)}
            className="p-1.5 rounded-md text-zinc-300 hover:text-zinc-500 hover:bg-white transition-all shadow-sm"
            title="Impostazioni SEO"
          >
            <div className="flex items-center gap-1 px-1">
              <Search size={14} />
              <span className="text-[10px] font-bold uppercase">SEO</span>
            </div>
          </button>
          <button
            onClick={() => onOpenTranslate(page.id)}
            className="p-1.5 rounded-md text-zinc-300 hover:text-blue-600 hover:bg-white transition-all shadow-sm"
            title="Traduci"
          >
            <Globe fontStyle="italic" size={14} className="scale-x-[-1]" />
          </button>
          {page.slug !== 'home' && (
            <button
              onClick={() => onDelete(page.id)}
              disabled={isDeleting}
              className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-white rounded-md transition-all shadow-sm disabled:opacity-50"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
