'use client';

import { cn } from '@/lib/utils';
import {
  Image as ImageIcon,
  Layers,
  List,
  Palette,
  Play,
  Plus,
  Settings,
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
  ImageStyleFields,
  LayoutFields,
  LayoutGridSlider,
  PatternManager,
  RichTextarea,
  SimpleInput,
  SimpleSlider,
  TypographyFields,
  LinkSelector,
  UnifiedSection as Section, 
  useUnifiedSections, 
  CategoryHeader, 
  ManagerWrapper
} from '../SharedSidebarComponents';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';

interface CardsProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const Cards: React.FC<CardsProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const { uploadImage, imageMemoryCache, viewport } = useEditorStore();
  const content = selectedBlock.content;
  const items = content.items || [];
  const { openSection, setOpenSection, toggleSection } = useUnifiedSections();

  React.useEffect(() => {
    const handler = (e: Event) => {
      const sectionId = (e as CustomEvent).detail;
      if (sectionId) setOpenSection(sectionId);
    };
    window.addEventListener('cards-section-focus', handler);
    return () => window.removeEventListener('cards-section-focus', handler);
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
          image: '',
          title: 'Nuovo Titolo',
          subtitle: 'Inserisci qui una breve descrizione.'
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
      return { items: currentItems };
    });
  };

  return (
    <div>
      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          placeholder="Le nostre eccellenze..."
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

      <Section icon={Layers} label="Layout & Griglia" id="grid" isOpen={openSection === 'grid'} onToggle={toggleSection}>
        <LayoutGridSlider
          content={content}
          updateContent={updateContent}
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          viewport={viewport}
        />
      </Section>

      <Section icon={List} label="Cards" id="cards" badge={`${items.length}`} isOpen={openSection === 'cards'} onToggle={toggleSection}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Elementi</label>
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
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Card #{index + 1}</span>
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

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">Immagine Card</label>
                <ImageUpload
                  label="Copertina"
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

              <SimpleInput
                label="Titolo"
                value={item.title || ''}
                onChange={(val) => updateItem(index, { title: val })}
                placeholder="Titolo del servizio..."
              />

              <LinkSelector
                label="URL (Link/Azione)"
                value={item.url || ''}
                onChange={(val: string) => updateItem(index, { url: val })}
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
            <div className="text-center py-12 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl">
              <div className="p-3 bg-white rounded-full shadow-sm inline-flex mb-3 text-zinc-300">
                <ImageIcon size={24} />
              </div>
              <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Nessun elemento presente</p>
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
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Proporzioni Immagine (Aspect Ratio)</label>
          <div className="flex border rounded-lg overflow-hidden bg-zinc-50">
            {[
              { id: '16/9', label: '16:9' },
              { id: '4/3', label: '4:3' },
              { id: '1/1', label: '1:1' },
              { id: '2/3', label: 'Portrait' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => updateStyle({ imageAspectRatio: item.id })}
                className={cn(
                  "flex-1 py-2 text-[10px] font-bold uppercase transition-all",
                  getStyleValue('imageAspectRatio', '16/9') === item.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section icon={ImageIcon} label="Stile Immagine" id="imageStyle" isOpen={openSection === 'imageStyle'} onToggle={toggleSection}>
        <ImageStyleFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
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
          <SimpleSlider
            label="Arrotondamento Card"
            value={getStyleValue('cardBorderRadius', 32)}
            onChange={(val: number) => updateStyle({ cardBorderRadius: val })}
            max={100}
          />
          <SimpleSlider
            label="Padding Card"
            value={getStyleValue('cardPadding', 32)}
            onChange={(val: number) => updateStyle({ cardPadding: val })}
            max={100} step={4}
          />
        </div>
      </Section>

      <Section icon={Type} label="Tipografia" id="typography" isOpen={openSection === 'typography'} onToggle={toggleSection}>
        <TypographyFields
          label="Titolo Card"
          sizeKey="cardTitleSize"
          boldKey="cardTitleBold"
          italicKey="cardTitleItalic"
          tagKey="itemTitleTag"
          showTagSelector
          defaultTag="h3"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={28}
        />
        <TypographyFields
          label="Sottotitolo Card"
          sizeKey="cardSubtitleSize"
          boldKey="cardSubtitleBold"
          italicKey="cardSubtitleItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={16}
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
