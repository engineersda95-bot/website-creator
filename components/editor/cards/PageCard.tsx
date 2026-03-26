'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Clock, Globe, Trash2 } from 'lucide-react';
import { Page } from '@/types/editor';

interface PageCardProps {
  page: Page;
  projectId: string;
  formatDate: (d: string) => string;
  onOpenSeo: (id: string) => void;
  onDelete: (id: string) => void;
  onInternalNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function PageCard({ page, projectId, formatDate, onOpenSeo, onDelete, onInternalNavigate }: PageCardProps) {
  return (
    <div
      className="group relative bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all flex flex-col"
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
            <Globe size={14} />
          </button>
          {page.slug !== 'home' && (
            <button
              onClick={() => onDelete(page.id)}
              className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-white rounded-md transition-all shadow-sm"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
