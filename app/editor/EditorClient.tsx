'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEditorStore } from '@/store/useEditorStore';
import { BlockSidebar } from '@/components/blocks/BlockSidebar';
import { EditorCanvas } from '@/components/blocks/EditorCanvas';
import { ConfigSidebar } from '@/components/blocks/ConfigSidebar';
import { deployToCloudflare } from '@/app/actions/deploy';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Save } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';

export function EditorClient({ 
  initialUser, 
  initialProject, 
  initialPages 
}: { 
  initialUser: any;
  initialProject: any;
  initialPages: any[];
}) {
  const { 
    setProject, 
    loadPage, 
    saveCurrentPage, 
    setUser,
    hydrateEditor,
    initialize, 
    syncGuestData, 
    project, 
    currentPage, 
    isLoading, 
    isInitialized, 
    user 
  } = useEditorStore();
  
  const searchParams = useSearchParams();
  const templateKey = searchParams.get('template') || undefined;
  const [isPublishing, setIsPublishing] = React.useState(false);
  const dataFetchedRef = React.useRef(false);

  // Hydrate user from server
  useEffect(() => {
    if (initialUser && !user) {
      setUser(initialUser);
    }
  }, [initialUser, user, setUser]);

  // COMPLETE HYDRATION from Server
  useEffect(() => {
    if (initialProject && initialPages && !project) {
        hydrateEditor(initialProject, initialPages);
    }
  }, [initialProject, initialPages, project, hydrateEditor]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handlePublish = async () => {
    if (!project || !currentPage) return;
    setIsPublishing(true);
    await saveCurrentPage();
    const result = await deployToCloudflare(project.id);
    setIsPublishing(false);
    if (result.success) {
      window.open(result.url, '_blank');
    } else {
      alert(`Deployment failed: ${result.error}`);
    }
  };

  // Sync guest data when user becomes available
  useEffect(() => {
    if (user && isInitialized && !isLoading) {
      syncGuestData();
    }
  }, [user, isInitialized, isLoading, syncGuestData]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!isInitialized || !user) return;

      const projectIdFromURL = searchParams.get('projectId');
      let targetProjectId = projectIdFromURL;

      if (!targetProjectId) {
         // Try to fetch the first project of the user
         const { data: projects } = await supabase
           .from('projects')
           .select('*')
           .eq('user_id', user.id)
           .order('created_at', { ascending: false })
           .limit(1);
           
         if (projects && projects.length > 0) {
           targetProjectId = projects[0].id;
         } else {
           // Create a default project for the new user
           const newProjId = uuidv4();
           const { data: newProj, error: createError } = await supabase
             .from('projects')
             .insert({
               id: newProjId,
               user_id: user.id,
               name: 'Il Mio Sito',
               subdomain: `site-${newProjId.substring(0, 8)}`,
               settings: { fontFamily: 'Outfit', primaryColor: '#3b82f6', secondaryColor: '#10b981' }
             })
             .select()
             .single();
           
           if (newProj) {
             targetProjectId = newProj.id;
             setProject(newProj);
             console.log('Created new project for user:', newProj.id);
           } else {
             console.error('Error creating initial project:', createError);
           }
         }
      }

      if (targetProjectId) {
        console.log('Final target Project ID:', targetProjectId);
        loadPage(targetProjectId, 'home', templateKey);
      } else {
        console.warn('No target project found after fetchInitialData');
      }
    };

    if (isInitialized && user && !dataFetchedRef.current) {
      const urlProjectId = searchParams.get('projectId');
      const needsFetch = !project || (urlProjectId && project.id !== urlProjectId);

      if (needsFetch) {
        console.log('[EditorClient] Fetching initial data fallback for:', user.email);
        dataFetchedRef.current = true;
        fetchInitialData();
      } else {
        console.log('[EditorClient] Already hydrated, skipping initial fetch');
        dataFetchedRef.current = true;
      }
    }
  }, [isInitialized, user, project, loadPage, templateKey, searchParams, setProject]);

  if (!isInitialized) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-zinc-50 gap-4">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Inizializzazione Editor...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      <BlockSidebar />

      <div className="flex-1 flex flex-col h-full">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg text-zinc-900">SitiVetrina <span className="text-zinc-400 font-normal">Editor</span></h1>
            <div className="h-4 w-px bg-zinc-200" />
            <span className="text-sm font-medium text-zinc-500">{currentPage?.title || 'Home Page'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => saveCurrentPage()}
              className="p-2 text-zinc-400 hover:text-zinc-900 border border-zinc-100 rounded-lg hover:bg-zinc-50 transition-all mr-2"
              title="Salva Modifiche"
            >
              <Save size={18} />
            </button>

            <div className="h-4 w-px bg-zinc-200 mr-2" />
            
            <UserMenu />

            <div className="h-4 w-px bg-zinc-200 ml-2 mr-2" />

            <button 
              onClick={handlePublish}
              disabled={isPublishing || isLoading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-black bg-zinc-900 text-white rounded-full hover:bg-zinc-800 shadow-xl shadow-zinc-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? <Loader2 className="animate-spin" size={16} /> : null}
              {isPublishing ? 'Pubblicazione...' : 'Pubblica Sito'}
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 gap-3">
             <Loader2 className="animate-spin text-zinc-200" size={48} />
             <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Caricamento Pagina...</p>
          </div>
        ) : (
          <EditorCanvas />
        )}
      </div>

      <ConfigSidebar />
    </div>
  );
}
