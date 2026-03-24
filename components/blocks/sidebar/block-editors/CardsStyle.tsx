'use client';

import React from 'react';
import { Layers, Type, ImageIcon, Palette } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BorderShadowManager, SimpleSlider, ImageStyleFields, BackgroundManager } from '../SharedSidebarComponents';
import { cn } from '@/lib/utils';

interface CardsStyleProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const CardsStyle: React.FC<CardsStyleProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* 1. Layout & Spaziatura (Blocco) */}
      <section>
        <SectionHeader icon={Layers} title="Layout & Spaziatura" />
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
        
        <div className="pt-8 mt-8 border-t border-zinc-100 space-y-8">
           <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex items-center gap-2 tracking-widest pl-1">
                <ImageIcon size={12} /> Proporzioni Immagine (Aspect Ratio)
              </label>
              <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
                {[
                   { id: '16/9', label: '16:9' },
                   { id: '4/3', label: '4:3' },
                   { id: '1/1', label: '1:1' },
                   { id: '2/3', label: 'Portrait' }
                ].map((item) => (
                   <button
                      key={item.id}
                      onClick={() => updateStyle({ imageAspectRatio: item.id })}
                      className={cn(
                        "flex-1 p-2.5 text-[10px] font-black uppercase transition-all",
                        getStyleValue('imageAspectRatio', '16/9') === item.id 
                          ? "bg-zinc-900 text-white shadow-lg z-10" 
                          : "text-zinc-400 hover:text-zinc-600"
                      )}
                   >
                      {item.label}
                   </button>
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* 2. Stile Immagine (Standardizzato) */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={ImageIcon} title="Stile Immagine" />
        <ImageStyleFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </section>

      {/* 3. Colori & Sfondo (Blocco) */}
      <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />

      <BackgroundManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
        updateStyle={updateStyle} 
        getStyleValue={getStyleValue} 
      />

      {/* 4. Bordi e Ombre (Blocco) */}
      <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

      {/* 5. Stile Card (Contenitore Interno) */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Palette} title="Stile Card" />
        <div className="space-y-10">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Sfondo Card</label>
                 <input
                    type="color"
                    className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                    value={getStyleValue('cardBgColor', '#ffffff00')}
                    onChange={(e) => updateStyle({ cardBgColor: e.target.value })}
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo Card</label>
                 <input
                    type="color"
                    className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                    value={getStyleValue('cardTextColor', '#000000')}
                    onChange={(e) => updateStyle({ cardTextColor: e.target.value })}
                 />
              </div>
           </div>

           <SimpleSlider 
              label="Arrotondamento Card" 
              value={getStyleValue('cardBorderRadius', 32)} 
              onChange={(val: number) => updateStyle({ cardBorderRadius: val })} 
              max={100}
           />

           <SimpleSlider 
              label="Padding Card" 
              value={getStyleValue('cardPadding', 32)} 
              onChange={(val: number) => updateStyle({ cardPadding: val })} 
              max={100} step={4}
           />
           
           <button
             onClick={() => updateStyle({ cardBgColor: undefined, cardTextColor: undefined, cardBorderRadius: undefined, cardPadding: undefined })}
             className="w-full p-2.5 text-[10px] font-bold text-zinc-400 border border-dashed rounded-xl hover:text-zinc-900 transition-all uppercase tracking-widest"
           >
             Resetta Stile Card
           </button>
        </div>
      </section>

      {/* 6. Stile Testi */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Type} title="Stile Testi" />
        <div className="space-y-8">
          <TypographyFields
            label="Dimensione Titolo (In alto)"
            sizeKey="titleSize"
            boldKey="titleBold"
            italicKey="titleItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={48}
          />
          <TypographyFields
            label="Dimensione Titolo Card"
            sizeKey="cardTitleSize"
            boldKey="cardTitleBold"
            italicKey="cardTitleItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={28}
          />
          <TypographyFields
            label="Dimensione Sottotitolo Card"
            sizeKey="cardSubtitleSize"
            boldKey="cardSubtitleBold"
            italicKey="cardSubtitleItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={16}
          />
        </div>
      </section>
    </div>
  );
};
