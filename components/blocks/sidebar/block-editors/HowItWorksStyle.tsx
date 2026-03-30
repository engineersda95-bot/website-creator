'use client';

import React from 'react';
import { Layers, Type, Palette, Layout } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BackgroundManager, PatternManager, BorderShadowManager, SimpleSlider, AnchorManager } from '../SharedSidebarComponents';
import { cn } from '@/lib/utils';

interface HowItWorksStyleProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const HowItWorksStyle: React.FC<HowItWorksStyleProps> = ({
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
          <label className="text-[12px] font-bold text-zinc-400 uppercase mb-3 block flex items-center gap-2 tracking-widest pl-1">
            <Layout size={12} /> Layout Visivo
          </label>
          <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
            {[
              { id: 'grid', label: 'Griglia' },
              { id: 'linear', label: 'Lineare' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => updateStyle({ layout: item.id })}
                className={cn(
                  "flex-1 p-2.5 text-[12px] font-black uppercase transition-all",
                  getStyleValue('layout', 'grid') === item.id 
                    ? "bg-zinc-900 text-white shadow-lg z-10" 
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {selectedBlock.content?.layout === 'slider' && (
          <div className="pt-6">
            <SimpleSlider
              label="Padding Laterale Slider"
              min={0}
              max={120}
              step={4}
              value={getStyleValue('sliderPadding', 48)}
              onChange={(val) => updateStyle({ sliderPadding: val })}
            />
          </div>
        )}
      </section>

      {/* 2. Colori & Sfondo Sezione */}
      <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />
      <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
      
      <BackgroundManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
        updateStyle={updateStyle} 
        getStyleValue={getStyleValue} 
      />

      {/* 3. Colori Numeri */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Palette} title="Colori Elementi" />
        <div className="space-y-8">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                 <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Sfondo Numero</label>
                 <input
                    type="color"
                    className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                    value={getStyleValue('numberBgColor', project.settings.primaryColor)}
                    onChange={(e) => updateStyle({ numberBgColor: e.target.value })}
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo Numero</label>
                 <input
                    type="color"
                    className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                    value={getStyleValue('numberTextColor', '#ffffff')}
                    onChange={(e) => updateStyle({ numberTextColor: e.target.value })}
                 />
              </div>
           </div>
        </div>
      </section>

      {/* 4. Tipografia */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Type} title="Tipografia" />
        <div className="space-y-8">
          <TypographyFields
            label="Titolo Sezione"
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
          <div className="pt-8 border-t border-zinc-100 space-y-8">
            <TypographyFields
              label="Titolo Passaggio"
              sizeKey="itemTitleSize"
              boldKey="itemTitleBold"
              italicKey="itemTitleItalic"
              tagKey="itemTitleTag"
              showTagSelector={true}
              defaultTag="h3"
              getStyleValue={getStyleValue}
              updateStyle={updateStyle}
                defaultValue={24}
            />
            <TypographyFields
              label="Descrizione Passaggio"
              sizeKey="itemDescSize"
              boldKey="itemDescBold"
              italicKey="itemDescItalic"
              getStyleValue={getStyleValue}
              updateStyle={updateStyle}
              defaultValue={16}
            />
          </div>
        </div>
      </section>
      <AnchorManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
      />
    </div>
  );
};

