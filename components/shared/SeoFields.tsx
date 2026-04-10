'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';

interface SeoFieldsProps {
  seo: { title?: string; description?: string; image?: string; indexable?: boolean };
  onChange: (updates: Partial<{ title: string; description: string; image: string; indexable: boolean }>) => void;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  defaultImage?: string; // fallback if image is missing, purely visual
  project: any;
  uploadImage: (val: string, filename?: string) => Promise<string>;
  isUploading: boolean;
  compact?: boolean; // If true, make font sizes/paddings smaller
  allowIndexToggle?: boolean; // Show the 'indexable' toggle
}

export function SeoFields({
  seo,
  onChange,
  titlePlaceholder = "Come apparirà nel titolo della scheda del browser e su Google...",
  descriptionPlaceholder = "Un breve riassunto del contenuto che spinga l'utente a cliccare...",
  defaultImage = "",
  project,
  uploadImage,
  isUploading,
  compact = false,
  allowIndexToggle = false,
}: SeoFieldsProps) {
  const titleLen = seo.title?.length || 0;
  const descLen = seo.description?.length || 0;

  const currentImage = seo.image || defaultImage;

  const labelClass = compact 
    ? "text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5"
    : "text-xs font-bold text-zinc-500 uppercase tracking-widest";
  
  const inputClass = compact
    ? "w-full text-[13px] px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all"
    : "w-full text-sm px-4 py-3 border border-zinc-200 rounded-2xl bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all shadow-inner";

  return (
    <div className={cn("space-y-6", compact && "space-y-5")}>
      {/* Meta Title */}
      <div className={cn("space-y-2", compact && "space-y-1.5")}>
        <div className="flex items-center justify-between pl-1">
          <label className={labelClass}>Titolo SEO</label>
          <span className={cn(
            "font-black px-2 py-0.5 rounded-full uppercase",
            compact ? "text-[9px]" : "text-[11px]",
            titleLen < 40 || titleLen > 70 ? "bg-red-50 text-red-500" :
              titleLen < 50 || titleLen > 60 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
          )}>
            {titleLen} / 60
          </span>
        </div>
        <input
          className={inputClass}
          placeholder={titlePlaceholder}
          value={seo.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
        {!compact && (
          <p className="text-[11px] text-zinc-400 pl-1 font-medium">Consigliato: 50-60 caratteri. È la prima cosa che gli utenti leggono nei motori di ricerca.</p>
        )}
      </div>

      {/* Meta Description */}
      <div className={cn("space-y-2", compact && "space-y-1.5")}>
        <div className="flex items-center justify-between pl-1">
          <label className={labelClass}>Descrizione SEO</label>
          <span className={cn(
            "font-black px-2 py-0.5 rounded-full uppercase",
            compact ? "text-[9px]" : "text-[11px]",
            descLen < 100 || descLen > 200 ? "bg-red-50 text-red-500" :
              descLen < 110 || descLen > 160 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
          )}>
            {descLen} / 160
          </span>
        </div>
        <textarea
          className={cn(inputClass, "resize-none", compact ? "h-20" : "h-28")}
          placeholder={descriptionPlaceholder}
          value={seo.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
        />
        {!compact && (
          <p className="text-[11px] text-zinc-400 pl-1 font-medium">Consigliato: 110-160 caratteri. Appare sotto il titolo nei risultati di ricerca.</p>
        )}
      </div>

      {/* Social Image */}
      <div className="space-y-1">
        <ImageUpload
          label={
            <div className="flex items-center justify-between w-full">
              <span className={labelClass}>Immagine OG / Social</span>
              {isUploading && <span className="text-[10px] sm:text-xs text-blue-500 animate-pulse font-black uppercase">Caricamento...</span>}
            </div>
          }
          showSEOStatus={true}
          value={currentImage ? resolveImageUrl(currentImage, project, useEditorStore.getState().imageMemoryCache) : ''}
          onChange={async (val, filename) => {
            if (!val) {
              onChange({ image: '' });
              return;
            }
            const path = await uploadImage(val, filename as string);
            if (path && !path.startsWith('data:')) {
              onChange({ image: path });
            }
          }}
        />
        {!seo.image && defaultImage && (
          <p className="text-[9px] text-zinc-400 pl-1 pt-1 font-medium">Visivamente si adatta alla copertina. Caricala per sovrascriverla nei social.</p>
        )}
      </div>

      {allowIndexToggle && (
        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl mt-2 border border-zinc-100">
          <div>
            <div className="text-[11px] font-bold text-zinc-700">Indicizzabile</div>
            <div className="text-[10px] text-zinc-400">Visibile ai motori di ricerca</div>
          </div>
          <input 
            type="checkbox" 
            checked={seo.indexable !== false} 
            onChange={(e) => onChange({ indexable: e.target.checked })} 
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900" 
          />
        </div>
      )}
    </div>
  );
}
