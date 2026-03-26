'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

import { BackgroundManagerProps } from '@/types/sidebar';

export function BackgroundManager({ selectedBlock, updateContent, updateStyle, getStyleValue }: BackgroundManagerProps) {
   const { uploadImage, isUploading } = useEditorStore();

   return (
      <div className="space-y-6 pt-4 border-t border-zinc-100">
         <div className="flex bg-zinc-100 p-1 rounded-2xl mb-6">
            <button className="flex-1 py-1.5 text-[12px] font-black uppercase bg-white text-zinc-900 rounded-xl shadow-sm border border-zinc-200">Immagine Sfondo</button>
            {selectedBlock.content.backgroundImage && (
               <button onClick={() => updateContent({ backgroundImage: undefined })} className="flex-1 py-1.5 text-[12px] font-black uppercase text-red-500 hover:text-red-600 transition-colors">Rimuovi</button>
            )}
         </div>
         <ImageUpload
            label="Immagine"
            value={resolveImageUrl(selectedBlock.content.backgroundImage, useEditorStore.getState().project, useEditorStore.getState().imageMemoryCache)}
            onChange={async (val: string, filename?: string) => {
               const relativePath = await uploadImage(val, filename);
               updateContent({ backgroundImage: relativePath });
               if (getStyleValue('overlayOpacity', undefined) === undefined) updateStyle({ overlayOpacity: 40 });
            }}
            altValue={selectedBlock.content.backgroundAlt ?? ''}
            onAltChange={(alt) => updateContent({ backgroundAlt: alt })}
            onFilenameSelect={(name) => {
               if (!selectedBlock.content.backgroundAlt) updateContent({ backgroundAlt: name });
            }}
         />

         {selectedBlock.content.backgroundImage && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block">Dimensione</label>
                     <select
                        className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold focus:bg-white transition-all outline-none"
                        value={getStyleValue('backgroundSize', 'cover')}
                        onChange={(e) => updateStyle({ backgroundSize: e.target.value })}
                     >
                        <option value="cover">Pieno (Cover)</option>
                        <option value="contain">Contenuto (Contain)</option>
                        <option value="auto">Originale (Auto)</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block">Posizione</label>
                     <select
                        className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold focus:bg-white transition-all outline-none"
                        value={getStyleValue('backgroundPosition', 'center')}
                        onChange={(e) => updateStyle({ backgroundPosition: e.target.value })}
                     >
                        <option value="center">Centro</option>
                        <option value="top">In Alto</option>
                        <option value="bottom">In Basso</option>
                        <option value="left">A Sinistra</option>
                        <option value="right">A Destra</option>
                     </select>
                  </div>
               </div>

               <div>
                  <label className="text-[12px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                     <span>Opacità Immagine</span>
                     <span className="text-zinc-900 font-bold">{getStyleValue('opacity', 100)}%</span>
                  </label>
                  <input type="range" min="0" max="100" step="1" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                     value={getStyleValue('opacity', 100)}
                     onChange={(e) => updateStyle({ opacity: parseInt(e.target.value) })}
                  />
               </div>
               
               <div className="pt-4 border-t border-zinc-50">
                  <div className="flex items-center justify-between mb-4">
                     <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        Overlay
                        <button 
                           onClick={() => updateStyle({ overlayDisabled: !getStyleValue('overlayDisabled', false) })}
                           className={cn(
                              "p-1 rounded transition-colors",
                              getStyleValue('overlayDisabled', false) ? "text-red-500 bg-red-50" : "text-emerald-500 bg-emerald-50"
                           )}
                        >
                           {getStyleValue('overlayDisabled', false) ? <EyeOff size={10} /> : <Eye size={10} />}
                        </button>
                     </label>
                     <div className={cn(
                        "flex bg-zinc-100 p-1 rounded-lg transition-opacity",
                        getStyleValue('overlayDisabled', false) && "opacity-30 pointer-events-none"
                     )}>
                        {[
                           { id: 'solid', label: 'Tinta' },
                           { id: 'gradient', label: 'Grad' }
                        ].map((type) => (
                           <button
                              key={type.id}
                              onClick={() => updateStyle({ overlayType: type.id })}
                              className={cn(
                                 "px-2 py-1 text-[13px] font-black uppercase tracking-tight rounded-md transition-all",
                                 getStyleValue('overlayType', 'solid') === type.id 
                                    ? "bg-zinc-900 text-white shadow-sm" 
                                    : "text-zinc-400 hover:text-zinc-600"
                              )}
                           >
                              {type.label}
                           </button>
                        ))}
                     </div>
                  </div>

                  {!getStyleValue('overlayDisabled', false) && (
                     <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block tracking-tighter">Colore {getStyleValue('overlayType', 'solid') === 'gradient' ? 'Inizio' : 'Overlay'}</label>
                              <input
                                 type="color"
                                 className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                                 value={getStyleValue('overlayColor', '#000000')}
                                 onChange={(e) => updateStyle({ overlayColor: e.target.value })}
                              />
                           </div>
                           {getStyleValue('overlayType', 'solid') === 'gradient' && (
                              <div>
                                 <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block tracking-tighter">Colore Fine</label>
                                 <input
                                    type="color"
                                    className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                                    value={getStyleValue('overlayColor2', '#111111')}
                                    onChange={(e) => updateStyle({ overlayColor2: e.target.value })}
                                 />
                              </div>
                           )}
                        </div>

                        {getStyleValue('overlayType', 'solid') === 'gradient' && (
                           <div>
                              <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block">Direzione</label>
                              <select
                                 className="w-full p-2.5 border border-zinc-200 rounded-xl text-[12px] font-black uppercase bg-zinc-50 outline-none"
                                 value={getStyleValue('overlayDirection', 'to bottom')}
                                 onChange={(e) => updateStyle({ overlayDirection: e.target.value })}
                              >
                                 <option value="to bottom">In giù ↓</option>
                                 <option value="to right">Destra →</option>
                                 <option value="to bottom right">Diagonale</option>
                              </select>
                           </div>
                        )}

                        <div>
                           <label className="text-[12px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between tracking-widest">
                              <span>Opacità Overlay</span>
                              <span className="text-zinc-900 font-bold">{getStyleValue('overlayOpacity', 40)}%</span>
                           </label>
                           <input type="range" min="0" max="100" step="1" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                              value={getStyleValue('overlayOpacity', 40)}
                              onChange={(e) => updateStyle({ overlayOpacity: parseInt(e.target.value) })}
                           />
                        </div>
                     </div>
                  )}
               </div>
               <div>
                  <label className="text-[12px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between tracking-widest">
                     <span>Sfocatura (Blur)</span>
                     <span className="text-zinc-900 font-bold">{getStyleValue('blur', 0)}px</span>
                  </label>
                  <input type="range" min="0" max="20" step="1" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                     value={getStyleValue('blur', 0)}
                     onChange={(e) => updateStyle({ blur: parseInt(e.target.value) })}
                  />
               </div>
            </div>
         )}
      </div>
   );
}

