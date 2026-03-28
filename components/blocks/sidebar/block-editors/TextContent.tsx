'use client';

import React from 'react';
import { RichTextarea, SimpleInput } from '../SharedSidebarComponents';

interface TextContentProps {
   selectedBlock: any;
   updateContent: (content: any) => void;
}

export const TextContent: React.FC<TextContentProps> = ({
   selectedBlock,
   updateContent
}) => {
   return (
      <div className="space-y-4">
         <div className="space-y-2">
            <SimpleInput
               label="Titolo (Opzionale)"
               placeholder="Inserisci il titolo..."
               value={selectedBlock.content.title || ''}
               onChange={(val) => updateContent({ title: val })}
            />
         </div>
         <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Corpo del Testo</label>
            <RichTextarea
               placeholder="Inserisci il tuo testo..."
               value={selectedBlock.content.text || ''}
               onChange={(val) => updateContent({ text: val })}
            />
         </div>
      </div>
   );
};

