'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Code,
  Instagram,
  Layers,
  MapPin,
  Palette,
  Play,
  Settings,
  Share2,
  Type,
  Youtube,
} from 'lucide-react';
import {
  AnchorManager,
  AnimationManager,
  BackgroundManager,
  BorderShadowManager,
  ColorManager,
  LayoutFields,
  PatternManager,
  SimpleInput,
  TypographyFields,
} from '../SharedSidebarComponents';
import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../UnifiedSection';

interface EmbedUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

const EMBED_TYPES = [
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'map', label: 'Google Maps', icon: MapPin },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'custom', label: 'Custom / Iframe', icon: Code },
];

export const EmbedUnified: React.FC<EmbedUnifiedProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const content = selectedBlock?.content;
  const { openSection, toggleSection } = useUnifiedSections();

  if (!content) return null;

  return (
    <div>
      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          placeholder="Es: Seguici su Instagram"
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
          defaultValue={32}
        />
      </Section>

      <Section icon={Share2} label="Configurazione Embed" id="embed" isOpen={openSection === 'embed'} onToggle={toggleSection}>
        <div className="grid grid-cols-2 gap-2">
          {EMBED_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => updateContent({ type: type.id })}
              className={cn(
                "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 group",
                content.type === type.id
                  ? "bg-zinc-900 border-zinc-900 text-white shadow-xl scale-[1.02]"
                  : "bg-zinc-50 border-transparent text-zinc-400 hover:bg-white hover:border-zinc-200"
              )}
            >
              <type.icon size={16} className={cn(content.type === type.id ? "text-white" : "group-hover:text-zinc-600")} />
              <span className="text-[10px] font-black uppercase tracking-tight">{type.label}</span>
            </button>
          ))}
        </div>

        <SimpleInput
          label={
            content.type === 'youtube' ? "Video URL o ID" :
              content.type === 'map' ? "Indirizzo" :
                content.type === 'instagram' ? "URL Post Instagram" :
                  "URL o Codice Iframe"
          }
          placeholder={
            content.type === 'youtube' ? "URL Video o ID (es: dQw4w9WgXcQ)" :
              content.type === 'map' ? "Inserisci Indirizzo (es: Via Roma 1, Milano)" :
                content.type === 'instagram' ? "URL Post Instagram" :
                  "Inserisci URL o intero tag <iframe>"
          }
          value={content.url || ''}
          onChange={(val) => updateContent({ url: val })}
        />

        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
          <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
            {content.type === 'youtube' && "Inserisci l'indirizzo del video o solo l'ID finale. L'aspect ratio viene mantenuto a 16:9."}
            {content.type === 'map' && "Scrivi semplicemente l'indirizzo dell'attività o del luogo. Il sistema genera la mappa automaticamente."}
            {content.type === 'instagram' && "Copia l'URL del post. Viene visualizzato centrato con un formato ottimizzato per i social."}
            {content.type === 'custom' && "Puoi incollare l'intero codice HTML dell'iframe o semplicemente l'URL."}
          </p>
        </div>
      </Section>

      <Section icon={Settings} label="Dimensioni Embed" id="dimensions" isOpen={openSection === 'dimensions'} onToggle={toggleSection}>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Altezza (px)</label>
            <input
              type="number"
              className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
              value={getStyleValue('minHeight', 450)}
              onChange={(e) => updateStyle({ minHeight: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Larghezza Max Embed (px)</label>
            <input
              type="number"
              className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
              value={getStyleValue('contentWidth', '')}
              placeholder="Esempio: 540"
              onChange={(e) => updateStyle({ contentWidth: parseInt(e.target.value) || undefined })}
            />
          </div>
        </div>
      </Section>

      {/* Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />
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
