'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { SocialLinksManager, LinkListManager } from '../SharedSidebarComponents';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';

interface FooterContentProps {
   selectedBlock: any;
   updateContent: (content: any) => void;
   projectPages: any;
}

export const FooterContent: React.FC<FooterContentProps> = ({
   selectedBlock,
   updateContent,
   projectPages
}) => {
   const { uploadImage, isUploading } = useEditorStore();

   return (
      <div className="space-y-8">
         <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
               <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Mostra Logo</label>
               <div
                  className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", selectedBlock.content.showLogo !== false ? "bg-zinc-900" : "bg-zinc-200")}
                  onClick={() => updateContent({ showLogo: selectedBlock.content.showLogo === false ? true : false })}
               >
                  <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", selectedBlock.content.showLogo !== false && "translate-x-5")} />
               </div>
            </div>

            {selectedBlock.content.showLogo !== false && (
               <div className="space-y-4 pt-2">
                  <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl">
                     <button onClick={() => updateContent({ logoType: 'text' })} className={cn("flex-1 py-1 text-[12px] font-black uppercase rounded-lg transition-all", selectedBlock.content.logoType !== 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-transparent text-zinc-400 hover:text-zinc-600')}>Testo</button>
                     <button onClick={() => updateContent({ logoType: 'image' })} className={cn("flex-1 py-1 text-[12px] font-black uppercase rounded-lg transition-all", selectedBlock.content.logoType === 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-transparent text-zinc-400 hover:text-zinc-600')}>Immagine</button>
                  </div>

                  {selectedBlock.content.logoType !== 'image' && (
                     <input className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50" placeholder="Testo Logo" value={selectedBlock.content.logoText || ''} onChange={(e) => updateContent({ logoText: e.target.value })} />
                  )}
                  {selectedBlock.content.logoType !== 'text' && (
                     <>
                        <div className="flex items-center justify-between gap-2 mb-2 px-1">
                           <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Logo</label>
                           {isUploading && <span className="text-[12px] font-bold text-blue-500 animate-pulse uppercase">Caricamento...</span>}
                        </div>
                        <ImageUpload
                           value={resolveImageUrl(selectedBlock.content.logoImage, useEditorStore.getState().project, useEditorStore.getState().imageMemoryCache)}
                           onChange={async (val: string, filename?: string) => {
                              const relativePath = await uploadImage(val, filename);
                              updateContent({ logoImage: relativePath });
                           }}
                        />
                     </>
                  )}
               </div>
            )}

            <div className="pt-4 mt-6 border-t border-zinc-100">
               <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Testo Copyright</label>
               <input className="w-full p-3 border border-zinc-200 rounded-xl text-xs bg-zinc-50 focus:bg-white transition-all outline-none" placeholder="Copyright (es: © 2026 Nome)" value={selectedBlock.content.copyright || ''} onChange={(e) => updateContent({ copyright: e.target.value })} />
            </div>
         </div>

         <SocialLinksManager 
            links={selectedBlock.content.socialLinks || []} 
            onChange={(socialLinks) => updateContent({ socialLinks })} 
         />

         <LinkListManager 
            label="Link Legali / Bottom" 
            links={selectedBlock.content.links || []} 
            onChange={(links) => updateContent({ links })} 
         />
      </div>
   );
};

