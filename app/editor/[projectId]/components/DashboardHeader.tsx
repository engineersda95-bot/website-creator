'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Loader2, Trash2, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProjectDomain } from '@/lib/url-utils';
import { Project } from '@/types/editor';

interface DashboardHeaderProps {
  project: Project;
  isPublished: boolean;
  isPublishing: boolean;
  isDeletingProject: boolean;
  onPublish: () => void;
  onDelete: () => void;
  onInternalNavigation: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function DashboardHeader({
  project,
  isPublished,
  isPublishing,
  isDeletingProject,
  onPublish,
  onDelete,
  onInternalNavigation,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-10">
      <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/editor"
            onClick={onInternalNavigation}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline font-bold">I miei siti</span>
          </Link>
          <div className="h-5 w-px bg-zinc-200" />
          <h1 className="text-sm font-bold text-zinc-900">{project?.name}</h1>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
            isPublished
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : "bg-zinc-100 text-amber-600 border border-zinc-200/60"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", isPublished ? "bg-emerald-500" : "bg-amber-400 animate-pulse")} />
            {isPublished ? 'Online' : 'Bozza'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {project?.live_url && (
            <a
              href={getProjectDomain(project)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-bold"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Vedi sito live</span>
            </a>
          )}
          <button
            onClick={onDelete}
            disabled={isDeletingProject}
            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Elimina sito"
          >
            {isDeletingProject ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <Rocket size={14} />}
            {isPublishing ? 'Pubblicazione...' : 'Pubblica'}
          </button>
        </div>
      </div>
    </header>
  );
}
