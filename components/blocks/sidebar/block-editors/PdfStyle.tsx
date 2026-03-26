'use client';

import React from 'react';
import { Layers, Type } from 'lucide-react';
import { 
  TypographyFields, 
  ColorManager, 
  LayoutFields, 
  BackgroundManager,
  BorderShadowManager,
  SimpleSlider,
  SimpleInput,
  PatternManager,
  SectionHeader,
  AnchorManager
} from '../SharedSidebarComponents';

export const PdfStyle = ({ selectedBlock, project, updateContent, updateStyle, getStyleValue }: any) => {

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Layout & Spaziatura */}
      <section>
        <SectionHeader icon={Layers} title="Layout & Spaziatura" />
        <LayoutFields 
          getStyleValue={getStyleValue} 
          updateStyle={updateStyle} 
        />
        
        <div className="space-y-6 pt-6 border-t border-zinc-100 mt-6">
          <SimpleSlider 
            value={getStyleValue('embedHeight', 800)} 
            onChange={(v) => updateStyle({ embedHeight: v })} 
            label="Altezza Viewer (px)" 
            min={300} 
            max={1200}
            step={50}
          />

          <SimpleInput
            label="LARGHEZZA MAX EMBED (PX)"
            placeholder="Esempio: 1200"
            value={getStyleValue('containerWidth', '')?.toString() || ''}
            onChange={(v) => updateStyle({ containerWidth: v === '' ? null : parseInt(v) })}
          />
        </div>
      </section>

      {/* Colori e Sfondo */}
      <ColorManager 
        getStyleValue={getStyleValue} 
        updateStyle={updateStyle} 
        project={project}
        title="Colori & Sfondo"
      />

      {/* Pattern Layer */}
      <PatternManager 
        getStyleValue={getStyleValue} 
        updateStyle={updateStyle} 
      />

      {/* Border & Shadow */}
      <BorderShadowManager 
        getStyleValue={getStyleValue} 
        updateStyle={updateStyle} 
      />

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
            defaultValue={40} 
          />

          <TypographyFields 
            label="Dimensione Sottotitolo" 
            sizeKey="subtitleSize" 
            boldKey="subtitleBold" 
            italicKey="subtitleItalic" 
            tagKey="subtitleTag"
            getStyleValue={getStyleValue} 
            updateStyle={updateStyle} 
            defaultValue={20} 
            showTagSelector={true}
            defaultTag="p"
          />
        </div>
      </section>

      {/* Background Avanzato */}
      <BackgroundManager 
        selectedBlock={selectedBlock}
        updateContent={updateContent}
        getStyleValue={getStyleValue} 
        updateStyle={updateStyle} 
      />

      {/* Anchor Navigation */}
      <AnchorManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
      />

    </div>
  );
};
