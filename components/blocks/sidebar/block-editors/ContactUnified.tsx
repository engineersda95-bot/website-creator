'use client';

import { cn } from '@/lib/utils';
import {
  AlignLeft,
  Layers,
  Mail, Map, MapPin, Phone,
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
  SimpleSlider,
  TypographyFields
} from '../SharedSidebarComponents';
import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../UnifiedSection';

interface ContactUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const ContactUnified: React.FC<ContactUnifiedProps> = ({
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
          placeholder="Contattaci"
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
        />
      </Section>

      <Section icon={AlignLeft} label="Sottotitolo" id="subtitle" isOpen={openSection === 'subtitle'} onToggle={toggleSection}>
        <RichTextarea
          label="Testo"
          placeholder="Descrizione della sezione contatti..."
          value={content.subtitle || ''}
          onChange={(val) => updateContent({ subtitle: val })}
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

      <Section icon={Mail} label="Dati Contatto" id="contact-data" isOpen={openSection === 'contact-data'} onToggle={toggleSection}>
        <div className="space-y-4">
          <SimpleInput
            label="E-mail"
            placeholder="info@tuaazienda.it"
            value={content.email || ''}
            onChange={(val) => updateContent({ email: val })}
            icon={Mail}
          />
          <SimpleInput
            label="Telefono"
            placeholder="+39 02 1234567"
            value={content.phone || ''}
            onChange={(val) => updateContent({ phone: val })}
            icon={Phone}
          />
          <SimpleInput
            label="Indirizzo"
            placeholder="Via Roma 1, Milano"
            value={content.address || ''}
            onChange={(val) => updateContent({ address: val })}
            icon={MapPin}
          />
        </div>

        {/* Typography for contact labels and values */}
        <div className="pt-4 border-t border-zinc-100 space-y-4">
          <SimpleSlider
            label="Dimensione Icone"
            value={getStyleValue('iconSize', 20)}
            onChange={(val: number) => updateStyle({ iconSize: val })}
            min={12} max={64} step={2}
          />
          <TypographyFields
            label="Etichette (E-mail, Tel...)"
            sizeKey="itemTitleSize"
            boldKey="itemTitleBold"
            italicKey="itemTitleItalic"
            tagKey="itemTitleTag"
            showTagSelector={true}
            defaultTag="h3"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={9}
          />
          <TypographyFields
            label="Dati Contatto"
            sizeKey="contactValueSize"
            boldKey="contactValueBold"
            italicKey="contactValueItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={18}
          />
        </div>
      </Section>

      <Section icon={Map} label="Mappa" id="map" isOpen={openSection === 'map'} onToggle={toggleSection}>
        <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase text-zinc-900 tracking-wider leading-none">Mostra Mappa Google</label>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">Visibile se inserisci l'indirizzo</p>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
            checked={content.showMap !== false}
            onChange={(e) => updateContent({ showMap: e.target.checked })}
          />
        </div>
        <SimpleSlider
          label="Larghezza Mappa"
          value={getStyleValue('mapWidth', 100)}
          onChange={(val: number) => updateStyle({ mapWidth: val })}
          min={20} suffix="%"
        />
      </Section>

      {/* Global Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
        <SimpleSlider
          label="Spaziatura Interna (Gap)"
          value={getStyleValue('gap', 64)}
          onChange={(val: number) => updateStyle({ gap: val })}
          max={200} step={4}
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
