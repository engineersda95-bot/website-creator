'use client';

import { cn } from '@/lib/utils';
import {
  AlignCenter,
  AlignLeft,
  Columns,
  Image as ImageIcon, Layers,
  MousePointer,
  Palette, Settings, Play,
  Type, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Copy
} from 'lucide-react';
import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import {
  AnchorManager,
  AnimationManager,
  BackgroundManager,
  BorderShadowManager,
  ColorManager,
  LayoutFields,
  PatternManager,
  RichTextarea,
  SimpleInput,
  TypographyFields,
  UnifiedSection as Section, 
  useUnifiedSections, 
  CategoryHeader, 
  ManagerWrapper
} from '../SharedSidebarComponents';
import { LinkSelector } from '../ui/LinkSelector';
import { CTAManager } from '../managers/CTAManager';

interface HeroProps {
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

export const Hero: React.FC<HeroProps> = ({
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
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          placeholder="Titolo Hero"
          value={content.carouselEnabled && content.slides?.[0] ? (content.slides[0].title || '') : (content.title || '')}
          onChange={(val) => {
            if (content.carouselEnabled && content.slides?.[0]) {
              const newSlides = [...content.slides];
              newSlides[0] = { ...newSlides[0], title: val };
              updateContent({ title: val, slides: newSlides });
            } else {
              updateContent({ title: val });
            }
          }}
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
          value={content.carouselEnabled && content.slides?.[0] ? (content.slides[0].subtitle || '') : (content.subtitle || '')}
          onChange={(val) => {
            if (content.carouselEnabled && content.slides?.[0]) {
              const newSlides = [...content.slides];
              newSlides[0] = { ...newSlides[0], subtitle: val };
              updateContent({ subtitle: val, slides: newSlides });
            } else {
              updateContent({ subtitle: val });
            }
          }}
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

      {/* Global Style */}
      <CategoryHeader label="Stile della Sezione" />

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

      {/* Carousel Settings Section */}
      <CategoryHeader label="Carosello" />
      <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-2">
          <Play size={14} className="text-zinc-400" />
          <span className="text-[10px] font-bold text-zinc-900 uppercase">Attiva Carosello</span>
        </div>
        <button
          onClick={() => {
            const isEnabled = !content.carouselEnabled;
            const updates: any = { carouselEnabled: isEnabled };
            // If enabling for the first time and no slides, create one from current content
            if (isEnabled && (!content.slides || content.slides.length === 0)) {
              updates.slides = [{
                id: Math.random().toString(36).substr(2, 9),
                title: content.title || '',
                subtitle: content.subtitle || '',
                cta: content.cta || '',
                ctaUrl: content.ctaUrl || '',
                ctaTheme: content.ctaTheme || 'primary',
                cta2: content.cta2 || '',
                cta2Url: content.cta2Url || '',
                cta2Theme: content.cta2Theme || 'secondary',
                backgroundImage: content.backgroundImage || '',
                backgroundAlt: content.backgroundAlt || '',
              }];
            }
            updateContent(updates);
          }}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none",
            content.carouselEnabled ? "bg-zinc-900" : "bg-zinc-200"
          )}
        >
          <span className={cn(
            "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition-transform",
            content.carouselEnabled ? "translate-x-4" : "translate-x-0"
          )} />
        </button>
      </div>

      {content.carouselEnabled && (
        <>
          <Section icon={Layers} label="Gestione Slide" id="slides" badge={`${content.slides?.length || 0}`} isOpen={openSection === 'slides'} onToggle={toggleSection}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Slide del carosello</label>
            <div className="flex items-center gap-2">
              {content.slides?.length >= 5 && (
                <span className="text-[8px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-tighter">Limite 5 raggiunto</span>
              )}
              <button
                disabled={content.slides?.length >= 5}
                onClick={() => {
                  const newSlide = {
                    id: Math.random().toString(36).substr(2, 9),
                    title: 'Nuova Slide',
                    subtitle: 'Descrizione della slide',
                    cta: 'Scopri di più',
                    ctaUrl: '#',
                  };
                  updateContent({ slides: [...(content.slides || []), newSlide] });
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm",
                  content.slides?.length >= 5 
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                    : "bg-zinc-900 text-white hover:scale-105 active:scale-95"
                )}
              >
                <Plus size={12} /> Slide
              </button>
            </div>
          </div>

            <div className="space-y-3">
              {(content.slides || []).map((slide: any, index: number) => (
                <SlideEditor
                  key={slide.id || index}
                  slide={slide}
                  index={index}
                  project={project}
                  content={content}
                  onUpdate={(updates) => {
                    const newSlides = [...content.slides];
                    newSlides[index] = { ...newSlides[index], ...updates };
                    updateContent({ slides: newSlides });
                  }}
                  onRemove={() => {
                    const newSlides = content.slides.filter((_: any, i: number) => i !== index);
                    updateContent({ slides: newSlides });
                  }}
                  onMove={(dir) => {
                    const newSlides = [...content.slides];
                    const targetIdx = dir === 'up' ? index - 1 : index + 1;
                    if (targetIdx < 0 || targetIdx >= newSlides.length) return;
                    [newSlides[index], newSlides[targetIdx]] = [newSlides[targetIdx], newSlides[index]];
                    updateContent({ slides: newSlides });
                  }}
                  onDuplicate={() => {
                    const newSlide = { ...slide, id: Math.random().toString(36).substr(2, 9) };
                    const newSlides = [...content.slides];
                    newSlides.splice(index + 1, 0, newSlide);
                    updateContent({ slides: newSlides });
                  }}
                  isLimitReached={content.slides?.length >= 5}
                  onOpen={() => {
                    updateContent({ activeSlideIndex: index });
                  }}
                />
              ))}
            </div>
          </Section>

          <Section icon={Settings} label="Impostazioni Slider" id="carousel-settings" isOpen={openSection === 'carousel-settings'} onToggle={toggleSection}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Autoplay</label>
                <button
                  onClick={() => updateStyle({ carouselAutoplay: !getStyleValue('carouselAutoplay', true) })}
                  className={cn(
                    "relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors",
                    getStyleValue('carouselAutoplay', true) ? "bg-zinc-900" : "bg-zinc-200"
                  )}
                >
                  <span className={cn(
                    "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                    getStyleValue('carouselAutoplay', true) ? "translate-x-3" : "translate-x-0.5"
                  )} />
                </button>
              </div>

              {getStyleValue('carouselAutoplay', true) && (
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Intervallo (ms)</label>
                  <input
                    type="range"
                    min="2000"
                    max="10000"
                    step="500"
                    className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                    value={getStyleValue('carouselInterval', 5000)}
                    onChange={(e) => updateStyle({ carouselInterval: parseInt(e.target.value) })}
                  />
                  <div className="flex justify-between mt-1 px-0.5">
                    <span className="text-[9px] text-zinc-400 font-medium">2s</span>
                    <span className="text-[10px] text-zinc-900 font-bold">{getStyleValue('carouselInterval', 5000)}ms</span>
                    <span className="text-[9px] text-zinc-400 font-medium">10s</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                  <span className="text-[9px] font-bold text-zinc-900 uppercase">Frecce</span>
                  <button
                    onClick={() => updateStyle({ carouselArrows: !getStyleValue('carouselArrows', true) })}
                    className={cn(
                      "w-6 h-3.5 rounded-full relative transition-colors",
                      getStyleValue('carouselArrows', true) ? "bg-zinc-900" : "bg-zinc-200"
                    )}
                  >
                    <span className={cn("absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform", getStyleValue('carouselArrows', true) ? "translate-x-2.5" : "")} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                  <span className="text-[9px] font-bold text-zinc-900 uppercase">Punti</span>
                  <button
                    onClick={() => updateStyle({ carouselDots: !getStyleValue('carouselDots', true) })}
                    className={cn(
                      "w-6 h-3.5 rounded-full relative transition-colors",
                      getStyleValue('carouselDots', true) ? "bg-zinc-900" : "bg-zinc-200"
                    )}
                  >
                    <span className={cn("absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform", getStyleValue('carouselDots', true) ? "translate-x-2.5" : "")} />
                  </button>
                </div>
              </div>
            </div>
          </Section>
        </>
      )}
    </div>
  );
};

// ─── Internal component for individual slide editing ─────────────────────
const SlideEditor: React.FC<{
  slide: any;
  index: number;
  project: any;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onDuplicate: () => void;
  isLimitReached?: boolean;
  onOpen?: () => void;
  content: any;
}> = ({ slide, index, project, onUpdate, onRemove, onMove, onDuplicate, isLimitReached, onOpen, content }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { uploadImage, imageMemoryCache } = useEditorStore();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm transition-all hover:border-zinc-300">
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center justify-between bg-zinc-50/50 border-b border-zinc-100">
        <div 
          className="flex items-center gap-2 cursor-pointer grow min-w-0" 
          onClick={() => {
            const newOpen = !isOpen;
            setIsOpen(newOpen);
            if (newOpen && onOpen) onOpen();
          }}
        >
          <span className="w-5 h-5 shrink-0 flex items-center justify-center bg-zinc-900 text-white rounded text-[10px] font-bold">
            {index + 1}
          </span>
          <span className="text-[10px] font-bold text-zinc-700 truncate min-w-0 pr-2">
            {slide.title || 'Senza titolo'}
          </span>
          {isOpen ? <ChevronUp size={12} className="text-zinc-400 shrink-0" /> : <ChevronDown size={12} className="text-zinc-400 shrink-0" />}
        </div>
        <div className="flex items-center gap-0.5">
          <button 
            disabled={isLimitReached}
            onClick={onDuplicate} 
            className={cn(
              "p-1.5 rounded-md transition-all",
              isLimitReached ? "text-zinc-200 cursor-not-allowed" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
            )} 
            title={isLimitReached ? "Limite massimo raggiunto" : "Duplica"}
          >
            <Copy size={13} />
          </button>
          <button onClick={() => onMove('up')} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all">
            <ArrowUp size={13} />
          </button>
          <button onClick={() => onMove('down')} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all">
            <ArrowDown size={13} />
          </button>
          <button onClick={onRemove} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all ml-1">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
          <SimpleInput
            label="Titolo Slide"
            value={slide.title || ''}
            onChange={(val) => onUpdate({ title: val })}
            placeholder="Esempio: Benvenuti in..."
          />
          <RichTextarea
            label="Sottotitolo"
            value={slide.subtitle || ''}
            onChange={(val) => onUpdate({ subtitle: val })}
            placeholder="Descrizione più lunga..."
          />
          
          <div className="space-y-4">
            <CTAManager
              content={slide}
              updateContent={onUpdate}
              getStyleValue={(key, def) => slide[key] !== undefined ? slide[key] : def}
              updateStyle={(updates) => onUpdate(updates)}
              label="Pulsante 1"
              ctaKey="cta"
              themeKey="ctaTheme"
              urlKey="ctaUrl"
            />

            <div className="h-px bg-zinc-100 my-2" />

            <CTAManager
              content={slide}
              updateContent={onUpdate}
              getStyleValue={(key, def) => slide[key] !== undefined ? slide[key] : def}
              updateStyle={(updates) => onUpdate(updates)}
              label="Pulsante 2"
              ctaKey="cta2"
              themeKey="cta2Theme"
              urlKey="cta2Url"
            />
          </div>

          <div className="h-px bg-zinc-50" />

          <ImageUpload
            label="Immagine Sfondo"
            value={resolveImageUrl(slide.backgroundImage || (index === 0 ? content.backgroundImage : ''), project, imageMemoryCache)}
            onChange={async (val: string, filename?: string) => {
              const relativePath = await uploadImage(val, filename);
              const updates: any = { backgroundImage: relativePath };
              
              // Atomic update for both image and alt text to avoid race conditions
              if (!slide.backgroundAlt && filename) {
                updates.backgroundAlt = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
              }
              
              onUpdate(updates);
            }}
            altValue={slide.backgroundAlt || (index === 0 ? content.backgroundAlt : '')}
            onAltChange={(alt) => onUpdate({ backgroundAlt: alt })}
          />
        </div>
      )}
    </div>
  );
};
