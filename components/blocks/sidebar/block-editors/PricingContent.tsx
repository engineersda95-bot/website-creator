import React from 'react';
import { Layout, Tag, Plus, Trash2, ArrowUp, ArrowDown, Star } from 'lucide-react';
import { SectionHeader, SimpleInput, RichTextarea, LayoutGridSlider, ColorManager } from '../SharedSidebarComponents';
import { useEditorStore } from '@/store/useEditorStore';
import { cn } from '@/lib/utils';
import { CTAManager } from '../managers/CTAManager';

interface PricingContentProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue?: any) => any;
}

export const PricingContent: React.FC<PricingContentProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue
}) => {
  const { viewport } = useEditorStore();
  const items = selectedBlock.content.items || [];

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
          price: '0€',
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
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">

      {/* 1. Intestazione e Layout */}
      <section>
        <SectionHeader icon={Layout} title="Configurazione" />
        <div className="space-y-6">
          <SimpleInput
            label="Titolo Sezione"
            value={selectedBlock.content.title || ''}
            onChange={(val) => updateContent({ title: val })}
            placeholder="I Nostri Piani..."
          />
          <SimpleInput
            label="Sottotitolo Sezione"
            value={selectedBlock.content.subtitle || ''}
            onChange={(val) => updateContent({ subtitle: val })}
            placeholder="Scegli la soluzione più adatta..."
          />
        </div>
      </section>

      {/* 2. Piani (Tiers) */}
      <section className="pt-8 border-t border-zinc-100">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader icon={Tag} title="Piani Tariffari" />
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95"
          >
            <Plus size={14} /> Aggiungi
          </button>
        </div>

        <div className="space-y-12">
          {items.map((item: any, index: number) => (
            <div key={index} className="space-y-6 p-6 bg-zinc-50/50 border border-zinc-100 rounded-[2.5rem] relative group/item animate-in slide-in-from-right-2 duration-300">
              <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-all">
                <button
                  onClick={() => moveItem(index, 'up')}
                  className="p-2 bg-white border border-zinc-100 rounded-full shadow-sm text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  className="p-2 bg-white border border-zinc-100 rounded-full shadow-sm text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => removeItem(index)}
                  className="p-2 bg-white border border-red-100 rounded-full shadow-sm text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <SimpleInput
                    label="Nome Piano"
                    value={item.name || ''}
                    onChange={(val) => updateItem(index, { name: val })}
                    placeholder="es. Base, Premium..."
                  />
                </div>
                <button
                  onClick={() => updateItem(index, { isHighlighted: !item.isHighlighted })}
                  className={cn(
                    "mt-6 p-3 rounded-xl border transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest",
                    item.isHighlighted
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-lg"
                      : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900"
                  )}
                >
                  <Star size={14} className={item.isHighlighted ? "fill-white" : ""} />
                  {item.isHighlighted ? "Messo in Risalto" : "Metti in Risalto"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SimpleInput
                  label="Prezzo"
                  value={item.price || ''}
                  onChange={(val) => updateItem(index, { price: val })}
                  placeholder="es. 0€, 29€"
                />
                <SimpleInput
                  label="Recorrenza"
                  value={item.period || ''}
                  onChange={(val) => updateItem(index, { period: val })}
                  placeholder="es. /mese, /anno"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Caratteristiche</label>
                  <button
                    onClick={() => {
                      const features = [...(item.features || []), ''];
                      updateItem(index, { features });
                    }}
                    className="p-1 px-3 bg-zinc-900/5 hover:bg-zinc-900/10 text-zinc-600 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all"
                  >
                    + Aggiungi
                  </button>
                </div>
                <div className="space-y-3">
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
                        className="mt-1 p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/feature:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100">
                <CTAManager
                  content={item}
                  updateContent={(updates) => updateItem(index, updates)}
                  label="CTA"
                  ctaKey="buttonText"
                  urlKey="buttonUrl"
                  themeKey="buttonTheme"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
