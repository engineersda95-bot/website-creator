'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Image as ImageIcon,
  Layers,
  Link,
  Palette,
  Play,
  Settings,
} from 'lucide-react';
import {
  AnchorManager,
  AnimationManager,
  BackgroundManager,
  BorderShadowManager,
  ColorManager,
  ImageStyleFields,
  LayoutFields,
  PatternManager,
  RichTextarea,
  SimpleInput,
  SimpleSlider,
  LinkSelector,
  UnifiedSection as Section, 
  useUnifiedSections, 
  CategoryHeader, 
  ManagerWrapper
} from '../SharedSidebarComponents';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';

interface SingleImageProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const SingleImage: React.FC<SingleImageProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const { uploadImage, imageMemoryCache } = useEditorStore();
  const { openSection, toggleSection } = useUnifiedSections();

  return (
    <div>
      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={ImageIcon} label="Immagine" id="image" isOpen={openSection === 'image'} onToggle={toggleSection}>
        <ImageUpload
          label="Seleziona Immagine"
          value={resolveImageUrl(selectedBlock.content.image, project, imageMemoryCache)}
          onChange={async (val: string, filename?: string) => {
            const relativePath = await uploadImage(val, filename);
            updateContent({ image: relativePath });
          }}
          altValue={selectedBlock.content.alt ?? ''}
          onAltChange={(alt) => updateContent({ alt })}
          onFilenameSelect={(name) => {
            if (!selectedBlock.content.alt) updateContent({ alt: name });
          }}
        />
      </Section>

      <Section icon={Link} label="Azione (Link)" id="link" isOpen={openSection === 'link'} onToggle={toggleSection}>
        <LinkSelector
          label="URL Destinazione"
          value={selectedBlock.content.url || ''}
          onChange={(val: string) => updateContent({ url: val })}
          placeholder="https://... o /pagina"
        />
        <p className="text-[10px] text-zinc-400 italic pl-1">Lascia vuoto se l'immagine non deve essere cliccabile.</p>
      </Section>

      <Section icon={ImageIcon} label="Stile Immagine" id="imageStyle" isOpen={openSection === 'imageStyle'} onToggle={toggleSection}>
        <SimpleSlider
          label="Larghezza Max Immagine (%)"
          value={getStyleValue('imageMaxWidth', 100)}
          onChange={(val: number) => updateStyle({ imageMaxWidth: val })}
          min={10}
          max={100}
        />

        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block tracking-wider">
            Proporzioni (Aspect Ratio)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: '16/9', label: '16:9' },
              { id: '4/3', label: '4:3' },
              { id: '1/1', label: '1:1' },
              { id: '21/9', label: 'Ultrawide' },
              { id: 'auto', label: 'Originale' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => updateStyle({ imageAspectRatio: item.id })}
                className={cn(
                  "p-2 text-[10px] font-black uppercase transition-all border rounded-lg",
                  getStyleValue('imageAspectRatio', '16/9') === item.id
                    ? "bg-zinc-900 text-white shadow-lg border-zinc-900"
                    : "text-zinc-400 bg-zinc-50 border-zinc-100 hover:text-zinc-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <ImageStyleFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      {/* Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} showTitle={false} />
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
