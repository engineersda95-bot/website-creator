'use client';

import React from 'react';
import { Layout, Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { SectionHeader, SimpleInput } from '../SharedSidebarComponents';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';

interface LogosContentProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
}

export const LogosContent: React.FC<LogosContentProps> = ({
  selectedBlock,
  updateContent,
}) => {
  const { uploadImage, project, imageMemoryCache } = useEditorStore();
  const items = selectedBlock.content.items || [];

  const updateItem = (index: number, updates: any) => {
    updateContent((prev: any) => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], ...updates };
      return { items: newItems };
    });
  };

  const addItem = () => {
    updateContent((prev: any) => ({
      items: [
        ...(prev.items || []),
        { image: '' }
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
      
      {/* Configurazione Generale */}
      <section>
        <SectionHeader icon={Layout} title="Configurazione" />
        <div className="space-y-6">
          <SimpleInput
            label="Titolo Sezione (Opzionale)"
            value={selectedBlock.content.title || ''}
            onChange={(val) => updateContent({ title: val })}
            placeholder="I nostri partner..."
          />
        </div>
      </section>

      {/* Loghi */}
      <section className="pt-8 border-t border-zinc-100">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader icon={Plus} title="Loghi Partner" />
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95"
          >
            <Plus size={14} /> Aggiungi
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {items.map((item: any, index: number) => (
            <div key={index} className="space-y-4 p-6 bg-zinc-50/50 border border-zinc-100 rounded-[2rem] relative group/item animate-in slide-in-from-right-2 duration-300">
              <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-all z-10">
                <button 
                  onClick={() => moveItem(index, 'up')}
                  className="p-2 bg-white border border-zinc-100 rounded-full shadow-sm text-zinc-400 hover:text-zinc-900 transition-colors"
                  title="Sposta su"
                >
                  <ArrowUp size={14} />
                </button>
                <button 
                  onClick={() => moveItem(index, 'down')}
                  className="p-2 bg-white border border-zinc-100 rounded-full shadow-sm text-zinc-400 hover:text-zinc-900 transition-colors"
                  title="Sposta giù"
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

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Logo #{index + 1}</label>
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
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-20 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem]">
              <div className="p-4 bg-white rounded-full shadow-sm inline-flex mb-4 text-zinc-300">
                <ImageIcon size={32} />
              </div>
              <p className="text-[12px] font-black uppercase text-zinc-400 tracking-widest">Nessun logo aggiunto</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

