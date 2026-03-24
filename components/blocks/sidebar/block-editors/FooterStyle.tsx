'use client';

import React from 'react';
import { Layers, Type } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BorderShadowManager } from '../SharedSidebarComponents';

interface FooterStyleProps {
   selectedBlock: any;
   updateStyle: (style: any) => void;
   getStyleValue: (key: string, defaultValue: any) => any;
   project: any;
}

export const FooterStyle: React.FC<FooterStyleProps> = ({
   selectedBlock,
   updateStyle,
   getStyleValue,
   project
}) => {
   return (
      <div className="space-y-10">
         <section>
            <SectionHeader icon={Layers} title="Layout & Spaziatura" />
            <LayoutFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
         </section>

         <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />

         <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

         <section className="pt-8 border-t border-zinc-100">
            <SectionHeader icon={Type} title="Stile Testi" />
            <div className="space-y-8">
               <TypographyFields 
                  label="Dimensione Logo" 
                  sizeKey="titleSize" 
                  boldKey="titleBold" 
                  italicKey="titleItalic" 
                  getStyleValue={getStyleValue} 
                  updateStyle={updateStyle} 
                  defaultValue={24} 
               />
               <TypographyFields 
                  label="Dimensione Link" 
                  sizeKey="fontSize" 
                  boldKey="linkBold" 
                  italicKey="linkItalic" 
                  getStyleValue={getStyleValue} 
                  updateStyle={updateStyle} 
                  defaultValue={14} 
               />
               <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                     <span>Dimensione Icone Social</span>
                     <span className="text-zinc-900 font-bold">{getStyleValue('socialIconSize', 20)}px</span>
                  </label>
                  <input type="range" min="12" max="60" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900" value={getStyleValue('socialIconSize', 20)} onChange={(e) => updateStyle({ socialIconSize: parseInt(e.target.value) })} />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                     <span>Dimensione Copyright</span>
                     <span className="text-zinc-900 font-bold">{getStyleValue('copyrightSize', 12)}px</span>
                  </label>
                  <input type="range" min="8" max="30" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900" value={getStyleValue('copyrightSize', 12)} onChange={(e) => updateStyle({ copyrightSize: parseInt(e.target.value) })} />
               </div>
            </div>
         </section>
      </div>
   );
};
