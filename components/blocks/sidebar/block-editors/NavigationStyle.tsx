'use client';

import React from 'react';
import { Layers, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BorderShadowManager } from '../SharedSidebarComponents';

interface NavigationStyleProps {
   selectedBlock: any;
   updateStyle: (style: any) => void;
   getStyleValue: (key: string, defaultValue: any) => any;
   project: any;
}

export const NavigationStyle: React.FC<NavigationStyleProps> = ({
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
               showAlign={false}
               paddingLabel="Padding su/giù"
               hPaddingLabel="Padding Dx/Sx"
            />

            <div className="mt-8 space-y-4">
               <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Larghezza Sidebar (px)</label>
                  <input 
                     type="number"
                     value={getStyleValue('hamburgerWidth', 450)}
                     onChange={(e) => updateStyle({ hamburgerWidth: parseInt(e.target.value) || 450 })}
                     className="w-20 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                  />
               </div>
            </div>

            <div className="mt-8 space-y-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
               <div className="flex items-center justify-between gap-4">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Header Sticky (Fisso)</label>
                  <div
                     className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", getStyleValue('isSticky', false) ? "bg-zinc-900" : "bg-zinc-200")}
                     onClick={() => updateStyle({ isSticky: !getStyleValue('isSticky', false) })}
                  >
                     <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", getStyleValue('isSticky', false) && "translate-x-5")} />
                  </div>
               </div>
               <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sfondo Trasparente</label>
                  <div
                     className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", getStyleValue('isTransparent', false) ? "bg-zinc-900" : "bg-zinc-200")}
                     onClick={() => {
                        const newVal = !getStyleValue('isTransparent', false);
                         updateStyle({ 
                           isTransparent: newVal,
                           scrolledOpacity: newVal ? 0 : getStyleValue('scrolledOpacity', 0)
                         });
                      }}
                  >
                     <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", getStyleValue('isTransparent', false) && "translate-x-5")} />
                  </div>
               </div>

               {getStyleValue('isTransparent', false) && (
                  <div className="space-y-4 pt-4 border-t border-zinc-100">
                     <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Configurazione Scrolled (Header Pieno)</p>
                     
                     <div className="space-y-2">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase">Opacità ({getStyleValue('scrolledOpacity', 0)}%)</label>
                        </div>
                        <input
                           type="range"
                           min="0"
                           max="100"
                           step="1"
                           value={getStyleValue('scrolledOpacity', 0)}
                           onChange={(e) => updateStyle({ scrolledOpacity: parseInt(e.target.value) })}
                           className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                        />
                     </div>
                  </div>
               )}
            </div>
         </section>

         <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />

         <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

         <section className="pt-8 border-t border-zinc-100">
            <SectionHeader icon={Type} title="Stile Font" />
            <TypographyFields
               label="Dimensione Link"
               sizeKey="fontSize"
               boldKey="titleBold"
               italicKey="titleItalic"
               getStyleValue={getStyleValue}
               updateStyle={updateStyle}
               defaultValue={14}
            />
         </section>
      </div>
   );
};
