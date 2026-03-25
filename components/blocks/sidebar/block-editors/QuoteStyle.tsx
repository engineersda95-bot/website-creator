'use client';

import React from 'react';
import { LayoutFields, ColorManager, SectionHeader, BorderShadowManager, TypographyFields, BackgroundManager, PatternManager, AnchorManager } from '../SharedSidebarComponents';
import { Palette, Type } from 'lucide-react';

export const QuoteStyle: React.FC<any> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project
}) => {
  return (
    <div className="space-y-8 pb-20">
      <SectionHeader icon={Palette} title="Stile Recensioni" />

      <section className="space-y-6">
        <SectionHeader icon={Type} title="Tipografia" />
        <div className="space-y-6">
           <TypographyFields 
              label="Titolo Sezione" 
              sizeKey="titleSize" 
              boldKey="titleBold" 
              italicKey="titleItalic" 
              tagKey="titleTag"
              showTagSelector={true}
              defaultTag="h2"
              defaultValue={48} 
              getStyleValue={getStyleValue} 
              updateStyle={updateStyle} 
           />
           <TypographyFields 
              label="Testo Recensione" 
              sizeKey="reviewSize" 
              boldKey="reviewBold" 
              italicKey="reviewItalic" 
              defaultValue={18} 
              getStyleValue={getStyleValue} 
              updateStyle={updateStyle} 
           />
           <TypographyFields 
              label="Nome Utente" 
              sizeKey="nameSize" 
              boldKey="nameBold" 
              italicKey="nameItalic" 
              tagKey="itemTitleTag"
              showTagSelector={true}
              defaultValue={14} 
              getStyleValue={getStyleValue} 
              updateStyle={updateStyle} 
           />
           <TypographyFields 
              label="Ruolo / Azienda" 
              sizeKey="roleSize" 
              boldKey="roleBold" 
              italicKey="roleItalic" 
              defaultValue={12} 
              getStyleValue={getStyleValue} 
              updateStyle={updateStyle} 
           />
        </div>
      </section>

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

      <ColorManager 
        title="Colori Card & Box"
        bgKey="cardBgColor"
        textKey="cardTextColor"
        icon={Palette}
        colorClass="text-zinc-900"
        getStyleValue={getStyleValue} 
        updateStyle={updateStyle} 
        project={project} 
      />

      <LayoutFields 
        getStyleValue={getStyleValue} 
        updateStyle={updateStyle} 
      />

      <BorderShadowManager 
        getStyleValue={getStyleValue} 
        updateStyle={updateStyle} 
      />
      <AnchorManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
      />
    </div>
  );
};

