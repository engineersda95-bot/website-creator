'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Type, AlignLeft, Filter, Layers, Palette, Settings, Play,
  List, ExternalLink
} from 'lucide-react';
import {
  AnchorManager, AnimationManager, BackgroundManager, BorderShadowManager,
  CTAManager, LayoutFields, LayoutGridSlider, PatternManager,
  RichTextarea, SimpleInput, SimpleSlider, TypographyFields
} from '../SharedSidebarComponents';
import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../SharedSidebarComponents';
import { useEditorStore } from '@/store/useEditorStore';
import { supabase } from '@/lib/supabase';

interface BlogListUnifiedProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const BlogListUnified: React.FC<BlogListUnifiedProps> = ({
  selectedBlock, updateContent, updateStyle, getStyleValue, project,
}) => {
  const content = selectedBlock.content;
  const { openSection, toggleSection } = useUnifiedSections();
  const { viewport } = useEditorStore();
  const currentPage = useEditorStore(state => state.currentPage);
  const isBlogPage = currentPage?.slug === 'blog';

  // Fetch blog posts to derive available categories
  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    if (!project?.id) return;
    supabase
      .from('blog_posts')
      .select('categories')
      .eq('project_id', project.id)
      .then(({ data }) => {
        if (data) {
          const cats = [...new Set((data as any[]).flatMap(p => p.categories || []).filter(Boolean))];
          setCategories(cats);
        }
      });
  }, [project?.id]);

  const filterMode = content.filterMode || 'all';

  return (
    <div>
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput label="Testo" value={content.title || ''} onChange={(val) => updateContent({ title: val })} placeholder="Dal nostro Blog" />
      </Section>

      <Section icon={AlignLeft} label="Sottotitolo" id="subtitle" isOpen={openSection === 'subtitle'} onToggle={toggleSection}>
        <RichTextarea label="Testo" value={content.subtitle || ''} onChange={(val) => updateContent({ subtitle: val })} placeholder="Descrizione..." />
      </Section>

      <Section icon={Filter} label="Impostazioni" id="filter" isOpen={openSection === 'filter'} onToggle={toggleSection}>
        {/* Filter mode — pre-filter by category (hidden on /blog which already has interactive filters) */}
        {!isBlogPage && (
          <>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Mostra</label>
              <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                {[
                  { id: 'all', label: 'Tutti' },
                  { id: 'category', label: 'Categoria' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => updateContent({ filterMode: m.id })}
                    className={cn("flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all", filterMode === m.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {filterMode === 'category' && (
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Categoria</label>
                {categories.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateContent({ filterCategory: content.filterCategory === cat ? '' : cat })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all",
                          content.filterCategory === cat ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 italic">Nessuna categoria trovata.</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Max posts — always visible, default differs by context */}
        <SimpleSlider
          label="Articoli visibili (max)"
          value={content.maxPosts ?? (isBlogPage ? 100 : 6)}
          onChange={(val: number) => updateContent({ maxPosts: val })}
          min={1} max={100} step={1}
          suffix=""
        />

        {/* Show/hide toggles */}
        <div className="space-y-2">
          {([
            { key: 'showSearch', label: 'Barra di ricerca', desc: 'Permette di cercare per titolo' },
            { key: 'showCategoryFilter', label: 'Filtri categoria', desc: 'Mostra pill per filtrare per categoria' },
            { key: 'showAuthor', label: 'Mostra autore', desc: 'Nome autore sotto ogni articolo' },
            { key: 'showDate', label: 'Mostra data', desc: 'Data di pubblicazione sotto ogni articolo' },
          ] as { key: string; label: string; desc: string }[]).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
              <div>
                <div className="text-[10px] font-bold text-zinc-700">{label}</div>
                <div className="text-[9px] text-zinc-400">{desc}</div>
              </div>
              <input
                type="checkbox"
                checked={content[key] !== false}
                onChange={(e) => updateContent({ [key]: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300 text-zinc-900"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* CTA section — hidden on /blog page */}
      {!isBlogPage && (
        <Section icon={ExternalLink} label="CTA" id="cta" isOpen={openSection === 'cta'} onToggle={toggleSection}>
          <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
            <div>
              <div className="text-[10px] font-bold text-zinc-700">Mostra bottone "Vedi tutti"</div>
              <div className="text-[9px] text-zinc-400">Appare in alto a destra del titolo sezione</div>
            </div>
            <input
              type="checkbox"
              checked={content.showViewAll !== false}
              onChange={(e) => updateContent({ showViewAll: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-300 text-zinc-900"
            />
          </div>
          {content.showViewAll !== false && (
            <CTAManager
              content={content}
              updateContent={updateContent}
              style={selectedBlock.style}
              updateStyle={updateStyle}
              getStyleValue={getStyleValue}
              label="Bottone CTA"
              ctaKey="viewAllCta"
              urlKey="viewAllCtaUrl"
              themeKey="viewAllCtaTheme"
            />
          )}
        </Section>
      )}

      <Section icon={List} label="Griglia" id="grid" isOpen={openSection === 'grid'} onToggle={toggleSection}>
        <LayoutGridSlider
          content={content}
          updateContent={updateContent}
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          viewport={viewport}
        />
      </Section>

      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Type} label="Tipografia" id="typography" isOpen={openSection === 'typography'} onToggle={toggleSection}>
        <TypographyFields label="Titolo" sizeKey="titleSize" boldKey="titleBold" italicKey="titleItalic" tagKey="titleTag" showTagSelector defaultTag="h2" getStyleValue={getStyleValue} updateStyle={updateStyle} />
        <TypographyFields label="Sottotitolo" sizeKey="subtitleSize" boldKey="subtitleBold" italicKey="subtitleItalic" getStyleValue={getStyleValue} updateStyle={updateStyle} defaultValue={18} />
        <TypographyFields label="Titolo card" sizeKey="itemTitleSize" boldKey="itemTitleBold" italicKey="itemTitleItalic" tagKey="itemTitleTag" showTagSelector defaultTag="h3" getStyleValue={getStyleValue} updateStyle={updateStyle} />
        {content.showAuthor !== false && (
          <TypographyFields label="Autore" sizeKey="authorSize" boldKey="authorBold" italicKey="authorItalic" getStyleValue={getStyleValue} updateStyle={updateStyle} defaultValue={14} />
        )}
        {content.showDate !== false && (
          <TypographyFields label="Data" sizeKey="dateSize" boldKey="dateBold" italicKey="dateItalic" getStyleValue={getStyleValue} updateStyle={updateStyle} defaultValue={14} />
        )}
        {content.showCategoryFilter !== false && (
          <TypographyFields label="Filtri categoria" sizeKey="filterFontSize" boldKey="filterFontBold" italicKey="filterFontItalic" getStyleValue={getStyleValue} updateStyle={updateStyle} defaultValue={11} />
        )}
      </Section>

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <ManagerWrapper label="Immagine Sfondo">
          <BackgroundManager selectedBlock={selectedBlock} updateContent={updateContent} updateStyle={updateStyle} getStyleValue={getStyleValue} />
        </ManagerWrapper>
        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Pattern">
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
