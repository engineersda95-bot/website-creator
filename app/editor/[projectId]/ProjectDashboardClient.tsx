'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import {
  ArrowLeft, Plus, FileText, ExternalLink, Rocket, Save,
  Loader2, Trash2, Languages, LayoutGrid, Clock, Palette, Globe, X,
  Monitor, Tablet, Smartphone, Check, Settings,
  CheckCircle2, Circle, ChevronDown, Bell, BookOpen, PenLine, Eye, EyeOff, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { deployToCloudflare } from '@/app/actions/deploy';
import { getProjectDomain } from '@/lib/url-utils';
import { useEditorStore } from '@/store/useEditorStore';
import { GlobalSettings } from '@/components/blocks/sidebar/GlobalSettings';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';
import { Page, Project, BlogPost } from '@/types/editor';
import { toast } from '@/components/shared/Toast';
import { PageCard } from '@/components/editor/cards/PageCard';
import { PageSeoModal } from '@/components/editor/modals/PageSeoModal';
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
  const [seoOpenId, setSeoOpenId] = useState<string | null>(null);
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

    // Cleanup translations_group_id: if only 1 sibling remains, unlink it
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
    // Update local state immediately
    setPages(pages.map(p => p.id === pageId ? { ...p, seo: newSeo } : p));
    // Persist to DB
    await supabase.from('pages').update({ seo: newSeo }).eq('id', pageId);
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

    // Best-effort: rimuove tutti gli asset del progetto dallo storage
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
              score={getCompletionScore(runGlobalChecks(localProject, pages, initialSiteGlobals))}
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

        {activeTab === 'checklist' && (() => {
          const gResults = runGlobalChecks(localProject, pages, initialSiteGlobals);
          const gScore = getCompletionScore(gResults);
          const gPassed = gResults.filter(r => !r.item.informational && r.passed).length;
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
                    <div className="text-[11px] text-zinc-400">{gPassed}/{gResults.filter(r => !r.item.informational).length} completati</div>
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
                  {gResults.map(({ item, passed: ok, href }) => (
                    <div key={item.id} className={cn("flex items-center gap-3 px-5 py-3 transition-all", ok && !item.informational ? "opacity-50" : !ok ? "hover:bg-zinc-50" : "")}>
                      {ok && !item.informational ? (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      ) : item.informational ? (
                        <Bell size={16} className="text-amber-400 shrink-0" />
                      ) : (
                        <Circle size={16} className="text-zinc-300 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-[12px] font-medium", ok && !item.informational && "line-through text-zinc-400")}>{item.label}</div>
                        {(!ok || item.informational) && <div className="text-[10px] text-zinc-400 mt-0.5">{item.description}</div>}
                        {item.informational && href && (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-500 hover:text-blue-700 underline underline-offset-2 mt-1 block truncate"
                          >
                            {href}
                          </a>
                        )}
                        {item.informational && item.fix?.action === 'open-url' && (
                          <button
                            onClick={() => window.open(item.fix!.target, '_blank', 'noopener,noreferrer')}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 mt-1"
                          >
                            {item.fix.label} →
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!ok && item.category === 'seo' && (
                          <button
                            onClick={() => setActiveTab('settings')}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Modifica SEO
                          </button>
                        )}
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", CATEGORY_COLORS[item.category])}>
                          {CATEGORY_LABELS[item.category]}
                        </span>
                      </div>
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
                              <span className={cn("text-[11px] flex-1", ok ? "text-zinc-400 line-through" : "text-zinc-600")}>{item.label}</span>
                              {!ok && item.category === 'seo' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSeoOpenId(p.id); }}
                                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                                >
                                  Modifica SEO
                                </button>
                              )}
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

        {activeTab === 'blog' && (() => {
          /* ── BLOG TAB ── */
          const defaultLang = localProject.settings?.defaultLanguage || 'it';
          const siteLanguages = localProject.settings?.languages || [defaultLang];
          const isMultilingual = siteLanguages.length > 1;
          const filteredPosts = blogLangFilter === 'all' ? blogPosts : blogPosts.filter(p => (p.language || defaultLang) === blogLangFilter);
          const atArticleLimit = userLimits?.max_articles_per_project !== null && blogPosts.length >= (userLimits?.max_articles_per_project ?? Infinity);

          return (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Blog</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {blogPosts.length === 0
                      ? 'Crea il tuo primo articolo'
                      : `${blogPosts.length}${userLimits?.max_articles_per_project ? ` / ${userLimits.max_articles_per_project}` : ''} ${blogPosts.length === 1 ? 'articolo' : 'articoli'}`}
                  </p>
                </div>
                <button
                  disabled={atArticleLimit}
                  onClick={async () => {
                    if (atArticleLimit) { toast(`Hai raggiunto il limite di ${userLimits?.max_articles_per_project} articoli per sito del tuo piano`, 'error'); return; }
                    // Auto-create /blog page if it doesn't exist
                    const hasBlogPage = pages.some(p => p.slug === 'blog');
                    if (!hasBlogPage) {
                      const blogPageId = crypto.randomUUID();
                      const blogListBlock = {
                        id: crypto.randomUUID(),
                        type: 'blog-list',
                        content: { title: 'Il nostro Blog', maxPosts: 100, isBlogPage: true },
                        style: {},
                      };
                      await supabase.from('pages').insert({
                        id: blogPageId,
                        project_id: localProject.id,
                        slug: 'blog',
                        title: 'Blog',
                        blocks: [blogListBlock],
                        seo: { title: `Blog — ${localProject.name}`, description: 'Tutti gli articoli del nostro blog.' },
                      });
                    }
                    // Create new draft blog post
                    const postLang = blogLangFilter !== 'all' ? blogLangFilter : defaultLang;
                    const postId = crypto.randomUUID();
                    const { data } = await supabase.from('blog_posts').insert({
                      id: postId,
                      project_id: localProject.id,
                      slug: `articolo-${Date.now()}`,
                      title: 'Nuovo Articolo',
                      status: 'draft',
                      language: postLang,
                      blocks: [],
                    }).select('id, slug, title, excerpt, cover_image, language, status, published_at, authors, categories, translation_group, created_at, updated_at').single();
                    if (data) {
                      setBlogPosts([data as BlogPost, ...blogPosts]);
                      router.push(`/editor/${localProject.id}/blog/${postId}`);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-bold border rounded-lg transition-all",
                    atArticleLimit
                      ? "bg-zinc-50 border-zinc-200 text-zinc-300 cursor-not-allowed"
                      : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  <Plus size={16} />
                  Nuovo Articolo
                </button>
              </div>

              {/* Language filter (only when multilingual) */}
              {isMultilingual && blogPosts.length > 0 && (
                <div className="flex gap-2 mb-5 flex-wrap">
                  <button onClick={() => setBlogLangFilter('all')} className={cn("px-3 py-1 rounded-full text-xs font-bold border transition-all", blogLangFilter === 'all' ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400")}>Tutti</button>
                  {siteLanguages.map((lang: string) => (
                    <button key={lang} onClick={() => setBlogLangFilter(lang)} className={cn("px-3 py-1 rounded-full text-xs font-bold border transition-all uppercase", blogLangFilter === lang ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400")}>{lang}</button>
                  ))}
                </div>
              )}

              {filteredPosts.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">{blogPosts.length === 0 ? 'Nessun articolo ancora' : 'Nessun articolo in questa lingua'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPosts.map(post => (
                    <div
                      key={post.id}
                      className={cn(
                        "group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 hover:shadow-md transition-all flex flex-col",
                        deletingBlogPostId === post.id && "opacity-50 pointer-events-none"
                      )}
                    >
                      {/* Card body — clickable to editor */}
                      <Link href={`/editor/${localProject.id}/blog/${post.id}`} className="flex-1">
                        {post.cover_image && (
                          <div className="aspect-video bg-zinc-100 overflow-hidden">
                            <img
                              src={resolveImageUrl(post.cover_image, localProject, {}, false)}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {post.status === 'published'
                              ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><Eye size={10} />Pubblicato</span>
                              : <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><EyeOff size={10} />Bozza</span>
                            }
                            {isMultilingual && post.language && (
                              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full uppercase">{(post.language || '').split('-')[0]}</span>
                            )}
                          </div>
                          <h3 className="font-bold text-zinc-900 text-sm line-clamp-2 mb-1">{post.title}</h3>
                          {post.excerpt && <p className="text-xs text-zinc-500 line-clamp-2">{post.excerpt}</p>}
                          {post.published_at && (
                            <div className="flex items-center gap-1 mt-2 text-[11px] text-zinc-400">
                              <Calendar size={10} />
                              {new Date(post.published_at).toLocaleDateString('it-IT')}
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Action bar — same style as PageCard */}
                      <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/30">
                        <span className="text-[11px] text-zinc-400 font-mono">/blog/{post.slug}</span>
                        <div className="flex items-center gap-1">
                          {isMultilingual && (
                            <button
                              onClick={() => setTranslateBlogPost(post)}
                              className="p-1.5 rounded-md text-zinc-400 hover:text-blue-500 hover:bg-white transition-all shadow-sm"
                              title="Traduci articolo"
                            >
                              <Languages size={16} />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (!await (confirm as any)({ title: 'Elimina articolo', message: `Vuoi eliminare "${post.title}"?`, confirmLabel: 'Elimina', variant: 'danger' })) return;
                              setDeletingBlogPostId(post.id);
                              await supabase.from('blog_posts').delete().eq('id', post.id);
                              setBlogPosts(prev => prev.filter(p => p.id !== post.id));
                              setDeletingBlogPostId(null);
                            }}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                            title="Elimina articolo"
                          >
                            {deletingBlogPostId === post.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                onClick={() => {
                  const atLimit = userLimits?.max_pages_per_project !== null && pages.length >= (userLimits?.max_pages_per_project ?? 0);
                  if (atLimit) { toast(`Hai raggiunto il limite di ${userLimits?.max_pages_per_project} pagine per sito del tuo piano`, 'error'); return; }
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
                  onDelete={handleDeletePage}
                  onTranslate={(localProject.settings?.languages || ['it']).length > 1 ? (p) => setTranslatePage(p) : undefined}
                  isDeleting={deletingPageId === page.id}
                  onInternalNavigate={handleInternalNavigation}
                  score={getCompletionScore(runPageChecks(localProject, pages, page))}
                  onScoreClick={() => setShowChecklist(true)}
                />
              ))}
            </div>


          </div>

        )}

        {activeTab === 'settings' && (
          /* ── SETTINGS TAB ── */
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Sticky save bar */}
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
                {hasUnsavedChanges ? <Save size={15} /> : <Check size={15} />}
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

              <div className="pt-8 border-t border-zinc-100">
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

      {showChecklist && (
        <ChecklistModal
          project={localProject}
          pages={pages}
          onClose={() => setShowChecklist(false)}
        />
      )}

      {translatePage && (
        <TranslatePageModal
          page={translatePage}
          projectId={localProject.id}
          availableLanguages={localProject.settings?.languages || ['it']}
          onClose={() => setTranslatePage(null)}
          onSuccess={(newPage, sourceGroupId) => {
            // Update source page with new translations_group_id if it was just assigned
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
            // Also update source post's translation_group in local state
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
