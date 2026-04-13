'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import {
  LayoutGrid, Check, Settings, BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { deployToCloudflare } from '@/app/actions/deploy';
import { useEditorStore } from '@/store/useEditorStore';
import { Page, Project, BlogPost } from '@/types/editor';
import { toast } from '@/components/shared/Toast';
import { PageSeoModal } from '@/components/editor/modals/PageSeoModal';
import { BlogPostSeoModal } from '@/components/editor/modals/BlogPostSeoModal';
import { confirm } from '@/components/shared/ConfirmDialog';
import { createPage } from '@/app/actions/pages';
import { TranslatePageModal } from '@/components/editor/modals/TranslatePageModal';
import { TranslateBlogPostModal } from '@/components/editor/modals/TranslateBlogPostModal';
import type { UserLimits } from '@/lib/permissions';
import { ChecklistModal } from '@/components/editor/ChecklistModal';
import { getCompletionScore, runGlobalChecks, runPageChecks } from '@/lib/site-checklist';

import { DashboardHeader } from './components/DashboardHeader';
import { PagesTab } from './components/PagesTab';
import { BlogTab } from './components/BlogTab';
import { ChecklistTab } from './components/ChecklistTab';
import { SettingsTab } from './components/SettingsTab';


const FontLoader = React.memo(({ font }: { font: string }) => {
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap`;
  return <link rel="stylesheet" href={googleFontUrl} />;
});
FontLoader.displayName = 'FontLoader';

export function ProjectDashboardClient({
  initialUser,
  initialProject,
  initialPages,
  initialSiteGlobals = [],
  initialBlogPosts = [],
  userLimits,
}: {
  initialUser: any;
  initialProject: Project;
  initialPages: Page[];
  initialSiteGlobals?: any[];
  initialBlogPosts?: BlogPost[];
  userLimits: UserLimits | null;
}) {
  const router = useRouter();
  const {
    setUser,
    initialize,
    hydrateEditor,
    project: storeProject,
    setProject: storeSetProject,
    updateProjectSettings,
    uploadImage,
    isUploading,
    hasUnsavedChanges,
    saveProject,
  } = useEditorStore();

  // Warn about unsaved changes when closing the tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useEditorStore.getState().hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleInternalNavigation = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasUnsavedChanges) {
      const href = e.currentTarget.getAttribute('href');
      e.preventDefault();
      if (await confirm({ title: 'Modifiche non salvate', message: 'Hai delle modifiche non salvate nel Design Globale. Sei sicuro di voler lasciare la pagina?', confirmLabel: 'Lascia', variant: 'danger' })) {
        if (href) {
          useEditorStore.getState().setUnsavedChanges(false);
          window.location.href = href;
        }
      }
    }
  };

  const [localProject, setLocalProject] = useState(initialProject);
  const [pages, setPages] = useState(initialPages);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [activeTab, setActiveTab] = useState<'pages' | 'blog' | 'checklist' | 'settings'>('pages');
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistPageId, setChecklistPageId] = useState<string | undefined>(undefined);
  const [checklistPost, setChecklistPost] = useState<BlogPost | null>(null);
  const [seoOpenId, setSeoOpenId] = useState<string | null>(null);
  const [seoOpenPostId, setSeoOpenPostId] = useState<string | null>(null);
  const [translatePage, setTranslatePage] = useState<Page | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [blogLangFilter, setBlogLangFilter] = useState<string>('all');
  const [translateBlogPost, setTranslateBlogPost] = useState<BlogPost | null>(null);
  const [deletingBlogPostId, setDeletingBlogPostId] = useState<string | null>(null);

  const isPublished = !!localProject?.live_url;

  // Hydrate store so GlobalSettings works
  useEffect(() => {
    if (initialUser) setUser(initialUser);
    initialize();
  }, [initialUser, setUser, initialize]);

  useEffect(() => {
    if (initialProject && (!storeProject || storeProject.id !== initialProject.id)) {
      hydrateEditor(initialProject, initialPages, undefined, initialSiteGlobals);
    }
  }, [initialProject, initialPages, initialSiteGlobals, storeProject, hydrateEditor]);

  // Sync project from store when settings change locally
  useEffect(() => {
    if (storeProject && storeProject.id === localProject.id) {
      setLocalProject(storeProject);
    }
  }, [storeProject, localProject.id]);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const lang = localProject.settings?.defaultLanguage || 'it';
    const slug = newSlug.trim() || newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existingPage = pages.find(p => p.slug === slug && p.language === lang);
    if (existingPage) {
      toast(`Una pagina con lo slug "/${slug}" esiste già`, 'error');
      return;
    }

    const result = await createPage({
      id: uuidv4(),
      projectId: localProject.id,
      title: newTitle.trim(),
      slug,
      language: lang,
      blocks: [],
    });

    if (!result.success) {
      toast(result.error || 'Errore durante la creazione della pagina', 'error');
      return;
    }

    setPages([...pages, result.page]);
    setIsCreating(false);
    setNewTitle('');
    setNewSlug('');
  };

  const handleDeletePage = async (pageId: string) => {
    if (!await confirm({ title: 'Elimina pagina', message: 'Vuoi eliminare questa pagina?', confirmLabel: 'Elimina', variant: 'danger' })) return;
    setDeletingPageId(pageId);

    const deletedPage = pages.find(p => p.id === pageId);
    const groupId = (deletedPage as any)?.translations_group_id;
    if (groupId) {
      const siblings = pages.filter(p => p.id !== pageId && (p as any).translations_group_id === groupId);
      if (siblings.length === 1) {
        await supabase.from('pages').update({ translations_group_id: null }).eq('id', siblings[0].id);
        setPages(prev => prev.map(p => p.id === siblings[0].id ? { ...p, translations_group_id: null } as any : p));
      }
    }

    await supabase.from('pages').delete().eq('id', pageId);
    setPages(prev => prev.filter(p => p.id !== pageId));
    setDeletingPageId(null);
  };

  const handleUpdatePageSEO = async (pageId: string, seo: { title?: string; description?: string; image?: string }) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    const newSeo = { ...(page.seo || {}), ...seo };
    setPages(pages.map(p => p.id === pageId ? { ...p, seo: newSeo } : p));
    await supabase.from('pages').update({ seo: newSeo }).eq('id', pageId);
  };

  const handleUpdateBlogPostSEO = async (postId: string, seo: { title?: string; description?: string; image?: string, indexable?: boolean }) => {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    const newSeo = { ...(post.seo || {}), ...seo };
    setBlogPosts(blogPosts.map(p => p.id === postId ? { ...p, seo: newSeo } : p));
    await supabase.from('blog_posts').update({ seo: newSeo }).eq('id', postId);
  };


  const handlePublish = async () => {
    if (!localProject) return;
    setIsPublishing(true);
    const result = await deployToCloudflare(localProject.id);
    setIsPublishing(false);
    if (result.success) {
      const { data: updatedProject } = await supabase
        .from('projects').select('*').eq('id', localProject.id).single();
      if (updatedProject) {
        setLocalProject(updatedProject);
        storeSetProject(updatedProject);
      }
      toast('Sito pubblicato con successo!', 'success');
    } else {
      toast(`Errore: ${result.error}`, 'error');
    }
  };

  const handleDeleteProject = async () => {
    if (!await confirm({ title: 'Elimina progetto', message: `Vuoi davvero eliminare "${localProject.name}"? Tutte le pagine e i dati verranno persi definitivamente.`, confirmLabel: 'Elimina definitivamente', variant: 'danger' })) return;
    setIsDeletingProject(true);
    await supabase.from('pages').delete().eq('project_id', localProject.id);
    await supabase.from('projects').delete().eq('id', localProject.id);

    try {
      const prefix = `${localProject.user_id}/${localProject.id}`;
      const { data: files } = await supabase.storage.from('project-assets').list(prefix);
      if (files?.length) {
        await supabase.storage.from('project-assets').remove(
          files.map(f => `${prefix}/${f.name}`)
        );
      }
    } catch {
      // non blocca il redirect
    }

    router.push('/editor');
  };

  return (
    <div className="min-h-screen bg-zinc-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <FontLoader font="DM Sans" />

      <DashboardHeader
        project={localProject}
        isPublished={isPublished}
        isPublishing={isPublishing}
        isDeletingProject={isDeletingProject}
        onPublish={handlePublish}
        onDeleteProject={handleDeleteProject}
        onInternalNavigate={handleInternalNavigation}
      />

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab('pages')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px",
              activeTab === 'pages'
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <LayoutGrid size={15} />
            Pagine
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px",
              activeTab === 'blog'
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <BookOpen size={15} />
            Blog
            {blogPosts.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500">{blogPosts.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px",
              activeTab === 'settings'
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <Settings size={15} />
            Impostazioni
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px",
              activeTab === 'checklist'
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <Check size={15} />
            Checklist
            {(() => {
              const gScore = getCompletionScore(runGlobalChecks(localProject, pages, initialSiteGlobals));
              const pageScoresArr = pages.map(p => getCompletionScore(runPageChecks(localProject, pages, p)));
              const avgPage = pageScoresArr.length > 0 ? Math.round(pageScoresArr.reduce((a, b) => a + b, 0) / pageScoresArr.length) : 0;
              const combined = Math.round((gScore + avgPage) / 2);
              return (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  combined === 100 ? "bg-emerald-100 text-emerald-700" : combined >= 70 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                )}>
                  {combined}%
                </span>
              );
            })()}
          </button>
        </div>

        {activeTab === 'checklist' && (
          <ChecklistTab
            project={localProject}
            pages={pages}
            siteGlobals={initialSiteGlobals}
            onOpenSeo={(id) => setSeoOpenId(id)}
            onSwitchToSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'blog' && (
          <BlogTab
            blogPosts={blogPosts}
            setBlogPosts={setBlogPosts}
            project={localProject}
            pages={pages}
            blogLangFilter={blogLangFilter}
            setBlogLangFilter={setBlogLangFilter}
            deletingBlogPostId={deletingBlogPostId}
            setDeletingBlogPostId={setDeletingBlogPostId}
            onOpenSeo={(id) => setSeoOpenPostId(id)}
            onTranslate={(post) => setTranslateBlogPost(post)}
            onChecklistClick={(post) => { setChecklistPost(post); setShowChecklist(true); }}
            userLimits={userLimits}
          />
        )}

        {activeTab === 'pages' && (
          <PagesTab
            pages={pages}
            project={localProject}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newSlug={newSlug}
            setNewSlug={setNewSlug}
            deletingPageId={deletingPageId}
            onCreatePage={handleCreatePage}
            onDeletePage={handleDeletePage}
            onOpenSeo={(id) => setSeoOpenId(id)}
            onTranslate={(localProject.settings?.languages || ['it']).length > 1 ? (p) => setTranslatePage(p) : undefined}
            onInternalNavigate={handleInternalNavigation}
            onChecklistClick={(pageId) => { setChecklistPageId(pageId); setShowChecklist(true); }}
            userLimits={userLimits}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            project={localProject}
            hasUnsavedChanges={hasUnsavedChanges}
            isUploading={isUploading}
            uploadImage={uploadImage}
            updateProjectSettings={updateProjectSettings}
            saveProject={saveProject}
            userLimits={userLimits}
          />
        )}
      </main>

      {seoOpenId && (() => {
        const page = pages.find(p => p.id === seoOpenId);
        if (!page) return null;
        return (
          <PageSeoModal
            page={page}
            project={localProject}
            onClose={() => setSeoOpenId(null)}
            updatePageSEO={handleUpdatePageSEO}
            uploadImage={uploadImage}
            isUploading={isUploading}
          />
        );
      })()}

      {seoOpenPostId && (() => {
        const post = blogPosts.find(p => p.id === seoOpenPostId);
        if (!post) return null;
        return (
          <BlogPostSeoModal
            post={post}
            project={localProject}
            onClose={() => setSeoOpenPostId(null)}
            updateBlogPostSEO={handleUpdateBlogPostSEO}
            uploadImage={uploadImage}
            isUploading={isUploading}
          />
        );
      })()}

      {showChecklist && (
        <ChecklistModal
          project={localProject}
          pages={pages}
          onClose={() => { setShowChecklist(false); setChecklistPageId(undefined); setChecklistPost(null); }}
          initialPageId={checklistPageId}
          initialPost={checklistPost || undefined}
        />
      )}

      {translatePage && (
        <TranslatePageModal
          page={translatePage}
          projectId={localProject.id}
          availableLanguages={localProject.settings?.languages || ['it']}
          onClose={() => setTranslatePage(null)}
          onSuccess={(newPage, sourceGroupId) => {
            setPages(prev => prev.map(p =>
              p.id === translatePage.id && !(p as any).translations_group_id
                ? { ...p, translations_group_id: sourceGroupId } as any
                : p
            ).concat([newPage]));
            setTranslatePage(null);
          }}
        />
      )}

      {translateBlogPost && (
        <TranslateBlogPostModal
          post={translateBlogPost}
          allPosts={blogPosts}
          projectId={localProject.id}
          availableLanguages={localProject.settings?.languages || ['it']}
          onClose={() => setTranslateBlogPost(null)}
          onSuccess={(newPost) => {
            setBlogPosts(prev => {
              const updated = prev.map(p =>
                p.id === translateBlogPost.id && !p.translation_group
                  ? { ...p, translation_group: newPost.translation_group }
                  : p
              );
              return [...updated, newPost];
            });
            setTranslateBlogPost(null);
          }}
        />
      )}
    </div>
  );
}
