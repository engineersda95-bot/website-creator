'use client';

import { cn } from '@/lib/utils';
import {
  AlignLeft,
  Image as ImageIcon,
  Layers,
  MousePointer,
  MoveHorizontal,
  Palette,
  Play,
  Settings,
  Type,
} from 'lucide-react';
import React from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';
import {
  AnchorManager,
  AnimationManager,
  BackgroundManager,
  BorderShadowManager,
  ColorManager,
  CTAManager,
  ImageStyleFields,
  LayoutFields,
  PatternManager,
  RichTextarea,
  SimpleInput,
  SimpleSlider,
  TypographyFields,
} from '../SharedSidebarComponents';
import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../UnifiedSection';

interface ImageTextUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const ImageTextUnified: React.FC<ImageTextUnifiedProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const content = selectedBlock.content;
  const { openSection, setOpenSection, toggleSection } = useUnifiedSections();

  React.useEffect(() => {
    const handler = (e: Event) => {
      const sectionId = (e as CustomEvent).detail;
      if (sectionId) setOpenSection(sectionId);
    };
    window.addEventListener('imagetext-section-focus', handler);
    return () => window.removeEventListener('imagetext-section-focus', handler);
  }, [setOpenSection]);

  return (
    <div>
      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          placeholder="Inserisci un titolo d'impatto"
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
          defaultValue={48}
        />
      </Section>

      <Section icon={AlignLeft} label="Descrizione" id="description" isOpen={openSection === 'description'} onToggle={toggleSection}>
        <RichTextarea
          label="Testo"
          placeholder="Descrivi il problema, la soluzione o il chi siamo..."
          value={content.text || ''}
          onChange={(val) => updateContent({ text: val })}
        />
        <TypographyFields
          label="Stile"
          sizeKey="subtitleSize"
          boldKey="subtitleBold"
          italicKey="subtitleItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={18}
        />
      </Section>

      <Section icon={MousePointer} label="CTA 1" id="cta" badge={content.cta || 'vuoto'} isOpen={openSection === 'cta'} onToggle={toggleSection}>
        <CTAManager
          content={content}
          updateContent={updateContent}
          style={selectedBlock.style}
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          label="CTA 1"
        />
      </Section>

      <Section icon={MousePointer} label="CTA 2" id="cta2" badge={content.cta2 || 'nessuno'} isOpen={openSection === 'cta2'} onToggle={toggleSection}>
        <CTAManager
          content={content}
          updateContent={updateContent}
          style={selectedBlock.style}
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          label="CTA 2"
          ctaKey="cta2"
          urlKey="cta2Url"
          themeKey="cta2Theme"
        />
      </Section>

      <Section icon={ImageIcon} label="Immagine" id="image" isOpen={openSection === 'image'} onToggle={toggleSection}>
        <ImageUpload
          value={resolveImageUrl(content.image, project, useEditorStore.getState().imageMemoryCache)}
          onChange={async (val: string, filename?: string) => {
            const relativePath = await useEditorStore.getState().uploadImage(val, filename);
            updateContent({ image: relativePath });
          }}
          label="Carica Immagine"
          altValue={content.alt ?? ''}
          onAltChange={(alt) => updateContent({ alt })}
          onFilenameSelect={(name) => {
            if (!content.alt) updateContent({ alt: name });
          }}
        />
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Aspetto Immagine</label>
          <select
            className="w-full p-2 border border-zinc-200 rounded-lg text-xs bg-zinc-50 font-bold"
            value={content.imageAspectRatio || '16/9'}
            onChange={(e) => updateContent({ imageAspectRatio: e.target.value })}
          >
            <option value="16/9">Desktop (16:9)</option>
            <option value="4/3">Standard (4:3)</option>
            <option value="1/1">Quadrato (1:1)</option>
            <option value="3/4">Verticale (3:4)</option>
            <option value="auto">Originale</option>
          </select>
        </div>
        <ManagerWrapper label="Stile Immagine">
          <ImageStyleFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
        </ManagerWrapper>
      </Section>

      {/* Global Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
        {/* Image Position */}
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Posizione Immagine</label>
          <div className="flex border rounded-lg overflow-hidden bg-zinc-50">
            {[
              { id: 'left', label: 'Sinistra' },
              { id: 'right', label: 'Destra' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => updateStyle({ imagePosition: item.id })}
                className={cn(
                  "flex-1 py-2 text-[10px] font-bold uppercase transition-all",
                  getStyleValue('imagePosition', 'left') === item.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {/* Vertical Align */}
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Allineamento Verticale</label>
          <div className="flex border rounded-lg overflow-hidden bg-zinc-50">
            {[
              { id: 'top', label: 'Sopra' },
              { id: 'center', label: 'Centro' },
              { id: 'bottom', label: 'Sotto' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => updateStyle({ verticalAlign: item.id })}
                className={cn(
                  "flex-1 py-2 text-[10px] font-bold uppercase transition-all",
                  getStyleValue('verticalAlign', 'center') === item.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <SimpleSlider
          label="Gap Colonne"
          value={getStyleValue('gap', 60)}
          onChange={(val: number) => updateStyle({ gap: val })}
          max={200}
          step={4}
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
