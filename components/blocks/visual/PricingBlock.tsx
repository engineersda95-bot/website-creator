import React from 'react';
import { Block, Project } from '@/types/editor';
import { cn, formatRichText } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { InlineEditable } from '@/components/shared/InlineEditable';
import { CTA, getCTAOverrides } from '@/components/shared/CTA';

interface PricingBlockProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  onInlineEdit?: (field: string, value: string) => void;
}

export const PricingBlock: React.FC<PricingBlockProps> = ({
  block,
  project,
  viewport,
  isStatic,
  imageMemoryCache,
  onInlineEdit
}) => {
  const { content } = block;
  const { style, isDark } = getBlockStyles(block, project, viewport);
  const items = content.items || [];
  const align = style.align || 'center';
  const blockId = `pricing-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const isSlider = content.layout === 'slider';

  // 1. Column and Layout logic
  const colsD = style.columns || 2;
  const colsT = block.responsiveStyles?.tablet?.columns || 2;
  const colsM = block.responsiveStyles?.mobile?.columns || 1;

  const gridClass = viewport 
    ? ({ 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6' }[ (viewport === 'desktop' ? colsD : viewport === 'tablet' ? colsT : colsM) as 1|2|3|4|5|6] || 'grid-cols-1')
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'; // Restore original default if not in editor

  const sliderWidth = viewport
    ? ({ 1: 'w-full', 2: 'w-[calc((100%-2rem)/2)]', 3: 'w-[calc((100%-4rem)/3)]', 4: 'w-[calc((100%-6rem)/4)]', 5: 'w-[calc((100%-8rem)/5)]', 6: 'w-[calc((100%-10rem)/6)]' }[ (viewport === 'desktop' ? colsD : viewport === 'tablet' ? colsT : colsM) as 1|2|3|4|5|6] || 'w-[calc((100%-2rem)/2)]')
    : 'w-full md:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]';

  const animType = style.animationType || 'none';
  const animDuration = style.animationDuration || 0.8;
  const baseDelay = style.animationDelay || 0;
  const animKey = !isStatic ? `${block.id}-${animType}-${animDuration}-${baseDelay}` : 'static';

  const renderItem = (item: any, i: number) => {
    const isHighlighted = item.isHighlighted;
    const itemDelay = baseDelay + 0.1 + (i * 0.05);
    
    return (
      <div 
        key={i} 
        data-siti-anim={animType}
        data-siti-anim-duration={animDuration}
        data-siti-anim-delay={itemDelay}
        className={cn(
          "flex flex-col h-full w-full border relative",
          isHighlighted ? "shadow-xl z-20 border-2" : "shadow-sm hover:shadow-md"
        )}
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: isHighlighted ? 'var(--highlight-color)' : 'rgba(0,0,0,0.1)',
          borderRadius: 'var(--card-radius)',
          padding: 'var(--card-padding)',
          color: 'var(--card-color)',
          '--siti-anim-duration': animDuration + 's',
          '--siti-anim-delay': itemDelay + 's'
        } as any}
      >
        <div className="flex-1 w-full flex flex-col">
          {isHighlighted && (
            <div 
              className="absolute top-4 right-6 px-3 py-1 rounded-full uppercase tracking-widest text-white shadow-sm"
              style={{ backgroundColor: 'var(--highlight-color)', fontSize: 'var(--label-fs)', fontWeight: 'var(--label-fw)', fontStyle: 'var(--label-is)' }}
            >
              {item.highlightLabel || 'Consigliato'}
            </div>
          )}

          <div className="mb-8">
            <div 
              className="uppercase tracking-[0.2em] mb-4 opacity-50 rt-content"
              style={{ fontSize: 'var(--plan-name-fs)', fontWeight: 'var(--plan-name-fw)', fontStyle: 'var(--plan-name-is)', color: 'inherit' }}
              dangerouslySetInnerHTML={{ __html: formatRichText(item.name || 'Piano') }}
            />
            <div className="flex items-baseline gap-1">
              <div 
                className="tracking-tighter rt-content"
                style={{ fontSize: 'var(--price-fs)', fontWeight: 'var(--price-fw)', fontStyle: 'var(--price-is)', color: 'inherit' }}
                dangerouslySetInnerHTML={{ __html: formatRichText(item.price || '0\u20ac') }}
              />
              <div 
                className="opacity-50 rt-content"
                style={{ fontSize: 'var(--period-fs)', fontWeight: 'var(--period-fw)', fontStyle: 'var(--period-is)', color: 'inherit' }}
                dangerouslySetInnerHTML={{ __html: formatRichText(item.period || '') }}
              />
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {(item.features || []).map((feature: string, idx: number) => (
              <li key={idx} className="flex items-start gap-4 opacity-80">
                <div 
                  className="shrink-0 mt-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: isHighlighted ? 'var(--highlight-color)' : 'var(--card-color)', opacity: isHighlighted ? 1 : 0.2 }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
                <div 
                  className="leading-[1.6] rt-content"
                  style={{ fontSize: 'var(--features-fs)', fontWeight: 'var(--features-fw)', fontStyle: 'var(--features-is)', color: 'inherit' }}
                  dangerouslySetInnerHTML={{ __html: formatRichText(feature) }} 
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-4">
          <CTA 
            label={item.buttonText || 'Scegli'} url={item.buttonUrl || '#'} project={project} viewport={viewport} theme={item.buttonTheme || (isHighlighted ? 'primary' : 'secondary')} isStatic={isStatic} className="w-full justify-center py-4 text-center"
            {...getCTAOverrides(item, style, 'buttonText', item.buttonTheme || (isHighlighted ? 'primary' : 'secondary'))}
          />
        </div>
      </div>
    );
  };

  return (
    <section key={animKey} id={blockId} className="relative overflow-hidden pricing-block" style={{
      background: 'var(--block-bg)',
      paddingTop: 'var(--block-pt)',
      paddingBottom: 'var(--block-pb)',
      paddingLeft: 'var(--block-px)',
      paddingRight: 'var(--block-px)',
      color: 'var(--block-color)',
    }}>
      {content.sectionId && <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />}
      <BlockBackground backgroundImage={content.backgroundImage} backgroundAlt={content.backgroundAlt} style={style} project={project} imageMemoryCache={imageMemoryCache} isStatic={isStatic} />
      
      <div className="relative z-10 w-full mx-auto px-0">
        {(content.title || content.subtitle) && (
          <div data-siti-anim={animType} data-siti-anim-duration={animDuration} data-siti-anim-delay={baseDelay} style={{ '--siti-anim-duration': animDuration + 's', '--siti-anim-delay': baseDelay + 's' } as any} className="w-full mb-16">
            {content.title && (() => {
              const TitleTag = (style.titleTag || 'h2') as any;
              return onInlineEdit ? (
                <InlineEditable fieldId="title" value={content.title || ''} onChange={(v) => onInlineEdit('title', v)} className="mb-6 tracking-tighter leading-tight rt-content" style={{ fontSize: 'var(--title-fs)', fontWeight: style.titleBold ? '700' : '400', fontStyle: style.titleItalic ? 'italic' : 'normal', textAlign: align as any, color: 'inherit' }} placeholder="Titolo..." />
              ) : (
                <div className="mb-6 tracking-tighter leading-tight rt-content" style={{ fontSize: 'var(--title-fs)', fontWeight: style.titleBold ? '700' : '400', fontStyle: style.titleItalic ? 'italic' : 'normal', textAlign: align as any, color: 'inherit' }} dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }} />
              );
            })()}
            {content.subtitle && (
              onInlineEdit ? (
                <InlineEditable fieldId="subtitle" value={content.subtitle || ''} onChange={(v) => onInlineEdit('subtitle', v)} className={cn("opacity-70 leading-relaxed whitespace-pre-wrap rt-content", align === 'center' ? "mx-auto" : align === 'right' ? "ml-auto" : "mr-auto")} style={{ fontSize: 'var(--subtitle-fs)', fontWeight: style.subtitleBold ? '700' : '400', fontStyle: style.subtitleItalic ? 'italic' : 'normal', textAlign: align as any, color: 'inherit' }} placeholder="Sottotitolo..." richText multiline />
              ) : (
                <div className={cn("opacity-70 leading-relaxed whitespace-pre-wrap rt-content", align === 'center' ? "mx-auto" : align === 'right' ? "ml-auto" : "mr-auto")} style={{ fontSize: 'var(--subtitle-fs)', fontWeight: style.subtitleBold ? '700' : '400', fontStyle: style.subtitleItalic ? 'italic' : 'normal', textAlign: align as any, color: 'inherit' }} dangerouslySetInnerHTML={{ __html: formatRichText(content.subtitle) }} />
              )
            )}
          </div>
        )}

        {isSlider ? (
          <div className="relative group/slider overflow-hidden">
            <div className="absolute top-1/2 left-2 md:left-4 lg:-left-6 -translate-y-1/2 z-30 transition-all duration-300">
              <button data-arrow="left" className={cn("p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full border transition-all hover:scale-110 active:scale-90 cursor-pointer group/arrow", isDark ? "bg-zinc-900 border-white/10" : "bg-white border-black/5")}>
                <ChevronLeft size={24} />
              </button>
            </div>
            <div className="absolute top-1/2 right-2 md:right-4 lg:-right-6 -translate-y-1/2 z-30 transition-all duration-300">
              <button data-arrow="right" className={cn("p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full border transition-all hover:scale-110 active:scale-90 cursor-pointer group/arrow", isDark ? "bg-zinc-900 border-white/10" : "bg-white border-black/5")}>
                <ChevronRight size={24} />
              </button>
            </div>
            <div className={cn("w-full flex gap-6 md:gap-8 items-stretch flex-row overflow-x-auto no-scrollbar transition-all scroll-container snap-x snap-mandatory")}>
              {items.map((item: any, i: number) => (
                <div key={i} className={cn("shrink-0 h-auto flex snap-center", sliderWidth)}>
                  {renderItem(item, i)}
                </div>
              ))}
            </div>
            <div dangerouslySetInnerHTML={{ __html: `<script>
              (function() {
                const b = document.getElementById('${blockId}'); if (!b) return;
                const c = b.querySelector('.scroll-container'); const l = b.querySelector('[data-arrow="left"]'); const r = b.querySelector('[data-arrow="right"]');
                if (c) {
                  const card = c.querySelector('div'); if (!card) return;
                  const getS = () => card.offsetWidth + 32;
                  if (l) l.onclick = () => c.scrollBy({ left: -getS(), behavior: 'smooth' });
                  if (r) r.onclick = () => c.scrollBy({ left: getS(), behavior: 'smooth' });
                }
              })();
            </script>`}} />
          </div>
        ) : (
          <div className={cn("grid gap-8 items-stretch", gridClass)} style={{ gap: 'var(--card-gap)' }}>
            {items.map((item: any, i: number) => renderItem(item, i))}
          </div>
        )}
      </div>
    </section>
  );
};
