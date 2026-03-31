'use client';

import { cn } from '@/lib/utils';
import {
  AlignLeft,
  Layers,
  Palette, Settings, Play,
  Type,
} from 'lucide-react';
import React from 'react';
import {
  AnchorManager, AnimationManager,
  BackgroundManager,
  BorderShadowManager,
  ColorManager,
  LayoutFields,
  PatternManager,
  RichTextarea,
  SimpleInput,
  TypographyFields
} from '../SharedSidebarComponents';
import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../UnifiedSection';

interface TextUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const TextUnified: React.FC<TextUnifiedProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const content = selectedBlock.content;
  const { openSection, toggleSection } = useUnifiedSections();

  return (
    <div>
      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          placeholder="Inserisci il titolo..."
          value={content.title || ''}
          onChange={(val) => updateContent({ title: val })}
        />
        <TypographyFields
          label="Stile"
          sizeKey="titleSize"
          boldKey="titleBold"
          italicKey="titleItalic"
          tagKey="titleTag"
          showTagSelector={true}
          defaultTag="h2"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={42}
        />
      </Section>

      <Section icon={AlignLeft} label="Testo" id="text" isOpen={openSection === 'text'} onToggle={toggleSection}>
        <RichTextarea
          label="Corpo del Testo"
          placeholder="Inserisci il tuo testo..."
          value={content.text || ''}
          onChange={(val) => updateContent({ text: val })}
        />
        <TypographyFields
          label="Stile"
          sizeKey="contentSize"
          boldKey="contentBold"
          italicKey="contentItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={18}
        />
      </Section>

      {/* Global Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <ColorManager
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          project={project}
          showTitle={false}
        />

        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Immagine Sfondo">
          <BackgroundManager
            selectedBlock={selectedBlock}
            updateContent={updateContent}
            updateStyle={updateStyle}
            getStyleValue={getStyleValue}
          />
        </ManagerWrapper>
        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Pattern Decorativo">
          <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        </ManagerWrapper>
      </Section>

      <Section icon={Play} label="Animazioni" id="animation" isOpen={openSection === 'animation'} onToggle={toggleSection}>
        <AnimationManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <Section icon={Settings} label="Avanzate" id="advanced" isOpen={openSection === 'advanced'} onToggle={toggleSection}>
        <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        <AnchorManager selectedBlock={selectedBlock} updateContent={updateContent} />
      </Section>
    </div>
  );
};
