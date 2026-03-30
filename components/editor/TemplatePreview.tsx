'use client';

import React, { useRef } from 'react';
import { TEMPLATES, TEMPLATE_SETTINGS, getBlocksFromTemplate } from '@/lib/templates';
import { getBlockComponent } from '@/components/blocks/BlockRegistry';
import { getBlockCSSVariables } from '@/lib/responsive-utils';
import { X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const BLOCK_WIREFRAME: Record<string, { label: string; h: string; color: string }> = {
  navigation: { label: 'Nav', h: 'h-4', color: 'bg-zinc-300' },
  hero: { label: 'Hero', h: 'h-16', color: 'bg-blue-200' },
  benefits: { label: 'Vantaggi', h: 'h-10', color: 'bg-emerald-100' },
  cards: { label: 'Card', h: 'h-12', color: 'bg-amber-100' },
  'image-text': { label: 'Img+Testo', h: 'h-10', color: 'bg-violet-100' },
  quote: { label: 'Recensioni', h: 'h-8', color: 'bg-pink-100' },
  'how-it-works': { label: 'Come funziona', h: 'h-8', color: 'bg-sky-100' },
  faq: { label: 'FAQ', h: 'h-8', color: 'bg-orange-100' },
  embed: { label: 'Mappa', h: 'h-8', color: 'bg-teal-100' },
  contact: { label: 'Contatti', h: 'h-10', color: 'bg-indigo-100' },
  footer: { label: 'Footer', h: 'h-4', color: 'bg-zinc-200' },
  text: { label: 'Testo', h: 'h-8', color: 'bg-zinc-100' },
  divider: { label: '', h: 'h-1', color: 'bg-zinc-200' },
  image: { label: 'Immagine', h: 'h-10', color: 'bg-zinc-100' },
  features: { label: 'Features', h: 'h-10', color: 'bg-emerald-100' },
  logos: { label: 'Loghi', h: 'h-6', color: 'bg-zinc-100' },
  gallery: { label: 'Galleria', h: 'h-12', color: 'bg-zinc-100' },
  map: { label: 'Mappa', h: 'h-8', color: 'bg-teal-100' },
};

// Wireframe mini preview for template cards
export function TemplateWireframe({ templateId }: { templateId: string }) {
  if (templateId === 'blank') {
    return (
      <div className="flex items-center justify-center h-full text-zinc-300">
        <div className="w-8 h-8 border-2 border-dashed border-zinc-200 rounded-lg" />
      </div>
    );
  }

  const blocks = (TEMPLATES as any)[templateId];
  if (!blocks) return null;

  return (
    <div className="flex flex-col gap-[2px] p-3 h-full justify-center">
      {blocks.map((b: any, i: number) => {
        const wire = BLOCK_WIREFRAME[b.type] || { label: b.type, h: 'h-6', color: 'bg-zinc-100' };
        return (
          <div
            key={i}
            className={cn("rounded-sm w-full", wire.h, wire.color)}
            title={wire.label}
          />
        );
      })}
    </div>
  );
}

// Full live preview modal
export function TemplatePreviewModal({
  templateId,
  templateName,
  onClose,
}: {
  templateId: string;
  templateName: string;
  onClose: () => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const blocks = getBlocksFromTemplate(templateId as keyof typeof TEMPLATES);

  // Use template-specific settings for accurate preview
  const templateSettings = TEMPLATE_SETTINGS[templateId] || {};
  const fakeProject: any = {
    settings: {
      fontFamily: 'Outfit',
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      appearance: 'light',
      themeColors: {
        light: { bg: '#ffffff', text: '#000000' },
        dark: { bg: '#0c0c0e', text: '#ffffff' },
      },
      ...templateSettings,
    },
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3">
            <Eye size={16} className="text-zinc-400" />
            <h2 className="text-sm font-bold text-zinc-900">Anteprima — {templateName}</h2>
            <span className="text-xs text-zinc-400">{blocks.length} blocchi</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview container — handle anchor scrolling, block external navigation */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto bg-zinc-100 custom-scrollbar scroll-smooth"
          onClick={(e) => {
            const anchor = (e.target as HTMLElement).closest('a');
            if (!anchor) return;
            e.preventDefault();
            e.stopPropagation();
            const href = anchor.getAttribute('href') || '';
            // Extract hash — handles both "#menu" and "/#menu" formats
            const hashMatch = href.match(/#(.+)/);
            if (hashMatch && scrollContainerRef.current) {
              const hash = hashMatch[1].toLowerCase();
              // Try exact match first, then fuzzy match on all data-anchor attributes
              const allAnchored = scrollContainerRef.current.querySelectorAll('[data-anchor]');
              let targetEl: Element | null = null;
              for (const el of allAnchored) {
                const parts = (el.getAttribute('data-anchor') || '').split(' ');
                if (parts.some(p => p === hash || p.includes(hash) || hash.includes(p))) {
                  targetEl = el;
                  break;
                }
              }
              if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          <div className="mx-auto" style={{ maxWidth: 1200 }}>
            <div
              className="bg-white shadow-lg origin-top"
              style={{
                fontFamily: `'${fakeProject.settings.fontFamily}', sans-serif`,
                backgroundColor: fakeProject.settings.themeColors?.[fakeProject.settings.appearance || 'light']?.bg || '#ffffff',
                color: fakeProject.settings.themeColors?.[fakeProject.settings.appearance || 'light']?.text || '#000000',
              }}
            >
              <link
                rel="stylesheet"
                href={`https://fonts.googleapis.com/css2?family=${fakeProject.settings.fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`}
              />
              {blocks.map((block) => {
                const Component = getBlockComponent(block.type);
                const vars = getBlockCSSVariables(block, fakeProject, 'desktop');

                // Generate multiple anchor ids for matching
                const slugify = (s: string) => s?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '';
                const anchorId = [
                  block.content?.sectionId,
                  slugify(block.content?.title || ''),
                  block.type,
                ].filter(Boolean).join(' ');

                return (
                  <div
                    key={block.id}
                    data-anchor={anchorId}
                    style={{
                      ...vars,
                      maxWidth: 'var(--block-max-width, 100%)',
                      borderRadius: 'var(--block-radius)',
                      marginTop: 'var(--block-mt)',
                      marginBottom: 'var(--block-mb)',
                      marginLeft: 'var(--block-ml-auto, 0)',
                      marginRight: 'var(--block-mr-auto, 0)',
                    } as any}
                  >
                    <Component
                      content={block.content}
                      block={block}
                      isEditing={false}
                      project={fakeProject}
                      allPages={[]}
                      viewport="desktop"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
