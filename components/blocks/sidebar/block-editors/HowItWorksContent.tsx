'use client';

import React from 'react';
import { List, Plus, Trash2, ArrowUp, ArrowDown, Layout, Clock, AlignLeft } from 'lucide-react';
import { SectionHeader, SimpleInput, RichTextarea, LayoutGridSlider } from '../SharedSidebarComponents';
import { useEditorStore } from '@/store/useEditorStore';
import { cn } from '@/lib/utils';

const HIW_VARIANTS = [
  { id: 'cards', label: 'Cards', icon: Layout },
  { id: 'minimal', label: 'Minimal', icon: AlignLeft },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'compact', label: 'Compatto', icon: List },
];

interface HowItWorksContentProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue?: any) => any;
}

export const HowItWorksContent: React.FC<HowItWorksContentProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue
}) => {
  const { viewport } = useEditorStore();
  const items = selectedBlock.content.items || [];

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
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* Variant selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Stile</label>
        <div className="grid grid-cols-4 gap-1.5">
          {HIW_VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => updateContent({ variant: v.id })}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[9px] font-medium transition-all",
                (selectedBlock.content.variant || 'cards') === v.id
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

      <section>
        <SectionHeader icon={List} title="Configurazione" />
        <div className="space-y-6">
          <SimpleInput
            label="Titolo Sezione"
            value={selectedBlock.content.title || ''}
            onChange={(val) => updateContent({ title: val })}
            placeholder="Come lavoriamo?"
          />

          <LayoutGridSlider 
            content={selectedBlock.content}
            updateContent={updateContent}
            updateStyle={updateStyle}
            getStyleValue={getStyleValue}
            viewport={viewport}
          />
        </div>
      </section>

      <section className="pt-8 border-t border-zinc-100">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader icon={Plus} title="Passaggi" />
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
        </div>
      </section>
    </div>
  );
};

