'use client';

import React from 'react';
import { Layers, Type } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader } from '../SharedSidebarComponents';

interface TextStyleProps {
   selectedBlock: any;
   updateStyle: (style: any) => void;
   getStyleValue: (key: string, defaultValue: any) => any;
   project: any;
}

export const TextStyle: React.FC<TextStyleProps> = ({
   selectedBlock,
   updateStyle,
   getStyleValue,
   project
}) => {
   return (
      <div className="space-y-10">
         <section>
            <SectionHeader icon={Layers} title="Layout & Spaziatura" colorClass="text-blue-500" />
            <LayoutFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
         </section>

         <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />

         <section className="pt-8 border-t border-zinc-100">
            <SectionHeader icon={Type} title="Stile Testi" colorClass="text-indigo-500" />
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
