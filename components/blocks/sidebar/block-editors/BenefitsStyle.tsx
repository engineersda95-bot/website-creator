'use client';

import React from 'react';
import { Layers, Type, Palette, Star } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BackgroundManager, PatternManager, BorderShadowManager, SimpleSlider, AnchorManager } from '../SharedSidebarComponents';

interface BenefitsStyleProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const BenefitsStyle: React.FC<BenefitsStyleProps> = ({
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
      </section>

      {/* 2. Colori & Sfondo */}
      <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />
      <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
      
      <BackgroundManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
        updateStyle={updateStyle} 
        getStyleValue={getStyleValue} 
      />

      <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

      {/* 3. Dimensioni & Stile Card */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Star} title="Personalizzazione Elementi" />
        <div className="space-y-10">
           <SimpleSlider 
              label="Grandezza Icone" 
              value={getStyleValue('iconSize', 40)} 
              onChange={(val: number) => updateStyle({ iconSize: val })} 
              min={16} max={120}
           />

           <SimpleSlider 
              label="Arrotondamento Card" 
              value={getStyleValue('cardBorderRadius', 24)} 
              onChange={(val: number) => updateStyle({ cardBorderRadius: val })} 
              max={100}
           />

           <SimpleSlider 
              label="Padding Interno Card" 
              value={getStyleValue('cardPadding', 32)} 
              onChange={(val: number) => updateStyle({ cardPadding: val })} 
              max={100} step={4}
           />
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
          <TypographyFields
            label="Sottotitolo Sezione"
            sizeKey="subtitleSize"
            boldKey="subtitleBold"
            italicKey="subtitleItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={20}
          />
          <div className="pt-8 border-t border-zinc-100 space-y-8">
            <TypographyFields
              label="Titolo Vantaggio"
              sizeKey="itemTitleSize"
              boldKey="itemTitleBold"
              italicKey="itemTitleItalic"
              tagKey="itemTitleTag"
              showTagSelector={true}
              defaultTag="h3"
              getStyleValue={getStyleValue}
              updateStyle={updateStyle}
                defaultValue={22}
            />
            <TypographyFields
              label="Descrizione Vantaggio"
              sizeKey="itemSubtitleSize"
              boldKey="itemSubtitleBold"
              italicKey="itemSubtitleItalic"
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

