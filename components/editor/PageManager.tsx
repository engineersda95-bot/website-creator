'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { FileText, Plus, ChevronRight, Layout, Trash2, Settings as SettingsIcon, Globe, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '../shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';

export const PageManager: React.FC = () => {
  const {
    project,
    projectPages,
    currentPage,
    loadPage,
    listProjectPages,
    addPage,
    deletePage,
    updatePageSEO,
    uploadImage,
    isUploading
  } = useEditorStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [showSEOSettings, setShowSEOSettings] = useState(false);

  // listProjectPages is handled by EditorClient hydration and loadPage actions

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const slug = newPageSlug.trim() || newPageTitle.toLowerCase().replace(/\s+/g, '-');
    await addPage(newPageTitle, slug);
    setIsAdding(false);
    setNewPageTitle('');
    setNewPageSlug('');
  };

  return (
    <div className="space-y-4" data-tour="page-manager">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pagine</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 hover:bg-zinc-100 rounded text-zinc-500 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-1">
        {projectPages.map((page) => (
          <div key={page.id} className="relative group/item">
            <div
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer",
                currentPage?.id === page.id
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
              onClick={() => project && loadPage(project.id, page.slug)}
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className={cn(currentPage?.id === page.id ? "text-blue-500" : "text-zinc-400")} />
                <span>{page.title}</span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                {page.slug !== 'home' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm('Vuoi davvero eliminare questa pagina?')) deletePage(page.id); }}
                    className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {currentPage?.id === page.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowSEOSettings(!showSEOSettings); }}
                    className={cn(
                      "p-1 hover:bg-blue-100 rounded transition-colors",
                      showSEOSettings ? "bg-blue-100 text-blue-600" : "text-zinc-400"
                    )}
                  >
                    <Globe size={14} />
                  </button>
                )}
                <ChevronRight size={14} className={cn(currentPage?.id === page.id ? "text-blue-500" : "text-zinc-400")} />
              </div>
            </div>

            {/* Inline SEO Settings */}
            {showSEOSettings && currentPage?.id === page.id && (
              <div className="mx-2 mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">SEO PAGINA</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-zinc-500 block uppercase">Meta Title</label>
                    <span className={cn(
                      "text-[9px] font-bold",
                      (currentPage?.seo?.title?.length || 0) < 40 || (currentPage?.seo?.title?.length || 0) > 70 ? "text-red-500" :
                        (currentPage?.seo?.title?.length || 0) < 50 || (currentPage?.seo?.title?.length || 0) > 60 ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {currentPage?.seo?.title?.length || 0} / 60
                    </span>
                  </div>
                  <input
                    className="w-full text-xs p-2 border border-zinc-200 rounded bg-white shadow-sm"
                    placeholder="Titolo per i motori di ricerca"
                    value={currentPage?.seo?.title || ''}
                    onChange={(e) => updatePageSEO({ title: e.target.value })}
                  />
                  <p className="text-[9px] text-zinc-400 px-1 font-medium">Consigliato: 50-60 caratteri. Attuale: {currentPage?.seo?.title?.length || 0}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-zinc-500 block uppercase">Meta Description</label>
                    <span className={cn(
                      "text-[9px] font-bold",
                      (currentPage?.seo?.description?.length || 0) < 100 || (currentPage?.seo?.description?.length || 0) > 200 ? "text-red-500" :
                        (currentPage?.seo?.description?.length || 0) < 110 || (currentPage?.seo?.description?.length || 0) > 160 ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {currentPage?.seo?.description?.length || 0} / 160
                    </span>
                  </div>
                  <textarea
                    className="w-full text-xs p-2 border border-zinc-200 rounded bg-white shadow-sm h-16 resize-none"
                    placeholder="Breve descrizione del contenuto..."
                    value={currentPage?.seo?.description || ''}
                    onChange={(e) => updatePageSEO({ description: e.target.value })}
                  />
                  <p className="text-[9px] text-zinc-400 px-1 font-medium">Consigliato: 110-160 caratteri. Attuale: {currentPage?.seo?.description?.length || 0}</p>
                </div>
                <div>
                  <ImageUpload
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span>Social Meta Image</span>
                        {isUploading && <span className="text-[9px] text-blue-500 animate-pulse font-bold">...</span>}
                      </div>
                    }
                    showSEOStatus={true}
                    value={resolveImageUrl(currentPage?.seo?.image || '', project, useEditorStore.getState().imageMemoryCache)}
                    onChange={async (val, filename) => {
                      const path = await uploadImage(val, filename as string);
                      updatePageSEO({ image: path });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isAdding && (
        <form onSubmit={handleCreatePage} className="p-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <input
            key="page-title-input"
            autoFocus
            className="w-full p-2.5 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-zinc-50 focus:bg-white transition-all"
            placeholder="Esempio: Chi Siamo"
            value={newPageTitle}
            onChange={(e) => {
              setNewPageTitle(e.target.value);
              setNewPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
            }}
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-300">/</span>
            <input
              className="w-full pl-6 p-2 text-xs border border-zinc-200 rounded-lg outline-none bg-zinc-50 focus:bg-white"
              placeholder="slug-url"
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700">
              Crea
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-md hover:bg-zinc-200"
            >
              Annulla
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
