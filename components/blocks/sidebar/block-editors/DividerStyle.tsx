'use client';

import React from 'react';
import { Layers, Palette } from 'lucide-react';
import { LayoutFields, SectionHeader, ColorManager, BackgroundManager } from '../SharedSidebarComponents';

interface DividerStyleProps {
   selectedBlock: any;
   updateContent: (content: any) => void;
   updateStyle: (style: any) => void;
   getStyleValue: (key: string, defaultValue: any) => any;
   project: any;
}

export const DividerStyle: React.FC<DividerStyleProps> = ({
   selectedBlock,
   updateContent,
   updateStyle,
   getStyleValue,
   project
}) => {
   // Calculate theme text color for the reset fallback correctly based on the project appearance
   const appearance = project?.settings?.appearance || 'light';
   const defaultTextColor = appearance === 'dark' 
      ? (project?.settings?.themeColors?.dark?.text || '#ffffff') 
      : (project?.settings?.themeColors?.light?.text || '#000000');

   return (
      <div className="space-y-10">
         <section>
            <SectionHeader icon={Layers} title="Layout & Spaziatura" />
            <LayoutFields 
               getStyleValue={getStyleValue} 
               updateStyle={updateStyle} 
            />
            
            <div className="space-y-6 mt-8 pt-8 border-t border-zinc-100">
               <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                     <span>Larghezza (%)</span>
                     <span className="text-zinc-900 font-bold">{getStyleValue('dividerWidth', 100)}%</span>
                  </label>
                  <input type="range" min="5" max="100" step="1" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                     value={getStyleValue('dividerWidth', 100)}
                     onChange={(e) => updateStyle({ dividerWidth: parseInt(e.target.value) })}
                  />
               </div>
               
               <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                     <span>Spessore (px)</span>
                     <span className="text-zinc-900 font-bold">{getStyleValue('dividerStroke', 1)}px</span>
                  </label>
                  <input type="range" min="0.5" max="20" step="0.5" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                     value={getStyleValue('dividerStroke', 1)}
                     onChange={(e) => updateStyle({ dividerStroke: parseFloat(e.target.value) })}
                  />
               </div>
            </div>
         </section>
         
         <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />

         <BackgroundManager 
            selectedBlock={selectedBlock} 
            updateContent={updateContent} 
            updateStyle={updateStyle} 
            getStyleValue={getStyleValue} 
         />

         <section className="pt-8 border-t border-zinc-100">
            {/* Standard "Colore" section for elements with a single primary color */}
            <SectionHeader icon={Palette} title="Elemento Visivo" />
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Colore Linea</label>
                  <input
                     type="color"
                     className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                     value={getStyleValue('dividerColor', defaultTextColor)}
                     onChange={(e) => updateStyle({ dividerColor: e.target.value })}
                  />
               </div>
               <button
                  onClick={() => updateStyle({ dividerColor: undefined })}
                  className="w-full p-2.5 text-[10px] font-bold text-zinc-400 border border-dashed rounded-xl hover:text-zinc-900 transition-all uppercase tracking-widest"
               >
                  Resetta a Colore Tema
               </button>
            </div>
         </section>
      </div>
   );
};
