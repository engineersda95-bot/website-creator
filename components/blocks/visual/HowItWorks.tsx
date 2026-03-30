import React from 'react';
import { Block, Project } from '@/types/editor';
import { cn, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { InlineEditable } from '@/components/shared/InlineEditable';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HowItWorksBlockProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  onInlineEdit?: (field: string, value: string) => void;
}

export const HowItWorks: React.FC<HowItWorksBlockProps> = ({
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
  const blockId = `how-it-works-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const isMobile = viewport === 'mobile';
  const layout = style.layout || 'grid'; // 'grid', 'linear'
  const isSlider = content.layout === 'slider';

  const colsD = block.style?.columns || 3;
  const colsT = (block.responsiveStyles as any)?.tablet?.columns || 2;
  const colsM = (block.responsiveStyles as any)?.mobile?.columns || 1;

  const currentCols = viewport === 'desktop' ? colsD : viewport === 'tablet' ? colsT : colsM;
  
  const gridClass = viewport 
    ? ({
        1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4'
      }[currentCols as 1|2|3|4] || 'grid-cols-1')
    : 'grid-cols-1 md:grid-cols-3';

  const sliderWidth = viewport
    ? ({
        1: 'w-full', 
        2: 'w-[calc((100%-var(--block-gap,2rem)*1)/2)]', 
        3: 'w-[calc((100%-var(--block-gap,2rem)*2)/3)]', 
        4: 'w-[calc((100%-var(--block-gap,2rem)*3)/4)]'
      }[currentCols as 1|2|3|4] || 'w-[calc((100%-2rem)/3)]')
    : 'w-full md:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]';

  const blockStyles = {
    background: 'var(--block-bg)',
    paddingTop: 'var(--block-pt)',
    paddingBottom: 'var(--block-pb)',
    paddingLeft: 'var(--block-px)',
    paddingRight: 'var(--block-px)',
    color: 'var(--block-color)',
  };

  const primaryColor = project.settings.primaryColor || '#000';

  const titleStyles = {
    fontSize: style.itemTitleSize ? `${style.itemTitleSize}px` : undefined,
    fontWeight: style.itemTitleBold ? '700' : 'bold',
  };

  const descStyles = {
    fontSize: style.itemDescSize ? `${style.itemDescSize}px` : undefined,
  };

  const numberStyle = {
    backgroundColor: style.numberBgColor || style.textColor || primaryColor,
    color: style.numberTextColor || style.backgroundColor || '#fff',
  };

  // ─── Shared pieces ─────────────────────────────────────────────────
  const StepTitle = ({ item, index }: { item: any; index: number }) => (
    <div
      className="mb-2 tracking-tight transition-all duration-300 rt-content"
      style={{ fontSize: 'var(--item-title-fs)', fontWeight: 'var(--item-title-fw)', fontStyle: 'var(--item-title-is)', color: 'inherit' }}
      dangerouslySetInnerHTML={{ __html: formatRichText(item.title || `Step ${index + 1}`) }}
    />
  );
  const StepDesc = ({ item }: { item: any }) => (
    <div
      className="opacity-70 leading-relaxed transition-all duration-300 rt-content"
      style={{ ...descStyles, color: 'inherit' }}
      dangerouslySetInnerHTML={{ __html: formatRichText(item.description || 'Descrizione del passaggio.') }}
    />
  );
  const NumberBox = ({ item, index, size = 56 }: { item: any; index: number; size?: number }) => (
    <div
      className="rounded-2xl flex items-center justify-center font-black text-white shrink-0 shadow-lg transition-all"
      style={{ ...numberStyle, width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.36)}px` }}
    >
      {item.number || (index + 1)}
    </div>
  );

  const variant = content.variant || 'cards';

  // ─── CARDS variant (default) ──────────────────────────────────────
  const CardsStep = ({ item, index, layoutType }: { item: any; index: number; layoutType: string }) => (
    <div className={cn(
      "relative flex flex-col transition-all duration-500",
      layoutType === 'grid' ? (
        align === 'center' ? "items-center text-center group" :
        align === 'right' ? "items-end text-right group" :
        "items-start text-left group"
      ) : (
        align === 'center' ? "flex-col md:flex-row items-center text-center md:text-left gap-6 md:gap-10" :
        align === 'right' ? "flex-col md:flex-row-reverse items-center md:items-start text-center md:text-right gap-6 md:gap-10" :
        "flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-10"
      )
    )}>
      <div className={cn(layoutType === 'grid' ? "mb-6 group-hover:scale-110 transition-transform" : "")}>
        <NumberBox item={item} index={index} size={layoutType === 'grid' ? 56 : 48} />
      </div>
      <div className="flex-1">
        <StepTitle item={item} index={index} />
        <StepDesc item={item} />
      </div>
    </div>
  );

  // ─── MINIMAL variant — big faded number, text beside it ────────────
  const MinimalStep = ({ item, index }: { item: any; index: number }) => (
    <div className="flex gap-5">
      <span className="text-4xl font-black tabular-nums shrink-0 leading-none pt-1" style={{ color: 'currentColor', opacity: 0.1 }}>
        {String(item.number || index + 1).padStart(2, '0')}
      </span>
      <div className="flex-1 min-w-0">
        <StepTitle item={item} index={index} />
        <StepDesc item={item} />
      </div>
    </div>
  );

  // ─── TIMELINE variant — dot + line + content ──────────────────────
  const TimelineStep = ({ item, index }: { item: any; index: number }) => (
    <div className="flex gap-5 relative">
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
          style={numberStyle}
        >
          {item.number || (index + 1)}
        </div>
        <div className="w-px flex-1" style={{ background: 'color-mix(in srgb, currentColor 12%, transparent)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <StepTitle item={item} index={index} />
        <StepDesc item={item} />
      </div>
    </div>
  );

  // ─── COMPACT variant — small circle + content ─────────────────────
  const CompactStep = ({ item, index }: { item: any; index: number }) => (
    <div className="flex gap-4">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
        style={{ background: 'color-mix(in srgb, currentColor 8%, transparent)', color: 'inherit', opacity: 0.6 }}
      >
        {item.number || (index + 1)}
      </div>
      <div className="flex-1 min-w-0">
        <StepTitle item={item} index={index} />
        <StepDesc item={item} />
      </div>
    </div>
  );

  // ─── Router ───────────────────────────────────────────────────────
  const StepItem = ({ item, index, layoutType }: { item: any; index: number; layoutType: string }) => {
    switch (variant) {
      case 'minimal': return <MinimalStep item={item} index={index} />;
      case 'timeline': return <TimelineStep item={item} index={index} />;
      case 'compact': return <CompactStep item={item} index={index} />;
      default: return <CardsStep item={item} index={index} layoutType={layoutType} />;
    }
  };

  return (
    <section id={blockId} className="relative overflow-hidden how-it-works-block" style={blockStyles}>
      {content.sectionId && (
        <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
      )}
      <BlockBackground 
        backgroundImage={content.backgroundImage} 
        backgroundAlt={(content as any).backgroundAlt}
        style={style} 
        project={project} 
        isStatic={isStatic} 
        imageMemoryCache={imageMemoryCache}
      />
      <div className="relative z-10 max-w-7xl mx-auto">
        {content.title && (() => {
          const TitleTag = (style.titleTag || 'h2') as any;
          return onInlineEdit ? (
            <InlineEditable
              value={content.title || ''}
              onChange={(v) => onInlineEdit('title', v)}
              className={cn(
                  "mb-16 tracking-tighter transition-all duration-500 leading-tight rt-content",
                  align === 'center' ? "text-center" : align === 'right' ? "text-right" : "text-left"
              )}
              style={{
                fontSize: 'var(--title-fs)',
                fontWeight: style.titleBold ? '700' : '400',
                fontStyle: style.titleItalic ? 'italic' : 'normal',
                color: 'inherit'
              }}
              placeholder="Titolo..."
            />
          ) : (
            <div
              className={cn(
                  "mb-16 tracking-tighter transition-all duration-500 leading-tight rt-content",
                  align === 'center' ? "text-center" : align === 'right' ? "text-right" : "text-left"
              )}
              style={{
                fontSize: 'var(--title-fs)',
                fontWeight: style.titleBold ? '700' : '400',
                fontStyle: style.titleItalic ? 'italic' : 'normal',
                color: 'inherit'
              }}
              dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
            />
          );
        })()}

        {layout === 'linear' ? (
          <div 
            className={cn(
                "mx-auto flex flex-col items-stretch",
                align === 'center' ? "max-w-4xl" : "max-w-7xl"
            )}
            style={{ gap: 'var(--block-gap, 3rem)' }}
          >
            {items.map((item: any, i: number) => (
              <StepItem key={i} item={item} index={i} layoutType="linear" />
            ))}
          </div>
        ) : isSlider ? (
          <div className="relative group/slider">
            <div className="absolute top-1/2 left-2 md:left-4 lg:-left-6 -translate-y-1/2 z-30 transition-all duration-300">
              <button 
                data-arrow="left" 
                className={cn(
                  "p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full border transition-all hover:scale-110 active:scale-90 cursor-pointer group/arrow",
                  isDark ? "bg-zinc-900 border-white/10" : "bg-white border-black/5"
                )}
              >
                <ChevronLeft size={24} style={{ color: style.textColor }} />
              </button>
            </div>
            <div className="absolute top-1/2 right-2 md:right-4 lg:-right-6 -translate-y-1/2 z-30 transition-all duration-300">
              <button 
                data-arrow="right" 
                className={cn(
                  "p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full border transition-all hover:scale-110 active:scale-90 cursor-pointer group/arrow",
                  isDark ? "bg-zinc-900 border-white/10" : "bg-white border-black/5"
                )}
              >
                <ChevronRight size={24} style={{ color: style.textColor }} />
              </button>
            </div>

            <div
              className={cn(
                "flex pb-4 items-stretch flex-row overflow-x-auto snap-x snap-mandatory scroll-container no-scrollbar transition-all"
              )}
              style={{ gap: 'var(--block-gap, 2rem)', paddingLeft: `${style.sliderPadding ?? 48}px`, paddingRight: `${style.sliderPadding ?? 48}px` }}
            >
              {items.map((item: any, i: number) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex flex-col transition-all duration-500 min-w-0 shrink-0 snap-center",
                    sliderWidth
                  )}
                >
                  <StepItem item={item} index={i} layoutType="grid" />
                </div>
              ))}
            </div>

            <div dangerouslySetInnerHTML={{ __html: `<script>
              (function() {
                const b = document.getElementById('${blockId}');
                if (!b) return;
                const c = b.querySelector('.scroll-container');
                const l = b.querySelector('[data-arrow="left"]');
                const r = b.querySelector('[data-arrow="right"]');
                if (c) {
                  const card = c.querySelector('div');
                  if (!card) return;
                  const g = parseInt(getComputedStyle(c).gap) || 32;
                  const getS = () => card.offsetWidth + g;
                  if (l) l.onclick = () => c.scrollBy({ left: -getS(), behavior: 'smooth' });
                  if (r) r.onclick = () => c.scrollBy({ left: getS(), behavior: 'smooth' });
                }
              })();
            </script>`}} />
          </div>
        ) : (
          <div 
            className={cn("grid relative", gridClass)}
            style={{ gap: 'var(--block-gap, 3rem)' }}
          >
            {/* Horizontal Line Connections */}
            {align === 'center' && currentCols > 1 && (
                <div className="absolute top-[28px] left-[10%] right-[10%] h-px bg-black/5 dark:bg-white/5 hidden md:block" />
            )}
            {items.map((item: any, i: number) => (
              <StepItem key={i} item={item} index={i} layoutType="grid" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
