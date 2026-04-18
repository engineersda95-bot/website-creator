'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Trash2, MonitorPlay } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlogPost } from '@/types/editor';

interface BlogPostHeaderProps {
  post: BlogPost;
  projectId: string;
  hasChanges: boolean;
  isSaving: boolean;
  isMultilingual: boolean;
  postLang: string;
  siblingTranslations: { id: string; language: string; title: string }[];
  normalizeLang: (lang: string) => string;
  onNavigateBack: () => void;
  onSave: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onShowPreview: () => void;
}

export function BlogPostHeader({
  post,
  projectId,
  hasChanges,
  isSaving,
  isMultilingual,
  postLang,
  siblingTranslations,
  normalizeLang,
  onNavigateBack,
  onSave,
  onToggleStatus,
  onDelete,
  onShowPreview,
}: BlogPostHeaderProps) {
  return (
    <header className="h-12 bg-white border-b border-zinc-200/80 flex items-center justify-between px-4 shrink-0 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onNavigateBack}
          className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-[13px] font-semibold text-zinc-700 truncate max-w-[250px]">
          {post.title || 'Nuovo Articolo'}
        </span>
        <span className={cn(
          "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
          post.status === 'published' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
        )}>
          {post.status === 'published' ? 'Pubblicato' : 'Bozza'}
        </span>

        {isMultilingual && (
          <div className="flex items-center bg-zinc-100 p-0.5 ml-3 rounded-md border border-zinc-200/50">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white text-zinc-900 rounded-[4px] shadow-sm border border-zinc-200/50">
              {postLang.split('-')[0]}
            </div>
            {siblingTranslations.map(s => (
              <Link
                key={s.id}
                href={`/editor/${projectId}/blog/${s.id}`}
                title={s.title}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-800 transition-colors block"
              >
                {normalizeLang(s.language).split('-')[0]}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onSave}
          disabled={!hasChanges && !isSaving}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all",
            hasChanges ? "bg-blue-600 text-white hover:bg-blue-700" : "text-zinc-400"
          )}
        >
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {isSaving ? 'Salvo...' : hasChanges ? 'Salva' : 'Salvato'}
        </button>

        <button
          onClick={onShowPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all"
          title="Anteprima articolo"
        >
          <MonitorPlay size={13} />
          Anteprima
        </button>

        <button
          onClick={onToggleStatus}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all",
            post.status === 'published'
              ? "text-amber-700 hover:bg-amber-50"
              : "bg-zinc-900 text-white hover:bg-zinc-800"
          )}
        >
          {post.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} />}
          {post.status === 'published' ? 'Metti in bozza' : 'Pubblica'}
        </button>

        <button onClick={onDelete} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </header>
  );
}
