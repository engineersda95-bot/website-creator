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
} from 'lucide-react';
import React from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';
import {
  BorderShadowManager,
  CTAManager,
  LayoutFields,
  LinkListManager,
  PatternManager,
  TypographyFields,
} from '../SharedSidebarComponents';
import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../UnifiedSection';

interface NavigationUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const NavigationUnified: React.FC<NavigationUnifiedProps> = ({
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
    window.addEventListener('navigation-section-focus', handler);
    return () => window.removeEventListener('navigation-section-focus', handler);
  }, [setOpenSection]);

  return (
    <div>
      {/* Components */}
      <CategoryHeader label="Componenti" />

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
              value={getStyleValue('logoTextSize', content?.logoTextSize || 24)}
              onChange={(e) => updateStyle({ logoTextSize: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Dim. Immagine Logo (px)</label>
            <input
              type="number"
              className="w-20 p-2 border border-zinc-200 rounded-lg text-xs font-bold"
              value={getStyleValue('logoSize', content?.logoSize || 40)}
              onChange={(e) => updateStyle({ logoSize: parseInt(e.target.value) })}
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
        <ManagerWrapper label="Link Navigazione">
          <LinkListManager
            label="Link Navigazione"
            links={content.links || []}
            onChange={(links) => updateContent({ links })}
          />
        </ManagerWrapper>
        {/* Layout Type */}
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block">Layout Default</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={() => updateContent({ layoutType: 'standard' })} className={cn("py-2 text-[10px] font-bold uppercase border rounded-lg transition-all", (content.layoutType || 'standard') === 'standard' ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-400 border-zinc-100 hover:border-zinc-300")}>Lista</button>
            <button onClick={() => updateContent({ layoutType: 'hamburger' })} className={cn("py-2 text-[10px] font-bold uppercase border rounded-lg transition-all", content.layoutType === 'hamburger' ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-400 border-zinc-100 hover:border-zinc-300")}>Hamburger</button>
          </div>
        </div>
      </Section>

      <Section icon={MousePointer} label="CTA" id="cta" badge={content.cta || 'vuoto'} isOpen={openSection === 'cta'} onToggle={toggleSection}>
        <CTAManager
          content={content}
          updateContent={updateContent}
          style={selectedBlock.style}
          updateStyle={updateStyle}
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
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Gap Link - CTA (px)</label>
            <input
              type="number"
              value={getStyleValue('linksCtaGap', 32)}
              onChange={(e) => updateStyle({ linksCtaGap: parseInt(e.target.value) || 32 })}
              className="w-20 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Larghezza Sidebar (px)</label>
          <input
            type="number"
            value={getStyleValue('hamburgerWidth', 450)}
            onChange={(e) => updateStyle({ hamburgerWidth: parseInt(e.target.value) || 450 })}
            className="w-20 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
          />
        </div>

        <div className="space-y-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
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

      <Section icon={Type} label="Typography" id="typography" isOpen={openSection === 'typography'} onToggle={toggleSection}>
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
                      <option value="to bottom">Alto → Basso</option>
                      <option value="to top">Basso → Alto</option>
                      <option value="to right">Sx → Dx</option>
                      <option value="to left">Dx → Sx</option>
                      <option value="to bottom right">Inclinato</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
              value={getStyleValue('scrolledOpacity', 100)}
              onChange={(e) => updateStyle({ scrolledOpacity: parseInt(e.target.value) })}
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
