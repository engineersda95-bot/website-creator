'use client';

import React from 'react';
import { Settings, Maximize2, Zap, Palette, Image as ImageIcon } from 'lucide-react';
import { SectionHeader, LayoutFields, ColorManager, BackgroundManager, BorderShadowManager, PatternManager, SimpleSlider, TypographyFields, AnchorManager } from '../SharedSidebarComponents';
import { cn } from '@/lib/utils';

interface LogosStyleProps {
  selectedBlock: any;
  updateStyle: (style: any) => void;
  updateContent: (content: any) => void;
  getStyleValue: (key: string, defaultValue?: any) => any;
  project: any;
}

export const LogosStyle: React.FC<LogosStyleProps> = ({
  selectedBlock,
  updateStyle,
  updateContent,
  getStyleValue,
  project
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* Layout Base */}
      <section>
        <SectionHeader icon={Settings} title="Layout & Spaziatura" />
        <LayoutFields 
          updateStyle={updateStyle} 
          getStyleValue={getStyleValue} 
          showAlign={false}
        />
      </section>

      {/* Proprietà Loghi */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Maximize2} title="Design Loghi" />
        <div className="space-y-6">
          <SimpleSlider 
            label="Larghezza Max Logo"
            value={getStyleValue('logoWidth', 120)}
            onChange={(val) => updateStyle({ logoWidth: val })}
            min={50}
            max={300}
            step={10}
            suffix="px"
          />

          <div>
            <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest block pl-1 mb-3">Aspect Ratio</label>
            <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
              {[
                { label: 'Originale', value: 'original' },
                { label: '1:1', value: '1:1' },
                { label: '3:2', value: '3:2' },
                { label: '16:9', value: '16:9' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateStyle({ aspectRatio: opt.value })}
                  className={cn(
                    "flex-1 p-2.5 text-[12px] font-black uppercase transition-all tracking-tighter",
                    getStyleValue('aspectRatio', '1:1') === opt.value
                      ? "bg-zinc-900 text-white shadow-lg z-10"
                      : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
            <div className="space-y-0.5">
               <label className="text-[12px] font-black uppercase text-zinc-900 tracking-wider block">Filtro Bianco e Nero</label>
               <p className="text-[12px] text-zinc-400 font-medium tracking-tight">Applica l'effetto grayscale ai loghi</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-zinc-200">
               {[
                  { id: true, label: 'SI' },
                  { id: false, label: 'NO' }
               ].map((opt) => (
                  <button
                     key={String(opt.id)}
                     onClick={() => updateStyle({ grayscale: opt.id })}
                     className={cn(
                        "px-3 py-1 text-[13px] font-black uppercase rounded-md transition-all",
                        getStyleValue('grayscale', true) === opt.id 
                           ? "bg-zinc-900 text-white shadow-sm" 
                           : "text-zinc-400 hover:text-zinc-600"
                     )}
                  >
                     {opt.label}
                  </button>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee & Animazioni */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Zap} title="Animazione" />
        <div className="space-y-8">
          <SimpleSlider 
            label="Velocità"
            value={getStyleValue('scrollSpeed', 40)}
            onChange={(val) => updateStyle({ scrollSpeed: val })}
            min={2}
            max={60}
            step={1}
            suffix="s"
          />
          <div className="p-3 bg-zinc-900/[0.03] rounded-xl border border-zinc-100">
             <p className="text-[12px] text-zinc-500 font-bold uppercase tracking-widest pl-1 leading-relaxed">
                <span className="text-zinc-900">Nota:</span> Valori bassi (es. 5s) = Molto veloce <br />
                Valori alti (es. 40s) = Molto lento
             </p>
          </div>

          <SimpleSlider 
            label="Distanza tra Loghi (Gap)"
            value={getStyleValue('gap', 40)}
            onChange={(val) => updateStyle({ gap: val })}
            min={10}
            max={120}
            step={5}
            suffix="px"
          />
        </div>
      </section>

      {/* Titolo Sezione */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Palette} title="Stile Testi" />
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
            defaultValue={32} 
          />
        </div>
      </section>

      {/* Colore Sfondo e Testo */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Palette} title="Colori" />
        <ColorManager 
          updateStyle={updateStyle} 
          getStyleValue={getStyleValue} 
          project={project}
        />
      </section>

      {/* Patterns */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={ImageIcon} title="Pattern Sfondo" />
        <PatternManager 
          updateStyle={updateStyle} 
          getStyleValue={getStyleValue} 
        />
      </section>

      {/* Immagine di Sfondo */}
      <BackgroundManager 
        selectedBlock={selectedBlock}
        updateStyle={updateStyle} 
        updateContent={updateContent}
        getStyleValue={getStyleValue} 
      />

      {/* Bordi e Ombre */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Settings} title="Bordi & Ombre" />
        <BorderShadowManager 
          updateStyle={updateStyle} 
          getStyleValue={getStyleValue} 
        />
      </section>
      <AnchorManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
      />
    </div>
  );
};

