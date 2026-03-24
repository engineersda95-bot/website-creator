'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ColorManager({ 
   getStyleValue, 
   updateStyle, 
   project, 
   bgKey = 'backgroundColor', 
   textKey = 'textColor', 
   title = "Colori & Sfondo", 
   icon = Palette, 
   colorClass = "text-pink-500",
   showReset = true
}: any) {
   const appearance = project?.settings?.appearance || 'light';
   const defaultBg = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff');
   const defaultText = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000');

   return (
      <section className="pt-8 border-t border-zinc-100">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
               <Palette size={14} className={colorClass} /> {title}
            </h3>
            <div className="flex bg-zinc-100 p-1 rounded-lg">
               {['solid', 'gradient'].map((t) => (
                  <button
                     key={t}
                     onClick={() => updateStyle({ bgType: t })}
                     className={cn(
                        "px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all",
                        getStyleValue('bgType', 'solid') === t ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                     )}
                  >
                     {t === 'solid' ? 'Tinta Unita' : 'Gradiente'}
                  </button>
               ))}
            </div>
         </div>
         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Sfondo</label>
                  <input
                     type="color"
                     className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                     value={getStyleValue(bgKey, defaultBg)}
                     onChange={(e) => updateStyle({ [bgKey]: e.target.value })}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo</label>
                  <input
                     type="color"
                     className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                     value={getStyleValue(textKey, defaultText)}
                     onChange={(e) => updateStyle({ [textKey]: e.target.value })}
                  />
               </div>
            </div>

            {getStyleValue('bgType', 'solid') === 'gradient' && (
               <div className="animate-in slide-in-from-top-2 duration-300 space-y-4 pt-4 border-t border-zinc-50">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Punto Fine</label>
                        <input
                           type="color"
                           className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                           value={getStyleValue('backgroundColor2', '#f3f4f6')}
                           onChange={(e) => updateStyle({ backgroundColor2: e.target.value })}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Direzione</label>
                        <select
                           className="w-full p-2.5 border border-zinc-200 rounded-xl text-[10px] font-black uppercase bg-zinc-50 outline-none focus:bg-white transition-all shadow-sm"
                           value={getStyleValue('bgDirection', 'to bottom')}
                           onChange={(e) => updateStyle({ bgDirection: e.target.value })}
                        >
                           <option value="to bottom">Dall'alto ↓</option>
                           <option value="to top">Dal basso ↑</option>
                           <option value="to right">Da sinistra →</option>
                           <option value="to left">Da destra ←</option>
                           <option value="to bottom right">Inclinato</option>
                        </select>
                     </div>
                  </div>
               </div>
            )}

            {showReset && (
               <button
                  onClick={() => updateStyle({ [bgKey]: undefined, [textKey]: undefined, bgType: 'solid', backgroundColor2: undefined, bgDirection: undefined })}
                  className="w-full p-2.5 text-[10px] font-bold text-zinc-400 border border-dashed rounded-xl hover:text-zinc-900 transition-all uppercase tracking-widest"
               >
                  Resetta a Tema Globale
               </button>
            )}
         </div>
      </section>
   );
}
