'use client';

import React from 'react';
import { Layers, Type, MoreVertical, MoveHorizontal, ImageIcon } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BorderShadowManager, SimpleSlider, ImageStyleFields, BackgroundManager, PatternManager } from '../SharedSidebarComponents';
import { cn } from '@/lib/utils';

interface ImageTextStyleProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const ImageTextStyle: React.FC<ImageTextStyleProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* 1. Layout & Spaziatura */}
      <section>
        <SectionHeader icon={Layers} title="Layout & Spaziatura" />
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />

        <div className="space-y-8 mt-8 pt-8 border-t border-zinc-50">
          {/* Posizione Immagine */}
          <div>
            <label className="text-[12px] font-bold text-zinc-400 uppercase mb-3 block flex items-center gap-2 tracking-widest pl-1">
              <MoveHorizontal size={12} /> Posizione Immagine
            </label>
            <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
              {[
                { id: 'left', label: 'Sinistra' },
                { id: 'right', label: 'Destra' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateStyle({ imagePosition: item.id })}
                  className={cn(
                    "flex-1 p-2.5 text-[12px] font-bold uppercase transition-all",
                    getStyleValue('imagePosition', 'left') === item.id
                      ? "bg-zinc-900 text-white shadow-lg z-10"
                      : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Allineamento Verticale */}
          <div>
            <label className="text-[12px] font-bold text-zinc-400 uppercase mb-3 block flex items-center gap-2 tracking-widest pl-1">
              <MoreVertical size={12} /> Allineamento Verticale
            </label>
            <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
              {[
                { id: 'top', label: 'Sopra' },
                { id: 'center', label: 'Centro' },
                { id: 'bottom', label: 'Sotto' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateStyle({ verticalAlign: item.id })}
                  className={cn(
                    "flex-1 p-2.5 text-[12px] font-bold uppercase transition-all",
                    getStyleValue('verticalAlign', 'center') === item.id
                      ? "bg-zinc-900 text-white shadow-lg z-10"
                      : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <SimpleSlider 
            label="Gap Colonne" 
            value={getStyleValue('gap', 60)} 
            onChange={(val: number) => updateStyle({ gap: val })} 
            max={200} step={4}
          />
        </div>
      </section>

      {/* 2. Stile Immagine (Standardizzato) */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={ImageIcon} title="Stile Immagine" />
        <ImageStyleFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </section>

      {/* 3. Colori & Sfondo */}
      <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />
      <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

      <BackgroundManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
        updateStyle={updateStyle} 
        getStyleValue={getStyleValue} 
      />

      {/* 4. Bordi e Ombre (Blocco) */}
      <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

      {/* 5. Stile Testi */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Type} title="Stile Testi" />
        <div className="space-y-8">
          <TypographyFields
            label="Dimensione Titolo"
            sizeKey="titleSize"
            boldKey="titleBold"
            italicKey="titleItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={48}
          />
          <TypographyFields
            label="Dimensione Testo"
            sizeKey="subtitleSize"
            boldKey="subtitleBold"
            italicKey="subtitleItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={18}
          />
        </div>
      </section>
    </div>
  );
};

