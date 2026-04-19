'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import {
  LayoutGrid, Check, Settings, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { deployToCloudflare } from '@/app/actions/deploy';
import { useEditorStore } from '@/store/useEditorStore';
import { GlobalSettings } from '@/components/blocks/sidebar/GlobalSettings';
import { Page, Project, BlogPost } from '@/types/editor';
import { toast } from '@/components/shared/Toast';
import { PageSeoModal } from '@/components/editor/modals/PageSeoModal';
import { BlogPostSeoModal } from '@/components/editor/modals/BlogPostSeoModal';
import { LanguageSection } from '@/components/blocks/sidebar/settings/LanguageSection';
import { AdvancedSection } from '@/components/blocks/sidebar/settings/AdvancedSection';
import { DomainSection } from '@/components/blocks/sidebar/settings/DomainSection';
import { SeoSection } from '@/components/blocks/sidebar/settings/SeoSection';
import { confirm } from '@/components/shared/ConfirmDialog';
import { createPage } from '@/app/actions/pages';
import { TranslatePageModal } from '@/components/editor/modals/TranslatePageModal';
import { TranslateBlogPostModal } from '@/components/editor/modals/TranslateBlogPostModal';
import type { UserLimits } from '@/lib/permissions';
import { ChecklistModal } from '@/components/editor/ChecklistModal';
import { getCompletionScore, runGlobalChecks, runPageChecks } from '@/lib/site-checklist';
import { Save, Check as CheckIcon } from 'lucide-react';
import { DashboardHeader } from './components/DashboardHeader';
import { PagesTab } from './components/PagesTab';
import { BlogTab } from './components/BlogTab';
import { ChecklistTab } from './components/ChecklistTab';

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
    initAiCredits,
    project: storeProject,
    setProject: storeSetProject,
    updateProjectSettings,
    uploadImage,
    isUploading,
    hasUnsavedChanges,
    saveProject,
  } = useEditorStore();

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

  useEffect(() => {
    if (initialUser) setUser(initialUser);
    initialize();
  }, [initialUser, setUser, initialize]);

  useEffect(() => {
    initAiCredits(userLimits?.ai_used_this_month ?? 0, userLimits?.max_ai_per_month ?? null);
  }, [userLimits, initAiCredits]);

  useEffect(() => {
    if (initialProject && (!storeProject || storeProject.id !== initialProject.id)) {
      hydrateEditor(initialProject, initialPages, undefined, initialSiteGlobals);
    }
  }, [initialProject, initialPages, initialSiteGlobals, storeProject, hydrateEditor]);

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

  const handleUpdateBlogPostSEO = async (postId: string, seo: { title?: string; description?: string; image?: string; indexable?: boolean }) => {
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
    } catch { /* best-effort */ }

    router.push('/editor');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const checklistTabScore = (() => {
    const gScore = getCompletionScore(runGlobalChecks(localProject, pages, initialSiteGlobals));
    const pageScoresArr = pages.map(p => getCompletionScore(runPageChecks(localProject, pages, p)));
    const avgPage = pageScoresArr.length > 0 ? Math.round(pageScoresArr.reduce((a, b) => a + b, 0) / pageScoresArr.length) : 0;
    return Math.round((gScore + avgPage) / 2);
  })();

  return (
    <div className="min-h-screen bg-zinc-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <FontLoader font="DM Sans" />

      <DashboardHeader
        project={localProject}
        isPublished={isPublished}
        isPublishing={isPublishing}
        isDeletingProject={isDeletingProject}
        onPublish={handlePublish}
        onDelete={handleDeleteProject}
        onInternalNavigation={handleInternalNavigation}
      />

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-zinc-200">
          {([
            { id: 'pages', icon: LayoutGrid, label: 'Pagine' },
            { id: 'blog', icon: BookOpen, label: 'Blog' },
            { id: 'settings', icon: Settings, label: 'Impostazioni' },
            { id: 'checklist', icon: Check, label: 'Checklist' },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px",
                activeTab === id
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              )}
            >
              <Icon size={15} />
              {label}
              {id === 'blog' && blogPosts.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500">{blogPosts.length}</span>
              )}
              {id === 'checklist' && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  checklistTabScore === 100 ? "bg-emerald-100 text-emerald-700" : checklistTabScore >= 70 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                )}>
                  {checklistTabScore}%
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'pages' && (
          <PagesTab
            project={localProject}
            pages={pages}
            isCreating={isCreating}
            newTitle={newTitle}
            newSlug={newSlug}
            deletingPageId={deletingPageId}
            userLimits={userLimits}
            onSetIsCreating={setIsCreating}
            onSetNewTitle={setNewTitle}
            onSetNewSlug={setNewSlug}
            onCreatePage={handleCreatePage}
            onDeletePage={handleDeletePage}
            onOpenSeo={(id) => setSeoOpenId(id)}
            onTranslate={(localProject.settings?.languages || ['it']).length > 1 ? (p) => setTranslatePage(p) : undefined}
            onInternalNavigation={handleInternalNavigation}
            onScoreClick={(pageId) => { setChecklistPageId(pageId); setShowChecklist(true); }}
            formatDate={formatDate}
          />
        )}

        {activeTab === 'blog' && (
          <BlogTab
            project={localProject}
            pages={pages}
            blogPosts={blogPosts}
            blogLangFilter={blogLangFilter}
            deletingBlogPostId={deletingBlogPostId}
            userLimits={userLimits}
            onSetBlogPosts={setBlogPosts}
            onSetBlogLangFilter={setBlogLangFilter}
            onSetDeletingBlogPostId={setDeletingBlogPostId}
            onSetPages={setPages}
            onOpenSeo={(postId) => setSeoOpenPostId(postId)}
            onTranslate={(post) => setTranslateBlogPost(post)}
            onChecklistClick={(post) => { setChecklistPost(post); setShowChecklist(true); }}
          />
        )}

        {activeTab === 'checklist' && (
          <ChecklistTab
            project={localProject}
            pages={pages}
            siteGlobals={initialSiteGlobals}
            onOpenSeo={(pageId) => setSeoOpenId(pageId)}
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="sticky top-14 z-10 -mx-6 px-6 py-3 bg-zinc-50/90 backdrop-blur-sm border-b border-zinc-200 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-zinc-900">Impostazioni Progetto</p>
                <p className="text-[11px] text-zinc-400">SEO, lingue e opzioni avanzate</p>
              </div>
              <button
                onClick={saveProject}
                disabled={!hasUnsavedChanges}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl transition-all text-sm font-bold shadow-sm",
                  hasUnsavedChanges
                    ? "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95"
                    : "bg-zinc-100 text-zinc-400 cursor-default"
                )}
              >
                {hasUnsavedChanges ? <Save size={15} /> : <CheckIcon size={15} />}
                {hasUnsavedChanges ? 'Salva' : 'Salvato'}
              </button>
            </div>

            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-8">
              <SeoSection
                project={localProject}
                updateProjectSettings={updateProjectSettings}
                isUploading={isUploading}
                uploadImage={uploadImage}
              />
              <div className="pt-8 border-t border-zinc-100">
                <LanguageSection
                  project={localProject}
                  updateProjectSettings={updateProjectSettings}
                  canMultilang={userLimits?.can_multilang ?? false}
                />
              </div>
              <div className="pt-8">
                <AdvancedSection
                  project={localProject}
                  updateProjectSettings={updateProjectSettings}
                  canCustomScripts={userLimits?.can_custom_scripts ?? false}
                />
              </div>
              <div className="pt-8 border-t border-zinc-100">
                <DomainSection
                  project={localProject}
                  updateProjectSettings={updateProjectSettings}
                  canCustomDomain={userLimits?.can_custom_domain ?? false}
                />
              </div>
            </div>
          </div>
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
