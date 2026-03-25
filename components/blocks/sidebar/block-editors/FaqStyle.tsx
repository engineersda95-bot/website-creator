'use client';

import React from 'react';
import { Type, Palette, AlignLeft, Layers, ArrowDown } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BorderShadowManager, SimpleSlider, BackgroundManager, PatternManager, AnchorManager } from '../SharedSidebarComponents';

interface FAQStyleProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const FAQStyle: React.FC<FAQStyleProps> = ({
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
          paddingLabel="Padding Sezione"
        />
        
        <div className="mt-8 pt-8 border-t border-zinc-50 space-y-10">
          <SimpleSlider 
            label="Distanza Titolo-FAQ (Gap)" 
            value={getStyleValue('gap', 64)} 
            onChange={(val: number) => updateStyle({ gap: val })} 
            max={200} step={4}
          />

          <SimpleSlider 
            label="Larghezza Massima Sezione" 
            value={getStyleValue('maxWidth', 800)} 
            onChange={(val: number) => updateStyle({ maxWidth: val })} 
            min={400} max={1400} step={50}
          />
        </div>
      </section>

      {/* 2. Stile Testi */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Type} title="Stile Testi" />
        
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
            label="Dimensione Domande" 
            sizeKey="questionSize" 
            boldKey="questionBold" 
            italicKey="questionItalic" 
            tagKey="itemTitleTag"
            showTagSelector={true}
            defaultTag="h3"
            getStyleValue={getStyleValue} 
            updateStyle={updateStyle} 
            defaultValue={18} 
            min={12}
            max={40}
          />

          <TypographyFields 
            label="Dimensione Risposte" 
            sizeKey="answerSize" 
            boldKey="answerBold" 
            italicKey="answerItalic" 
            getStyleValue={getStyleValue} 
            updateStyle={updateStyle} 
            defaultValue={16} 
            min={12}
            max={32}
          />
        </div>
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

      {/* 4. Bordi & Ombre */}
      <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
      <AnchorManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
      />
    </div>
  );
};

