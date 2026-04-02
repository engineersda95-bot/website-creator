'use client';

import { cn } from '@/lib/utils';
import {
  AlignLeft,
  Copyright,
  Globe,
  Image as ImageIcon,
  Layers,
  Link2,
  Palette,
  Settings,
  Share2,
  Type,
} from 'lucide-react';
import React from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';
import {
  AnchorManager,
  AnimationManager,
  BackgroundManager,
  BorderShadowManager,
  ColorManager,
  LayoutFields,
  LinkListManager,
  PatternManager,
  RichTextarea,
  SimpleInput,
  SocialLinksManager,
  TypographyFields,
  UnifiedSection as Section, 
  useUnifiedSections, 
  CategoryHeader, 
  ManagerWrapper
} from '../SharedSidebarComponents';

interface FooterProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const Footer: React.FC<FooterProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const content = selectedBlock.content;
  const { uploadImage, isUploading } = useEditorStore();
  const { openSection, setOpenSection, toggleSection } = useUnifiedSections();

  React.useEffect(() => {
    const handler = (e: Event) => {
      const sectionId = (e as CustomEvent).detail;
      if (sectionId) setOpenSection(sectionId);
    };
    window.addEventListener('footer-section-focus', handler);
    return () => window.removeEventListener('footer-section-focus', handler);
  }, [setOpenSection]);

  return (
    <div>
      {/* Sync Info */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Globe size={14} className="text-amber-600" />
          </div>
          <p className="text-[11px] text-amber-800 leading-normal">
            La configurazione di questo blocco è <strong>sincronizzata</strong> tra tutte le pagine in <strong>{useEditorStore.getState().currentPage?.language?.toUpperCase() || 'IT'}</strong>.
          </p>
        </div>
      </div>

      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={ImageIcon} label="Logo" id="logo" isOpen={openSection === 'logo'} onToggle={toggleSection}>
        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Mostra Logo</label>
          <div
            className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", content.showLogo !== false ? "bg-zinc-900" : "bg-zinc-200")}
            onClick={() => updateContent({ showLogo: content.showLogo === false ? true : false })}
          >
            <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", content.showLogo !== false && "translate-x-5")} />
          </div>
        </div>

        {content.showLogo !== false && (
          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg">
              <button onClick={() => updateContent({ logoType: 'text' })} className={cn("flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all", content.logoType !== 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-transparent text-zinc-400 hover:text-zinc-600')}>Testo</button>
              <button onClick={() => updateContent({ logoType: 'image' })} className={cn("flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all", content.logoType === 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-transparent text-zinc-400 hover:text-zinc-600')}>Immagine</button>
            </div>

            {content.logoType !== 'image' && (
              <SimpleInput
                label="Testo Logo"
                value={content.logoText || ''}
                onChange={(val: string) => updateContent({ logoText: val })}
                placeholder="Nome Sito"
              />
            )}

            {content.logoType === 'image' && (
              <>
                <div className="flex items-center justify-between gap-2 px-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Logo</label>
                  {isUploading && <span className="text-[10px] font-bold text-blue-500 animate-pulse uppercase">Caricamento...</span>}
                </div>
                <ImageUpload
                  value={resolveImageUrl(content.logoImage, useEditorStore.getState().project, useEditorStore.getState().imageMemoryCache)}
                  onChange={async (val: string, filename?: string) => {
                    const relativePath = await uploadImage(val, filename);
                    updateContent({ logoImage: relativePath });
                  }}
                  altValue={content.logoAlt ?? ''}
                  onAltChange={(alt) => updateContent({ logoAlt: alt })}
                  onFilenameSelect={(name) => {
                    if (!content.logoAlt) updateContent({ logoAlt: name });
                  }}
                />
              </>
            )}
          </div>
        )}
      </Section>

      <Section icon={AlignLeft} label="Descrizione" id="description" isOpen={openSection === 'description'} onToggle={toggleSection}>
        <RichTextarea
          placeholder="Inserisci una descrizione per il footer..."
          value={content.description || ''}
          onChange={(val: string) => updateContent({ description: val })}
        />
      </Section>

      <Section icon={Link2} label="Links" id="links" isOpen={openSection === 'links'} onToggle={toggleSection}>
        <ManagerWrapper label="Link Rapidi">
          <LinkListManager
            label="Link"
            links={content.links || []}
            onChange={(links) => updateContent({ links })}
          />
        </ManagerWrapper>
        <SimpleInput
          label="Titolo Link Rapidi (Opzionale)"
          value={content.linksTitle || ''}
          onChange={(val: string) => updateContent({ linksTitle: val })}
          placeholder="Esempio: Link Rapidi"
        />
      </Section>

      <Section icon={Share2} label="Social" id="social" isOpen={openSection === 'social'} onToggle={toggleSection}>
        <ManagerWrapper label="Link Social">
          <SocialLinksManager
            links={content.socialLinks || []}
            onChange={(socialLinks) => updateContent({ socialLinks })}
          />
        </ManagerWrapper>
      </Section>

      <Section icon={Copyright} label="Copyright" id="copyright" isOpen={openSection === 'copyright'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo Copyright"
          value={content.copyright || ''}
          onChange={(val: string) => updateContent({ copyright: val })}
          placeholder="© 2026 Nome"
        />
      </Section>

      {/* Global Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <Section icon={Type} label="Typography" id="typography" isOpen={openSection === 'typography'} onToggle={toggleSection}>
        <TypographyFields
          label="Dimensione Logo"
          sizeKey="titleSize"
          boldKey="titleBold"
          italicKey="titleItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={24}
        />
        <TypographyFields
          label="Dimensione Descrizione"
          sizeKey="descriptionSize"
          boldKey="descriptionBold"
          italicKey="descriptionItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={14}
        />
        <TypographyFields
          label="Titolo Link Rapidi"
          sizeKey="linksTitleSize"
          boldKey="linksTitleBold"
          italicKey="linksTitleItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={12}
        />
        <TypographyFields
          label="Dimensione Link"
          sizeKey="fontSize"
          boldKey="linkBold"
          italicKey="linkItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={14}
        />
        <TypographyFields
          label="Dimensione Copyright"
          sizeKey="copyrightSize"
          boldKey="copyrightBold"
          italicKey="copyrightItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={10}
        />
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block flex justify-between">
            <span>Dimensione Icone Social</span>
            <span className="text-zinc-900 font-bold">{getStyleValue('socialIconSize', 20)}px</span>
          </label>
          <input
            type="range"
            min="12"
            max="60"
            className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
            value={getStyleValue('socialIconSize', 20)}
            onChange={(e) => updateStyle({ socialIconSize: parseInt(e.target.value) })}
          />
        </div>
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <ColorManager
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          project={project}
          showTitle={false}
        />
        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Pattern Decorativo">
          <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        </ManagerWrapper>
      </Section>

      <Section icon={Settings} label="Avanzate" id="advanced" isOpen={openSection === 'advanced'} onToggle={toggleSection}>
        <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>
    </div>
  );
};
