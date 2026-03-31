'use client';

import { cn } from '@/lib/utils';
import {
  Circle,
  Layers,
  Layout,
  List,
  MessageCircle,
  Palette,
  Play,
  Plus,
  Quote,
  Settings,
  Square,
  Star,
  Trash2,
  ChevronDown,
  ChevronUp,
  Type,
} from 'lucide-react';
import React from 'react';
import {
  AnchorManager,
  AnimationManager,
  BackgroundManager,
  BorderShadowManager,
  LayoutFields,
  LayoutGridSlider,
  PatternManager,
  SimpleInput,
  TypographyFields,
} from '../SharedSidebarComponents';
import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../UnifiedSection';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';

interface QuoteUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

const QUOTE_VARIANTS = [
  { id: 'cards', label: 'Cards', icon: Layout },
  { id: 'minimal', label: 'Minimal', icon: List },
  { id: 'bubble', label: 'Bubble', icon: MessageCircle },
];

export const QuoteUnified: React.FC<QuoteUnifiedProps> = ({
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
    window.addEventListener('quote-section-focus', handler);
    return () => window.removeEventListener('quote-section-focus', handler);
  }, [setOpenSection]);

  const updateSetting = (key: string, value: any) => {
    updateContent({ [key]: value });
  };

  const addReview = () => {
    updateContent((prev: any) => ({
      items: [...(prev.items || []), { text: 'Inserisci qui la recensione.', name: 'Nome Utente', role: 'Ruolo / Azienda', stars: 5 }]
    }));
  };

  const removeReview = (index: number) => {
    updateContent((prev: any) => ({
      items: (prev.items || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const updateReview = (index: number, updates: any) => {
    updateContent((prev: any) => {
      const current = [...(prev.items || [])];
      current[index] = { ...current[index], ...updates };
      return { ...prev, items: current };
    });
  };

  const moveReview = (index: number, direction: 'up' | 'down') => {
    updateContent((prev: any) => {
      const current = [...(prev.items || [])];
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === current.length - 1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [current[index], current[targetIndex]] = [current[targetIndex], current[index]];
      return { ...prev, items: current };
    });
  };

  return (
    <div>
      {/* Variant selector */}
      <div className="px-5 py-4 border-b border-zinc-100">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Stile</label>
        <div className="grid grid-cols-3 gap-1.5">
          {QUOTE_VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => updateContent({ variant: v.id })}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[9px] font-medium transition-all",
                (content.variant || 'cards') === v.id
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

      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          placeholder="es: Cosa dicono di noi"
          value={content.title || ''}
          onChange={(val) => updateSetting('title', val)}
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

      <Section icon={Star} label="Stile Visivo" id="visualType" isOpen={openSection === 'visualType'} onToggle={toggleSection}>
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Icona / Stile</label>
          <div className="flex p-1 bg-zinc-100 rounded-xl gap-1.5">
            {[
              { id: 'quotes', icon: Quote, label: 'Quote' },
              { id: 'stars', icon: Star, label: 'Stelle' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => updateSetting('visualType', t.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                  (content.visualType || 'quotes') === t.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                <t.icon size={14} />
                <span className="text-[10px] font-bold uppercase">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section icon={Circle} label="Avatar Cliente" id="avatar" isOpen={openSection === 'avatar'} onToggle={toggleSection}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase block">Forma</label>
              <div className="flex p-0.5 bg-zinc-100 border border-zinc-200 rounded-lg gap-0.5">
                {[
                  { id: 'circle', icon: Circle, label: 'Cerchio' },
                  { id: 'rect', icon: Square, label: 'Standard' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => updateSetting('avatarShape', s.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 p-1.5 rounded-md transition-all",
                      (content.avatarShape || 'circle') === s.id ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900"
                    )}
                  >
                    <s.icon size={12} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase block">Proporzioni</label>
              <select
                className="w-full p-2 border border-zinc-200 rounded-lg text-[10px] font-bold bg-zinc-50"
                value={content.avatarAspectRatio || '1/1'}
                onChange={(e) => updateSetting('avatarAspectRatio', e.target.value)}
              >
                <option value="1/1">1:1 (Quadrato)</option>
                <option value="4/3">4:3 (Photo)</option>
                <option value="3/4">3:4 (Portrait)</option>
                <option value="16/9">16:9 (Wide)</option>
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Dimensione Avatar</label>
              <span className="text-[10px] font-bold text-zinc-900 bg-white px-2 py-0.5 rounded-full border border-zinc-200">{content.avatarSize || 60}px</span>
            </div>
            <input
              type="range" min="10" max="150" step="2"
              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
              value={content.avatarSize || 60}
              onChange={(e) => updateSetting('avatarSize', parseInt(e.target.value))}
            />
          </div>
        </div>
      </Section>

      <Section icon={MessageCircle} label="Recensioni" id="reviews" badge={`${items.length}`} isOpen={openSection === 'reviews'} onToggle={toggleSection}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Recensioni Personali</label>
          <button
            onClick={addReview}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-sm active:scale-95"
          >
            <Plus size={12} /> Aggiungi
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item: any, i: number) => (
            <div key={i} className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4 relative group animate-in slide-in-from-right-2 duration-200">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-50 pb-2">
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Recensione #{i + 1}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveReview(i, 'up')} disabled={i === 0} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => moveReview(i, 'down')} disabled={i === items.length - 1} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20">
                    <ChevronDown size={14} />
                  </button>
                  <button onClick={() => removeReview(i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[80px,1fr] gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Avatar</label>
                  <div className="scale-90 origin-top-left">
                    <ImageUpload
                      value={resolveImageUrl(item.avatar, project, imageMemoryCache)}
                      onChange={async (val: string, filename?: string) => {
                        const relativePath = await uploadImage(val, filename);
                        updateReview(i, { avatar: relativePath });
                      }}
                      altValue={item.avatarAlt ?? ''}
                      onAltChange={(alt) => updateReview(i, { avatarAlt: alt })}
                      onFilenameSelect={(name) => {
                        if (!item.avatarAlt) updateReview(i, { avatarAlt: name });
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block">Nome</label>
                      <input
                        className="w-full p-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        value={item.name}
                        onChange={(e) => updateReview(i, { name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block">Ruolo</label>
                      <input
                        className="w-full p-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        value={item.role}
                        onChange={(e) => updateReview(i, { role: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase flex justify-between">
                      Valutazione
                      <span className="text-zinc-900 font-bold">{item.stars} &#9733;</span>
                    </label>
                    <input
                      type="range" min="0" max="5" step="1"
                      className="w-full h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                      value={item.stars}
                      onChange={(e) => updateReview(i, { stars: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">Testo Recensione</label>
                <textarea
                  className="w-full h-24 p-3 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none leading-relaxed resize-none"
                  value={item.text}
                  onChange={(e) => updateReview(i, { text: e.target.value })}
                  placeholder="Scrivi qui la recensione..."
                />
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-12 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Nessuna recensione presente</p>
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
      </Section>

      <Section icon={Palette} label="Colori Card" id="cardColors" isOpen={openSection === 'cardColors'} onToggle={toggleSection}>
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Sfondo Card</label>
            <input
              type="color"
              className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
              value={getStyleValue('cardBgColor', '#ffffff')}
              onChange={(e) => updateStyle({ cardBgColor: e.target.value })}
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Testo Card</label>
            <input
              type="color"
              className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
              value={getStyleValue('cardTextColor', '#000000')}
              onChange={(e) => updateStyle({ cardTextColor: e.target.value })}
            />
          </div>
          <button
            onClick={() => updateStyle({ cardBgColor: undefined, cardTextColor: undefined })}
            className="self-end p-1.5 text-zinc-300 hover:text-zinc-600 transition-colors" title="Reset"
          >
            <Settings size={12} />
          </button>
        </div>
      </Section>

      <Section icon={Type} label="Tipografia" id="typography" isOpen={openSection === 'typography'} onToggle={toggleSection}>
        <TypographyFields
          label="Testo Recensione"
          sizeKey="reviewSize"
          boldKey="reviewBold"
          italicKey="reviewItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={18}
        />
        <TypographyFields
          label="Nome Utente"
          sizeKey="nameSize"
          boldKey="nameBold"
          italicKey="nameItalic"
          tagKey="itemTitleTag"
          showTagSelector
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={14}
        />
        <TypographyFields
          label="Ruolo / Azienda"
          sizeKey="roleSize"
          boldKey="roleBold"
          italicKey="roleItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={12}
        />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        {(() => {
          const appearance = project?.settings?.appearance || 'light';
          const defaultBg = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff');
          const defaultText = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000');
          const bgType = getStyleValue('bgType', 'solid');
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Sfondo</label>
                  <input type="color" className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent" value={getStyleValue('backgroundColor', defaultBg)} onChange={(e) => updateStyle({ backgroundColor: e.target.value })} />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Testo</label>
                  <input type="color" className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent" value={getStyleValue('textColor', defaultText)} onChange={(e) => updateStyle({ textColor: e.target.value })} />
                </div>
                <button
                  onClick={() => updateStyle({ backgroundColor: undefined, textColor: undefined, bgType: 'solid', backgroundColor2: undefined, bgDirection: undefined })}
                  className="self-end p-1.5 text-zinc-300 hover:text-zinc-600 transition-colors" title="Reset"
                >
                  <Settings size={12} />
                </button>
              </div>
              <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                {['solid', 'gradient'].map((t) => (
                  <button key={t} onClick={() => updateStyle({ bgType: t })} className={cn("flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all", bgType === t ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
                    {t === 'solid' ? 'Tinta Unita' : 'Gradiente'}
                  </button>
                ))}
              </div>
              {bgType === 'gradient' && (
                <div className="flex items-center gap-3 animate-in fade-in duration-200">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Fine</label>
                    <input type="color" className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent" value={getStyleValue('backgroundColor2', '#f3f4f6')} onChange={(e) => updateStyle({ backgroundColor2: e.target.value })} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Direzione</label>
                    <select className="w-full py-1.5 px-2 border border-zinc-200 rounded-lg text-[10px] font-bold bg-zinc-50" value={getStyleValue('bgDirection', 'to bottom')} onChange={(e) => updateStyle({ bgDirection: e.target.value })}>
                      <option value="to bottom">Alto &rarr; Basso</option>
                      <option value="to top">Basso &rarr; Alto</option>
                      <option value="to right">Sx &rarr; Dx</option>
                      <option value="to left">Dx &rarr; Sx</option>
                      <option value="to bottom right">Inclinato</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
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
