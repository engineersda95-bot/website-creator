'use client';

import React from 'react';
import { Layout, Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { SectionHeader, SimpleInput, RichTextarea, LayoutGridSlider } from '../SharedSidebarComponents';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface CardsContentProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue?: any) => any;
}

export const CardsContent: React.FC<CardsContentProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue
}) => {
  const { uploadImage, project, imageMemoryCache } = useEditorStore();
  const items = selectedBlock.content.items || [];

  const updateItem = (index: number, updates: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    updateContent({ items: newItems });
  };

  const addItem = () => {
    updateContent({
      items: [
        ...items,
        {
          image: '',
          title: 'Nuovo Titolo',
          subtitle: 'Inserisci qui una breve descrizione.'
        }
      ]
    });
  };

  const removeItem = (index: number) => {
    updateContent({
      items: items.filter((_: any, i: number) => i !== index)
    });
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
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* Intestazione e Layout */}
      <section>
        <SectionHeader icon={Layout} title="Configurazione" colorClass="text-blue-500" />
        <div className="space-y-6">
          <SimpleInput
            label="Titolo Sezione (Opzionale)"
            value={selectedBlock.content.title || ''}
            onChange={(val) => updateContent({ title: val })}
            placeholder="Le nostre eccellenze..."
          />

          <LayoutGridSlider 
            content={selectedBlock.content}
            updateContent={updateContent}
            updateStyle={updateStyle}
            getStyleValue={getStyleValue}
          />
        </div>
      </section>

      {/* Elementi (Cards) */}
      <section className="pt-8 border-t border-zinc-100">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader icon={Plus} title="Elementi" colorClass="text-emerald-500" />
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95"
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

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Immagine Card</label>
                <ImageUpload
                  label="Copertina"
                  value={resolveImageUrl(item.image, project, imageMemoryCache)}
                  onChange={async (val: string, filename?: string) => {
                    const relativePath = await uploadImage(val, filename);
                    updateItem(index, { image: relativePath });
                  }}
                />
              </div>

              <SimpleInput
                label="Titolo"
                value={item.title || ''}
                onChange={(val) => updateItem(index, { title: val })}
                placeholder="Titolo del servizio..."
              />

              <SimpleInput
                label="URL (Link/Azione)"
                value={item.url || ''}
                onChange={(val) => updateItem(index, { url: val })}
                placeholder="/... (relativo) o https://... (assoluto)"
              />

              <RichTextarea
                label="Sottotitolo / Descrizione"
                value={item.subtitle || ''}
                onChange={(val) => updateItem(index, { subtitle: val })}
                placeholder="Descrizione dettagliata..."
              />
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-20 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem]">
              <div className="p-4 bg-white rounded-full shadow-sm inline-flex mb-4 text-zinc-300">
                <ImageIcon size={32} />
              </div>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Nessun elemento presente</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
