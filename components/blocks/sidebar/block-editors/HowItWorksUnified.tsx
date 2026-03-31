'use client';

import { cn } from '@/lib/utils';
import {
  AlignLeft,
  Clock,
  Layers,
  Layout,
  List,
  Palette,
  Play,
  Plus,
  Settings,
  Trash2,
  ArrowUp,
  ArrowDown,
  Type,
} from 'lucide-react';
import React from 'react';
import {
  AnchorManager,
  AnimationManager,
  BackgroundManager,
  BorderShadowManager,
  LayoutFields,
  LayoutGridSlider,
  PatternManager,
  RichTextarea,
  SimpleInput,
  SimpleSlider,
  TypographyFields,
} from '../SharedSidebarComponents';
import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../UnifiedSection';
import { useEditorStore } from '@/store/useEditorStore';

interface HowItWorksUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

const HIW_VARIANTS = [
  { id: 'cards', label: 'Cards', icon: Layout },
  { id: 'minimal', label: 'Minimal', icon: AlignLeft },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'compact', label: 'Compatto', icon: List },
];

export const HowItWorksUnified: React.FC<HowItWorksUnifiedProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const { viewport } = useEditorStore();
  const content = selectedBlock.content;
  const items = content.items || [];
  const { openSection, setOpenSection, toggleSection } = useUnifiedSections();

  React.useEffect(() => {
    const handler = (e: Event) => {
      const sectionId = (e as CustomEvent).detail;
      if (sectionId) setOpenSection(sectionId);
    };
    window.addEventListener('howitworks-section-focus', handler);
    return () => window.removeEventListener('howitworks-section-focus', handler);
  }, [setOpenSection]);

  const updateItem = (index: number, updates: any) => {
    updateContent((prev: any) => {
      const currentItems = [...(prev.items || [])];
      currentItems[index] = { ...currentItems[index], ...updates };
      return { items: currentItems };
    });
  };

  const addItem = () => {
    updateContent((prev: any) => ({
      items: [
        ...(prev.items || []),
        {
          number: ((prev.items || []).length + 1).toString(),
          title: 'Nuovo Step',
          description: 'Descrivi questo passaggio.'
        }
      ]
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
      {/* Variant selector */}
      <div className="px-5 py-4 border-b border-zinc-100">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Stile</label>
        <div className="grid grid-cols-4 gap-1.5">
          {HIW_VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => updateContent({ variant: v.id })}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[9px] font-medium transition-all",
                (content.variant || 'cards') === v.id
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
          placeholder="Come lavoriamo?"
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

      <Section icon={Layout} label="Disposizione & Griglia" id="grid" isOpen={openSection === 'grid'} onToggle={toggleSection}>
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Disposizione</label>
          <div className="flex border rounded-lg overflow-hidden bg-zinc-50">
            {[
              { id: 'grid', label: 'Orizzontale' },
              { id: 'linear', label: 'Verticale' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => updateStyle({ layout: item.id })}
                className={cn(
                  "flex-1 py-2 text-[10px] font-bold uppercase transition-all",
                  getStyleValue('layout', 'grid') === item.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {getStyleValue('layout', 'grid') === 'grid' && (
          <LayoutGridSlider
            content={content}
            updateContent={updateContent}
            updateStyle={updateStyle}
            getStyleValue={getStyleValue}
            viewport={viewport}
          />
        )}
      </Section>

      <Section icon={List} label="Passaggi" id="steps" badge={`${items.length}`} isOpen={openSection === 'steps'} onToggle={toggleSection}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Passaggi</label>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-sm active:scale-95"
          >
            <Plus size={12} /> Aggiungi
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <div key={index} className="space-y-4 p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm relative group/item animate-in slide-in-from-right-2 duration-200">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-50 pb-2">
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Step #{index + 1}</span>
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

              <SimpleInput
                label="Numero/Label Step"
                value={item.number || ''}
                onChange={(val) => updateItem(index, { number: val })}
                placeholder="1, 2, A, B..."
              />

              <SimpleInput
                label="Titolo"
                value={item.title || ''}
                onChange={(val) => updateItem(index, { title: val })}
                placeholder="Titolo passaggio..."
              />

              <RichTextarea
                label="Descrizione"
                value={item.description || ''}
                onChange={(val) => updateItem(index, { description: val })}
                placeholder="Dettagli passaggio..."
              />
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-12 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Nessun passaggio presente</p>
            </div>
          )}
        </div>
      </Section>

      {/* Global Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
        {content?.layout === 'slider' && (
          <SimpleSlider
            label="Padding Laterale Slider"
            min={0}
            max={120}
            step={4}
            value={getStyleValue('sliderPadding', 48)}
            onChange={(val) => updateStyle({ sliderPadding: val })}
          />
        )}
      </Section>

      {content.variant !== 'minimal' && (
        <Section icon={Palette} label="Colori Numeri" id="numberColors" isOpen={openSection === 'numberColors'} onToggle={toggleSection}>
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Sfondo Numero</label>
              <input
                type="color"
                className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                value={getStyleValue('numberBgColor', project?.settings?.primaryColor || '#000000')}
                onChange={(e) => updateStyle({ numberBgColor: e.target.value })}
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Testo Numero</label>
              <input
                type="color"
                className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                value={getStyleValue('numberTextColor', '#ffffff')}
                onChange={(e) => updateStyle({ numberTextColor: e.target.value })}
              />
            </div>
            <button
              onClick={() => updateStyle({ numberBgColor: undefined, numberTextColor: undefined })}
              className="self-end p-1.5 text-zinc-300 hover:text-zinc-600 transition-colors" title="Reset"
            >
              <Settings size={12} />
            </button>
          </div>
        </Section>
      )}

      <Section icon={Type} label="Tipografia" id="typography" isOpen={openSection === 'typography'} onToggle={toggleSection}>
        <TypographyFields
          label="Titolo Passaggio"
          sizeKey="itemTitleSize"
          boldKey="itemTitleBold"
          italicKey="itemTitleItalic"
          tagKey="itemTitleTag"
          showTagSelector
          defaultTag="h3"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={24}
        />
        <TypographyFields
          label="Descrizione Passaggio"
          sizeKey="itemDescSize"
          boldKey="itemDescBold"
          italicKey="itemDescItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={16}
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
                      <option value="to bottom">Alto &rarr; Basso</option>
                      <option value="to top">Basso &rarr; Alto</option>
                      <option value="to right">Sx &rarr; Dx</option>
                      <option value="to left">Dx &rarr; Sx</option>
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
