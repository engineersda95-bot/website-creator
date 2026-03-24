'use client';

import React from 'react';
import { Layers, Type } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BorderShadowManager, BackgroundManager, PatternManager } from '../SharedSidebarComponents';

interface TextStyleProps {
   selectedBlock: any;
   updateContent: (content: any) => void;
   updateStyle: (style: any) => void;
   getStyleValue: (key: string, defaultValue: any) => any;
   project: any;
}

export const TextStyle: React.FC<TextStyleProps> = ({
   selectedBlock,
   updateContent,
   updateStyle,
   getStyleValue,
   project
}) => {
   return (
      <div className="space-y-10">
         <section>
            <SectionHeader icon={Layers} title="Layout & Spaziatura" />
            <LayoutFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
         </section>

         <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />
      <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

         <BackgroundManager 
            selectedBlock={selectedBlock} 
            updateContent={updateContent} 
            updateStyle={updateStyle} 
            getStyleValue={getStyleValue} 
         />

         <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

         <section className="pt-8 border-t border-zinc-100">
            <SectionHeader icon={Type} title="Stile Testi" />
            <TypographyFields 
               label="Dimensione Testo" 
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
