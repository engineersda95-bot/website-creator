'use client';

import { cn } from '@/lib/utils';
import {
  AlignLeft,
  ChevronDown, ChevronUp,
  Columns, Hash,
  HelpCircle,
  Layers,
  List,
  Palette, Settings, Play,
  Plus, Square, Trash2,
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
  SimpleInput,
  SimpleSlider,
  TypographyFields
} from '../SharedSidebarComponents';
import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../UnifiedSection';

interface FaqUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

const FAQ_VARIANTS = [
  { id: 'accordion', label: 'Minimal', icon: List },
  { id: 'classic', label: 'Classico', icon: Square },
  { id: 'side-by-side', label: 'Affiancato', icon: Columns },
  { id: 'numbered', label: 'Numerato', icon: Hash },
];

export const FaqUnified: React.FC<FaqUnifiedProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const content = selectedBlock.content;
  const { openSection, toggleSection } = useUnifiedSections();
  const items: Array<{ question: string; answer: string }> = content.items || [];

  const addItem = () => {
    updateContent({ items: [...items, { question: 'Nuova Domanda', answer: 'Inserisci qui la risposta.' }] });
  };

  const removeItem = (index: number) => {
    updateContent({ items: items.filter((_: any, i: number) => i !== index) });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateContent({ items: newItems });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    updateContent({ items: newItems });
  };

  return (
    <div>
      {/* Variant selector */}
      <div className="px-5 py-4 border-b border-zinc-100">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Layout</label>
        <div className="grid grid-cols-4 gap-1.5">
          {FAQ_VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => updateContent({ variant: v.id })}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[9px] font-medium transition-all",
                (content.variant || 'accordion') === v.id
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
          placeholder="es: Domande Frequenti"
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

      <Section icon={HelpCircle} label="Domande" id="items" badge={`${items.length}`} isOpen={openSection === 'items'} onToggle={toggleSection}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Domande e Risposte</label>
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-800 transition-all"
            >
              <Plus size={10} /> Aggiungi
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-3 relative group animate-in slide-in-from-right-2 duration-200">
                <div className="flex items-center justify-between gap-2 border-b border-zinc-50 pb-2">
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">FAQ #{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveItem(i, 'up')}
                      disabled={i === 0}
                      className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      onClick={() => moveItem(i, 'down')}
                      disabled={i === items.length - 1}
                      className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(i)}
                      className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Domanda</label>
                  <textarea
                    className="w-full p-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none font-bold resize-none"
                    rows={2}
                    placeholder="Inserisci la domanda..."
                    value={item.question}
                    onChange={(e) => updateItem(i, 'question', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Risposta</label>
                  <textarea
                    className="w-full p-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none resize-none leading-relaxed"
                    rows={3}
                    placeholder="Inserisci la risposta..."
                    value={item.answer}
                    onChange={(e) => updateItem(i, 'answer', e.target.value)}
                  />
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Nessuna domanda. Clicca aggiungi per iniziare.</p>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Global Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
        <div className="pt-4 border-t border-zinc-100 space-y-4">
          <SimpleSlider
            label="Distanza Titolo-FAQ (Gap)"
            value={getStyleValue('gap', 64)}
            onChange={(val: number) => updateStyle({ gap: val })}
            max={200} step={4}
          />
          <SimpleSlider
            label="Larghezza Massima Sezione"
            value={getStyleValue('maxWidth', 800)}
            onChange={(val: number) => updateStyle({ maxWidth: val })}
            min={400} max={1400} step={50}
          />
        </div>
      </Section>

      <Section icon={Type} label="Tipografia" id="typography" isOpen={openSection === 'typography'} onToggle={toggleSection}>
        <div className="space-y-4">
          <TypographyFields
            label="Dimensione Domande"
            sizeKey="itemTitleSize"
            boldKey="itemTitleBold"
            italicKey="itemTitleItalic"
            tagKey="itemTitleTag"
            showTagSelector={true}
            defaultTag="h3"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={18}
          />
          <TypographyFields
            label="Dimensione Risposte"
            sizeKey="answerSize"
            boldKey="answerBold"
            italicKey="answerItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={16}
          />
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
    </div>
  );
};
