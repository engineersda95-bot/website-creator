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
        {(() => {
          const appearance = project?.settings?.appearance || 'light';
          const defaultBg = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff');
          const defaultText = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000');
          const bgType = getStyleValue('bgType', 'solid');
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Sfondo</label>
                  <input type="color" className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent" value={getStyleValue('backgroundColor', defaultBg)} onChange={(e) => updateStyle({ backgroundColor: e.target.value })} />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Testo</label>
                  <input type="color" className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent" value={getStyleValue('textColor', defaultText)} onChange={(e) => updateStyle({ textColor: e.target.value })} />
                </div>
                <button
                  onClick={() => updateStyle({ backgroundColor: undefined, textColor: undefined, bgType: 'solid', backgroundColor2: undefined, bgDirection: undefined })}
                  className="self-end p-1.5 text-zinc-300 hover:text-zinc-600 transition-colors" title="Reset"
                >
                  <Settings size={12} />
                </button>
              </div>
              <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                {['solid', 'gradient'].map((t) => (
                  <button key={t} onClick={() => updateStyle({ bgType: t })} className={cn("flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all", bgType === t ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
                    {t === 'solid' ? 'Tinta Unita' : 'Gradiente'}
                  </button>
                ))}
              </div>
              {bgType === 'gradient' && (
                <div className="flex items-center gap-3 animate-in fade-in duration-200">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Fine</label>
                    <input type="color" className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent" value={getStyleValue('backgroundColor2', '#f3f4f6')} onChange={(e) => updateStyle({ backgroundColor2: e.target.value })} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Direzione</label>
                    <select className="w-full py-1.5 px-2 border border-zinc-200 rounded-lg text-[10px] font-bold bg-zinc-50" value={getStyleValue('bgDirection', 'to bottom')} onChange={(e) => updateStyle({ bgDirection: e.target.value })}>
                      <option value="to bottom">Alto → Basso</option>
                      <option value="to top">Basso → Alto</option>
                      <option value="to right">Sx → Dx</option>
                      <option value="to left">Dx → Sx</option>
                      <option value="to bottom right">Inclinato</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
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
