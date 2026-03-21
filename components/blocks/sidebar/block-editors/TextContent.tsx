'use client';

import React from 'react';
import { RichTextarea } from '../SharedSidebarComponents';

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
         <RichTextarea 
            placeholder="Inserisci il tuo testo..." 
            value={selectedBlock.content.text || ''} 
            onChange={(val) => updateContent({ text: val })} 
         />
      </div>
   );
};
