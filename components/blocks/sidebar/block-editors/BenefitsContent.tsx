'use client';

import React from 'react';
import { Layout, Plus, Trash2, ArrowUp, ArrowDown, Star, Palette } from 'lucide-react';
import { SectionHeader, SimpleInput, RichTextarea, LayoutGridSlider, IconManager } from '../SharedSidebarComponents';
import { useEditorStore } from '@/store/useEditorStore';
import { cn } from '@/lib/utils';

interface BenefitsContentProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue?: any) => any;
}

export const BenefitsContent: React.FC<BenefitsContentProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue
}) => {
  const { viewport } = useEditorStore();
  const items = selectedBlock.content.items || [];
  const boxStyle = selectedBlock.content.boxStyle || 'plain';
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
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      <section>
        <SectionHeader icon={Layout} title="Configurazione" />
        <div className="space-y-6">
          <SimpleInput
            label="Titolo Sezione"
            value={selectedBlock.content.title || ''}
            onChange={(val) => updateContent({ title: val })}
            placeholder="Perché sceglierci?"
          />
          <RichTextarea
            label="Sottotitolo"
            value={selectedBlock.content.subtitle || ''}
            onChange={(val) => updateContent({ subtitle: val })}
            placeholder="Un'introduzione ai tuoi vantaggi..."
          />

          <LayoutGridSlider 
            content={selectedBlock.content}
            updateContent={updateContent}
            updateStyle={updateStyle}
            getStyleValue={getStyleValue}
            viewport={viewport}
          />

          <div className="pt-4 border-t border-zinc-100">
            <label className="text-[12px] font-bold text-zinc-400 uppercase mb-3 block flex items-center gap-2 tracking-widest pl-1">
               Stile Box
            </label>
            <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
              {[
                { id: 'plain', label: 'Solo Testo' },
                { id: 'card', label: 'Card' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateContent({ boxStyle: item.id })}
                  className={cn(
                    "flex-1 p-2.5 text-[12px] font-black uppercase transition-all",
                    boxStyle === item.id 
                      ? "bg-zinc-900 text-white shadow-lg z-10" 
                      : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {isCard && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Sfondo Card</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="flex-1 h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                    value={selectedBlock.content.cardBgColor || '#ffffff'}
                    onChange={(e) => updateContent({ cardBgColor: e.target.value })}
                  />
                  <button onClick={() => updateContent({ cardBgColor: undefined })} className="p-2 text-zinc-400 hover:text-zinc-900 transition-all border border-dashed rounded-xl"><Trash2 size={14}/></button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo Card</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="flex-1 h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                    value={selectedBlock.content.cardTextColor || '#000000'}
                    onChange={(e) => updateContent({ cardTextColor: e.target.value })}
                  />
                  <button onClick={() => updateContent({ cardTextColor: undefined })} className="p-2 text-zinc-400 hover:text-zinc-900 transition-all border border-dashed rounded-xl"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="pt-8 border-t border-zinc-100">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader icon={Star} title="Vantaggi" />
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
        </div>
      </section>
    </div>
  );
};

