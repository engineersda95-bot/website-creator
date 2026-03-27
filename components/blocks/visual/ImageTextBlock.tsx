

import React from 'react';
import { cn, formatLink, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';
import { SitiImage } from '@/components/shared/SitiImage';
import { CTA } from '@/components/shared/CTA';
import { BlockBackground } from '@/components/shared/BlockBackground';

interface ImageTextBlockProps {
  content: {
    title: string;
    text: string;
    cta?: string;
    ctaUrl?: string;
    ctaTheme?: 'primary' | 'secondary';
    cta2?: string;
    cta2Url?: string;
    cta2Theme?: 'primary' | 'secondary';
    image?: string;
    alt?: string;
    imageAspectRatio?: string;
    backgroundImage?: string;
    backgroundAlt?: string;
    sectionId?: string;
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

  // Variabili immagine premium
  const imageRadius = style.imageBorderRadius !== undefined ? `${style.imageBorderRadius}px` : '24px';
  const hasImageShadow = style.imageShadow !== false;
  const hasImageHover = style.imageHover !== false;

  return (
    <section
      id={block.id}
      className={cn(
        "relative overflow-hidden transition-all duration-500",
      )}
      style={{
        background: 'var(--block-bg)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        paddingLeft: 'var(--block-px)',
        paddingRight: 'var(--block-px)',
        marginTop: 'var(--block-mt)',
        marginBottom: 'var(--block-mb)',
        marginLeft: 'var(--block-ml)',
        marginRight: 'var(--block-mr)',
        color: 'var(--block-color)',
      }}
    >
      {content.sectionId && (
        <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
      )}
      <BlockBackground
        backgroundImage={content.backgroundImage}
        backgroundAlt={content.backgroundAlt}
        style={style}
        project={project}
        isStatic={isStatic}
        imageMemoryCache={imageMemoryCache}
      />
      <div
        className="mx-auto relative z-10"
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
            className="w-full shrink-0 order-[var(--image-order)]"
            style={{
              order: 'var(--image-order)' as any,
            }}
          >
            <div
              className={cn(
                "relative w-full overflow-hidden transition-all duration-700 h-auto",
                hasImageShadow && "shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
              )}
              style={{
                borderRadius: 'var(--image-radius)',
                aspectRatio: 'var(--image-aspect)'
              }}
            >
              {content.image ? (
                <SitiImage
                  src={content.image}
                  project={project}
                  isStatic={isStatic}
                  imageMemoryCache={imageMemoryCache}
                  alt={content.alt || ''}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-1000 ease-out",
                    hasImageHover && "hover:scale-110"
                  )}
                />
              ) : (
                <div
                  className="w-full bg-zinc-100 flex flex-col items-center justify-center text-zinc-400 p-8 border-2 border-dashed border-zinc-200 h-full"
                  style={{
                    borderRadius: imageRadius
                  }}
                >
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nessuna Immagine</span>
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
            <div className="space-y-4 w-full" style={{ alignItems: 'inherit' }}>
              {content.title && (() => {
                const TitleTag = (style.titleTag || 'h2') as any;
                return (
                  <div
                    className="tracking-tighter transition-all duration-500 leading-[1.1] rt-content"
                    style={{
                      fontSize: 'var(--title-fs)',
                      fontWeight: 'var(--title-fw)' as any,
                      fontStyle: 'var(--title-fs-style)' as any,
                      letterSpacing: 'var(--title-ls)',
                      lineHeight: 'var(--title-lh)',
                      textTransform: 'var(--title-upper)' as any,
                      textAlign: 'inherit',
                      color: 'inherit'
                    }}
                    dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
                  />
                );
              })()}
              {content.text && (
                <div
                  className="rt-content max-w-none transition-all duration-500"
                  style={{
                    fontSize: style.subtitleSize ? 'var(--subtitle-fs)' : 'var(--global-body-fs)',
                    fontWeight: 'var(--subtitle-fw)' as any,
                    fontStyle: 'var(--subtitle-fs-style)' as any,
                    lineHeight: '1.6',
                    opacity: 0.9,
                    textAlign: 'inherit',
                    marginLeft: 'var(--block-ml-auto)',
                    marginRight: 'var(--block-mr-auto)',
                    color: 'inherit'
                  }}
                  dangerouslySetInnerHTML={{ __html: formatRichText(content.text) }}
                />
              )}
            </div>

            <div
              className="pt-4 flex flex-wrap gap-4 w-full"
              style={{
                justifyContent: 'var(--block-justify)',
              }}
            >
              {content.cta && (
                <CTA
                  label={content.cta}
                  url={content.ctaUrl || (content as any).ctaLink}
                  project={project}
                  viewport={viewport as any}
                  theme={content.ctaTheme || style.buttonTheme}
                  isStatic={isStatic}
                />
              )}
              {content.cta2 && (
                <CTA
                  label={content.cta2}
                  url={content.cta2Url}
                  project={project}
                  viewport={viewport as any}
                  theme={content.cta2Theme || 'secondary'}
                  isStatic={isStatic}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
