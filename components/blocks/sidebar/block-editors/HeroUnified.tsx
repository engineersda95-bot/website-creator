'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Type, AlignLeft, MousePointer, Image as ImageIcon, Layers,
  Palette, Settings, ChevronDown, AlignCenter, Columns, Sparkles,
} from 'lucide-react';
import {
  SimpleInput, RichTextarea, CTAManager, BackgroundManager,
  LayoutFields, TypographyFields, ColorManager, PatternManager,
  BorderShadowManager, AnchorManager, AnimationManager, SectionHeader, SimpleSlider,
} from '../SharedSidebarComponents';

interface HeroUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

const HERO_VARIANTS = [
  { id: 'centered', label: 'Centrata', icon: AlignCenter },
  { id: 'split', label: 'Split', icon: Columns },
  { id: 'stacked', label: 'Immagine+', icon: Layers },
];

// Accordion section with expand/collapse
const Section: React.FC<{
  icon: any;
  id: string;
  label: string;
  children: React.ReactNode;
  badge?: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
}> = ({ icon: Icon, id, label, children, badge, isOpen, onToggle }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (isOpen) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [isOpen]);
  return (
    <div ref={ref} className="border-b border-zinc-100 last:border-b-0">
      <button
        onClick={() => onToggle(id)}
        className={cn("w-full flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50/50 transition-colors", isOpen && "bg-zinc-50/50")}
      >
        <Icon size={14} className={cn("shrink-0 transition-colors", isOpen ? "text-zinc-900" : "text-zinc-400")} />
        <span className={cn("text-[12px] font-bold flex-1 text-left transition-colors", isOpen ? "text-zinc-900" : "text-zinc-700")}>{label}</span>
        {badge && (
          <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">{badge}</span>
        )}
        <ChevronDown size={12} className={cn("text-zinc-300 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export const HeroUnified: React.FC<HeroUnifiedProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const content = selectedBlock.content;
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  // Listen for canvas clicks to auto-open the matching section
  React.useEffect(() => {
    const handler = (e: Event) => {
      const sectionId = (e as CustomEvent).detail;
      if (sectionId) setOpenSection(sectionId);
    };
    window.addEventListener('hero-section-focus', handler);
    return () => window.removeEventListener('hero-section-focus', handler);
  }, []);

  return (
    <div>
      {/* Layout variant selector */}
      <div className="px-5 py-4 border-b border-zinc-100">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Layout</label>
        <div className="grid grid-cols-3 gap-1.5">
          {HERO_VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => updateContent({ variant: v.id })}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[9px] font-medium transition-all",
                (content.variant || 'centered') === v.id
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-100 text-zinc-400 hover:border-zinc-300"
              )}
            >
              <v.icon size={14} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Components */}
      <div className="px-5 pt-3 pb-1">
        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Componenti</span>
      </div>

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          placeholder="Titolo Hero"
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
          defaultTag="h1"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={40}
        />
      </Section>

      <Section icon={AlignLeft} label="Sottotitolo" id="subtitle" isOpen={openSection === 'subtitle'} onToggle={toggleSection}>
        <RichTextarea
          label="Testo"
          placeholder="Sottotitolo Hero"
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

      <Section icon={MousePointer} label="CTA 1" id="cta" badge={content.cta || 'vuoto'} isOpen={openSection === 'cta'} onToggle={toggleSection}>
        <CTAManager
          content={content}
          updateContent={updateContent}
          style={selectedBlock.style}
          updateStyle={updateStyle}
          label="CTA 1"
        />
      </Section>

      <Section icon={MousePointer} label="CTA 2" id="cta2" badge={content.cta2 || 'nessuno'} isOpen={openSection === 'cta2'} onToggle={toggleSection}>
        <CTAManager
          content={content}
          updateContent={updateContent}
          style={selectedBlock.style}
          updateStyle={updateStyle}
          label="CTA 2"
          ctaKey="cta2"
          urlKey="cta2Url"
          themeKey="cta2Theme"
        />
      </Section>

      <Section icon={ImageIcon} label="Sfondo" id="background" badge={content.backgroundImage ? 'attivo' : 'nessuno'} isOpen={openSection === 'background'} onToggle={toggleSection}>
        <BackgroundManager
          selectedBlock={selectedBlock}
          updateContent={updateContent}
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
        />
      </Section>

      {/* Global Style */}
      <div className="px-5 pt-5 pb-1">
        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Stile Globale</span>
      </div>

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Altezza (px)</label>
            <input
              type="number"
              className="w-full p-2 border border-zinc-200 rounded-lg text-xs bg-zinc-50 font-bold"
              value={getStyleValue('minHeight', 600)}
              onChange={(e) => updateStyle({ minHeight: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Gap</label>
            <input
              type="number"
              className="w-full p-2 border border-zinc-200 rounded-lg text-xs bg-zinc-50 font-bold"
              value={getStyleValue('gap', 32)}
              onChange={(e) => updateStyle({ gap: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
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
      </Section>

      <Section icon={Palette} label="Colori" id="colors" isOpen={openSection === 'colors'} onToggle={toggleSection}>
        <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />
      </Section>

      <Section icon={Sparkles} label="Pattern" id="pattern" isOpen={openSection === 'pattern'} onToggle={toggleSection}>
        <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <Section icon={Settings} label="Avanzate" id="advanced" isOpen={openSection === 'advanced'} onToggle={toggleSection}>
        <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        <AnimationManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        <AnchorManager selectedBlock={selectedBlock} updateContent={updateContent} />
      </Section>
    </div>
  );
};
