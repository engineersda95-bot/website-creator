'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import {
  ArrowLeft, Plus, FileText, ExternalLink, Rocket, Save,
  Loader2, Trash2, LayoutGrid, Clock, Palette, Globe, X,
  Monitor, Tablet, Smartphone, Check, Settings,
  CheckCircle2, Circle, ChevronDown, PenLine, Eye, EyeOff,
  Image as ImageIcon, Calendar, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { deployToCloudflare } from '@/app/actions/deploy';
import { getProjectDomain } from '@/lib/url-utils';
import { useEditorStore } from '@/store/useEditorStore';
import { GlobalSettings } from '@/components/blocks/sidebar/GlobalSettings';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';
import { Page, BlogPost } from '@/types/editor';
import { toast } from '@/components/shared/Toast';
import { PageCard } from '@/components/editor/cards/PageCard';
import { PageSeoModal } from '@/components/editor/modals/PageSeoModal';
import { TranslatePageModal } from '@/components/editor/modals/TranslatePageModal';
import { TranslateBlogModal } from '@/components/editor/modals/TranslateBlogModal';
import { translateBlogPostWithAI } from '@/app/actions/ai-generator';
import { LanguageSection } from '@/components/blocks/sidebar/settings/LanguageSection';
import { AdvancedSection } from '@/components/blocks/sidebar/settings/AdvancedSection';
import { DomainSection } from '@/components/blocks/sidebar/settings/DomainSection';
import { SeoSection } from '@/components/blocks/sidebar/settings/SeoSection';
import { confirm } from '@/components/shared/ConfirmDialog';
import { ChecklistModal } from '@/components/editor/ChecklistModal';
import { CompletionBadge, SiteChecklist } from '@/components/editor/SiteChecklist';
import { getCompletionScore, runGlobalChecks, runPageChecks, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/site-checklist';


const FontLoader = React.memo(({ font }: { font: string }) => {
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap`;
  return <link rel="stylesheet" href={googleFontUrl} />;
});
FontLoader.displayName = 'FontLoader';

export function ProjectDashboardClient({
  initialUser,
  initialProject,
  initialPages,
  initialBlogPosts = [],
}: {
  initialUser: any;
  initialProject: any;
  initialPages: any[];
  initialBlogPosts?: BlogPost[];
}) {
  const router = useRouter();
  const {
    setUser,
    initialize,
    hydrateEditor,
    project: storeProject,
    setProject: storeSetProject,
    updateProjectSettings,
    viewport,
    setViewport,
    uploadImage,
    isUploading,
    hasUnsavedChanges,
    saveProject,
    updatePageSEO: storeUpdatePageSEO
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
  }, []); // Re-render logic is no longer needed since we check getState() directly

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
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [blogLangFilter, setBlogLangFilter] = useState<string>('all');
  const [translateBlogPost, setTranslateBlogPost] = useState<BlogPost | null>(null);
  const [seoOpenId, setSeoOpenId] = useState<string | null>(null);
  const [translateOpenId, setTranslateOpenId] = useState<string | null>(null);

  const isPublished = !!localProject?.live_url;

  // Hydrate store so GlobalSettings works
  useEffect(() => {
    if (initialUser) setUser(initialUser);
    initialize();
  }, [initialUser, setUser, initialize]);

  useEffect(() => {
    if (initialProject && (!storeProject || storeProject.id !== initialProject.id)) {
      hydrateEditor(initialProject, initialPages);
    }
  }, [initialProject, initialPages, storeProject, hydrateEditor]);

  // Sync project from store when settings change locally
  useEffect(() => {
    if (storeProject && storeProject.id === localProject.id) {
      setLocalProject(storeProject);
    }
  }, [storeProject, localProject.id]);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const slug = newSlug.trim() || newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const pageId = uuidv4();

    const { data: newPage } = await supabase
      .from('pages')
      .insert({
        id: pageId,
        project_id: localProject.id,
        title: newTitle.trim(),
        slug,
        language: localProject.settings?.defaultLanguage || 'it',
        blocks: [],
      })
      .select()
      .single();

    if (newPage) {
      setPages([...pages, newPage]);
      setIsCreating(false);
      setNewTitle('');
      setNewSlug('');
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!await confirm({ title: 'Elimina pagina', message: 'Vuoi eliminare questa pagina?', confirmLabel: 'Elimina', variant: 'danger' })) return;
    setDeletingPageId(pageId);
    await supabase.from('pages').delete().eq('id', pageId);
    setPages(pages.filter(p => p.id !== pageId));
    setDeletingPageId(null);
  };

  const handleUpdatePageSEO = async (pageId: string, seo: { title?: string; description?: string; image?: string }) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    const newSeo = { ...(page.seo || {}), ...seo };
    // Update local state immediately
    setPages(pages.map(p => p.id === pageId ? { ...p, seo: newSeo } : p));
    // Persist to DB
    await supabase.from('pages').update({ seo: newSeo }).eq('id', pageId);
  };

  const handleTranslatePage = async ({ lang, title, slug, seoTitle, seoDescription }: { 
    lang: string; 
    title: string; 
    slug: string;
    seoTitle?: string;
    seoDescription?: string;
  }) => {
    const sourcePage = pages.find(p => p.id === translateOpenId);
    if (!sourcePage) return;

    const newPageId = uuidv4();
    const { data: newPage, error } = await supabase
      .from('pages')
      .insert({
        id: newPageId,
        project_id: localProject.id,
        title,
        slug,
        language: lang,
        blocks: sourcePage.blocks.map((b: any) => ({ ...b, id: uuidv4() })), // Proper deep clone with new IDs
        seo: { 
          ...sourcePage.seo, 
          title: seoTitle || title,
          description: seoDescription || sourcePage.seo?.description || '' 
        },
      })
      .select()
      .single();

    if (error) {
      toast(`Errore durante la traduzione: ${error.message}`, 'error');
      throw error;
    }

    if (newPage) {
      setPages([...pages, newPage]);
      toast(`Pagina tradotta in ${lang.toUpperCase()}!`, 'success');
    }
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

  return (
    <div className="min-h-screen bg-zinc-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <FontLoader font="DM Sans" />
      {/* Header */}
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-10">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/editor" 
              onClick={handleInternalNavigation}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline font-bold">I miei siti</span>
            </Link>
            <div className="h-5 w-px bg-zinc-200" />
            <h1 className="text-sm font-bold text-zinc-900">{localProject?.name}</h1>
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
              isPublished
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-zinc-100 text-amber-600 border border-zinc-200/60"
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", isPublished ? "bg-emerald-500" : "bg-amber-400 animate-pulse")} />
              {isPublished ? 'Online' : 'Bozza'}
            </div>
            <CompletionBadge
              score={getCompletionScore(runGlobalChecks(localProject, pages))}
              onClick={() => setShowChecklist(true)}
            />
          </div>

          <div className="flex items-center gap-2">
            {localProject?.live_url && (
              <a
                href={getProjectDomain(localProject)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-bold"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">Vedi sito live</span>
              </a>
            )}
            <button
              onClick={handleDeleteProject}
              disabled={isDeletingProject}
              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Elimina sito"
            >
              {isDeletingProject ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <Rocket size={14} />}
              {isPublishing ? 'Pubblicazione...' : 'Pubblica'}
            </button>
          </div>
        </div>
      </header>

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
            <PenLine size={15} />
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
              const gScore = getCompletionScore(runGlobalChecks(localProject, pages));
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

        {/* ── BLOG TAB ── */}
        {activeTab === 'blog' && (() => {
          const siteLanguages = localProject.settings?.languages || [localProject.settings?.defaultLanguage || 'it'];
          const isMultilingual = siteLanguages.length > 1;
          const defaultLang = localProject.settings?.defaultLanguage || 'it';
          const langLabels: Record<string, string> = { it: '🇮🇹', en: '🇬🇧', fr: '🇫🇷', de: '🇩🇪', es: '🇪🇸' };
          const filteredPosts = blogLangFilter === 'all' ? blogPosts : blogPosts.filter(p => (p.language || defaultLang) === blogLangFilter);

          return (
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Blog</h2>
                <p className="text-sm text-zinc-500 mt-0.5">{blogPosts.length === 0 ? 'Crea il tuo primo articolo' : `${blogPosts.length} ${blogPosts.length === 1 ? 'articolo' : 'articoli'}`}</p>
              </div>
              <button
                onClick={async () => {
                  // Auto-create /blog page if it doesn't exist
                  const hasBlogPage = pages.some(p => p.slug === 'blog');
                  if (!hasBlogPage) {
                    const blogPageId = crypto.randomUUID();
                    let navBlock = null;
                    let footerBlock = null;
                    for (const p of pages) {
                      if (!navBlock) navBlock = p.blocks?.find((b: any) => b.type === 'navigation') || null;
                      if (!footerBlock) footerBlock = p.blocks?.find((b: any) => b.type === 'footer') || null;
                      if (navBlock && footerBlock) break;
                    }
                    const blogListBlock = {
                      id: crypto.randomUUID(),
                      type: 'blog-list',
                      content: {
                        title: 'Il nostro Blog',
                        subtitle: 'Scopri i nostri ultimi articoli e aggiornamenti.',
                        filterMode: 'all',
                        maxPosts: 20,
                        showViewAll: false,
                        showFilters: true,
                        isBlogPage: true,
                      },
                      style: { padding: 80, align: 'center', columns: 3, titleTag: 'h2', itemTitleTag: 'h3', itemTitleBold: true },
                    };
                    const blogPageBlocks = [
                      ...(navBlock ? [{ ...navBlock, id: crypto.randomUUID() }] : []),
                      blogListBlock,
                      ...(footerBlock ? [{ ...footerBlock, id: crypto.randomUUID() }] : []),
                    ];
                    const { data: newPage } = await supabase.from('pages').insert({
                      id: blogPageId,
                      project_id: localProject.id,
                      slug: 'blog',
                      title: 'Blog',
                      blocks: blogPageBlocks,
                      seo: { title: `Blog — ${localProject.name}`, description: 'Tutti gli articoli del nostro blog.' },
                      language: defaultLang,
                    }).select().single();
                    if (newPage) setPages([...pages, newPage]);
                  }

                  // Create blog post with language from filter (or default)
                  const postLang = blogLangFilter !== 'all' ? blogLangFilter : defaultLang;
                  const id = crypto.randomUUID();
                  const slug = `post-${Date.now().toString(36)}`;
                  const postPayload: any = {
                    id,
                    project_id: localProject.id,
                    slug,
                    title: 'Nuovo Articolo',
                    excerpt: '',
                    cover_image: '',
                    categories: [],
                    authors: [],
                    status: 'draft',
                    blocks: [],
                    seo: {},
                    language: postLang,
                    translation_group: id,
                  };
                  let { data } = await supabase.from('blog_posts').insert(postPayload).select().single();
                  // Fallback if translation_group column doesn't exist yet
                  if (!data) {
                    delete postPayload.translation_group;
                    ({ data } = await supabase.from('blog_posts').insert(postPayload).select().single());
                  }
                  if (data) {
                    setBlogPosts([data, ...blogPosts]);
                    router.push(`/editor/${localProject.id}/blog/${id}`);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.97]"
              >
                <Plus size={16} />
                Nuovo Articolo
              </button>
            </div>

            {/* Language filter — only for multilingual sites */}
            {isMultilingual && (
              <div className="flex items-center gap-1.5 mb-4">
                <button
                  onClick={() => setBlogLangFilter('all')}
                  className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all", blogLangFilter === 'all' ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100")}
                >
                  Tutti
                </button>
                {siteLanguages.map((lang: string) => (
                  <button
                    key={lang}
                    onClick={() => setBlogLangFilter(lang)}
                    className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all", blogLangFilter === lang ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100")}
                  >
                    {langLabels[lang] || lang} {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200 rounded-2xl">
                <div className="w-14 h-14 mx-auto bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                  <PenLine size={24} className="text-zinc-300" />
                </div>
                <h3 className="text-sm font-bold text-zinc-800 mb-1">Nessun articolo</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">Crea articoli per il blog del tuo sito. Ogni articolo avrà la sua pagina con URL dedicato.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPosts.map((post) => {
                  // Find sibling translations
                  const siblings = post.translation_group
                    ? blogPosts.filter(p => p.translation_group === post.translation_group && p.id !== post.id)
                    : [];
                  return (
                  <div
                    key={post.id}
                    className="flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-xl hover:shadow-md hover:border-zinc-300 transition-all group cursor-pointer"
                    onClick={() => router.push(`/editor/${localProject.id}/blog/${post.id}`)}
                  >
                    {/* Cover thumbnail */}
                    <div className="w-20 h-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                      {post.cover_image ? (
                        <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={16} className="text-zinc-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {isMultilingual && (
                          <span className="text-[10px] font-bold text-zinc-400 uppercase shrink-0">{langLabels[post.language || defaultLang] || post.language}</span>
                        )}
                        <h3 className="text-[13px] font-semibold text-zinc-900 truncate group-hover:text-blue-600 transition-colors">{post.title || 'Senza titolo'}</h3>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0",
                          post.status === 'published' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {post.status === 'published' ? 'Pubblicato' : 'Bozza'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-zinc-400 truncate">{post.excerpt || 'Nessun estratto'}</p>
                        {siblings.length > 0 && (
                          <span className="text-[9px] text-zinc-300 shrink-0">
                            {siblings.map(s => langLabels[s.language || defaultLang] || s.language).join(' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 shrink-0 text-[10px] text-zinc-400">
                      {post.categories?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag size={10} />
                          {post.categories.join(', ')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(post.updated_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isMultilingual && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setTranslateBlogPost(post); }}
                          className="p-1.5 text-zinc-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                          title="Traduci"
                        >
                          <Globe size={14} />
                        </button>
                      )}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!await confirm({ title: 'Elimina articolo', message: `Vuoi eliminare "${post.title}"?`, confirmLabel: 'Elimina', variant: 'danger' })) return;
                          await supabase.from('blog_posts').delete().eq('id', post.id);
                          setBlogPosts(blogPosts.filter(p => p.id !== post.id));
                        }}
                        className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {/* Translate blog modal */}
            {translateBlogPost && (
              <TranslateBlogModal
                post={translateBlogPost}
                project={localProject}
                existingLanguages={
                  blogPosts
                    .filter(p => p.translation_group === translateBlogPost.translation_group)
                    .map(p => p.language || defaultLang)
                }
                onClose={() => setTranslateBlogPost(null)}
                onTranslate={async ({ lang, mode, title, slug }) => {
                  const sourcePost = translateBlogPost;
                  const group = sourcePost.translation_group || sourcePost.id;
                  let body = '';
                  let excerpt = sourcePost.excerpt;
                  let finalTitle = title;

                  if (mode === 'copy') {
                    body = (sourcePost.blocks[0] as any)?.content?.text || '';
                  } else if (mode === 'ai') {
                    try {
                      const translated = await translateBlogPostWithAI({
                        title: sourcePost.title,
                        excerpt: sourcePost.excerpt,
                        body: (sourcePost.blocks[0] as any)?.content?.text || '',
                        sourceLang: sourcePost.language || defaultLang,
                        targetLang: lang,
                      });
                      finalTitle = translated.title;
                      excerpt = translated.excerpt;
                      body = translated.body;
                    } catch (err: any) {
                      toast(err.message || 'Errore traduzione AI', 'error');
                      return;
                    }
                  }

                  const id = crypto.randomUUID();
                  const blocks = body ? [{
                    id: crypto.randomUUID(),
                    type: 'text' as const,
                    content: { text: body },
                    style: {},
                  }] : [];

                  const translatePayload: any = {
                    id,
                    project_id: localProject.id,
                    slug,
                    title: finalTitle,
                    excerpt,
                    cover_image: sourcePost.cover_image,
                    categories: sourcePost.categories,
                    authors: sourcePost.authors,
                    status: 'draft',
                    blocks,
                    seo: {},
                    language: lang,
                    translation_group: group,
                  };
                  let { data } = await supabase.from('blog_posts').insert(translatePayload).select().single();
                  if (!data) {
                    delete translatePayload.translation_group;
                    ({ data } = await supabase.from('blog_posts').insert(translatePayload).select().single());
                  }

                  if (data) {
                    // Also update source post's translation_group if it didn't have one
                    if (!sourcePost.translation_group && translatePayload.translation_group) {
                      await supabase.from('blog_posts').update({ translation_group: group }).eq('id', sourcePost.id);
                      setBlogPosts(prev => prev.map(p => p.id === sourcePost.id ? { ...p, translation_group: group } : p));
                    }
                    setBlogPosts(prev => [data, ...prev]);
                    toast('Traduzione creata', 'success');
                    router.push(`/editor/${localProject.id}/blog/${id}`);
                  }
                }}
              />
            )}
          </div>
          );
        })()}

        {activeTab === 'checklist' && (() => {
          const gResults = runGlobalChecks(localProject, pages);
          const gScore = getCompletionScore(gResults);
          const gPassed = gResults.filter(r => r.passed).length;
          const pageScoresData = pages.map(p => ({
            page: p,
            score: getCompletionScore(runPageChecks(localProject, pages, p)),
          }));
          const avgPageScore = pageScoresData.length > 0 ? Math.round(pageScoresData.reduce((s, p) => s + p.score, 0) / pageScoresData.length) : 0;

          return (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Score cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Global score */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e4e4e7" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke={gScore === 100 ? '#10b981' : gScore >= 70 ? '#3b82f6' : '#f59e0b'} strokeWidth="2.5" strokeDasharray={`${gScore * 0.94} 94`} strokeLinecap="round" className="transition-all duration-700" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-800">{gScore}%</span>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-zinc-900">Sito</div>
                  <div className="text-[11px] text-zinc-400">{gPassed}/{gResults.length} completati</div>
                </div>
              </div>

              {/* Pages average */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e4e4e7" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke={avgPageScore === 100 ? '#10b981' : avgPageScore >= 70 ? '#3b82f6' : '#f59e0b'} strokeWidth="2.5" strokeDasharray={`${avgPageScore * 0.94} 94`} strokeLinecap="round" className="transition-all duration-700" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-800">{avgPageScore}%</span>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-zinc-900">Media Pagine</div>
                  <div className="text-[11px] text-zinc-400">{pageScoresData.filter(p => p.score === 100).length}/{pages.length} complete</div>
                </div>
              </div>

              {/* Overall combined */}
              {(() => {
                const combined = Math.round((gScore + avgPageScore) / 2);
                return (
                  <div className={cn(
                    "border rounded-2xl p-5 flex items-center gap-4",
                    combined === 100 ? "bg-emerald-50 border-emerald-200" : combined >= 70 ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"
                  )}>
                    <div className="relative w-14 h-14 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.15" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${combined * 0.94} 94`} strokeLinecap="round" className="transition-all duration-700" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{combined}%</span>
                    </div>
                    <div>
                      <div className="text-[13px] font-bold">{combined === 100 ? 'Perfetto!' : combined >= 70 ? 'Buon lavoro' : 'Da migliorare'}</div>
                      <div className="text-[11px] opacity-60">Punteggio complessivo</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Global checks */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h3 className="text-[13px] font-bold text-zinc-900">Controlli Generali</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Passaggi per rendere il sito completo e professionale</p>
              </div>
              <div className="divide-y divide-zinc-50">
                {gResults.map(({ item, passed: ok }) => (
                  <div key={item.id} className={cn("flex items-center gap-3 px-5 py-3 transition-all", ok ? "opacity-50" : "hover:bg-zinc-50")}>
                    {ok ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-zinc-300 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-[12px] font-medium", ok && "line-through text-zinc-400")}>{item.label}</div>
                      {!ok && <div className="text-[10px] text-zinc-400 mt-0.5">{item.description}</div>}
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0", CATEGORY_COLORS[item.category])}>
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-page checks */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h3 className="text-[13px] font-bold text-zinc-900">Controlli per Pagina</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Ogni pagina ha i suoi requisiti per un risultato ottimale</p>
              </div>
              <div className="divide-y divide-zinc-50">
                {pageScoresData.map(({ page: p, score: pScore }) => {
                  const pResults = runPageChecks(localProject, pages, p);
                  const allDone = pScore === 100;
                  return (
                    <details key={p.id} className="group">
                      <summary className="flex items-center gap-3 px-5 py-3 cursor-pointer list-none hover:bg-zinc-50 transition-all">
                        <div className="relative w-8 h-8 shrink-0">
                          <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#e4e4e7" strokeWidth="3" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke={pScore === 100 ? '#10b981' : pScore >= 60 ? '#3b82f6' : '#f59e0b'} strokeWidth="3" strokeDasharray={`${pScore * 0.88} 88`} strokeLinecap="round" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-zinc-600">{pScore}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-zinc-800 truncate">{p.title || p.slug}</div>
                          <div className="text-[10px] text-zinc-400">/{p.slug}</div>
                        </div>
                        {allDone && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                        <ChevronDown size={12} className="text-zinc-300 group-open:rotate-180 transition-transform shrink-0" />
                      </summary>
                      <div className="px-5 pb-3 pl-16 space-y-1">
                        {pResults.map(({ item, passed: ok }) => (
                          <div key={item.id} className={cn("flex items-center gap-2 py-1.5", ok && "opacity-40")}>
                            {ok ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> : <Circle size={12} className="text-zinc-300 shrink-0" />}
                            <span className={cn("text-[11px]", ok ? "text-zinc-400 line-through" : "text-zinc-600")}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          </div>
          );
        })()}

        {activeTab === 'pages' && (
          /* ── PAGES TAB ── */
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Le tue Pagine</h2>
                <p className="text-sm text-zinc-500 mt-0.5">{pages.length} {pages.length === 1 ? 'pagina' : 'pagine'} disponibili</p>
              </div>
              <button
                onClick={() => setIsCreating(true)}
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
                  onSubmit={handleCreatePage}
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
                  projectId={localProject.id}
                  formatDate={formatDate}
                  onOpenSeo={(id) => setSeoOpenId(id)}
                  onOpenTranslate={(id) => setTranslateOpenId(id)}
                  onDelete={handleDeletePage}
                  isDeleting={deletingPageId === page.id}
                  onInternalNavigate={handleInternalNavigation}
                  score={getCompletionScore(runPageChecks(localProject, pages, page))}
                  onScoreClick={() => setShowChecklist(true)}
                />
              ))}
            </div>

            {/* SEO Modal */}
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

            {/* Translate Modal */}
            {translateOpenId && (() => {
              const page = pages.find(p => p.id === translateOpenId);
              if (!page) return null;

              return (
                <TranslatePageModal
                  page={page}
                  project={localProject}
                  onClose={() => setTranslateOpenId(null)}
                  onTranslate={handleTranslatePage}
                />
              );
            })()}
          </div>

        )}

        {activeTab === 'settings' && (
          /* ── SETTINGS TAB ── */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-8">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 leading-none">Impostazioni Progetto</h2>
                <p className="text-[11px] text-zinc-500 mt-1.5 font-medium">Gestisci le lingue e le opzioni avanzate del tuo sito.</p>
              </div>


              <div className="pt-8 border-t border-zinc-100">
                <LanguageSection
                  project={localProject}
                  updateProjectSettings={updateProjectSettings}
                />
              </div>

              <div className="pt-8 border-t border-zinc-100">
                <AdvancedSection
                  project={localProject}
                  updateProjectSettings={updateProjectSettings}
                />
              </div>

              <div className="pt-8 border-t border-zinc-100">
                <DomainSection
                  project={localProject}
                  updateProjectSettings={updateProjectSettings}
                />
              </div>

              <div className="pt-8 border-t border-zinc-100 flex justify-end">
                <button
                  onClick={saveProject}
                  disabled={!hasUnsavedChanges}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-sm font-bold shadow-sm",
                    hasUnsavedChanges
                      ? "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95"
                      : "bg-zinc-100 text-zinc-400 cursor-default"
                  )}
                >
                  {hasUnsavedChanges ? <Save size={16} /> : <Check size={16} />}
                  <span>{hasUnsavedChanges ? 'Salva Impostazioni' : 'Impostazioni Salvate'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showChecklist && (
        <ChecklistModal
          project={localProject}
          pages={pages}
          onClose={() => setShowChecklist(false)}
        />
      )}
    </div>
  );
}
