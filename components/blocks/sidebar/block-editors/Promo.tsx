'use client';

import React from 'react';
import {
  UnifiedSection as Section,
  useUnifiedSections,
  CategoryHeader,
  ManagerWrapper,
  SimpleInput,
  SimpleSlider,
  TypographyFields,
  LayoutFields,
  ColorManager,
  BackgroundManager,
  BorderShadowManager,
  AnimationManager,
  AnchorManager,
  RichTextarea,
  PatternManager,
  CTAManager
} from '../SharedSidebarComponents';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { cn } from '@/lib/utils';
import { Tag, List, Layout, Palette, Play, Settings, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, ArrowUp, ArrowDown, Trash2, Plus, Columns, Layers, Eye, EyeOff } from 'lucide-react';
import { Block, Project } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';

interface PromoProps {
  selectedBlock: Block;
  updateContent: (updates: any) => void;
  updateStyle: (updates: any) => void;
  getStyleValue: (key: string, defaultValue?: any) => any;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
}

export const Promo: React.FC<PromoProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
  viewport = 'desktop'
}) => {
  const { openSection, toggleSection } = useUnifiedSections();
  const { uploadImage, imageMemoryCache } = useEditorStore();
  const content = selectedBlock.content;
  const items = content.items || [];

  const updateItem = (index: number, updates: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    updateContent({ items: newItems });
  };

  const addItem = () => {
    updateContent({
      items: [...items, {
        image: '',
        title: 'Nuova Promo',
        text: 'Descrizione della promozione.',
        url: ''
      }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    updateContent({ items: newItems });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    updateContent({ items: newItems });
  };

  return (
    <div className="pb-20">
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo Sezione" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo Titolo"
          placeholder="es: Le nostre Offerte"
          value={content.title || ''}
          onChange={(val) => updateContent({ title: val })}
        />
        <TypographyFields
          label="Stile Titolo"
          sizeKey="titleSize"
          boldKey="titleBold"
          italicKey="titleItalic"
          tagKey="titleTag"
          showTagSelector
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          defaultValue={42}
        />
      </Section>

      {/* LAYOUT & GRID */}
      <Section icon={Layout} label="Layout & Griglia" id="grid" isOpen={openSection === 'grid'} onToggle={toggleSection}>
        <SimpleSlider
          label={`Elementi per Riga (${viewport.charAt(0).toUpperCase() + viewport.slice(1)})`}
          value={getStyleValue('columns', (viewport === 'tablet' ? 2 : 1))}
          min={1}
          max={6}
          onChange={(val: number) => updateStyle({ columns: val })}
        />
        <SimpleSlider
          label="Spaziatura (Gap)"
          value={getStyleValue('gap', 32)}
          min={0}
          max={100}
          onChange={(val: number) => updateStyle({ gap: val })}
          suffix="px"
        />

      </Section>

      {/* IMAGE STYLE (Moved to Componenti) */}
      <Section icon={Palette} label="Stile Immagini" id="imageStyle" isOpen={openSection === 'imageStyle'} onToggle={toggleSection}>
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Proporzioni Immagine</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: '16/9', label: '16:9 Desktop' },
                { id: '4/3', label: '4:3 Standard' },
                { id: '1/1', label: '1:1 Square' },
                { id: '3/4', label: '3:4 Mobile' }
              ].map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => updateStyle({ imageAspectRatio: ratio.id })}
                  className={cn(
                    "py-2.5 px-2 rounded-xl border text-[10px] font-bold uppercase transition-all",
                    getStyleValue('imageAspectRatio', '16/9') === ratio.id
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-md"
                      : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          <SimpleSlider
            label="Arrotondamento Angoli"
            value={getStyleValue('imageBorderRadius', 24)}
            min={0}
            max={60}
            onChange={(val: number) => updateStyle({ imageBorderRadius: val })}
            suffix="px"
          />

          <div className="h-px bg-zinc-100" />

          {/* Overlay globale sulle immagini promo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                Overlay Immagini
                <button
                  onClick={() => updateStyle({ overlayDisabled: !getStyleValue('overlayDisabled', true) })}
                  className={cn(
                    "p-1 rounded transition-colors",
                    getStyleValue('overlayDisabled', true) ? "text-red-500 bg-red-50" : "text-emerald-500 bg-emerald-50"
                  )}
                >
                  {getStyleValue('overlayDisabled', true) ? <EyeOff size={10} /> : <Eye size={10} />}
                </button>
              </label>
            </div>
            {!getStyleValue('overlayDisabled', true) && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block tracking-tighter">Colore Overlay</label>
                  <input
                    type="color"
                    className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                    value={getStyleValue('overlayColor', '#000000')}
                    onChange={(e) => updateStyle({ overlayColor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 flex justify-between tracking-widest">
                    <span>Opacità</span>
                    <span className="text-zinc-900 font-bold">{getStyleValue('overlayOpacity', 40)}%</span>
                  </label>
                  <input
                    type="range" min="0" max="100" step="1"
                    className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                    value={getStyleValue('overlayOpacity', 40)}
                    onChange={(e) => updateStyle({ overlayOpacity: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </Section>

      {/* ITEMS MANAGER */}
      <Section icon={List} label="Elementi Promo" id="items" badge={`${items.length}`} isOpen={openSection === 'items'} onToggle={toggleSection}>
        <div className="flex items-center justify-between mb-4">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Elementi</label>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-sm active:scale-95"
          >
            <Plus size={12} /> Aggiungi
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item: any, i: number) => (
            <div key={i} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 relative group">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Promo #{i + 1}</span>
                <div className="flex gap-1">
                  <button onClick={() => moveItem(i, 'up')} disabled={i === 0} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowUp size={14} /></button>
                  <button onClick={() => moveItem(i, 'down')} disabled={i === items.length - 1} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowDown size={14} /></button>
                  <button onClick={() => removeItem(i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-4">
                <ImageUpload
                  label="Immagine Sfondo"
                  value={resolveImageUrl(item.image, project, imageMemoryCache)}
                  onChange={async (val, filename) => {
                    const relativePath = await uploadImage(val, filename);
                    updateItem(i, { image: relativePath });
                  }}
                />
                <SimpleInput
                  label="Titolo"
                  value={item.title || ''}
                  onChange={(val) => updateItem(i, { title: val })}
                  placeholder="Titolo della promo..."
                />
                <RichTextarea
                  label="Testo"
                  value={item.text || ''}
                  onChange={(val: string) => updateItem(i, { text: val })}
                  placeholder="Descrizione promo..."
                />
                <SimpleInput 
                  label="URL (Link/Azione)"
                  value={item.url || ''}
                  onChange={(val) => updateItem(i, { url: val })}
                  placeholder="/... o https://..."
                />

                <div className="pt-4 border-t border-zinc-100">
                  <CTAManager
                    label="Call to Action"
                    content={item}
                    updateContent={(updates) => updateItem(i, updates)}
                    getStyleValue={(key, def) => (item[key] !== undefined ? item[key] : def)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <CategoryHeader label="Stile della Sezione" />

      {/* LAYOUT & SPACING (Exactly like Hero) */}
      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
        />


      </Section>

      {/* TYPOGRAPHY (Standard like Hero) */}
      <Section icon={Type} label="Tipografia" id="typography" isOpen={openSection === 'typography'} onToggle={toggleSection}>
        <div className="space-y-8">
          <TypographyFields
            label="Stile Titolo Promo"
            sizeKey="itemTitleSize"
            boldKey="itemTitleBold"
            italicKey="itemTitleItalic"
            tagKey="itemTitleTag"
            showTagSelector
            defaultTag="h3"
            updateStyle={updateStyle}
            getStyleValue={getStyleValue}
            defaultValue={32}
          />
          <div className="h-px bg-zinc-100" />
          <TypographyFields
            label="Stile Testo Promo"
            sizeKey="itemTextSize"
            boldKey="itemTextBold"
            italicKey="itemTextItalic"
            updateStyle={updateStyle}
            getStyleValue={getStyleValue}
            defaultValue={18}
          />
        </div>
      </Section>

      {/* SFONDO & COLORI */}
      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <div className="space-y-6">
          <ColorManager
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            project={project}
            showTitle={false}
          />
          <div className="h-px bg-zinc-100" />
          <ManagerWrapper label="Immagine Sfondo">
            <BackgroundManager
              selectedBlock={selectedBlock}
              updateContent={updateContent}
              updateStyle={updateStyle}
              getStyleValue={getStyleValue}
            />
          </ManagerWrapper>
          <div className="h-px bg-zinc-100" />
          <ManagerWrapper label="Pattern Decorativo">
            <PatternManager
              updateStyle={updateStyle}
              getStyleValue={getStyleValue}
            />
          </ManagerWrapper>
        </div>
      </Section>

      <Section icon={Play} label="Animazioni" id="animation" isOpen={openSection === 'animation'} onToggle={toggleSection}>
        <AnimationManager
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
        />
      </Section>

      <Section icon={Settings} label="Avanzate" id="advanced" isOpen={openSection === 'advanced'} onToggle={toggleSection}>
        <BorderShadowManager
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
        />
        <AnchorManager
          selectedBlock={selectedBlock}
          updateContent={updateContent}
        />
      </Section>
    </div>
  );
};
