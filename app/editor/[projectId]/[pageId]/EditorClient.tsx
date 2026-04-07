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
import { toast } from '@/components/shared/Toast';
import { OnboardingTour } from '@/components/editor/OnboardingTour';
import { PageSwitcher } from '@/components/editor/PageSwitcher';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';
import { ChecklistModal } from '@/components/editor/ChecklistModal';

const FontLoader = React.memo(({ font }: { font: string }) => {
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap`;
  return <link rel="stylesheet" href={googleFontUrl} />;
});
FontLoader.displayName = 'FontLoader';

export function EditorClient({
  initialUser,
  initialProject,
  initialPages,
  initialPageId,
  initialSiteGlobals = [],
}: {
  initialUser: any;
  initialProject: any;
  initialPages: any[];
  initialPageId: string;
  initialSiteGlobals?: any[];
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
    isSaving,
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
  const [showChecklist, setShowChecklist] = React.useState(false);
  const font = targetProject?.settings?.fontFamily || 'Outfit';

  // Flicker Fix Check
  const hasPageMismatch = currentPage && currentPage.id !== initialPageId;
  const hasProjectMismatch = project && project.id !== initialProject.id;
  const isStale = hasPageMismatch || hasProjectMismatch;
  const showLoader = isLoading || isStale;

  // Hydrate user
  useEffect(() => {
    if (initialUser && !user) setUser(initialUser);
  }, [initialUser, user, setUser]);

  // Hydrate project + pages + specific page + site globals
  useEffect(() => {
    if (initialProject && initialPages && (!project || project.id !== initialProject.id || currentPage?.id !== initialPageId)) {
      hydrateEditor(initialProject, initialPages, initialPageId, initialSiteGlobals);
    }
  }, [initialProject, initialPages, initialPageId, initialSiteGlobals, project, currentPage, hydrateEditor]);

  useEffect(() => { initialize(); }, [initialize]);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check the latest state from the store directly because the local variable might be stale during rapid state changes/navigation
      if (useEditorStore.getState().hasUnsavedChanges) { 
        e.preventDefault(); 
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); // Re-render logic is no longer needed since we check getState() directly

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

  // Use centralized keyboard shortcuts
  useEditorShortcuts();

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
    <div className="flex h-screen bg-zinc-100 overflow-hidden font-sans" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <FontLoader font={font} />
      <FontLoader font="DM Sans" />
      <BlockSidebar />

      <div className="flex-1 min-w-0 z-10 relative flex flex-col h-full">
        <EditorHeader
          project={project}
          targetProject={targetProject}
          currentPage={currentPage}
          targetPages={targetPages}
          initialProject={initialProject}
          initialPageId={initialPageId}
          hasUnsavedChanges={hasUnsavedChanges}
          siteStatus={siteStatus}
          isPublishing={isPublishing}
          isLoading={isLoading || isSaving}
          font={font}
          onSave={async () => {
            await saveCurrentPage();
            toast('Modifiche salvate', 'success', 2000);
          }}
          onPublish={handlePublish}
          onChecklistClick={() => setShowChecklist(true)}
        />

        {showLoader ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 gap-3">
            <Loader2 className="animate-spin text-zinc-400" size={32} />
            <p className="text-xs font-medium text-zinc-400">Caricamento in corso...</p>
          </div>
        ) : (
          <EditorCanvas />
        )}
      </div>

      <ConfigSidebar />
      <OnboardingTour />

      {showChecklist && targetProject && (
        <ChecklistModal
          project={targetProject}
          pages={targetPages}
          onClose={() => setShowChecklist(false)}
          initialPageId={currentPage?.id}
        />
      )}
    </div>
  );
}
