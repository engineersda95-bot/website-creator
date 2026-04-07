'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Clock, Languages, Loader2, Trash2, Search } from 'lucide-react';
import { Page } from '@/types/editor';
import { cn } from '@/lib/utils';

interface PageCardProps {
  page: Page;
  projectId: string;
  formatDate: (d: string) => string;
  onOpenSeo: (id: string) => void;
  onDelete: (id: string) => void;
  onTranslate?: (page: Page) => void;
  isDeleting?: boolean;
  onInternalNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  score?: number;
  onScoreClick?: () => void;
}

export function PageCard({ page, projectId, formatDate, onOpenSeo, onDelete, onTranslate, isDeleting, onInternalNavigate, score, onScoreClick }: PageCardProps) {
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
        <h3 className="text-sm font-bold text-zinc-900 transition-colors truncate">
          {page.title}
        </h3>
        <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1.5 uppercase font-bold">
          <Clock size={10} />
          Modificata {formatDate(page.updated_at)}
        </p>
      </Link>

      <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/30">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-400 font-mono">/{page.slug}</span>
          {score !== undefined && (
            <button
              onClick={() => onScoreClick?.()}
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all hover:shadow-sm",
                score === 100 ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                score >= 60 ? "bg-blue-50 text-blue-600 border-blue-200" :
                "bg-amber-50 text-amber-600 border-amber-200"
              )}
              title="Completamento pagina"
            >
              {score}%
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onTranslate && (
            <button
              onClick={() => onTranslate(page)}
              className="p-1.5 rounded-md text-zinc-300 hover:text-blue-500 hover:bg-white transition-all shadow-sm"
              title="Traduci pagina"
            >
              <Languages size={14} />
            </button>
          )}
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
            onClick={() => onDelete(page.id)}
            disabled={isDeleting}
            className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-white rounded-md transition-all shadow-sm disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
