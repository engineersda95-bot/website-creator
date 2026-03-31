'use client';

import React from 'react';
import { Layout, Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { SectionHeader, SimpleInput } from '../SharedSidebarComponents';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';
import { toast } from '@/components/shared/Toast';

interface GalleryContentProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue?: any) => any;
}

export const GalleryContent: React.FC<GalleryContentProps> = ({
  selectedBlock,
  updateContent,
}) => {
  const { uploadImage, project, imageMemoryCache } = useEditorStore();
  const images = selectedBlock.content.images || [];

  const updateImage = (index: number, updates: any) => {
    updateContent((prevContent: any) => {
      const currentImages = prevContent.images || [];
      const newImages = [...currentImages];
      newImages[index] = { ...newImages[index], ...updates };
      return { ...prevContent, images: newImages };
    });
  };

  const addImage = () => {
    if (images.length >= 15) {
      toast("Il limite massimo consigliato è di 15 immagini per galleria.", 'info');
      return;
    }
    updateContent((prev: any) => ({
      images: [
        ...(prev.images || []),
        { image: '', alt: '' }
      ]
    }));
  };

  const removeImage = (index: number) => {
    updateContent((prev: any) => ({
      images: (prev.images || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    updateContent((prev: any) => {
      if (direction === 'up' && index === 0) return prev;
      const currentImages = [...(prev.images || [])];
      if (direction === 'down' && index === currentImages.length - 1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [currentImages[index], currentImages[targetIndex]] = [currentImages[targetIndex], currentImages[index]];
      return { images: currentImages };
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* Intestazione */}
      <section>
        <SectionHeader icon={Layout} title="Configurazione" />
        <div className="space-y-6">
          <SimpleInput
            label="Titolo Galleria (Opzionale)"
            value={selectedBlock.content.title || ''}
            onChange={(val) => updateContent({ title: val })}
            placeholder="La nostra galleria..."
          />
        </div>
      </section>

      {/* Immagini */}
      <section className="pt-8 border-t border-zinc-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <SectionHeader icon={ImageIcon} title="Immagini" />
            <p className="text-xs text-zinc-500 mt-1 pl-7">Massimo 15 immagini consigliate.</p>
          </div>
          <button
            onClick={addImage}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95"
          >
            <Plus size={14} /> Aggiungi
          </button>
        </div>

        <div className="space-y-8">
          {images.map((item: any, index: number) => (
            <div key={index} className="space-y-4 p-5 bg-zinc-50/50 border border-zinc-100 rounded-[2rem] relative group/item animate-in slide-in-from-right-2 duration-300">
              <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-all z-10">
                <button 
                  onClick={() => moveImage(index, 'up')}
                  className="p-2 bg-white border border-zinc-100 rounded-full shadow-sm text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <ArrowUp size={14} />
                </button>
                <button 
                  onClick={() => moveImage(index, 'down')}
                  className="p-2 bg-white border border-zinc-100 rounded-full shadow-sm text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <ArrowDown size={14} />
                </button>
                <button 
                  onClick={() => removeImage(index)}
                  className="p-2 bg-white border border-red-100 rounded-full shadow-sm text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <ImageUpload
                label={`Immagine ${index + 1}`}
                value={resolveImageUrl(item.image, project, imageMemoryCache)}
                onChange={async (val: string, filename?: string) => {
                  const relativePath = await uploadImage(val, filename);
                  updateImage(index, { image: relativePath });
                }}
                altValue={item.alt ?? ''}
                onAltChange={(alt) => updateImage(index, { alt })}
                onFilenameSelect={(name) => {
                  if (!item.alt) updateImage(index, { alt: name });
                }}
              />
            </div>
          ))}

          {images.length === 0 && (
            <div className="text-center py-20 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem]">
              <div className="p-4 bg-white rounded-full shadow-sm inline-flex mb-4 text-zinc-300">
                <ImageIcon size={32} />
              </div>
              <p className="text-[12px] font-black uppercase text-zinc-400 tracking-widest">Nessuna immagine presente</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
