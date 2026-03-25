'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

import { LayoutGridSliderProps } from '@/types/sidebar';

export function LayoutGridSlider({ content, updateContent, updateStyle, getStyleValue, viewport = 'desktop' }: LayoutGridSliderProps) {
   const layout = content?.layout || 'grid';
   
   // Default columns based on viewport
   const defaultCols = viewport === 'desktop' ? 3 : viewport === 'tablet' ? 2 : 1;
   
   // Use getStyleValue if possible? No, we need precisely the responsive columns.
   const columns = getStyleValue('columns', defaultCols);

   return (
      <section className="pt-8 border-t border-zinc-100 space-y-8">
         <div className="flex items-center justify-between">
            <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Layout & Griglia</label>
            <div className="flex bg-zinc-100 p-1 rounded-xl">
               {[
                  { id: 'grid', label: 'Griglia' },
                  { id: 'slider', label: 'Slider' }
               ].map(l => (
                  <button
                     key={l.id}
                     onClick={() => updateContent({ layout: l.id })}
                     className={cn(
                        "px-4 py-1.5 text-[12px] font-black uppercase rounded-lg transition-all",
                        layout === l.id ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600"
                     )}
                  >
                     {l.label}
                  </button>
               ))}
            </div>
         </div>

         <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                  <Package size={14} className="text-zinc-400" />
                  <span className="text-[12px] font-black uppercase tracking-widest text-zinc-500">
                     Elementi per riga ({viewport})
                  </span>
               </div>
               <span className="text-sm font-black text-zinc-900 tabular-nums">{columns}</span>
            </div>
            
            <input 
               type="range" 
               min="1" 
               max="6" 
               step="1"
               className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900 transition-all hover:accent-zinc-700"
               value={columns}
               onChange={(e) => updateStyle({ columns: parseInt(e.target.value) })}
            />

            <div className="flex justify-between px-1">
               {[1, 2, 3, 4, 5, 6].map(n => (
                  <span key={n} className="text-[13px] font-bold text-zinc-300">{n}</span>
               ))}
            </div>
         </div>
      </section>
   );
}

