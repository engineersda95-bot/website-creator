'use client';

import React from 'react';
import { Layers, Type } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BorderShadowManager, BackgroundManager, PatternManager } from '../SharedSidebarComponents';
import { useEditorStore } from '@/store/useEditorStore';
import { cn } from '@/lib/utils';

interface HeroStyleProps {
   selectedBlock: any;
   updateStyle: (style: any) => void;
   getStyleValue: (key: string, defaultValue: any) => any;
   project: any;
}

export const HeroStyle: React.FC<HeroStyleProps> = ({
   selectedBlock,
   updateStyle,
   getStyleValue,
   project
}) => {
   return (
      <div className="space-y-10">
         <section>
            <SectionHeader icon={Layers} title="Layout & Spaziatura" />
            <LayoutFields 
               getStyleValue={getStyleValue} 
               updateStyle={updateStyle} 
            />
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-50">
               <div>
                  <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block">Altezza (px)</label>
                  <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={getStyleValue('minHeight', 600)} onChange={(e) => updateStyle({ minHeight: parseInt(e.target.value) || 0 })} />
               </div>
               <div>
                  <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block tracking-widest">Spazio Int (Gap)</label>
                  <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={getStyleValue('gap', 32)} onChange={(e) => updateStyle({ gap: parseInt(e.target.value) || 0 })} />
               </div>
            </div>

            <div className="space-y-6 mt-8 pt-8 border-t border-zinc-50">
               {/* Allineamento Verticale (Reused from ImageText) */}
               <div>
                  <label className="text-[12px] font-bold text-zinc-400 uppercase mb-3 block flex items-center gap-2 tracking-widest font-black">
                     <Layers size={12} className="text-zinc-400" /> Allineamento Verticale
                  </label>
                  <div className="flex border rounded-xl overflow-hidden bg-zinc-50 shadow-sm transition-all focus-within:border-zinc-300">
                     {[
                        { id: 'top', label: 'Sopra' },
                        { id: 'center', label: 'Centro' },
                        { id: 'bottom', label: 'Sotto' }
                     ].map((item) => (
                        <button
                           key={item.id}
                           onClick={() => updateStyle({ verticalAlign: item.id })}
                           className={cn(
                              "flex-1 p-2.5 text-[12px] font-black uppercase transition-all tracking-tighter",
                              getStyleValue('verticalAlign', 'center') === item.id 
                                 ? "bg-zinc-900 text-white shadow-lg z-10 scale-[1.02]" 
                                 : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                           )}
                        >
                           {item.label}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />
         <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

         <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

         <section className="pt-8 border-t border-zinc-100">
            <SectionHeader icon={Type} title="Stile Testi" />
            <div className="space-y-8">
               <TypographyFields 
                  label="Dimensione Titolo" 
                  sizeKey="titleSize" 
                  boldKey="titleBold" 
                  italicKey="titleItalic" 
                  getStyleValue={getStyleValue} 
                  updateStyle={updateStyle} 
                  defaultValue={40} 
               />
               <TypographyFields 
                  label="Dimensione Sottotitolo" 
                  sizeKey="subtitleSize" 
                  boldKey="subtitleBold" 
                  italicKey="subtitleItalic" 
                  getStyleValue={getStyleValue} 
                  updateStyle={updateStyle} 
                  defaultValue={18} 
               />
            </div>
         </section>
      </div>
   );
};

