'use client';

import React from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { BackgroundManager, CTAManager, RichTextarea, SimpleInput } from '../SharedSidebarComponents';
import { AlignCenter, Columns, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const HERO_VARIANTS = [
   { id: 'centered', label: 'Centrata', icon: AlignCenter },
   { id: 'split', label: 'Split', icon: Columns },
   { id: 'stacked', label: 'Immagine+', icon: Layers },
];

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
         {/* Variant selector */}
         <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Layout</label>
            <div className="grid grid-cols-3 gap-1.5">
               {HERO_VARIANTS.map((v) => (
                  <button
                     key={v.id}
                     onClick={() => updateContent({ variant: v.id })}
                     className={cn(
                        "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[9px] font-medium transition-all",
                        (selectedBlock.content.variant || 'centered') === v.id
                           ? "border-zinc-900 bg-zinc-900 text-white"
                           : "border-zinc-100 text-zinc-400 hover:border-zinc-300"
                     )}
                  >
                     <v.icon size={14} />
                     {v.label}
                  </button>
               ))}
            </div>
         </div>

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
            getStyleValue={getStyleValue}
            label="CTA 1"
         />

         <CTAManager
            content={selectedBlock.content}
            updateContent={updateContent}
            style={selectedBlock.style}
            updateStyle={updateStyle}
            getStyleValue={getStyleValue}
            label="CTA 2"
            ctaKey="cta2"
            urlKey="cta2Url"
            themeKey="cta2Theme"
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

