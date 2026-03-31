'use client';

import { cn } from '@/lib/utils';
import {
  Layers,
  Palette,
  Play,
  Plus,
  Settings,
  Star,
  Tag,
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
  ColorManager,
  CTAManager,
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

interface PricingUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const PricingUnified: React.FC<PricingUnifiedProps> = ({
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
    window.addEventListener('pricing-section-focus', handler);
    return () => window.removeEventListener('pricing-section-focus', handler);
  }, [setOpenSection]);

  const updateItem = (index: number, updates: any) => {
    updateContent((prevContent: any) => {
      const currentItems = prevContent.items || [];
      const newItems = [...currentItems];
      newItems[index] = { ...newItems[index], ...updates };
      return { ...prevContent, items: newItems };
    });
  };

  const addItem = () => {
    updateContent((prev: any) => ({
      items: [
        ...(prev.items || []),
        {
          name: 'Nuovo Piano',
          price: '0\u20ac',
          period: '/mese',
          features: ['Caratteristica 1'],
          buttonText: 'Scegli',
          buttonUrl: '#',
          isHighlighted: false
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
      if (direction === 'up' && index === 0) return prev;
      const currentItems = [...(prev.items || [])];
      if (direction === 'down' && index === currentItems.length - 1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [currentItems[index], currentItems[targetIndex]] = [currentItems[targetIndex], currentItems[index]];
      return { ...prev, items: currentItems };
    });
  };

  return (
    <div>
      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          placeholder="I Nostri Piani..."
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

      <Section icon={Type} label="Sottotitolo" id="subtitle" isOpen={openSection === 'subtitle'} onToggle={toggleSection}>
        <RichTextarea
          label="Testo"
          placeholder="Scegli la soluzione pi\u00f9 adatta..."
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

      <Section icon={Layers} label="Layout & Griglia" id="grid" isOpen={openSection === 'grid'} onToggle={toggleSection}>
        <LayoutGridSlider
          content={content}
          updateContent={updateContent}
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          viewport={viewport}
        />
      </Section>

      <Section icon={Tag} label="Piani Tariffari" id="plans" badge={`${items.length}`} isOpen={openSection === 'plans'} onToggle={toggleSection}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Piani</label>
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
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Piano #{index + 1}</span>
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

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <SimpleInput
                    label="Nome Piano"
                    value={item.name || ''}
                    onChange={(val) => updateItem(index, { name: val })}
                    placeholder="es. Base, Premium..."
                  />
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <button
                    onClick={() => updateItem(index, { isHighlighted: !item.isHighlighted })}
                    className={cn(
                      "p-2 rounded-lg border transition-all flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider",
                      item.isHighlighted
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                        : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900"
                    )}
                  >
                    <Star size={12} className={item.isHighlighted ? "fill-white" : ""} />
                    {item.isHighlighted ? "In Risalto" : "Risalto"}
                  </button>
                </div>
              </div>

              {item.isHighlighted && (
                <SimpleInput
                  label="Testo Etichetta (es. Consigliato)"
                  value={item.highlightLabel || ''}
                  onChange={(val) => updateItem(index, { highlightLabel: val })}
                  placeholder="Consigliato"
                />
              )}

              <div className="grid grid-cols-2 gap-3">
                <SimpleInput
                  label="Prezzo"
                  value={item.price || ''}
                  onChange={(val) => updateItem(index, { price: val })}
                  placeholder="es. 0\u20ac, 29\u20ac"
                />
                <SimpleInput
                  label="Recorrenza"
                  value={item.period || ''}
                  onChange={(val) => updateItem(index, { period: val })}
                  placeholder="es. /mese, /anno"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Caratteristiche</label>
                  <button
                    onClick={() => {
                      const features = [...(item.features || []), ''];
                      updateItem(index, { features });
                    }}
                    className="px-2 py-0.5 bg-zinc-900/5 hover:bg-zinc-900/10 text-zinc-600 rounded-md text-[9px] uppercase font-bold tracking-wider transition-all"
                  >
                    + Aggiungi
                  </button>
                </div>
                <div className="space-y-2">
                  {(item.features || []).map((feature: string, fIdx: number) => (
                    <div key={fIdx} className="flex gap-2 group/feature">
                      <div className="flex-1">
                        <SimpleInput
                          label=""
                          value={feature}
                          onChange={(val) => {
                            const newFeatures = [...item.features];
                            newFeatures[fIdx] = val;
                            updateItem(index, { features: newFeatures });
                          }}
                          placeholder="es. Supporto Email..."
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newFeatures = item.features.filter((_: any, i: number) => i !== fIdx);
                          updateItem(index, { features: newFeatures });
                        }}
                        className="mt-1 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/feature:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100">
                <CTAManager
                  content={item}
                  updateContent={(updates) => updateItem(index, updates)}
                  style={selectedBlock.style}
                  updateStyle={updateStyle}
                  getStyleValue={getStyleValue}
                  label="CTA"
                  ctaKey="buttonText"
                  urlKey="buttonUrl"
                  themeKey="buttonTheme"
                />
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-12 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Nessun piano presente</p>
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
        <SimpleSlider
          label="Spaziatura tra Piani (Gap)"
          value={getStyleValue('gap', 32)}
          onChange={(val: number) => updateStyle({ gap: val })}
          max={100} step={4}
        />
      </Section>

      <Section icon={Palette} label="Stile Card" id="cardColors" isOpen={openSection === 'cardColors'} onToggle={toggleSection}>
        <div className="space-y-4">
          <ColorManager
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            project={project}
            bgKey="cardBgColor"
            textKey="cardTextColor"
            showTitle={false}
          />

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
              <Star size={10} className="text-amber-400 fill-amber-400" /> Colore Evidenziatore (Piani Pro)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                value={getStyleValue('highlightColor', '#000000')}
                onChange={(e) => updateStyle({ highlightColor: e.target.value })}
              />
              <button
                onClick={() => updateStyle({ highlightColor: project?.settings?.primaryColor || '#000000' })}
                className="px-3 py-1.5 border rounded-lg text-[9px] uppercase font-bold tracking-wider hover:bg-zinc-50 transition-all whitespace-nowrap"
              >
                Usa Brand
              </button>
            </div>
          </div>

          <SimpleSlider
            label="Arrotondamento Card"
            value={getStyleValue('cardBorderRadius', 24)}
            onChange={(val: number) => updateStyle({ cardBorderRadius: val })}
            max={100}
          />

          <SimpleSlider
            label="Padding Interno Card"
            value={getStyleValue('cardPadding', 40)}
            onChange={(val: number) => updateStyle({ cardPadding: val })}
            max={100} step={4}
          />
        </div>
      </Section>

      <Section icon={Type} label="Tipografia" id="typography" isOpen={openSection === 'typography'} onToggle={toggleSection}>
        <TypographyFields
          label="Nome Piano (Card)"
          sizeKey="planNameSize"
          boldKey="planNameBold"
          italicKey="planNameItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={14}
        />
        <TypographyFields
          label="Prezzo (Card)"
          sizeKey="priceSize"
          boldKey="priceBold"
          italicKey="priceItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={40}
        />
        <TypographyFields
          label="Recorrenza (Card)"
          sizeKey="periodSize"
          boldKey="periodBold"
          italicKey="periodItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={18}
        />
        <TypographyFields
          label="Caratteristiche (Card)"
          sizeKey="featuresSize"
          boldKey="featuresBold"
          italicKey="featuresItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={14}
        />
        <TypographyFields
          label="Etichetta Consigliato (Card)"
          sizeKey="labelSize"
          boldKey="labelBold"
          italicKey="labelItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={10}
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
