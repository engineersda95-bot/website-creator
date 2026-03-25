'use client';

import React from 'react';
import { ImageIcon, Link } from 'lucide-react';
import { SectionHeader, SimpleInput } from '../SharedSidebarComponents';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';

interface SingleImageContentProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue?: any) => any;
}

export const SingleImageContent: React.FC<SingleImageContentProps> = ({
  selectedBlock,
  updateContent,
}) => {
  const { uploadImage, project, imageMemoryCache } = useEditorStore();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      <section>
        <SectionHeader icon={ImageIcon} title="Immagine" />
        <div className="space-y-6">
          <ImageUpload
            label="Seleziona Immagine"
            value={resolveImageUrl(selectedBlock.content.image, project, imageMemoryCache)}
            onChange={async (val: string, filename?: string) => {
              const relativePath = await uploadImage(val, filename);
              updateContent({ image: relativePath });
            }}
          />

          <SimpleInput
            label="Testo Alternativo (SEO)"
            value={selectedBlock.content.alt || ''}
            onChange={(val) => updateContent({ alt: val })}
            placeholder="Descrizione per i motori di ricerca..."
          />
        </div>
      </section>

      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Link} title="Azione (Link)" />
        <div className="space-y-6">
          <SimpleInput
            label="URL Destinazione"
            value={selectedBlock.content.url || ''}
            onChange={(val) => updateContent({ url: val })}
            placeholder="https://... o /pagina"
          />
          <p className="text-[10px] text-zinc-400 italic pl-1">Lascia vuoto se l'immagine non deve essere cliccabile.</p>
        </div>
      </section>
    </div>
  );
};
