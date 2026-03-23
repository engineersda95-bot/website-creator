import React from 'react';
import { cn, getButtonStyle, formatLink, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';
import { SitiImage } from '@/components/shared/SitiImage';

interface ImageTextBlockProps {
  content: {
    title: string;
    text: string;
    cta?: string;
    ctaUrl?: string;
    image?: string;
    alt?: string;
    imageAspectRatio?: string;
  };
  block: Block;
  isEditing?: boolean;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

export const ImageTextBlock: React.FC<ImageTextBlockProps> = ({ 
  content, 
  block, 
  project, 
  viewport, 
  isStatic, 
  imageMemoryCache 
}) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  
  const pColor = project?.settings?.primaryColor || '#3b82f6';
  const secondaryColor = project?.settings?.secondaryColor || '#10b981';
  const activeColor = style.buttonTheme === 'secondary' ? secondaryColor : pColor;

  return (
    <section 
      className={cn(
        "relative overflow-hidden transition-all duration-500",
      )}
      style={{
        backgroundColor: 'var(--block-bg)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        paddingLeft: 'var(--block-px)',
        paddingRight: 'var(--block-px)',
        color: 'var(--block-color)',
      }}
    >
      <div 
        className="mx-auto"
        style={{ maxWidth: 'var(--block-max-width)' }}
      >
        <div 
          className={cn(
            "grid",
            (viewport === 'mobile' || viewport === 'tablet') ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          )}
          style={{
            gap: 'var(--block-gap)',
            alignItems: 'var(--text-v-align)' as any,
          }}
        >
          {/* Immagine */}
          <div 
            className="w-full h-full order-[var(--image-order)]"
            style={{ 
              order: 'var(--image-order)' as any,
            }}
          >
            <div className="relative w-full h-full overflow-hidden rounded-[var(--block-radius,1.5rem)] shadow-lg transition-all duration-500">
              {content.image ? (
                <SitiImage 
                  src={content.image}
                  project={project}
                  isStatic={isStatic}
                  imageMemoryCache={imageMemoryCache}
                  alt={content.alt || ''}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  style={{
                    aspectRatio: 'var(--image-aspect)'
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center text-zinc-400 p-8 border-2 border-dashed border-zinc-200"
                  style={{ aspectRatio: 'var(--image-aspect)' }}
                >
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Nessuna Immagine</span>
                  <span className="text-[9px] opacity-70 mt-1">Caricala dalla sidebar</span>
                </div>
              )}
            </div>
          </div>

          {/* Testo */}
          <div 
            className="flex flex-col space-y-6 order-[var(--text-order)]"
            style={{ 
                order: 'var(--text-order)' as any,
                textAlign: 'var(--block-align)' as any,
                alignItems: 'var(--block-items)' as any,
            }}
          >
            <div className="space-y-4">
              {content.title && (
                <h2 
                  className="tracking-tight transition-all duration-500"
                  style={{ 
                    fontSize: 'var(--title-fs)',
                    fontWeight: 'var(--title-fw)' as any,
                    fontStyle: 'var(--title-fs-style)' as any,
                    letterSpacing: 'var(--title-ls)',
                    lineHeight: 'var(--title-lh)',
                    textTransform: 'var(--title-upper)' as any
                  }}
                  dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
                />
              )}
              {content.text && (
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none transition-all duration-500"
                  style={{
                    fontSize: 'var(--subtitle-fs)',
                    fontWeight: 'var(--subtitle-fw)' as any,
                    fontStyle: 'var(--subtitle-fs-style)' as any,
                    lineHeight: '1.6',
                    opacity: 0.9
                  }}
                  dangerouslySetInnerHTML={{ __html: formatRichText(content.text) }}
                />
              )}
            </div>

            {content.cta && (
              <div 
                className="pt-4 flex"
                style={{ 
                    justifyContent: 'var(--block-justify)',
                    width: '100%'
                }}
              >
                <a 
                  {...formatLink(content.ctaUrl || '#')}
                  className="font-bold transition-all active:scale-95 border-0 outline-none no-underline inline-flex items-center justify-center"
                  style={getButtonStyle(project, activeColor, (viewport as any) || 'desktop', style.buttonTheme, !!(isStatic || !viewport))}
                >
                  {content.cta}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
