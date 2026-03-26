'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import {
  ArrowLeft, Plus, FileText, ExternalLink, Rocket, Save,
  Loader2, Trash2, LayoutGrid, Clock, Palette, Globe, X,
  Monitor, Tablet, Smartphone, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { deployToCloudflare } from '@/app/actions/deploy';
import { getProjectDomain } from '@/lib/url-utils';
import { useEditorStore } from '@/store/useEditorStore';
import { GlobalSettings } from '@/components/blocks/sidebar/GlobalSettings';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';
import { Page } from '@/types/editor';
import { toast } from '@/components/shared/Toast';
import { PageCard } from '@/components/editor/cards/PageCard';
import { PageSeoModal } from '@/components/editor/modals/PageSeoModal';


const FontLoader = React.memo(({ font }: { font: string }) => {
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`;
  return <link rel="stylesheet" href={googleFontUrl} />;
});
FontLoader.displayName = 'FontLoader';

export function ProjectDashboardClient({
  initialUser,
  initialProject,
  initialPages,
}: {
  initialUser: any;
  initialProject: any;
  initialPages: any[];
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
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInternalNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasUnsavedChanges) {
      if (!confirm('Hai delle modifiche non salvate nel Design Globale. Sei sicuro di voler lasciare la pagina e perdere le modifiche?')) {
        e.preventDefault();
      }
    }
  };

  const [localProject, setLocalProject] = useState(initialProject);
  const [pages, setPages] = useState(initialPages);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pages' | 'design'>('pages');
  const [seoOpenId, setSeoOpenId] = useState<string | null>(null);

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
    if (!confirm('Vuoi eliminare questa pagina?')) return;
    await supabase.from('pages').delete().eq('id', pageId);
    setPages(pages.filter(p => p.id !== pageId));
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
    if (!confirm(`Vuoi davvero eliminare "${localProject.name}"? Tutte le pagine e i dati verranno persi definitivamente.`)) return;
    // Delete pages first, then project
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
              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Elimina sito"
            >
              <Trash2 size={16} />
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
            onClick={() => setActiveTab('design')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px",
              activeTab === 'design'
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <Palette size={15} />
            Design Globale
          </button>
        </div>

        {activeTab === 'pages' ? (
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
                  onDelete={handleDeletePage}
                  onInternalNavigate={handleInternalNavigation}
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
          </div>

        ) : (
          /* ── DESIGN TAB ── */
          <div className="max-w-3xl mx-auto">
            {/* STICKY DESIGN HEADER */}
            <div className="sticky top-[56px] z-50 -mx-6 px-6 py-4 mb-6 bg-zinc-50/90 backdrop-blur-md border-b border-zinc-200/50 flex items-center justify-between transition-all">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 leading-none">Design Globale</h2>
                <p className="text-[11px] text-zinc-500 mt-1.5 font-medium">Font, colori, pulsanti e layout.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-zinc-200/50 rounded-lg p-0.5">
                  {([
                    { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                    { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                    { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
                  ]).map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => setViewport(key)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all",
                        viewport === key
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-600"
                      )}
                      title={label}
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline text-[11px]">{label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={saveProject}
                  disabled={!hasUnsavedChanges}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold shadow-sm",
                    hasUnsavedChanges
                      ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                      : "bg-zinc-100 text-zinc-400 cursor-default"
                  )}
                >
                  {hasUnsavedChanges ? <Save size={16} /> : <Check size={16} />}
                  <span>{hasUnsavedChanges ? 'Salva Design' : 'Salvato'}</span>
                </button>
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden p-8 shadow-sm">
              <GlobalSettings
                project={localProject}
                updateProjectSettings={updateProjectSettings}
                viewport={viewport}
                variant="page"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
