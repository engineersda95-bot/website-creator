import React from 'react';
import { Block, Project } from '@/types/editor';
import { cn, formatRichText, formatLink, toPx } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';
import { SitiImage } from '@/components/shared/SitiImage';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { InlineEditable } from '@/components/shared/InlineEditable';
import { CTA, getCTAOverrides } from '@/components/shared/CTA';

interface PromoBlockProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  onInlineEdit?: (field: string, value: any) => void;
}

const GRID_LG = {
  1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6'
};

const GRID_MD = {
  1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3',
  4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6'
};

const GRID_SM = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3',
  4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6'
};

export const PromoBlock: React.FC<PromoBlockProps> = ({
  block,
  project,
  viewport,
  isStatic,
  imageMemoryCache,
  onInlineEdit
}) => {
  const { content } = block;
  const { style, isDark } = getBlockStyles(block, project, viewport);
  const { vars } = getBaseStyleVars(style, block, project, viewport || 'desktop');

  const items = content.items || [];
  const blockId = `promo-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const isFullBleed = style.hPadding === 0;

  const animType = style.animationType || 'none';
  const animDuration = style.animationDuration || 0.8;
  const baseDelay = style.animationDelay || 0;

  const colsD = block.style?.columns || 1;
  const colsT = block.responsiveStyles?.tablet?.columns ?? Math.min(colsD, 2);
  const colsM = block.responsiveStyles?.mobile?.columns ?? 1;

  const activeCols = viewport === 'tablet' ? colsT : (viewport === 'mobile' ? colsM : colsD);

  const blockStyles = {
    ...vars,
    background: 'var(--block-bg)',
    marginTop: 'var(--block-mt)',
    marginBottom: 'var(--block-mb)',
    marginLeft: 'var(--block-ml)',
    marginRight: 'var(--block-mr)',
    paddingTop: 'var(--block-pt)',
    paddingBottom: 'var(--block-pb)',
    paddingLeft: isFullBleed ? '0' : 'var(--block-px)',
    paddingRight: isFullBleed ? '0' : 'var(--block-px)',
    width: 'var(--block-width)',
    maxWidth: 'var(--block-max-width)',
    color: 'var(--block-color)',
  };

  const lg = GRID_LG[colsD as 1 | 2 | 3 | 4 | 5 | 6] || 'lg:grid-cols-1';
  const md = GRID_MD[colsT as 1 | 2 | 3 | 4 | 5 | 6] || 'md:grid-cols-2';
  const sm = GRID_SM[colsM as 1 | 2 | 3 | 4 | 5 | 6] || 'grid-cols-1';

  return (
    <section
      id={content.anchorId || blockId}
      className={cn(
        "relative overflow-hidden mx-auto",
        style.parallax ? "bg-fixed" : ""
      )}
      style={blockStyles as any}
    >
      {content.sectionId && <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />}

      <BlockBackground
        backgroundImage={content.backgroundImage}
        backgroundAlt={content.backgroundAlt || content.title || ''}
        style={style}
        project={project}
        isStatic={isStatic}
        imageMemoryCache={imageMemoryCache}
      />

      <div className={cn("relative z-10 w-full mx-auto flex flex-col ", !isFullBleed && "max-w-[var(--block-max-width)]")}>
        {/* Section Title */}
        {content.title && (
          <div
            data-siti-anim={animType !== 'none' ? animType : 'none'}
            data-siti-anim-duration={animDuration}
            data-siti-anim-delay={baseDelay}
            className="w-full mb-[var(--block-gap,32px)]"
            style={{
              '--siti-anim-duration': animDuration + 's',
              '--siti-anim-delay': baseDelay + 's'
            } as any}
          >
            {onInlineEdit ? (
              <InlineEditable
                fieldId="title"
                value={content.title || ''}
                onChange={(v) => onInlineEdit('title', v)}
                className="font-heading leading-tight w-full rt-content"
                style={{
                  fontSize: 'var(--title-fs)',
                  textAlign: (style.titleAlign || style.align || 'center') as any,
                  fontWeight: style.titleBold ? '700' : '400',
                  fontStyle: style.titleItalic ? 'italic' : 'normal',
                  lineHeight: 'var(--title-lh)',
                  letterSpacing: 'var(--title-ls)',
                  textTransform: 'var(--title-upper)' as any,
                  color: 'inherit'
                }}
                placeholder="Titolo sezione..."
              />
            ) : (
              <React.Fragment>
                {(() => {
                  const TitleTag = (style.titleTag || 'h2') as any;
                  return (
                    <TitleTag
                      className="font-heading leading-tight w-full rt-content"
                      style={{
                        fontSize: 'var(--title-fs)',
                        textAlign: (style.titleAlign || style.align || 'center') as any,
                        fontWeight: style.titleBold ? '700' : '400',
                        fontStyle: style.titleItalic ? 'italic' : 'normal',
                        lineHeight: 'var(--title-lh)',
                        letterSpacing: 'var(--title-ls)',
                        textTransform: 'var(--title-upper)' as any,
                        color: 'inherit'
                      }}
                      dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
                    />
                  );
                })()}
              </React.Fragment>
            )}
          </div>
        )}

        <div
          className={cn(
            "grid overflow-y-hidden",
            viewport ? "" : cn(sm, md, lg)
          )}
          style={{
            gridTemplateColumns: viewport ? `repeat(${activeCols}, 1fr)` : undefined,
            gap: 'var(--block-gap, 32px)'
          }}
        >
          {items.map((item: any, i: number) => {
            const itemDelay = baseDelay;

            const handleItemEdit = (field: string, value: string) => {
              if (!onInlineEdit) return;
              const newItems = [...items];
              newItems[i] = { ...newItems[i], [field]: value };
              onInlineEdit('items', newItems as any);
            };

            const hasCTA = item.cta && item.cta.trim().length > 0;
            const useFullLink = item.url && !hasCTA;

            return (
              <div
                key={i}
                className="relative group/promo overflow-hidden flex flex-col"
                style={{
                  aspectRatio: isFullBleed ? 'auto' : (style.imageAspectRatio || '16/9'),
                  minHeight: isFullBleed ? 'var(--promo-min-h, 60vh)' : undefined,
                  borderRadius: isFullBleed ? '0' : (style.imageBorderRadius !== undefined ? `${style.imageBorderRadius}px` : '24px'),
                } as any}
              >
                {/* Image Background */}
                <div className="absolute inset-0 z-0">
                  {item.image ? (
                    <SitiImage
                      src={item.image}
                      project={project}
                      isStatic={isStatic}
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      imageMemoryCache={imageMemoryCache}
                      alt={item.alt || item.title || ''}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover/promo:scale-110 will-change-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center text-zinc-300">
                      <ImageIcon size={48} />
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Nessuna Immagine</span>
                    </div>
                  )}
                </div>

                {/* Overlay (global style, applied to all items) */}
                {!style.overlayDisabled && (
                  <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                      backgroundColor: style.overlayColor || '#000000',
                      opacity: (style.overlayOpacity !== undefined ? style.overlayOpacity : 40) / 100
                    }}
                  />
                )}

                {/* Text Content Overlay */}
                <div
                  className={cn(
                    "absolute inset-0 z-20 p-8 md:p-12 lg:p-20 flex flex-col pointer-events-none",
                    style.verticalAlign === 'top' ? 'justify-start' : (style.verticalAlign === 'bottom' ? 'justify-end' : 'justify-center'),
                    (style.align || 'center') === 'left' ? 'items-start text-left' : ((style.align || 'center') === 'right' ? 'items-end text-right' : 'items-center text-center')
                  )}
                  data-siti-anim={animType !== 'none' ? animType : 'none'}
                  data-siti-anim-duration={animDuration}
                  data-siti-anim-delay={itemDelay}
                  style={{
                    '--siti-anim-duration': animDuration + 's',
                    '--siti-anim-delay': itemDelay + 's',
                  } as any}
                >
                  <div className="w-full max-w-4xl pointer-events-auto">
                    {(() => {
                      const TitleTag = (style.itemTitleTag || 'h3') as any;
                      const titleInlineStyles = {
                        fontSize: 'var(--item-title-fs)',
                        fontWeight: style.itemTitleBold ? '700' : '400',
                        fontStyle: style.itemTitleItalic ? 'italic' : 'normal',
                        color: 'inherit',
                      };

                      if (onInlineEdit) {
                        return (
                          <InlineEditable
                            fieldId={`item-${i}-title`}
                            value={item.title || ''}
                            onChange={(v) => handleItemEdit('title', v)}
                            className="tracking-tighter  leading-tight rt-content mb-4"
                            style={titleInlineStyles}
                            placeholder="Titolo Promo..."
                          />
                        );
                      }
                      return (
                        <TitleTag
                          className="tracking-tighter  leading-tight rt-content mb-4"
                          style={titleInlineStyles}
                          dangerouslySetInnerHTML={{ __html: formatRichText(item.title) }}
                        />
                      );
                    })()}

                    {(() => {
                      const textInlineStyles = {
                        fontSize: 'var(--item-text-fs)',
                        fontWeight: '400',
                        color: 'inherit',
                      };

                      if (onInlineEdit) {
                        return (
                          <InlineEditable
                            fieldId={`item-${i}-text`}
                            value={item.text || ''}
                            onChange={(v) => handleItemEdit('text', v)}
                            className="opacity-90 leading-relaxed rt-content mb-8"
                            style={textInlineStyles}
                            placeholder="Testo promozionale..."
                            multiline
                          />
                        );
                      }
                      return (
                        <div
                          className="opacity-90 leading-relaxed rt-content mb-8"
                          style={textInlineStyles}
                          dangerouslySetInnerHTML={{ __html: formatRichText(item.text) }}
                        />
                      );
                    })()}

                    {hasCTA && (
                      <div className="mt-4">
                        <CTA
                          label={item.cta}
                          url={item.ctaUrl || item.url}
                          project={project}
                          viewport={viewport as any}
                          theme={item.ctaTheme || 'primary'}
                          isStatic={isStatic}
                          onLabelChange={onInlineEdit ? (v: string) => handleItemEdit('cta', v) : undefined}
                          fieldId={`item-${i}-cta`}
                          {...getCTAOverrides(item, style, 'cta', item.ctaTheme || 'primary')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Full Link Overlay (Only if NO CTA) */}
                {useFullLink && (
                  <a
                    {...formatLink(item.url, isStatic)}
                    className="absolute inset-0 z-30 no-underline"
                    aria-label={item.title || 'Link promozionale'}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

