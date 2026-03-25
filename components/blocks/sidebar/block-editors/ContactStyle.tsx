'use client';

import React from 'react';
import { Layout, Palette, Type, Map } from 'lucide-react';
import { LayoutFields, ColorManager, BorderShadowManager, SectionHeader, TypographyFields, SimpleSlider, BackgroundManager, PatternManager, AnchorManager } from '@/components/blocks/sidebar/SharedSidebarComponents';

export function ContactStyle({ selectedBlock, updateContent, updateStyle, getStyleValue, project }: any) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">

      {/* 1. Layout & Spaziature */}
      <section className="pb-10 border-b border-zinc-100">
        <SectionHeader icon={Layout} title="Layout & Allineamento" />
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          paddingLabel="Padding Sezione"
          hPaddingLabel="Margini Laterali"
        />
        <div className="mt-8 space-y-8">
          <SimpleSlider
            label="Spaziatura Interna (Gap)"
            value={getStyleValue('gap', 64)}
            onChange={(val: number) => updateStyle({ gap: val })}
            max={200} step={4}
          />

          <div className="pt-6 border-t border-zinc-50">
            <SectionHeader icon={Map} title="Stile Mappa" />
            <SimpleSlider
              label="Larghezza Mappa"
              value={getStyleValue('mapWidth', 100)}
              onChange={(val: number) => updateStyle({ mapWidth: val })}
              min={20} suffix="%"
            />
          </div>
        </div>
      </section>

      {/* 2. Tipografia */}
      <section className="pb-10 border-b border-zinc-100">
        <SectionHeader icon={Type} title="Stile Testi & Icone" />
        <div className="space-y-8">
          <TypographyFields
            label="Titolo Principale"
            sizeKey="titleSize" boldKey="titleBold" italicKey="titleItalic"
            getStyleValue={getStyleValue} updateStyle={updateStyle} defaultValue={48}
          />
          <TypographyFields
            label="Sottotitolo"
            sizeKey="subtitleSize" boldKey="subtitleBold" italicKey="subtitleItalic"
            getStyleValue={getStyleValue} updateStyle={updateStyle} defaultValue={18}
          />

          <div className="pt-8 border-t border-zinc-50 space-y-8">
            <SimpleSlider
              label="Dimensione Icone"
              value={getStyleValue('iconSize', 20)}
              onChange={(val: number) => updateStyle({ iconSize: val })}
              min={12} max={64} step={2}
            />

            <TypographyFields
              label="Etichette (E-mail, Tel...)"
              sizeKey="contactLabelSize" boldKey="contactLabelBold"
              getStyleValue={getStyleValue} updateStyle={updateStyle} defaultValue={9}
              min={8} max={24}
            />
            <TypographyFields
              label="Dimensione Contatti"
              sizeKey="contactValueSize" boldKey="contactValueBold"
              getStyleValue={getStyleValue} updateStyle={updateStyle} defaultValue={18}
              min={12} max={48}
            />
          </div>
        </div>
      </section>

      {/* 3. Colori & Sfondo */}
      <section className="pb-10 border-b border-zinc-100">
        <ColorManager
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          project={project}
        />
        <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        <BackgroundManager 
          selectedBlock={selectedBlock} 
          updateContent={updateContent} 
          updateStyle={updateStyle} 
          getStyleValue={getStyleValue} 
        />
      </section>

      {/* 4. Bordi e Ombre */}
      <section>
        <BorderShadowManager
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
      </section>

      <AnchorManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
      />
    </div>
  );
}

