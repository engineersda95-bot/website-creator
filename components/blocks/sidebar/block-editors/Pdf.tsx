'use client';

import { cn } from '@/lib/utils';
import {
  AlignLeft,
  FileText,
  Layers,
  Palette,
  Settings,
  Type,
} from 'lucide-react';
import React from 'react';
import {
  AnchorManager,
  BackgroundManager,
  BorderShadowManager,
  ColorManager,
  LayoutFields,
  PatternManager,
  RichTextarea,
  SimpleInput,
  SimpleSlider,
  TypographyFields,
  UnifiedSection as Section, 
  useUnifiedSections, 
  CategoryHeader, 
  ManagerWrapper
} from '../SharedSidebarComponents';

interface PdfProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const Pdf: React.FC<PdfProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const content = selectedBlock.content || {};
  const { openSection, setOpenSection, toggleSection } = useUnifiedSections();

  React.useEffect(() => {
    const handler = (e: Event) => {
      const sectionId = (e as CustomEvent).detail;
      if (sectionId) setOpenSection(sectionId);
    };
    window.addEventListener('pdf-section-focus', handler);
    return () => window.removeEventListener('pdf-section-focus', handler);
  }, [setOpenSection]);

  return (
    <div>
      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          placeholder="es. Il Nostro Menu"
          value={content.title || ''}
          onChange={(val) => updateContent({ title: val })}
        />
        <TypographyFields
          label="Stile"
          sizeKey="titleSize"
          boldKey="titleBold"
          italicKey="titleItalic"
          tagKey="titleTag"
          showTagSelector
          defaultTag="h2"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={40}
        />
      </Section>

      <Section icon={AlignLeft} label="Sottotitolo" id="subtitle" isOpen={openSection === 'subtitle'} onToggle={toggleSection}>
        <RichTextarea
          label="Testo"
          placeholder="es. Scopri i piatti del giorno..."
          value={content.subtitle || ''}
          onChange={(val) => updateContent({ subtitle: val })}
        />
        <TypographyFields
          label="Stile"
          sizeKey="subtitleSize"
          boldKey="subtitleBold"
          italicKey="subtitleItalic"
          tagKey="subtitleTag"
          showTagSelector
          defaultTag="p"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={20}
        />
      </Section>

      <Section icon={FileText} label="PDF" id="pdf" isOpen={openSection === 'pdf'} onToggle={toggleSection}>
        <SimpleInput
          label="URL del PDF (Google Drive o diretto)"
          value={content.url || ''}
          onChange={(val) => updateContent({ url: val })}
          placeholder="https://drive.google.com/file/d/..."
        />
        <p className="text-[10px] text-zinc-400 italic leading-relaxed">
          Inserisci l&apos;URL di condivisione di Google Drive o un link diretto a un file PDF.
        </p>
      </Section>

      {/* Global Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
        <SimpleSlider
          value={getStyleValue('embedHeight', 800)}
          onChange={(v: number) => updateStyle({ embedHeight: v })}
          label="Altezza Viewer (px)"
          min={300}
          max={1200}
          step={50}
        />
        <SimpleInput
          label="Larghezza Max Embed (px)"
          placeholder="Esempio: 1200"
          value={getStyleValue('containerWidth', '')?.toString() || ''}
          onChange={(v) => updateStyle({ containerWidth: v === '' ? null : parseInt(v) })}
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

      <Section icon={Settings} label="Avanzate" id="advanced" isOpen={openSection === 'advanced'} onToggle={toggleSection}>
        <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        <AnchorManager selectedBlock={selectedBlock} updateContent={updateContent} />
      </Section>
    </div>
  );
};
