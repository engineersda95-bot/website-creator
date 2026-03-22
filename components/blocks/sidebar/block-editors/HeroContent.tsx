'use client';

import React from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { BackgroundManager, CTAManager, RichTextarea, SimpleInput } from '../SharedSidebarComponents';

interface HeroContentProps {
   selectedBlock: any;
   updateContent: (content: any) => void;
   updateStyle: (style: any) => void;
   getStyleValue: (key: string, defaultValue: any) => any;
}

export const HeroContent: React.FC<HeroContentProps> = ({
   selectedBlock,
   updateContent,
   updateStyle,
   getStyleValue
}) => {
   return (
      <div className="space-y-8">
         <div className="space-y-6">
            <SimpleInput 
               label="Titolo"
               placeholder="Titolo Hero" 
               value={selectedBlock.content.title || ''} 
               onChange={(val) => updateContent({ title: val })} 
            />
            <RichTextarea 
               label="Descrizione / Sottotitolo"
               placeholder="Sottotitolo Hero" 
               value={selectedBlock.content.subtitle || ''} 
               onChange={(val) => updateContent({ subtitle: val })} 
            />
         </div>

         <CTAManager 
            content={selectedBlock.content} 
            updateContent={updateContent} 
            style={selectedBlock.style}
            updateStyle={updateStyle}
         />

         <BackgroundManager 
            selectedBlock={selectedBlock} 
            updateContent={updateContent} 
            updateStyle={updateStyle} 
            getStyleValue={getStyleValue} 
         />
      </div>
   );
};
