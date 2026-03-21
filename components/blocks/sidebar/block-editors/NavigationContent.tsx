'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '../../ImageUpload';
import { LinkListManager, CTAManager, SectionHeader } from '../SharedSidebarComponents';
import { Layout } from 'lucide-react';

interface NavigationContentProps {
   selectedBlock: any;
   updateContent: (content: any) => void;
   updateStyle: (style: any) => void;
   getStyleValue: (key: string, defaultValue: any) => any;
}

export const NavigationContent: React.FC<NavigationContentProps> = ({
   selectedBlock,
   updateContent,
   updateStyle,
   getStyleValue
}) => {
   return (
      <div className="space-y-8">
         <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl">
               <button onClick={() => updateContent({ logoType: 'text' })} className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all", selectedBlock.content.logoType !== 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-transparent text-zinc-400 hover:text-zinc-600')}>Testo</button>
               <button onClick={() => updateContent({ logoType: 'image' })} className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all", selectedBlock.content.logoType === 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-transparent text-zinc-400 hover:text-zinc-600')}>Immagine</button>
            </div>

            {selectedBlock.content.logoType !== 'image' && (
               <input className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50 focus:bg-white transition-all outline-none" placeholder="Testo Logo" value={selectedBlock.content.logoText || ''} onChange={(e) => updateContent({ logoText: e.target.value })} />
            )}
            {selectedBlock.content.logoType !== 'text' && (
               <ImageUpload label="File Logo" value={selectedBlock.content.logoImage} onChange={(val: string) => updateContent({ logoImage: val })} />
            )}

            <div className="space-y-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
               <div className="flex items-center justify-between gap-4">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Dim. Testo Logo (px)</label>
                  <input
                     type="number"
                     className="w-20 p-2 border border-zinc-200 rounded-lg text-xs font-bold"
                     value={getStyleValue('logoTextSize', selectedBlock.content?.logoTextSize || 24)}
                     onChange={(e) => updateStyle({ logoTextSize: parseInt(e.target.value) })}
                  />
               </div>
               <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Dim. Immagine Logo (px)</label>
                  <input
                     type="number"
                     className="w-20 p-2 border border-zinc-200 rounded-lg text-xs font-bold"
                     value={getStyleValue('logoSize', selectedBlock.content?.logoSize || 40)}
                     onChange={(e) => updateStyle({ logoSize: parseInt(e.target.value) })}
                  />
               </div>
               <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Home Link su Logo</label>
                  <div
                     className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", selectedBlock.content.logoLinkHome !== false ? "bg-zinc-900" : "bg-zinc-200")}
                     onClick={() => updateContent({ logoLinkHome: selectedBlock.content.logoLinkHome === false ? true : false })}
                  >
                     <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", selectedBlock.content.logoLinkHome !== false && "translate-x-5")} />
                  </div>
               </div>
            </div>
         </div>

         <LinkListManager
            label="Link Navigazione"
            links={selectedBlock.content.links || []}
            onChange={(links) => updateContent({ links })}
         />

         <div className="space-y-4 pt-4 border-t border-zinc-100">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Configurazione Header</label>
            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => updateContent({ layoutType: 'standard' })} className={cn("py-2.5 text-[10px] font-black border-2 rounded-xl transition-all", (selectedBlock.content.layoutType || 'standard') === 'standard' ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}>LISTA</button>
               <button onClick={() => updateContent({ layoutType: 'hamburger' })} className={cn("py-2.5 text-[10px] font-black border-2 rounded-xl transition-all", selectedBlock.content.layoutType === 'hamburger' ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}>HAMBURGER</button>
            </div>


         </div>


      </div>
   );
};
