'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Save, Check, Rocket, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/auth/UserMenu';
import { PageSwitcher } from '@/components/editor/PageSwitcher';
import { getProjectDomain } from '@/lib/url-utils';
import { confirm } from '@/components/shared/ConfirmDialog';

interface EditorHeaderProps {
  project: any;
  targetProject: any;
  currentPage: any;
  targetPages: any[];
  initialProject: any;
  initialPageId: string;
  hasUnsavedChanges: boolean;
  siteStatus: 'pubblicato' | 'bozza' | 'non_pubblicato';
  isPublishing: boolean;
  isLoading: boolean;
  font: string;
  onSave: () => void;
  onPublish: () => void;
}

export function EditorHeader({
  project,
  targetProject,
  currentPage,
  targetPages,
  initialProject,
  initialPageId,
  hasUnsavedChanges,
  siteStatus,
  isPublishing,
  isLoading,
  font,
  onSave,
  onPublish
}: EditorHeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-zinc-200/80 flex items-center justify-between px-5 shrink-0 z-[9999] relative">
      {/* Left: breadcrumb + status */}
      <div className="flex items-center gap-2">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/editor"
            onClick={async (e) => {
              if (hasUnsavedChanges) {
                e.preventDefault();
                if (await confirm({ title: 'Modifiche non salvate', message: 'Hai delle modifiche non salvate. Vuoi abbandonare la pagina e perdere le modifiche?', confirmLabel: 'Abbandona', variant: 'danger' })) {
                  window.location.href = '/editor';
                }
              }
            }}
            className="text-zinc-400 hover:text-zinc-600 transition-colors font-medium text-[13px]"
          >
            I miei siti
          </Link>
          <ChevronRight size={12} className="text-zinc-300" />
          <Link
            href={`/editor/${initialProject?.id}`}
            onClick={async (e) => {
              if (hasUnsavedChanges) {
                e.preventDefault();
                if (await confirm({ title: 'Modifiche non salvate', message: 'Hai delle modifiche non salvate. Vuoi abbandonare la pagina e perdere le modifiche?', confirmLabel: 'Abbandona', variant: 'danger' })) {
                  window.location.href = `/editor/${initialProject?.id}`;
                }
              }
            }}
            className="text-zinc-400 hover:text-zinc-600 transition-colors font-medium max-w-[120px] truncate text-[13px]"
          >
            {targetProject?.name || 'Sito'}
          </Link>
          <ChevronRight size={12} className="text-zinc-300" />
          <PageSwitcher
            currentPage={currentPage}
            pages={targetPages}
            projectId={initialProject.id}
            initialPageId={initialPageId}
            fontFamily="'DM Sans', sans-serif"
          />
        </nav>

        <div className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ml-2",
          siteStatus === 'pubblicato'
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
            : siteStatus === 'bozza'
              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
              : "bg-zinc-100 text-zinc-500 border border-zinc-200/60"
        )}>
          <div className={cn("w-1.5 h-1.5 rounded-full",
            siteStatus === 'pubblicato' ? "bg-emerald-500" :
              siteStatus === 'bozza' ? "bg-amber-500" : "bg-zinc-400"
          )} />
          {siteStatus === 'pubblicato' ? 'Online' : siteStatus === 'bozza' ? 'Bozza' : 'Bozza'}
        </div>

        {currentPage?.language && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white border border-zinc-900 shadow-sm ml-1">
            {currentPage.language}
          </div>
        )}

        {project?.live_url && (
          <a
            href={getProjectDomain(project)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <ExternalLink size={12} />
            <span className="hidden xl:inline">Vedi sito</span>
          </a>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2" data-tour="publish-btn">
        <button
          onClick={onSave}
          disabled={!hasUnsavedChanges && !isLoading}
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all text-sm font-medium",
            hasUnsavedChanges
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200"
              : "text-zinc-400 hover:text-zinc-500"
          )}
          title={hasUnsavedChanges ? "Salva Modifiche (Ctrl+S)" : "Tutto Salvato"}
        >
          {hasUnsavedChanges ? <Save size={14} /> : <Check size={14} />}
          <span className="hidden sm:inline">{hasUnsavedChanges ? 'Salva' : 'Salvato'}</span>
        </button>

        <UserMenu />

        <button
          onClick={onPublish}
          disabled={isPublishing || isLoading}
          className="flex items-center gap-2 px-5 py-1.5 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <Rocket size={14} />}
          {isPublishing ? 'Pubblicando...' : 'Pubblica'}
        </button>
      </div>
    </header>
  );
}
