'use client';

import React from 'react';
import { Layers, ImageIcon, Palette } from 'lucide-react';
import { LayoutFields, ColorManager, SectionHeader, BackgroundManager, PatternManager, BorderShadowManager, SimpleSlider, ImageStyleFields } from '../SharedSidebarComponents';
import { cn } from '@/lib/utils';

interface SingleImageStyleProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const SingleImageStyle: React.FC<SingleImageStyleProps> = ({
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
        
        <div className="pt-8 mt-8 border-t border-zinc-100">
           <SimpleSlider 
              label="Larghezza Max Immagine (%)" 
              value={getStyleValue('imageMaxWidth', 100)} 
              onChange={(val: number) => updateStyle({ imageMaxWidth: val })} 
              min={10} max={100}
           />
        </div>
      </section>

      {/* 2. Stile Immagine */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={ImageIcon} title="Stile Immagine" />
        <div className="space-y-8">
           <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block tracking-widest pl-1">
                Proporzioni (Aspect Ratio)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                   { id: '16/9', label: '16:9' },
                   { id: '4/3', label: '4:3' },
                   { id: '1/1', label: '1:1' },
                   { id: '21/9', label: 'Ultrawide' },
                   { id: 'auto', label: 'Originale' }
                ].map((item) => (
                   <button
                      key={item.id}
                      onClick={() => updateStyle({ imageAspectRatio: item.id })}
                      className={cn(
                        "p-2.5 text-[10px] font-black uppercase transition-all border rounded-xl",
                        getStyleValue('imageAspectRatio', '16/9') === item.id 
                          ? "bg-zinc-900 text-white shadow-lg border-zinc-900" 
                          : "text-zinc-400 bg-zinc-50 border-zinc-100 hover:text-zinc-600"
                      )}
                   >
                      {item.label}
                   </button>
                ))}
              </div>
           </div>

           <ImageStyleFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
        </div>
      </section>

      {/* 3. Colori & Sfondo Sezione */}
      <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />
      <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
      
      <BackgroundManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
        updateStyle={updateStyle} 
        getStyleValue={getStyleValue} 
      />

      <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
    </div>
  );
};
