'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Save, Check, Rocket, Loader2, ExternalLink, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';
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
  onSave,
  onPublish
}: EditorHeaderProps) {
  const navigateWithCheck = async (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      if (await confirm({ title: 'Modifiche non salvate', message: 'Hai delle modifiche non salvate. Vuoi abbandonare la pagina e perdere le modifiche?', confirmLabel: 'Abbandona', variant: 'danger' })) {
        useEditorStore.getState().setUnsavedChanges(false);
        window.location.href = href;
      }
    }
  };

  return (
    <header className="h-12 bg-white border-b border-zinc-200/80 flex items-center justify-between px-4 shrink-0 z-[9999] relative">
      {/* Left: back + project name + page switcher */}
      <div className="flex items-center gap-2 min-w-0" data-tour="editor-nav">
        <Link
          href={`/editor/${initialProject?.id}`}
          onClick={(e) => navigateWithCheck(e, `/editor/${initialProject?.id}`)}
          className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all shrink-0"
          title="Torna alla gestione pagine"
          data-tour="back-btn"
        >
          <ArrowLeft size={16} />
        </Link>

        <div className="flex items-center gap-1.5 min-w-0" data-tour="site-page-nav">
          <span className="text-[13px] font-semibold text-zinc-700 truncate max-w-[140px]" title={targetProject?.name}>
            {targetProject?.name || 'Sito'}
          </span>
          <ChevronRight size={10} className="text-zinc-300 shrink-0" />
          <PageSwitcher
            currentPage={currentPage}
            pages={targetPages}
            projectId={initialProject.id}
            initialPageId={initialPageId}
            fontFamily="'DM Sans', sans-serif"
          />
        </div>

        {/* Status dot */}
        <div className={cn(
          "w-2 h-2 rounded-full shrink-0 ml-1",
          siteStatus === 'pubblicato' ? "bg-emerald-500" : "bg-amber-400"
        )} title={siteStatus === 'pubblicato' ? 'Online' : 'Bozza'} />

        {project?.live_url && (
          <a
            href={getProjectDomain(project)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-zinc-300 hover:text-blue-500 transition-colors shrink-0"
            title="Apri sito live"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Right: save + publish + user */}
      <div className="flex items-center gap-1.5" data-tour="publish-btn">
        <button
          onClick={onSave}
          disabled={!hasUnsavedChanges && !isLoading}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-[13px] font-medium",
            hasUnsavedChanges
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "text-zinc-400"
          )}
          title={hasUnsavedChanges ? "Salva (Ctrl+S)" : "Tutto salvato"}
        >
          {isLoading ? <Loader2 size={13} className="animate-spin" /> : hasUnsavedChanges ? <Save size={13} /> : <Check size={13} />}
          <span className="hidden sm:inline">{isLoading ? 'Salvo...' : hasUnsavedChanges ? 'Salva' : 'Salvato'}</span>
        </button>

        <button
          onClick={onPublish}
          disabled={isPublishing || isLoading}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.97] disabled:opacity-50"
        >
          {isPublishing ? <Loader2 className="animate-spin" size={13} /> : <Rocket size={13} />}
          <span className="hidden sm:inline">{isPublishing ? 'Pubblico...' : 'Pubblica'}</span>
        </button>

        <UserMenu />
      </div>
    </header>
  );
}
