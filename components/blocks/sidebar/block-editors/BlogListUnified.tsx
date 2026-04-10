'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Type, AlignLeft, Filter, Layers, Palette, Settings, Play,
  List, Hash, Eye, EyeOff
} from 'lucide-react';
import {
  AnchorManager, AnimationManager, BackgroundManager, BorderShadowManager,
  LayoutFields, LayoutGridSlider, PatternManager,
  RichTextarea, SimpleInput, SimpleSlider, TypographyFields
} from '../SharedSidebarComponents';
import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../SharedSidebarComponents';
import { useEditorStore } from '@/store/useEditorStore';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/types/editor';

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

  // Fetch blog posts for manual selection
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  useEffect(() => {
    if (!project?.id) return;
    supabase
      .from('blog_posts')
      .select('id, title, categories, status, cover_image')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setBlogPosts(data as BlogPost[]); });
  }, [project?.id]);

  const categories = [...new Set(blogPosts.flatMap(p => p.categories || []).filter(Boolean))];
  const filterMode = content.filterMode || 'all';
  const manualPostIds = content.manualPostIds || [];

  return (
    <div>
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput label="Testo" value={content.title || ''} onChange={(val) => updateContent({ title: val })} placeholder="Dal nostro Blog" />
        <TypographyFields label="Stile" sizeKey="titleSize" boldKey="titleBold" italicKey="titleItalic" tagKey="titleTag" showTagSelector defaultTag="h2" getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <Section icon={AlignLeft} label="Sottotitolo" id="subtitle" isOpen={openSection === 'subtitle'} onToggle={toggleSection}>
        <RichTextarea label="Testo" value={content.subtitle || ''} onChange={(val) => updateContent({ subtitle: val })} placeholder="Descrizione..." />
        <TypographyFields label="Stile" sizeKey="subtitleSize" boldKey="subtitleBold" italicKey="subtitleItalic" getStyleValue={getStyleValue} updateStyle={updateStyle} defaultValue={18} />
      </Section>

      <Section icon={Filter} label="Impostazioni" id="filter" isOpen={openSection === 'filter'} onToggle={toggleSection}>
        {/* Filter mode — only outside /blog page */}
        {!isBlogPage && (
          <>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Mostra</label>
              <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                {[
                  { id: 'all', label: 'Tutti' },
                  { id: 'category', label: 'Categoria' },
                  { id: 'manual', label: 'Selezione' },
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

            {filterMode === 'manual' && (
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Seleziona articoli</label>
                <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                  {blogPosts.map(post => {
                    const isSelected = manualPostIds.includes(post.id);
                    return (
                      <button
                        key={post.id}
                        onClick={() => {
                          const newIds = isSelected
                            ? manualPostIds.filter((id: string) => id !== post.id)
                            : [...manualPostIds, post.id];
                          updateContent({ manualPostIds: newIds });
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all",
                          isSelected ? "bg-zinc-900 text-white" : "hover:bg-zinc-50 text-zinc-600"
                        )}
                      >
                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px]",
                          isSelected ? "bg-white text-zinc-900 border-white" : "border-zinc-300"
                        )}>
                          {isSelected && '✓'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold truncate">{post.title || 'Senza titolo'}</div>
                          {(post.categories?.length ?? 0) > 0 && <div className={cn("text-[9px]", isSelected ? "text-white/50" : "text-zinc-400")}>{post.categories.join(', ')}</div>}
                        </div>
                      </button>
                    );
                  })}
                  {blogPosts.length === 0 && (
                    <p className="text-[10px] text-zinc-400 italic py-4 text-center">Nessun post trovato.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Max posts — hidden on blog page (always 100) */}
        {!isBlogPage && (
          <SimpleSlider
            label="Articoli visibili (max)"
            value={content.maxPosts || 6}
            onChange={(val: number) => updateContent({ maxPosts: val })}
            min={1} max={20} step={1}
          />
        )}

        {/* Show search / categories — separate toggles */}
        {isBlogPage && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-3">
            <div className="text-[10px] font-bold text-blue-700">Pagina Blog principale</div>
            <div className="text-[9px] text-blue-500">Tutti gli articoli sono mostrati in questa pagina.</div>
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
          <div>
            <div className="text-[10px] font-bold text-zinc-700">Barra di ricerca</div>
            <div className="text-[9px] text-zinc-400">Permette di cercare per titolo</div>
          </div>
          <input
            type="checkbox"
            checked={content.showSearch !== false}
            onChange={(e) => updateContent({ showSearch: e.target.checked })}
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
          <div>
            <div className="text-[10px] font-bold text-zinc-700">Filtri categoria</div>
            <div className="text-[9px] text-zinc-400">Mostra pill per filtrare per categoria</div>
          </div>
          <input
            type="checkbox"
            checked={content.showCategoryFilter !== false}
            onChange={(e) => updateContent({ showCategoryFilter: e.target.checked })}
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
          <div>
            <div className="text-[10px] font-bold text-zinc-700">Filtri autore</div>
            <div className="text-[9px] text-zinc-400">Mostra pill per filtrare per autore</div>
          </div>
          <input
            type="checkbox"
            checked={content.showAuthorFilter === true}
            onChange={(e) => updateContent({ showAuthorFilter: e.target.checked })}
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
          <div>
            <div className="text-[10px] font-bold text-zinc-700">Mostra autore</div>
            <div className="text-[9px] text-zinc-400">Nome dell'autore sotto ogni articolo</div>
          </div>
          <input
            type="checkbox"
            checked={content.showAuthor !== false}
            onChange={(e) => updateContent({ showAuthor: e.target.checked })}
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
          <div>
            <div className="text-[10px] font-bold text-zinc-700">Mostra data</div>
            <div className="text-[9px] text-zinc-400">Data di pubblicazione sotto ogni articolo</div>
          </div>
          <input
            type="checkbox"
            checked={content.showDate !== false}
            onChange={(e) => updateContent({ showDate: e.target.checked })}
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900"
          />
        </div>

        {/* Tag color (category labels on cards) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Colore tag categorie</label>
          <div className="flex items-center gap-2">
            {['primary', 'text', 'custom'].map(opt => (
              <button
                key={opt}
                onClick={() => updateContent({ tagColorMode: opt })}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                  (content.tagColorMode || 'primary') === opt
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                )}
              >
                {opt === 'primary' ? 'Primario' : opt === 'text' ? 'Testo' : 'Custom'}
              </button>
            ))}
            {content.tagColorMode === 'custom' && (
              <input
                type="color"
                value={content.tagColor || '#3b82f6'}
                onChange={(e) => updateContent({ tagColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-zinc-200 cursor-pointer bg-transparent"
              />
            )}
          </div>
        </div>

        {/* Filter pills colors */}
        {(content.showCategoryFilter !== false || content.showAuthorFilter === true) && (
          <div className="space-y-3 p-3 bg-zinc-50 rounded-xl">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Colore filtri</label>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-600">Selezionato (sfondo)</span>
              <input
                type="color"
                value={content.filterActiveColor || '#000000'}
                onChange={(e) => updateContent({ filterActiveColor: e.target.value })}
                className="w-7 h-7 rounded-lg border border-zinc-200 cursor-pointer bg-transparent"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-600">Selezionato (testo)</span>
              <input
                type="color"
                value={content.filterActiveTextColor || '#ffffff'}
                onChange={(e) => updateContent({ filterActiveTextColor: e.target.value })}
                className="w-7 h-7 rounded-lg border border-zinc-200 cursor-pointer bg-transparent"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-600">Non selezionato (bordo)</span>
              <input
                type="color"
                value={content.filterInactiveColor || '#d4d4d8'}
                onChange={(e) => updateContent({ filterInactiveColor: e.target.value })}
                className="w-7 h-7 rounded-lg border border-zinc-200 cursor-pointer bg-transparent"
              />
            </div>
          </div>
        )}

        {/* Show view all link — hidden on blog page */}
        {!isBlogPage && (
          <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
            <div>
              <div className="text-[10px] font-bold text-zinc-700">Link "Vedi tutti"</div>
              <div className="text-[9px] text-zinc-400">Mostra link alla pagina /blog</div>
            </div>
            <input
              type="checkbox"
              checked={content.showViewAll !== false}
              onChange={(e) => updateContent({ showViewAll: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-300 text-zinc-900"
            />
          </div>
        )}
      </Section>

      <Section icon={List} label="Griglia" id="grid" isOpen={openSection === 'grid'} onToggle={toggleSection}>
        <LayoutGridSlider
          content={content}
          updateContent={updateContent}
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          viewport={viewport}
        />
        <TypographyFields label="Titolo Card" sizeKey="itemTitleSize" boldKey="itemTitleBold" italicKey="itemTitleItalic" tagKey="itemTitleTag" showTagSelector defaultTag="h3" getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <CategoryHeader label="Stile della Sezione" />

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
