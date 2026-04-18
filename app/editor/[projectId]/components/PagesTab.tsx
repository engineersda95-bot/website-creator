'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Page, Project } from '@/types/editor';
import { toast } from '@/components/shared/Toast';
import { PageCard } from '@/components/editor/cards/PageCard';
import { getCompletionScore, runPageChecks } from '@/lib/site-checklist';
import type { UserLimits } from '@/lib/permissions';

interface PagesTabProps {
  project: Project;
  pages: Page[];
  isCreating: boolean;
  newTitle: string;
  newSlug: string;
  deletingPageId: string | null;
  userLimits: UserLimits | null;
  onSetIsCreating: (v: boolean) => void;
  onSetNewTitle: (v: string) => void;
  onSetNewSlug: (v: string) => void;
  onCreatePage: (e: React.FormEvent) => void;
  onDeletePage: (pageId: string) => void;
  onOpenSeo: (pageId: string) => void;
  onTranslate?: (page: Page) => void;
  onInternalNavigation: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onScoreClick: (pageId: string) => void;
  formatDate: (date: string) => string;
}

export function PagesTab({
  project,
  pages,
  isCreating,
  newTitle,
  newSlug,
  deletingPageId,
  userLimits,
  onSetIsCreating,
  onSetNewTitle,
  onSetNewSlug,
  onCreatePage,
  onDeletePage,
  onOpenSeo,
  onTranslate,
  onInternalNavigation,
  onScoreClick,
  formatDate,
}: PagesTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Le tue Pagine</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{pages.length} {pages.length === 1 ? 'pagina' : 'pagine'} disponibili</p>
        </div>
        <button
          onClick={() => {
            const atLimit = userLimits?.max_pages_per_project !== null && pages.length >= (userLimits?.max_pages_per_project ?? 0);
            if (atLimit) { toast(`Hai raggiunto il limite di ${userLimits?.max_pages_per_project} pagine per sito del tuo piano`, 'error'); return; }
            onSetIsCreating(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-all"
        >
          <Plus size={16} />
          Nuova pagina
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onSetIsCreating(false)} />
          <form
            onSubmit={onCreatePage}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-zinc-200"
          >
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Nuova Pagina</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Titolo</label>
                <input
                  autoFocus
                  className="w-full px-4 py-2 text-sm border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none transition-all"
                  placeholder="Es. Chi Siamo"
                  value={newTitle}
                  onChange={(e) => onSetNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Slug URL</label>
                <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden focus-within:border-zinc-400 transition-all">
                  <span className="px-2.5 text-sm text-zinc-400 bg-zinc-50 py-2 border-r border-zinc-200 font-mono">/</span>
                  <input
                    className="flex-1 px-3 py-2 text-sm outline-none font-mono"
                    placeholder="chi-siamo"
                    value={newSlug}
                    onChange={(e) => onSetNewSlug(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => onSetIsCreating(false)}
                className="flex-1 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="flex-1 px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
              >
                Crea pagina
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {pages.map((page) => (
          <PageCard
            key={page.id}
            page={page}
            projectId={project.id}
            formatDate={formatDate}
            onOpenSeo={(id) => onOpenSeo(id)}
            onDelete={onDeletePage}
            onTranslate={onTranslate}
            isDeleting={deletingPageId === page.id}
            onInternalNavigate={onInternalNavigation}
            score={getCompletionScore(runPageChecks(project, pages, page))}
            onScoreClick={() => onScoreClick(page.id)}
          />
        ))}
      </div>
    </div>
  );
}
