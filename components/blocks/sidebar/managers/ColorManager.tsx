'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorManagerProps } from '@/types/sidebar';
import { ColorInput } from '../ui/ColorInput';

export function ColorManager({ 
   getStyleValue, 
   updateStyle, 
   project, 
   bgKey = 'backgroundColor', 
   textKey = 'textColor', 
   title = "Colori & Sfondo", 
   icon = Palette, 
   colorClass = "text-pink-500",
   showReset = true,
   showTitle = true
}: ColorManagerProps & { showTitle?: boolean }) {
   const appearance = project?.settings?.appearance || 'light';
   const themeColors = project?.settings?.themeColors;
   
   // Better defaults pulling from project theme settings
   const defaultBg = appearance === 'dark' 
      ? (themeColors?.dark?.bg || '#0c0c0e') 
      : (themeColors?.light?.bg || '#ffffff');
   const defaultText = appearance === 'dark' 
      ? (themeColors?.dark?.text || '#ffffff') 
      : (themeColors?.light?.text || '#000000');

   // Derived keys for gradients
   const isDefaultBg = bgKey === 'backgroundColor';
   const bgTypeKey = isDefaultBg ? 'bgType' : `${bgKey.replace('Color', '')}Type`;
   const bgColor2Key = isDefaultBg ? 'backgroundColor2' : `${bgKey}2`;
   const bgDirectionKey = isDefaultBg ? 'bgDirection' : `${bgKey.replace('Color', '')}Direction`;

   const currentBg = getStyleValue(bgKey, defaultBg);
   const currentText = getStyleValue(textKey, defaultText);
   const RenderIcon = icon;

   return (
      <div className={cn("space-y-6", showTitle && "pt-8 border-t border-zinc-100")}>
         {showTitle && (
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                  {RenderIcon && <RenderIcon size={14} className={colorClass} />} {title}
               </h3>
               <div className="flex bg-zinc-100 p-1 rounded-lg">
                  {['solid', 'gradient'].map((t) => (
                     <button
                        key={t}
                        onClick={() => updateStyle({ [bgTypeKey]: t })}
                        className={cn(
                           "px-3 py-1 text-[12px] font-black uppercase rounded-md transition-all",
                           getStyleValue(bgTypeKey, 'solid') === t ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                     >
                        {t === 'solid' ? 'Tinta' : 'Grad'}
                     </button>
                  ))}
               </div>
            </div>
         )}

         {!showTitle && (
            <div className="flex items-center justify-between mb-4">
               <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tipo Sfondo</label>
               <div className="flex bg-zinc-100 p-1 rounded-lg">
                  {['solid', 'gradient'].map((t) => (
                     <button
                        key={t}
                        onClick={() => updateStyle({ [bgTypeKey]: t })}
                        className={cn(
                           "px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all",
                           getStyleValue(bgTypeKey, 'solid') === t ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                     >
                        {t === 'solid' ? 'Tinta' : 'Grad'}
                     </button>
                  ))}
               </div>
            </div>
         )}

         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <ColorInput 
                  label="Sfondo"
                  value={currentBg}
                  onChange={(val) => updateStyle({ [bgKey]: val })}
               />
               <ColorInput 
                  label="Testo"
                  value={currentText}
                  onChange={(val) => updateStyle({ [textKey]: val })}
               />
            </div>

            {getStyleValue(bgTypeKey, 'solid') === 'gradient' && (
               <div className="animate-in slide-in-from-top-2 duration-300 space-y-4 pt-4 border-t border-zinc-50">
                  <div className="grid grid-cols-2 gap-4">
                     <ColorInput 
                        label="Fine"
                        value={getStyleValue(bgColor2Key, '#f3f4f6')}
                        onChange={(val) => updateStyle({ [bgColor2Key]: val })}
                     />
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Direzione</label>
                        <select
                           className="w-full p-2.5 border border-zinc-200 rounded-xl text-[10px] font-black uppercase bg-zinc-50 outline-none focus:bg-white transition-all shadow-sm"
                           value={getStyleValue(bgDirectionKey, 'to bottom')}
                           onChange={(e) => updateStyle({ [bgDirectionKey]: e.target.value })}
                        >
                           <option value="to bottom">Giù ↓</option>
                           <option value="to top">Su ↑</option>
                           <option value="to right">Dx →</option>
                           <option value="to left">Sx ←</option>
                           <option value="to bottom right">Diag</option>
                        </select>
                     </div>
                  </div>
               </div>
            )}

            {showReset && (
               <button
                  onClick={() => updateStyle({ 
                     [bgKey]: undefined, 
                     [textKey]: undefined, 
                     [bgTypeKey]: 'solid', 
                     [bgColor2Key]: undefined, 
                     [bgDirectionKey]: undefined 
                  })}
                  className="w-full p-2.5 text-[10px] font-bold text-zinc-400 border border-dashed rounded-xl hover:text-zinc-900 transition-all uppercase tracking-widest"
               >
                  Resetta a Tema Globale
               </button>
            )}
         </div>
      </div>
   );
}
