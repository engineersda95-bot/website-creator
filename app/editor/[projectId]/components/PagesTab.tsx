'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { PageCard } from '@/components/editor/cards/PageCard';
import { getCompletionScore, runPageChecks } from '@/lib/site-checklist';
import type { Page, Project } from '@/types/editor';

interface PagesTabProps {
  pages: Page[];
  project: Project;
  isCreating: boolean;
  setIsCreating: (v: boolean) => void;
  newTitle: string;
  setNewTitle: (v: string) => void;
  newSlug: string;
  setNewSlug: (v: string) => void;
  deletingPageId: string | null;
  onCreatePage: (e: React.FormEvent) => void;
  onDeletePage: (id: string) => void;
  onOpenSeo: (id: string) => void;
  onTranslate?: (page: Page) => void;
  onInternalNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onChecklistClick: (pageId: string) => void;
  userLimits: any;
}

export function PagesTab({
  pages,
  project,
  isCreating,
  setIsCreating,
  newTitle,
  setNewTitle,
  newSlug,
  setNewSlug,
  deletingPageId,
  onCreatePage,
  onDeletePage,
  onOpenSeo,
  onTranslate,
  onInternalNavigate,
  onChecklistClick,
  userLimits,
}: PagesTabProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            if (atLimit) {
              // Toast handled in parent via import
              return;
            }
            setIsCreating(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-all"
        >
          <Plus size={16} />
          Nuova pagina
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreating(false)} />
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
                  onChange={(e) => setNewTitle(e.target.value)}
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
                    onChange={(e) => setNewSlug(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
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
            onOpenSeo={onOpenSeo}
            onDelete={onDeletePage}
            onTranslate={onTranslate}
            isDeleting={deletingPageId === page.id}
            onInternalNavigate={onInternalNavigate}
            score={getCompletionScore(runPageChecks(project, pages, page))}
            onScoreClick={() => onChecklistClick(page.id)}
          />
        ))}
      </div>
    </div>
  );
}
