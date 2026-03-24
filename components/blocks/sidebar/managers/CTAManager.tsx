'use client';

import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

import { CTAManagerProps } from '@/types/sidebar';

export function CTAManager({ content, updateContent, style, updateStyle }: CTAManagerProps) {
   return (
      <div className="space-y-4 pt-4 border-t border-zinc-100">
         <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Pulsante (CTA)</label>
            <div className="flex bg-zinc-100 p-1 rounded-lg">
               <button
                  onClick={() => updateStyle?.({ buttonTheme: 'primary' })}
                  className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-tight rounded-md transition-all", (style?.buttonTheme || 'primary') === 'primary' ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
               >
                  Primario
               </button>
               <button
                  onClick={() => updateStyle?.({ buttonTheme: 'secondary' })}
                  className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-tight rounded-md transition-all", style?.buttonTheme === 'secondary' ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
               >
                  Secondario
               </button>
            </div>
         </div>
         <div className="grid gap-3">
            <input
               className="w-full p-3 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white transition-all outline-none"
               placeholder="Testo Bottone (es: Inizia Ora)"
               value={content.cta || ''}
               onChange={(e) => updateContent({ cta: e.target.value })}
            />
            <div className="flex items-center gap-2 p-3 border border-zinc-200 rounded-xl bg-zinc-50">
               <LinkIcon size={14} className="text-zinc-400" />
               <input
                  className="flex-1 bg-transparent text-xs outline-none"
                  placeholder="Link (es: /contatti o https://...)"
                  value={content.ctaLink || ''}
                  onChange={(e) => updateContent({ ctaLink: e.target.value })}
               />
            </div>
         </div>
      </div>
   );
}
