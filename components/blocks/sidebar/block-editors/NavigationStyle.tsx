'use client';

import React from 'react';
import { Layers, Type } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BorderShadowManager } from '../SharedSidebarComponents';

interface NavigationStyleProps {
   selectedBlock: any;
   updateStyle: (style: any) => void;
   getStyleValue: (key: string, defaultValue: any) => any;
   project: any;
}

export const NavigationStyle: React.FC<NavigationStyleProps> = ({
   selectedBlock,
   updateStyle,
   getStyleValue,
   project
}) => {
   return (
      <div className="space-y-10">
         <section>
            <SectionHeader icon={Layers} title="Layout & Spaziatura" />
            <LayoutFields
               getStyleValue={getStyleValue}
               updateStyle={updateStyle}
               showAlign={false}
               paddingLabel="Padding su/giù"
               hPaddingLabel="Padding Dx/Sx"
            />
         </section>

         <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />

         <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

         <section className="pt-8 border-t border-zinc-100">
            <SectionHeader icon={Type} title="Stile Font" />
            <TypographyFields
               label="Dimensione Link"
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
