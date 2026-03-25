'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { LinkListManager, CTAManager, SectionHeader } from '../SharedSidebarComponents';
import { Layout } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';

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
   const { uploadImage, isUploading } = useEditorStore();

   return (
      <div className="space-y-8">
         <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl">
               <button onClick={() => updateContent({ logoType: 'text' })} className={cn("flex-1 py-2 text-[12px] font-black uppercase tracking-wider rounded-lg transition-all", selectedBlock.content.logoType !== 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-transparent text-zinc-400 hover:text-zinc-600')}>Testo</button>
               <button onClick={() => updateContent({ logoType: 'image' })} className={cn("flex-1 py-2 text-[12px] font-black uppercase tracking-wider rounded-lg transition-all", selectedBlock.content.logoType === 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-transparent text-zinc-400 hover:text-zinc-600')}>Immagine</button>
            </div>

            {selectedBlock.content.logoType !== 'image' && (
               <input className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50 focus:bg-white transition-all outline-none" placeholder="Testo Logo" value={selectedBlock.content.logoText || ''} onChange={(e) => updateContent({ logoText: e.target.value })} />
            )}
            <div className="flex items-center justify-between gap-2 mb-2">
               <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Logo</label>
               {isUploading && <span className="text-[12px] font-bold text-blue-500 animate-pulse uppercase">Caricamento...</span>}
            </div>
            {selectedBlock.content.logoType !== 'text' && (
               <ImageUpload
                  label="File Logo"
                  value={resolveImageUrl(selectedBlock.content.logoImage, useEditorStore.getState().project, useEditorStore.getState().imageMemoryCache)}
                  onChange={async (val: string, filename?: string) => {
                     const relativePath = await uploadImage(val, filename);
                     updateContent({ logoImage: relativePath });
                  }}
               />
            )}

            <div className="space-y-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
               <div className="flex items-center justify-between gap-4">
                  <label className="text-[12px] font-bold text-zinc-400 uppercase">Dim. Testo Logo (px)</label>
                  <input
                     type="number"
                     className="w-20 p-2 border border-zinc-200 rounded-lg text-xs font-bold"
                     value={getStyleValue('logoTextSize', selectedBlock.content?.logoTextSize || 24)}
                     onChange={(e) => updateStyle({ logoTextSize: parseInt(e.target.value) })}
                  />
               </div>
               <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
                  <label className="text-[12px] font-bold text-zinc-400 uppercase">Dim. Immagine Logo (px)</label>
                  <input
                     type="number"
                     className="w-20 p-2 border border-zinc-200 rounded-lg text-xs font-bold"
                     value={getStyleValue('logoSize', selectedBlock.content?.logoSize || 40)}
                     onChange={(e) => updateStyle({ logoSize: parseInt(e.target.value) })}
                  />
               </div>
               <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
                  <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Home Link su Logo</label>
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

          <section className="pt-8 border-t border-zinc-100">
            <SectionHeader icon={Layout} title="Configurazione" />
            <div className="space-y-4">
              <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest block">Layout Default</label>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => updateContent({ layoutType: 'standard' })} className={cn("py-2.5 text-[12px] font-black border-2 rounded-xl transition-all", (selectedBlock.content.layoutType || 'standard') === 'standard' ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}>LISTA</button>
                 <button onClick={() => updateContent({ layoutType: 'hamburger' })} className={cn("py-2.5 text-[12px] font-black border-2 rounded-xl transition-all", selectedBlock.content.layoutType === 'hamburger' ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}>HAMBURGER</button>
              </div>
            </div>
          </section>

          <section className="pt-4 border-t border-zinc-100">
            <CTAManager
                content={selectedBlock.content}
                updateContent={updateContent}
                style={selectedBlock.style}
                updateStyle={updateStyle}
            />
          </section>
      </div>
   );
};

