'use client';

import React from 'react';
import { LayoutFields, ColorManager, SimpleSlider, BackgroundManager, BorderShadowManager, IconManager, SectionHeader, TypographyFields, PatternManager } from '../SharedSidebarComponents';
import { Layout, Palette, Image as ImageIcon, Box, Type } from 'lucide-react';
import { cn } from '@/lib/utils';


interface GalleryStyleProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const GalleryStyle: React.FC<GalleryStyleProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* Layout Base */}
      <section>
        <LayoutFields 
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
        />
      </section>

      {/* Tipo di Layout Gallery */}
      <section className="pt-8 border-t border-zinc-100 space-y-6">
        <SectionHeader icon={Box} title="Design Galleria" />

        <SimpleSlider
          label="Numero di Colonne"
          value={getStyleValue('columns', 3)}
          onChange={(val: number) => updateStyle({ columns: val })}
          min={1}
          max={6}
          step={1}
        />

        <SimpleSlider
          label="Spaziatura (Gap)"
          value={getStyleValue('gap', 16)}
          onChange={(val: number) => updateStyle({ gap: val })}
          min={0}
          max={80}
          step={4}
        />
      </section>

      {/* Stile Immagini */}
      <section className="pt-8 border-t border-zinc-100 space-y-6">
        <SectionHeader icon={ImageIcon} title="Stile Immagini" />
        
        <div className="space-y-4">
          <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Proporzioni (Aspect Ratio)</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'original', label: 'Originale' },
              { id: '1/1', label: '1:1 Quadrato' },
              { id: '4/3', label: '4:3 Classico' },
              { id: '16/9', label: '16:9 Wide' },
            ].map(aspect => (
              <button
                key={aspect.id}
                onClick={() => updateStyle({ imageAspectRatio: aspect.id })}
                className={cn(
                  "px-3 py-2 text-xs font-semibold rounded-lg border transition-all",
                  getStyleValue('imageAspectRatio', 'original') === aspect.id 
                    ? "border-zinc-900 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm" 
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                )}
              >
                {aspect.label}
              </button>
            ))}
          </div>
        </div>

        <SimpleSlider
          label="Arrotondamento (Border Radius)"
          value={getStyleValue('imageBorderRadius', 16)}
          onChange={(val: number) => updateStyle({ imageBorderRadius: val })}
          min={0}
          max={64}
          step={4}
        />

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div>
              <p className="text-sm font-bold text-zinc-900">Ombra Immagini</p>
              <p className="text-xs text-zinc-500 mt-0.5">Aggiungi una leggera ombra sotto le immagini</p>
            </div>
            <button
              onClick={() => updateStyle({ imageShadow: !getStyleValue('imageShadow', false) })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none",
                getStyleValue('imageShadow', false) ? "bg-zinc-900" : "bg-zinc-200"
              )}
            >
              <span 
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
                  getStyleValue('imageShadow', false) ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div>
              <p className="text-sm font-bold text-zinc-900">Effetto Hover</p>
              <p className="text-xs text-zinc-500 mt-0.5">Animazione di ingrandimento al passaggio del mouse</p>
            </div>
            <button
              onClick={() => updateStyle({ imageHover: !getStyleValue('imageHover', true) })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none",
                getStyleValue('imageHover', true) ? "bg-zinc-900" : "bg-zinc-200"
              )}
            >
              <span 
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
                  getStyleValue('imageHover', true) ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Stile Testi */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Type} title="Stile Testi" />
        <div className="space-y-8">
          <TypographyFields
            label="Dimensione Titolo"
            sizeKey="titleSize"
            boldKey="titleBold"
            italicKey="titleItalic"
            tagKey="titleTag"
            showTagSelector={true}
            defaultTag="h2"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={48}
          />
        </div>
      </section>

      {/* Sfondo e Colori */}
      <section className="pt-8 border-t border-zinc-100">
        <ColorManager 
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          project={project}
        />
      </section>

      <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

      <section className="pt-8 border-t border-zinc-100">
        <BackgroundManager 
          selectedBlock={selectedBlock}
          updateContent={updateContent}
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
        />
      </section>
      
    </div>
  );
};
