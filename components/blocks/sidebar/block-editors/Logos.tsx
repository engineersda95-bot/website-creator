'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Image as ImageIcon,
  Layers,
  Maximize2,
  Palette,
  Play,
  Plus,
  Settings,
  Trash2,
  ArrowUp,
  ArrowDown,
  Type,
  Zap,
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
  UnifiedSection as Section, 
  useUnifiedSections, 
  CategoryHeader, 
  ManagerWrapper
} from '../SharedSidebarComponents';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';

interface LogosProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const Logos: React.FC<LogosProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const { uploadImage, imageMemoryCache } = useEditorStore();
  const items = selectedBlock.content.items || [];
  const { openSection, toggleSection } = useUnifiedSections();

  const updateItem = (index: number, updates: any) => {
    updateContent((prev: any) => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], ...updates };
      return { items: newItems };
    });
  };

  const addItem = () => {
    updateContent((prev: any) => ({
      items: [...(prev.items || []), { image: '' }]
    }));
  };

  const removeItem = (index: number) => {
    updateContent((prev: any) => ({
      items: (prev.items || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    updateContent((prev: any) => {
      const currentItems = [...(prev.items || [])];
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === currentItems.length - 1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [currentItems[index], currentItems[targetIndex]] = [currentItems[targetIndex], currentItems[index]];
      return { items: currentItems };
    });
  };

  return (
    <div>
      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Titolo Sezione"
          placeholder="I nostri partner..."
          value={selectedBlock.content.title || ''}
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

      <Section icon={ImageIcon} label="Loghi Partner" id="logos" badge={`${items.length}`} isOpen={openSection === 'logos'} onToggle={toggleSection}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Loghi</label>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-sm active:scale-95"
          >
            <Plus size={12} /> Aggiungi
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <div key={index} className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4 relative group animate-in slide-in-from-right-2 duration-200">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-50 pb-2">
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Logo #{index + 1}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20">
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => removeItem(index)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <ImageUpload
                label="Carica Logo"
                value={resolveImageUrl(item.image, project, imageMemoryCache)}
                onChange={async (val: string, filename?: string) => {
                  const relativePath = await uploadImage(val, filename);
                  updateItem(index, { image: relativePath });
                }}
                altValue={item.alt ?? ''}
                onAltChange={(alt) => updateItem(index, { alt })}
                onFilenameSelect={(name) => {
                  if (!item.alt) updateItem(index, { alt: name });
                }}
              />
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-12 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Nessun logo aggiunto</p>
            </div>
          )}
        </div>
      </Section>

      <Section icon={Maximize2} label="Design Loghi" id="design" isOpen={openSection === 'design'} onToggle={toggleSection}>
        <SimpleSlider
          label="Larghezza Max Logo"
          value={getStyleValue('logoWidth', 120)}
          onChange={(val) => updateStyle({ logoWidth: val })}
          min={50}
          max={300}
          step={10}
          suffix="px"
        />

        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Aspect Ratio</label>
          <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
            {[
              { label: 'Originale', value: 'original' },
              { label: '1:1', value: '1:1' },
              { label: '3:2', value: '3:2' },
              { label: '16:9', value: '16:9' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateStyle({ aspectRatio: opt.value })}
                className={cn(
                  "flex-1 p-2.5 text-[10px] font-black uppercase transition-all tracking-tighter",
                  getStyleValue('aspectRatio', '1:1') === opt.value
                    ? "bg-zinc-900 text-white shadow-lg z-10"
                    : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
          <div className="space-y-0.5">
            <label className="text-[10px] font-black uppercase text-zinc-900 tracking-wider block">Filtro Bianco e Nero</label>
            <p className="text-[10px] text-zinc-400 font-medium tracking-tight">Applica l'effetto grayscale</p>
          </div>
          <div className="flex bg-white p-0.5 rounded-lg border border-zinc-200">
            {[
              { id: true, label: 'SI' },
              { id: false, label: 'NO' }
            ].map((opt) => (
              <button
                key={String(opt.id)}
                onClick={() => updateStyle({ grayscale: opt.id })}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-black uppercase rounded-md transition-all",
                  getStyleValue('grayscale', true) === opt.id
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section icon={Zap} label="Marquee & Scroll" id="marquee" isOpen={openSection === 'marquee'} onToggle={toggleSection}>
        <SimpleSlider
          label="Velocità"
          value={getStyleValue('scrollSpeed', 40)}
          onChange={(val) => updateStyle({ scrollSpeed: val })}
          min={2}
          max={60}
          step={1}
          suffix="s"
        />
        <div className="p-3 bg-zinc-900/[0.03] rounded-xl border border-zinc-100">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1 leading-relaxed">
            <span className="text-zinc-900">Nota:</span> Valori bassi = Molto veloce, Valori alti = Molto lento
          </p>
        </div>
        <SimpleSlider
          label="Distanza tra Loghi (Gap)"
          value={getStyleValue('gap', 40)}
          onChange={(val) => updateStyle({ gap: val })}
          min={10}
          max={120}
          step={5}
          suffix="px"
        />
      </Section>

      {/* Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          showAlign={false}
        />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <ColorManager
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          project={project}
          showTitle={false}
        />
        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Immagine Sfondo">
          <BackgroundManager
            selectedBlock={selectedBlock}
            updateStyle={updateStyle}
            updateContent={updateContent}
            getStyleValue={getStyleValue}
          />
        </ManagerWrapper>
        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Pattern Decorativo">
          <PatternManager
            updateStyle={updateStyle}
            getStyleValue={getStyleValue}
          />
        </ManagerWrapper>
      </Section>

      <Section icon={Play} label="Animazioni" id="animation" isOpen={openSection === 'animation'} onToggle={toggleSection}>
        <AnimationManager
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
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
