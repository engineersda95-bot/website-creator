'use client';

import React from 'react';
import { Layers, Type } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader } from '../SharedSidebarComponents';

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
            <SectionHeader icon={Layers} title="Layout & Spaziatura" colorClass="text-blue-500" />
            <LayoutFields 
               getStyleValue={getStyleValue} 
               updateStyle={updateStyle} 
            />
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-50">
               <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Altezza (px)</label>
                  <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={getStyleValue('minHeight', 600)} onChange={(e) => updateStyle({ minHeight: parseInt(e.target.value) || 0 })} />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Spazio Int (Gap)</label>
                  <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={getStyleValue('gap', 32)} onChange={(e) => updateStyle({ gap: parseInt(e.target.value) || 0 })} />
               </div>
            </div>
         </section>

         <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />

         <section className="pt-8 border-t border-zinc-100">
            <SectionHeader icon={Type} title="Stile Testi" colorClass="text-indigo-500" />
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
