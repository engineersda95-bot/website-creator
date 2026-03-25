'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import {
  ArrowLeft, Plus, FileText, ExternalLink, Rocket,
  Loader2, Trash2, LayoutGrid, Clock, Palette, Globe, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { deployToCloudflare } from '@/app/actions/deploy';
import { getProjectDomain } from '@/lib/url-utils';
import { useEditorStore } from '@/store/useEditorStore';
import { GlobalSettings } from '@/components/blocks/sidebar/GlobalSettings';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';

export function ProjectDashboardClient({
  initialUser,
  initialProject,
  initialPages,
}: {
  initialUser: any;
  initialProject: any;
  initialPages: any[];
}) {
  const { setUser, initialize, hydrateEditor, project: storeProject, updateProjectSettings, viewport, uploadImage, isUploading } = useEditorStore();
  const [project, setProject] = useState(initialProject);
  const [pages, setPages] = useState(initialPages);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pages' | 'design'>('pages');
  const [seoOpenId, setSeoOpenId] = useState<string | null>(null);

  const isPublished = !!project?.live_url;

  // Hydrate store so GlobalSettings works
  useEffect(() => {
    if (initialUser) setUser(initialUser);
    initialize();
  }, [initialUser, setUser, initialize]);

  useEffect(() => {
    if (initialProject && !storeProject) {
      hydrateEditor(initialProject, initialPages);
    }
  }, [initialProject, initialPages, storeProject, hydrateEditor]);

  // Sync project from store when settings change
  useEffect(() => {
    if (storeProject && storeProject.id === project.id) {
      setProject(storeProject);
    }
  }, [storeProject, project.id]);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const slug = newSlug.trim() || newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const pageId = uuidv4();

    const { data: newPage } = await supabase
      .from('pages')
      .insert({
        id: pageId,
        project_id: project.id,
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

  const updatePageSEO = async (pageId: string, seo: { title?: string; description?: string; image?: string }) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    const newSeo = { ...(page.seo || {}), ...seo };
    // Update local state immediately
    setPages(pages.map(p => p.id === pageId ? { ...p, seo: newSeo } : p));
    // Persist to DB
    await supabase.from('pages').update({ seo: newSeo }).eq('id', pageId);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const result = await deployToCloudflare(project.id);
    setIsPublishing(false);
    if (result.success) {
      const { data: updated } = await supabase
        .from('projects').select('*').eq('id', project.id).single();
      if (updated) setProject(updated);
    }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/editor" className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">I miei siti</span>
            </Link>
            <div className="h-5 w-px bg-zinc-200" />
            <h1 className="text-sm font-bold text-zinc-900">{project.name}</h1>
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
              isPublished
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-zinc-100 text-zinc-500 border border-zinc-200/60"
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", isPublished ? "bg-emerald-500" : "bg-zinc-400")} />
              {isPublished ? 'Online' : 'Non pubblicato'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {project.live_url && (
              <a
                href={getProjectDomain(project)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">Vedi sito</span>
              </a>
            )}
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <Rocket size={14} />}
              {isPublishing ? 'Pubblicando...' : 'Pubblica'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab('pages')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px",
              activeTab === 'pages'
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <FileText size={15} />
            Pagine
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px",
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
                <h2 className="text-lg font-bold text-zinc-900">Pagine</h2>
                <p className="text-sm text-zinc-500 mt-0.5">{pages.length} {pages.length === 1 ? 'pagina' : 'pagine'} nel sito</p>
              </div>
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-all"
              >
                <Plus size={16} />
                Nuova pagina
              </button>
            </div>

            {/* Create page form */}
            {isCreating && (
              <form onSubmit={handleCreatePage} className="mb-6 p-5 bg-white border border-zinc-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Titolo</label>
                    <input
                      autoFocus
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none transition-all"
                      placeholder="Es. Chi Siamo"
                      value={newTitle}
                      onChange={(e) => {
                        setNewTitle(e.target.value);
                        setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Slug URL</label>
                    <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden focus-within:border-zinc-400 transition-all">
                      <span className="px-2 text-xs text-zinc-400 bg-zinc-50 py-2 border-r border-zinc-200">/</span>
                      <input
                        className="flex-1 px-2 py-2 text-sm outline-none"
                        placeholder="chi-siamo"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setIsCreating(false); setNewTitle(''); setNewSlug(''); }}
                    className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Crea pagina
                  </button>
                </div>
              </form>
            )}

            {/* Pages grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="group relative bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all"
                >
                  <Link href={`/editor/${project.id}/${page.id}`} className="block p-5 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                        <FileText size={18} className="text-zinc-400" />
                      </div>
                      {page.slug === 'home' && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Home
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                      {page.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <LayoutGrid size={11} />
                        {page.blocks?.length || 0} blocchi
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(page.updated_at)}
                      </span>
                    </p>
                  </Link>

                  <div className="px-5 py-2.5 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-mono">/{page.slug}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSeoOpenId(page.id)}
                        className="p-1.5 rounded-md text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-colors"
                        title="Impostazioni SEO"
                      >
                        <Globe size={14} />
                      </button>
                      {page.slug !== 'home' && (
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SEO Modal */}
            {seoOpenId && (() => {
              const page = pages.find(p => p.id === seoOpenId);
              if (!page) return null;
              const titleLen = page.seo?.title?.length || 0;
              const descLen = page.seo?.description?.length || 0;

              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSeoOpenId(null)} />
                  <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100">
                      <div>
                        <h2 className="text-base font-bold text-zinc-900">SEO — {page.title}</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">/{page.slug}</p>
                      </div>
                      <button
                        onClick={() => setSeoOpenId(null)}
                        className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-600"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                      {/* Meta Title */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-zinc-700">Meta Title</label>
                          <span className={cn(
                            "text-xs font-semibold",
                            titleLen < 40 || titleLen > 70 ? "text-red-500" :
                            titleLen < 50 || titleLen > 60 ? "text-amber-500" : "text-emerald-500"
                          )}>
                            {titleLen} / 60
                          </span>
                        </div>
                        <input
                          className="w-full text-sm px-3.5 py-2.5 border border-zinc-200 rounded-lg bg-white focus:border-zinc-400 outline-none transition-all"
                          placeholder="Titolo per i motori di ricerca"
                          value={page.seo?.title || ''}
                          onChange={(e) => updatePageSEO(page.id, { title: e.target.value })}
                        />
                        <p className="text-[11px] text-zinc-400 mt-1.5">Consigliato: 50-60 caratteri. Questo appare come titolo su Google.</p>
                      </div>

                      {/* Meta Description */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-zinc-700">Meta Description</label>
                          <span className={cn(
                            "text-xs font-semibold",
                            descLen < 100 || descLen > 200 ? "text-red-500" :
                            descLen < 110 || descLen > 160 ? "text-amber-500" : "text-emerald-500"
                          )}>
                            {descLen} / 160
                          </span>
                        </div>
                        <textarea
                          className="w-full text-sm px-3.5 py-2.5 border border-zinc-200 rounded-lg bg-white focus:border-zinc-400 outline-none transition-all h-24 resize-none"
                          placeholder="Breve descrizione del contenuto della pagina..."
                          value={page.seo?.description || ''}
                          onChange={(e) => updatePageSEO(page.id, { description: e.target.value })}
                        />
                        <p className="text-[11px] text-zinc-400 mt-1.5">Consigliato: 110-160 caratteri. Appare sotto il titolo nei risultati Google.</p>
                      </div>

                      {/* Social Image */}
                      <div>
                        <ImageUpload
                          label={
                            <div className="flex items-center justify-between w-full">
                              <span>Social Meta Image</span>
                              {isUploading && <span className="text-xs text-blue-500 animate-pulse font-semibold">Caricamento...</span>}
                            </div>
                          }
                          showSEOStatus={true}
                          value={resolveImageUrl(page.seo?.image || '', project, useEditorStore.getState().imageMemoryCache)}
                          onChange={async (val, filename) => {
                            const path = await uploadImage(val, filename as string);
                            updatePageSEO(page.id, { image: path });
                          }}
                        />
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-zinc-100 flex justify-end">
                      <button
                        onClick={() => setSeoOpenId(null)}
                        className="px-5 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all"
                      >
                        Fatto
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        ) : (
          /* ── DESIGN TAB ── */
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-zinc-900">Design Globale</h2>
              <p className="text-sm text-zinc-500 mt-0.5">Font, colori, pulsanti e impostazioni che si applicano a tutto il sito.</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden p-6">
              <GlobalSettings
                project={project}
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
