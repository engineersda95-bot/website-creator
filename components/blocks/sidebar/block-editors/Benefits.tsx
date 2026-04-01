'use client';

import { cn } from '@/lib/utils';
import {
  AlignLeft,
  Grid, LayoutGrid, List, AlignCenter,
  Layers,
  Palette, Settings, Play,
  Plus, Trash2, ArrowUp, ArrowDown,
  Star,
  Type,
} from 'lucide-react';
import React from 'react';
import {
  AnchorManager, AnimationManager,
  BackgroundManager,
  BorderShadowManager,
  ColorManager,
  IconManager,
  LayoutFields,
  LayoutGridSlider,
  PatternManager,
  RichTextarea,
  SimpleInput,
  SimpleSlider,
  TypographyFields,
  UnifiedSection as Section, 
  useUnifiedSections, 
  CategoryHeader, 
  ManagerWrapper
} from '../SharedSidebarComponents';
import { useEditorStore } from '@/store/useEditorStore';

interface BenefitsProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const Benefits: React.FC<BenefitsProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const content = selectedBlock.content;
  const { openSection, toggleSection } = useUnifiedSections();
  const { viewport } = useEditorStore();
  const items = content.items || [];
  const boxStyle = content.boxStyle || 'plain';
  const isCard = boxStyle === 'card';

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
          icon: 'Star',
          title: 'Vantaggio',
          description: 'Spiegazione del beneficio per l\'utente.'
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
      {/* Components */}
      {/* Variant selector */}
      <div className="px-5 py-4 border-b border-zinc-100">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Stile</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'cards', label: 'Cards', icon: LayoutGrid },
            { id: 'minimal', label: 'Minimal', icon: AlignLeft },
            { id: 'centered', label: 'Centrato', icon: AlignCenter },
            { id: 'list', label: 'Lista', icon: List },
          ].map((v) => (
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

      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          placeholder="Perché sceglierci?"
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
          defaultValue={48}
        />
      </Section>

      <Section icon={AlignLeft} label="Sottotitolo" id="subtitle" isOpen={openSection === 'subtitle'} onToggle={toggleSection}>
        <RichTextarea
          label="Testo"
          placeholder="Un'introduzione ai tuoi vantaggi..."
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
          defaultValue={20}
        />
      </Section>

      <Section icon={Star} label="Vantaggi" id="items" badge={`${items.length}`} isOpen={openSection === 'items'} onToggle={toggleSection}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Elementi</label>
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-800 transition-all"
            >
              <Plus size={10} /> Aggiungi
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <div key={index} className="space-y-3 p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl relative group/item animate-in slide-in-from-right-2 duration-300">
                <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">#{index + 1}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveItem(index, 'up')} className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"><ArrowUp size={12} /></button>
                    <button onClick={() => moveItem(index, 'down')} className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"><ArrowDown size={12} /></button>
                    <button onClick={() => removeItem(index)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>

                <IconManager
                  label="Icona (Nome Lucide)"
                  value={item.icon || 'Star'}
                  onChange={(val) => updateItem(index, { icon: val })}
                />

                <SimpleInput
                  label="Titolo Vantaggio"
                  value={item.title || ''}
                  onChange={(val) => updateItem(index, { title: val })}
                  placeholder="Velocità, Qualità, etc."
                />

                <RichTextarea
                  label="Descrizione"
                  value={item.description || ''}
                  onChange={(val) => updateItem(index, { description: val })}
                  placeholder="Dettagli sul vantaggio..."
                />
              </div>
            ))}

            {items.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Nessun vantaggio. Clicca aggiungi per iniziare.</p>
              </div>
            )}
          </div>
        </div>

        {/* Item typography */}
        <div className="pt-4 border-t border-zinc-100 space-y-4">
          <TypographyFields
            label="Titolo Vantaggio"
            sizeKey="itemTitleSize"
            boldKey="itemTitleBold"
            italicKey="itemTitleItalic"
            tagKey="itemTitleTag"
            showTagSelector={true}
            defaultTag="h3"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={22}
          />
          <TypographyFields
            label="Descrizione Vantaggio"
            sizeKey="itemSubtitleSize"
            boldKey="itemSubtitleBold"
            italicKey="itemSubtitleItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={16}
          />
        </div>
      </Section>

      <Section icon={Grid} label="Layout & Griglia" id="grid" isOpen={openSection === 'grid'} onToggle={toggleSection}>
        <LayoutGridSlider
          content={content}
          updateContent={updateContent}
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          viewport={viewport}
        />

        {/* Box style */}
        <div className="pt-4 border-t border-zinc-100">
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Stile Box</label>
          <div className="flex border rounded-lg overflow-hidden bg-zinc-50">
            {[
              { id: 'plain', label: 'Solo Testo' },
              { id: 'card', label: 'Card' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => updateContent({ boxStyle: item.id })}
                className={cn(
                  "flex-1 py-2 text-[10px] font-bold uppercase transition-all",
                  boxStyle === item.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {isCard && (
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Sfondo Card</label>
              <div className="flex gap-1.5">
                <input
                  type="color"
                  className="flex-1 h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                  value={content.cardBgColor || '#ffffff'}
                  onChange={(e) => updateContent({ cardBgColor: e.target.value })}
                />
                <button onClick={() => updateContent({ cardBgColor: undefined })} className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-all border border-dashed rounded-lg"><Trash2 size={10}/></button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Testo Card</label>
              <div className="flex gap-1.5">
                <input
                  type="color"
                  className="flex-1 h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                  value={content.cardTextColor || '#000000'}
                  onChange={(e) => updateContent({ cardTextColor: e.target.value })}
                />
                <button onClick={() => updateContent({ cardTextColor: undefined })} className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-all border border-dashed rounded-lg"><Trash2 size={10}/></button>
              </div>
            </div>
          </div>
        )}

        {/* Card style sliders */}
        <div className="pt-4 border-t border-zinc-100 space-y-4">
          <SimpleSlider
            label="Grandezza Icone"
            value={getStyleValue('iconSize', 40)}
            onChange={(val: number) => updateStyle({ iconSize: val })}
            min={16} max={120}
          />
          <SimpleSlider
            label="Arrotondamento Card"
            value={getStyleValue('cardBorderRadius', 24)}
            onChange={(val: number) => updateStyle({ cardBorderRadius: val })}
            max={100}
          />
          <SimpleSlider
            label="Padding Interno Card"
            value={getStyleValue('cardPadding', 32)}
            onChange={(val: number) => updateStyle({ cardPadding: val })}
            max={100} step={4}
          />
        </div>
      </Section>

      {/* Global Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
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
