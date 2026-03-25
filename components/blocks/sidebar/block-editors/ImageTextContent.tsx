'use client';

import React from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { CTAManager, RichTextarea, SimpleInput } from '../SharedSidebarComponents';

interface ImageTextContentProps {
   selectedBlock: any;
   updateContent: (content: any) => void;
   updateStyle: (style: any) => void;
   getStyleValue: (key: string, defaultValue: any) => any;
   project: any;
}

export const ImageTextContent: React.FC<ImageTextContentProps> = ({
   selectedBlock,
   updateContent,
   updateStyle,
   getStyleValue,
   project
}) => {
   return (
      <div className="space-y-8">
         <div className="space-y-6">
            <SimpleInput 
               label="Titolo"
               placeholder="Inserisci un titolo d'impatto" 
               value={selectedBlock.content.title || ''} 
               onChange={(val) => updateContent({ title: val })} 
            />
            <RichTextarea 
               label="Corpo del Testo"
               placeholder="Descrivi il problema, la soluzione o il chi siamo..." 
               value={selectedBlock.content.text || ''} 
               onChange={(val) => updateContent({ text: val })} 
            />
         </div>

         <div className="space-y-4 pt-6 border-t border-zinc-100">
            <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-wider block">Immagine Principale</label>
            <ImageUpload 
               value={selectedBlock.content.image || ''}
               onChange={(val) => updateContent({ image: val })}
               label="Carica Immagine"
            />
            <SimpleInput 
               label="Alt Text (SEO)"
               placeholder="Descrizione dell'immagine" 
               value={selectedBlock.content.alt || ''} 
               onChange={(val) => updateContent({ alt: val })} 
            />
         </div>

         <div className="pt-6 border-t border-zinc-100">
            <label className="text-[12px] font-bold text-zinc-400 uppercase mb-3 block tracking-widest">Aspetto Immagine</label>
            <select
               className="w-full p-3 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold focus:bg-white transition-all outline-none"
               value={selectedBlock.content.imageAspectRatio || '16/9'}
               onChange={(e) => updateContent({ imageAspectRatio: e.target.value })}
            >
               <option value="16/9">Desktop (16:9)</option>
               <option value="4/3">Standard (4:3)</option>
               <option value="1/1">Quadrato (1:1)</option>
               <option value="3/4">Verticale (3:4)</option>
               <option value="auto">Originale</option>
            </select>
         </div>

         <CTAManager 
            content={selectedBlock.content} 
            updateContent={updateContent} 
            style={selectedBlock.style}
            updateStyle={updateStyle}
         />
      </div>
   );
};

