'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';
import { Page } from '@/types/editor';

interface PageSeoModalProps {
  page: Page;
  project: any;
  onClose: () => void;
  updatePageSEO: (pageId: string, seo: any) => Promise<void>;
  uploadImage: (val: string, filename?: string) => Promise<string>;
  isUploading: boolean;
}

export const PageSeoModal = ({ page, project, onClose, updatePageSEO, uploadImage, isUploading }: PageSeoModalProps) => {
  const [localSeo, setLocalSeo] = React.useState({
    title: page.seo?.title || '',
    description: page.seo?.description || '',
    image: page.seo?.image || ''
  });

  const [isSavingSeo, setIsSavingSeo] = React.useState(false);

  const handleSaveSeo = async () => {
    setIsSavingSeo(true);
    await updatePageSEO(page.id, localSeo);
    setIsSavingSeo(false);
    onClose();
  };

  const titleLen = localSeo.title?.length || 0;
  const descLen = localSeo.description?.length || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-zinc-200/50">
        <div className="px-8 py-6 flex items-center justify-between border-b border-zinc-100">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Impostazioni SEO</h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-bold uppercase">{page.title}</span>
              <span className="text-zinc-300">/</span>
              <span className="font-mono">/{page.slug}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-zinc-600 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Meta Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Titolo della Pagina (Meta Title)</label>
              <span className={cn(
                "text-[11px] font-black px-2 py-0.5 rounded-full uppercase",
                titleLen < 40 || titleLen > 70 ? "bg-red-50 text-red-500" :
                  titleLen < 50 || titleLen > 60 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
              )}>
                {titleLen} / 60
              </span>
            </div>
            <input
              className="w-full text-sm px-4 py-3 border border-zinc-200 rounded-2xl bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all shadow-inner"
              placeholder="Come apparirà nel titolo della scheda del browser e su Google..."
              value={localSeo.title}
              onChange={(e) => setLocalSeo(prev => ({ ...prev, title: e.target.value }))}
            />
            <p className="text-[11px] text-zinc-400 pl-1 font-medium">Consigliato: 50-60 caratteri. È la prima cosa che gli utenti leggono nei motori di ricerca.</p>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Descrizione della Pagina (Meta Description)</label>
              <span className={cn(
                "text-[11px] font-black px-2 py-0.5 rounded-full uppercase",
                descLen < 100 || descLen > 200 ? "bg-red-50 text-red-500" :
                  descLen < 110 || descLen > 160 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
              )}>
                {descLen} / 160
              </span>
            </div>
            <textarea
              className="w-full text-sm px-4 py-3 border border-zinc-200 rounded-2xl bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all h-28 resize-none shadow-inner"
              placeholder="Un breve riassunto del contenuto che spinga l'utente a cliccare..."
              value={localSeo.description}
              onChange={(e) => setLocalSeo(prev => ({ ...prev, description: e.target.value }))}
            />
            <p className="text-[11px] text-zinc-400 pl-1 font-medium">Consigliato: 110-160 caratteri. Appare sotto il titolo nei risultati di ricerca.</p>
          </div>

          {/* Social Image */}
          <div className="space-y-1">
            <ImageUpload
              label={
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Immagine Condivisione (Social Image)</span>
                  {isUploading && <span className="text-xs text-blue-500 animate-pulse font-black uppercase">Caricamento...</span>}
                </div>
              }
              showSEOStatus={true}
              value={resolveImageUrl(localSeo.image, project, useEditorStore.getState().imageMemoryCache)}
              onChange={async (val, filename) => {
                const path = await uploadImage(val, filename as string);
                setLocalSeo(prev => ({ ...prev, image: path }));
              }}
            />
          </div>
        </div>

        <div className="px-8 py-6 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest active:scale-95"
          >
            Annulla
          </button>
          <button
            onClick={handleSaveSeo}
            disabled={isSavingSeo}
            className="flex items-center gap-2 px-8 py-2.5 text-sm font-black bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 active:scale-95 disabled:opacity-50 uppercase tracking-widest"
          >
            {isSavingSeo ? <Loader2 size={16} className="animate-spin" /> : 'Salva SEO'}
          </button>
        </div>
      </div>
    </div>
  );
};
