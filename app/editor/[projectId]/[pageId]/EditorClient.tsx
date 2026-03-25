'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useEditorStore } from '@/store/useEditorStore';
import { BlockSidebar } from '@/components/blocks/BlockSidebar';
import { EditorCanvas } from '@/components/blocks/EditorCanvas';
import { ConfigSidebar } from '@/components/blocks/ConfigSidebar';
import { deployToCloudflare } from '@/app/actions/deploy';
import { Loader2, Save, ExternalLink, Rocket, Check, ChevronRight } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { cn } from '@/lib/utils';
import { getProjectDomain } from '@/lib/url-utils';
import { ToastContainer, toast } from '@/components/shared/Toast';
import { OnboardingTour } from '@/components/editor/OnboardingTour';

export function EditorClient({
  initialUser,
  initialProject,
  initialPages,
  initialPageId
}: {
  initialUser: any;
  initialProject: any;
  initialPages: any[];
  initialPageId: string;
}) {
  const {
    setProject,
    saveCurrentPage,
    setUser,
    hydrateEditor,
    initialize,
    project,
    currentPage,
    projectPages,
    isLoading,
    isInitialized,
    user,
    hasUnsavedChanges,
  } = useEditorStore();

  const targetProject = project || initialProject;
  const targetPages = (projectPages && projectPages.length > 0) ? projectPages : initialPages;

  const isPublished = !!targetProject?.live_url;
  const isDraftAtLeastOnePage = targetPages.some(p => {
    if (!targetProject?.last_published_at) return false;
    const updatedAt = new Date(p.updated_at).getTime();
    const publishedAt = new Date(targetProject.last_published_at).getTime();
    if (hasUnsavedChanges) return true;
    return updatedAt > publishedAt;
  });

  const siteStatus = !isPublished ? 'non_pubblicato' : (hasUnsavedChanges || isDraftAtLeastOnePage ? 'bozza' : 'pubblicato');

  const [isPublishing, setIsPublishing] = React.useState(false);

  // Hydrate user
  useEffect(() => {
    if (initialUser && !user) setUser(initialUser);
  }, [initialUser, user, setUser]);

  // Hydrate project + pages + specific page
  useEffect(() => {
    if (initialProject && initialPages && !project) {
      hydrateEditor(initialProject, initialPages, initialPageId);
    }
  }, [initialProject, initialPages, initialPageId, project, hydrateEditor]);

  useEffect(() => { initialize(); }, [initialize]);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handlePublish = async () => {
    if (!project || !currentPage) return;
    setIsPublishing(true);
    await saveCurrentPage();
    const result = await deployToCloudflare(project.id);
    setIsPublishing(false);
    if (result.success) {
      const { data: updatedProject } = await supabase
        .from('projects').select('*').eq('id', project.id).single();
      if (updatedProject) setProject(updatedProject);
      toast('Sito pubblicato con successo!', 'success');
    } else {
      toast(`Pubblicazione fallita: ${result.error}`, 'error', 5000);
    }
  };

  const handleSave = async () => {
    await saveCurrentPage();
    toast('Modifiche salvate', 'success', 2000);
  };

  // Ctrl+S / Cmd+S
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (hasUnsavedChanges) handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges]);

  if (!isInitialized) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-zinc-50 gap-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-xl">
            <span className="text-white font-black text-lg">SV</span>
          </div>
          <Loader2 className="animate-spin text-blue-500 absolute -bottom-1 -right-1" size={18} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-zinc-700">Caricamento editor</p>
          <p className="text-xs text-zinc-400">Preparazione dell&apos;ambiente di lavoro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-100 overflow-hidden">
      <BlockSidebar />

      <div className="flex-1 min-w-0 z-10 relative flex flex-col h-full">
        {/* Header */}
        <header className="h-14 bg-white border-b border-zinc-200/80 flex items-center justify-between px-5 shrink-0">
          {/* Left: breadcrumb + status */}
          <div className="flex items-center gap-2">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/editor" className="text-zinc-400 hover:text-zinc-600 transition-colors font-medium">
                I miei siti
              </Link>
              <ChevronRight size={12} className="text-zinc-300" />
              <Link
                href={`/editor/${initialProject?.id}`}
                className="text-zinc-400 hover:text-zinc-600 transition-colors font-medium max-w-[120px] truncate"
              >
                {targetProject?.name || 'Sito'}
              </Link>
              <ChevronRight size={12} className="text-zinc-300" />
              <span className="text-zinc-900 font-semibold" data-tour="page-status">
                {currentPage?.title || 'Pagina'}
              </span>
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
              onClick={handleSave}
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
              onClick={handlePublish}
              disabled={isPublishing || isLoading}
              className="flex items-center gap-2 px-5 py-1.5 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <Rocket size={14} />}
              {isPublishing ? 'Pubblicando...' : 'Pubblica'}
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 gap-3">
            <Loader2 className="animate-spin text-zinc-300" size={24} />
            <p className="text-xs text-zinc-400">Caricamento pagina...</p>
          </div>
        ) : (
          <EditorCanvas />
        )}
      </div>

      <ConfigSidebar />
      <ToastContainer />
      <OnboardingTour />
    </div>
  );
}
