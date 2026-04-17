'use client';

import { cn } from '@/lib/utils';
import {
  Image as ImageIcon,
  Layers,
  Link2,
  MousePointer,
  Palette,
  Settings,
  Type,
  Layout,
  Share2,
  Globe
} from 'lucide-react';
import React from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';
import {
  AnchorManager,
  BackgroundManager,
  BorderShadowManager,
  ColorManager,
  CTAManager,
  LayoutFields,
  LinkListManager,
  PatternManager,
  SimpleInput,
  SimpleSlider,
  SocialLinksManager,
  TypographyFields,
  UnifiedSection as Section, 
  useUnifiedSections, 
  CategoryHeader, 
  ManagerWrapper
} from '../SharedSidebarComponents';

interface NavigationProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const Navigation: React.FC<NavigationProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const content = selectedBlock.content;
  const { uploadImage, isUploading, siteGlobals, currentPage } = useEditorStore();
  const { openSection, setOpenSection, toggleSection } = useUnifiedSections();

  React.useEffect(() => {
    const handler = (e: Event) => {
      const sectionId = (e as CustomEvent).detail;
      if (sectionId) setOpenSection(sectionId);
    };
    window.addEventListener('navigation-section-focus', handler);
    return () => window.removeEventListener('navigation-section-focus', handler);
  }, [setOpenSection]);

  return (
    <div>
      {/* Global Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Globe size={14} className="text-blue-600" />
          </div>
          <p className="text-[11px] text-blue-800 leading-normal">
            Questo blocco è <strong>globale</strong>: le modifiche si applicano a tutte le pagine in <strong>{useEditorStore.getState().currentPage?.language?.toUpperCase() || 'IT'}</strong>.
          </p>
        </div>
      </div>

      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={Layout} label="Modalità" id="modes" isOpen={openSection === 'modes'} onToggle={toggleSection}>
        {/* Layout Type (Moved from Links) */}
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Tipo Visualizzazione</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button 
              onClick={() => updateContent({ layoutType: 'standard' })} 
              className={cn(
                "py-2 text-[10px] font-bold uppercase border rounded-lg transition-all", 
                (content.layoutType || 'standard') === 'standard' ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-400 border-zinc-100 hover:border-zinc-300"
              )}
            >
              Lista
            </button>
            <button 
              onClick={() => updateContent({ layoutType: 'hamburger' })} 
              className={cn(
                "py-2 text-[10px] font-bold uppercase border rounded-lg transition-all", 
                content.layoutType === 'hamburger' ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-400 border-zinc-100 hover:border-zinc-300"
              )}
            >
              Hamburger
            </button>
          </div>
        </div>

        {/* Behavior (Moved from Layout & Spaziatura) */}
        <div className="space-y-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100 mt-4">
          <div className="flex items-center justify-between gap-4">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Header Sticky (Fisso)</label>
            <div
              className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", getStyleValue('isSticky', false) ? "bg-zinc-900" : "bg-zinc-200")}
              onClick={() => updateStyle({ isSticky: !getStyleValue('isSticky', false) })}
            >
              <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", getStyleValue('isSticky', false) && "translate-x-5")} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Sfondo Trasparente</label>
            <div
              className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", getStyleValue('isTransparent', false) ? "bg-zinc-900" : "bg-zinc-200")}
              onClick={() => {
                const newVal = !getStyleValue('isTransparent', false);
                updateStyle({
                  isTransparent: newVal,
                  scrolledOpacity: newVal ? 0 : 100,
                });
              }}
            >
              <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", getStyleValue('isTransparent', false) && "translate-x-5")} />
            </div>
          </div>
        </div>
      </Section>

      <Section icon={ImageIcon} label="Logo" id="logo" isOpen={openSection === 'logo'} onToggle={toggleSection}>
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg">
          <button onClick={() => updateContent({ logoType: 'text' })} className={cn("flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all", content.logoType !== 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-transparent text-zinc-400 hover:text-zinc-600')}>Testo</button>
          <button onClick={() => updateContent({ logoType: 'image' })} className={cn("flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all", content.logoType === 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-transparent text-zinc-400 hover:text-zinc-600')}>Immagine</button>
        </div>

        {content.logoType !== 'image' && (
          <input
            className="w-full p-2 border border-zinc-200 rounded-lg text-xs font-bold bg-zinc-50 focus:bg-white transition-all outline-none"
            placeholder="Testo Logo"
            value={content.logoText || ''}
            onChange={(e) => updateContent({ logoText: e.target.value })}
          />
        )}

        {content.logoType !== 'text' && (
          <>
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Logo</label>
              {isUploading && <span className="text-[10px] font-bold text-blue-500 animate-pulse uppercase">Caricamento...</span>}
            </div>
            <ImageUpload
              label="File Logo"
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

        <div className="space-y-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
          <div className="flex items-center justify-between gap-4">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Dim. Testo Logo (px)</label>
            <input
              type="number"
              className="w-20 p-2 border border-zinc-200 rounded-lg text-xs font-bold"
              value={getStyleValue('logoTextSize', content?.logoTextSize || 24) || 24}
              onChange={(e) => updateStyle({ logoTextSize: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Dim. Immagine Logo (px)</label>
            <input
              type="number"
              className="w-20 p-2 border border-zinc-200 rounded-lg text-xs font-bold"
              value={getStyleValue('logoSize', content?.logoSize || 40) || 40}
              onChange={(e) => updateStyle({ logoSize: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Home Link su Logo</label>
            <div
              className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", content.logoLinkHome !== false ? "bg-zinc-900" : "bg-zinc-200")}
              onClick={() => updateContent({ logoLinkHome: content.logoLinkHome === false ? true : false })}
            >
              <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", content.logoLinkHome !== false && "translate-x-5")} />
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Link2} label="Links" id="links" isOpen={openSection === 'links'} onToggle={toggleSection}>
        <LinkListManager
          label="Link Navigazione"
          links={content.links || []}
          onChange={(links) => updateContent({ links })}
        />
        <div className="mt-4">
          <SimpleSlider
            label="Gap tra Link"
            value={getStyleValue('linksGap', 15)}
            onChange={(val) => updateStyle({ linksGap: val })}
            max={100}
          />
        </div>
      </Section>

      <Section icon={Share2} label="Social" id="social" isOpen={openSection === 'social'} onToggle={toggleSection}>
        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Mostra Social</label>
          <div
            className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", content.showSocial ? "bg-zinc-900" : "bg-zinc-200")}
            onClick={() => {
              const newVal = !content.showSocial;
              const update: any = { showSocial: newVal };
              if (newVal && (!content.socialLinks || content.socialLinks.length === 0)) {
                // Fallback: copy social links from footer globals if available
                const footerGlobal = siteGlobals?.find(
                  (g: any) => g.language === (currentPage?.language || 'it') && g.type === 'footer'
                );
                const footerSocial = footerGlobal?.content?.socialLinks;
                if (footerSocial?.length) update.socialLinks = footerSocial;
              }
              updateContent(update);
            }}
          >
            <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", content.showSocial && "translate-x-5")} />
          </div>
        </div>

        {content.showSocial && (
          <>
            <SocialLinksManager
              links={content.socialLinks || []}
              onChange={(socialLinks) => updateContent({ socialLinks })}
            />
            <div className="mt-4 space-y-2">
              <SimpleSlider
                label="Dimensione Icone"
                value={getStyleValue('socialIconSize', 20)}
                onChange={(val) => updateStyle({ socialIconSize: val })}
                min={12}
                max={60}
              />
              <SimpleSlider
                label="Gap tra Icone"
                value={getStyleValue('socialLinksGap', 15)}
                onChange={(val) => updateStyle({ socialLinksGap: val })}
                max={100}
              />
            </div>
          </>
        )}
      </Section>

      <Section icon={Globe} label="Lingua" id="language" isOpen={openSection === 'language'} onToggle={toggleSection}>
        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Selettore Lingua</label>
          <div
            className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", content.showLanguageSelector ? "bg-zinc-900" : "bg-zinc-200")}
            onClick={() => updateContent({ showLanguageSelector: !content.showLanguageSelector })}
          >
            <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", content.showLanguageSelector && "translate-x-5")} />
          </div>
        </div>
        {content.showLanguageSelector && (
          <div className="px-3 pb-6">
            <div className="flex items-center justify-between gap-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Grandezza Testo (px)</label>
              <input
                type="number"
                className="w-20 p-2 border border-zinc-200 rounded-lg text-xs font-bold bg-white"
                value={getStyleValue('langSize', 10) || 10}
                onChange={(e) => updateStyle({ langSize: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        )}
      </Section>

      <Section icon={MousePointer} label="CTA" id="cta" badge={content.cta || 'vuoto'} isOpen={openSection === 'cta'} onToggle={toggleSection}>
        <CTAManager
          content={content}
          updateContent={updateContent}
          style={selectedBlock.style}
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
        />
      </Section>

      {/* Global Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          showAlign={false}
          paddingLabel="Padding su/giù"
          hPaddingLabel="Padding Dx/Sx"
        />

        {(content?.layoutType || 'standard') === 'standard' && (
          <SimpleSlider
            label="Gap tra Componenti"
            value={getStyleValue('linksCtaGap', 20)}
            onChange={(val) => updateStyle({ linksCtaGap: val })}
            max={150}
          />
        )}

        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Larghezza Sidebar (px)</label>
          <input
            type="number"
            value={getStyleValue('hamburgerWidth', 450) || 450}
            onChange={(e) => updateStyle({ hamburgerWidth: parseInt(e.target.value) || 0 })}
            className="w-20 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
          />
        </div>
      </Section>

      <Section icon={Type} label="Tipografia" id="typography" isOpen={openSection === 'typography'} onToggle={toggleSection}>
        <TypographyFields
          label="Dimensione Link"
          sizeKey="fontSize"
          boldKey="titleBold"
          italicKey="titleItalic"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={14}
        />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <ColorManager
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          project={project}
          showTitle={false}
        />

        <div className="px-1 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
          <div className="space-y-2 px-3 py-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Opacità Sfondo ({getStyleValue('scrolledOpacity', 100)}%)</label>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={getStyleValue('scrolledOpacity', 100) || 0}
              onChange={(e) => updateStyle({ scrolledOpacity: parseInt(e.target.value) || 0 })}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
            />
          </div>
        </div>

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
