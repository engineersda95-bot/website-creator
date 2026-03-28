'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { SocialLinksManager, LinkListManager, RichTextarea, SimpleInput } from '../SharedSidebarComponents';
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
                     <SimpleInput
                        label="Testo Logo"
                        value={selectedBlock.content.logoText}
                        onChange={(val: string) => updateContent({ logoText: val })}
                        placeholder="Nome Sito"
                     />
                  )}
                  {selectedBlock.content.logoType !== 'text' && (
                     <>
                        <div className="flex items-center justify-between gap-2 mb-2 px-1 pt-2">
                           <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Logo</label>
                           {isUploading && <span className="text-[12px] font-bold text-blue-500 animate-pulse uppercase">Caricamento...</span>}
                        </div>
                        <ImageUpload
                           value={resolveImageUrl(selectedBlock.content.logoImage, useEditorStore.getState().project, useEditorStore.getState().imageMemoryCache)}
                           onChange={async (val: string, filename?: string) => {
                              const relativePath = await uploadImage(val, filename);
                              updateContent({ logoImage: relativePath });
                           }}
                           altValue={selectedBlock.content.logoAlt ?? ''}
                           onAltChange={(alt) => updateContent({ logoAlt: alt })}
                           onFilenameSelect={(name) => {
                              if (!selectedBlock.content.logoAlt) updateContent({ logoAlt: name });
                           }}
                        />
                     </>
                  )}

                  <div className="pt-2">

                     <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest block mb-2 px-1">Descrizione</label>
                     <RichTextarea
                        placeholder="Inserisci una descrizione per il footer..."
                        value={selectedBlock.content.description || ''}
                        onChange={(val: string) => updateContent({ description: val })}
                     />
                  </div>
               </div>
            )}

            <div className="pt-4 mt-6 border-t border-zinc-200">
               <SimpleInput
                  label="Testo Copyright"
                  value={selectedBlock.content.copyright}
                  onChange={(val: string) => updateContent({ copyright: val })}
                  placeholder="© 2026 Nome"
               />
            </div>
         </div>

         <SocialLinksManager
            links={selectedBlock.content.socialLinks || []}
            onChange={(socialLinks) => updateContent({ socialLinks })}
         />

         <LinkListManager
            label="Link"
            links={selectedBlock.content.links || []}
            onChange={(links) => updateContent({ links })}
         />
         <SimpleInput
            label="Titolo Link Rapidi (Opzionale)"
            value={selectedBlock.content.linksTitle}
            onChange={(val: string) => updateContent({ linksTitle: val })}
            placeholder="Esempio: Link Rapidi"
         />
         <div className="h-6" />
      </div>
   );
};

