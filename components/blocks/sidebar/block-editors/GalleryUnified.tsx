'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Box,
  Columns, GalleryHorizontal, Grid, Image as ImageIcon,
  Layers,
  Palette,
  Play,
  Plus,
  Settings,
  Star,
  Trash2,
  ArrowUp,
  ArrowDown,
  Type,
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
  SimpleSlider,
  TypographyFields,
} from '../SharedSidebarComponents';
import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../UnifiedSection';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';
import { toast } from '@/components/shared/Toast';

interface GalleryUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const GalleryUnified: React.FC<GalleryUnifiedProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const { uploadImage, imageMemoryCache } = useEditorStore();
  const content = selectedBlock.content;
  const images = content.images || [];
  const { openSection, toggleSection } = useUnifiedSections();

  const updateImage = (index: number, updates: any) => {
    updateContent((prevContent: any) => {
      const currentImages = prevContent.images || [];
      const newImages = [...currentImages];
      newImages[index] = { ...newImages[index], ...updates };
      return { ...prevContent, images: newImages };
    });
  };

  const addImage = () => {
    if (images.length >= 15) {
      toast("Il limite massimo consigliato è di 15 immagini per galleria.", 'info');
      return;
    }
    updateContent((prev: any) => ({
      images: [
        ...(prev.images || []),
        { image: '', alt: `Nuova Immagine ${images.length + 1}` }
      ]
    }));
  };

  const removeImage = (index: number) => {
    updateContent((prev: any) => ({
      images: (prev.images || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    updateContent((prev: any) => {
      if (direction === 'up' && index === 0) return prev;
      const currentImages = [...(prev.images || [])];
      if (direction === 'down' && index === currentImages.length - 1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [currentImages[index], currentImages[targetIndex]] = [currentImages[targetIndex], currentImages[index]];
      return { images: currentImages };
    });
  };

  return (
    <div>
      {/* Components */}
      {/* Variant selector */}
      <div className="px-5 py-4 border-b border-zinc-100">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Layout</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'masonry', label: 'Masonry', icon: Columns },
            { id: 'grid', label: 'Griglia', icon: Grid },
            { id: 'slider', label: 'Slider', icon: GalleryHorizontal },
            { id: 'featured', label: 'Featured', icon: Star },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => updateContent({ variant: v.id })}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[9px] font-medium transition-all",
                (content.variant || 'masonry') === v.id
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

      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          placeholder="La nostra galleria..."
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

      <Section icon={ImageIcon} label="Immagini" id="images" badge={`${images.length}`} isOpen={openSection === 'images'} onToggle={toggleSection}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Massimo 15 consigliate</label>
          <button
            onClick={addImage}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-sm active:scale-95"
          >
            <Plus size={12} /> Aggiungi
          </button>
        </div>

        <div className="space-y-4">
          {images.map((item: any, index: number) => (
            <div key={index} className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4 relative group animate-in slide-in-from-right-2 duration-200">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-50 pb-2">
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Immagine #{index + 1}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveImage(index, 'up')} disabled={index === 0} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => moveImage(index, 'down')} disabled={index === images.length - 1} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20">
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => removeImage(index)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <ImageUpload
                label={`Immagine ${index + 1}`}
                value={resolveImageUrl(item.image, project, imageMemoryCache)}
                onChange={async (val: string, filename?: string) => {
                  const relativePath = await uploadImage(val, filename);
                  updateImage(index, { image: relativePath });
                }}
                altValue={item.alt ?? ''}
                onAltChange={(alt) => updateImage(index, { alt })}
                onFilenameSelect={(name) => {
                  if (!item.alt) updateImage(index, { alt: name });
                }}
              />
            </div>
          ))}

          {images.length === 0 && (
            <div className="text-center py-12 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Nessuna immagine presente</p>
            </div>
          )}
        </div>
      </Section>

      <Section icon={Box} label="Design Galleria" id="design" isOpen={openSection === 'design'} onToggle={toggleSection}>
        <SimpleSlider
          label="Numero di Colonne"
          value={getStyleValue('columns', 3)}
          onChange={(val: number) => updateStyle({ columns: val })}
          min={1}
          max={6}
          step={1}
        />
        <SimpleSlider
          label="Spaziatura (Gap)"
          value={getStyleValue('gap', 16)}
          onChange={(val: number) => updateStyle({ gap: val })}
          min={0}
          max={80}
          step={4}
        />
      </Section>

      <Section icon={ImageIcon} label="Stile Immagini" id="imageStyle" isOpen={openSection === 'imageStyle'} onToggle={toggleSection}>
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Proporzioni (Aspect Ratio)</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'original', label: 'Originale' },
              { id: '1/1', label: '1:1 Quadrato' },
              { id: '4/3', label: '4:3 Classico' },
              { id: '16/9', label: '16:9 Wide' },
            ].map(aspect => (
              <button
                key={aspect.id}
                onClick={() => updateStyle({ imageAspectRatio: aspect.id })}
                className={cn(
                  "px-3 py-2 text-[10px] font-semibold rounded-lg border transition-all",
                  getStyleValue('imageAspectRatio', 'original') === aspect.id
                    ? "border-zinc-900 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                )}
              >
                {aspect.label}
              </button>
            ))}
          </div>
        </div>

        <SimpleSlider
          label="Arrotondamento (Border Radius)"
          value={getStyleValue('imageBorderRadius', 16)}
          onChange={(val: number) => updateStyle({ imageBorderRadius: val })}
          min={0}
          max={64}
          step={4}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <div>
              <p className="text-[10px] font-bold text-zinc-900 uppercase">Ombra Immagini</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Leggera ombra sotto le immagini</p>
            </div>
            <button
              onClick={() => updateStyle({ imageShadow: !getStyleValue('imageShadow', false) })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none",
                getStyleValue('imageShadow', false) ? "bg-zinc-900" : "bg-zinc-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
                  getStyleValue('imageShadow', false) ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <div>
              <p className="text-[10px] font-bold text-zinc-900 uppercase">Effetto Hover</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Ingrandimento al passaggio del mouse</p>
            </div>
            <button
              onClick={() => updateStyle({ imageHover: !getStyleValue('imageHover', true) })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none",
                getStyleValue('imageHover', true) ? "bg-zinc-900" : "bg-zinc-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
                  getStyleValue('imageHover', true) ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </Section>

      {/* Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
        />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <ColorManager
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          project={project}
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
