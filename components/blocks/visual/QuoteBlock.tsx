import React from 'react';
import { Block, Project } from '@/types/editor';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/image-utils';
import { Star, Quote as QuoteIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { InlineEditable } from '@/components/shared/InlineEditable';

interface QuoteBlockProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  onInlineEdit?: (field: string, value: string) => void;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ block, project, viewport, isStatic, imageMemoryCache, onInlineEdit }) => {
  const { content } = block;
  const variant = content.variant || 'cards';
  const { style, viewport: currentVp, isDark, theme } = getBlockStyles(block, project, viewport);

  const items = content.items || [];

  if (items.length === 0 && !content.title) return null;

  const layout = content.layout || 'grid';
  const visualType = content.visualType || 'quotes';
  const avatarShape = content.avatarShape || 'circle';
  const avatarSize = content.avatarSize || 60;
  const avatarAspectRatio = content.avatarAspectRatio || '1/1';
  const align = style.align || 'center';
  const blockId = `quote-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const isSlider = layout === 'slider' || variant === 'spotlight';
  
  const colsD = block.style?.columns || 3;
  const colsT = block.responsiveStyles?.tablet?.columns || 2;
  const colsM = block.responsiveStyles?.mobile?.columns || 1;


  const blockStyles = {
    background: 'var(--block-bg)',
    paddingTop: `${style.paddingTop ?? style.padding ?? 20}px`,
    paddingBottom: `${style.paddingBottom ?? style.padding ?? 20}px`,
    paddingLeft: `${style.paddingLeft ?? style.hPadding ?? 20}px`,
    paddingRight: `${style.paddingRight ?? style.hPadding ?? 20}px`,
    marginTop: `${style.marginTop || 0}px`,
    marginBottom: `${style.marginBottom || 0}px`,
    color: style.textColor || 'inherit',
    borderRadius: `${style.borderRadius || 0}px`,
    borderWidth: `${style.borderWidth || 0}px`,
    borderColor: style.borderColor || 'transparent',
    borderStyle: (style.borderWidth || 0) > 0 ? 'solid' : 'none',
  };

  const defaultBg = isDark ? (theme?.dark?.bg || '#161618') : (theme?.light?.bg || '#ffffff');
  const defaultText = isDark ? (theme?.dark?.text || '#ffffff') : (theme?.light?.text || '#000000');
  const cardStyles = {
    backgroundColor: style.cardBgType === 'gradient' ? 'transparent' : (style.cardBgColor || defaultBg),
    backgroundImage: style.cardBgType === 'gradient'
      ? `linear-gradient(${style.cardBgDirection || 'to bottom'}, ${style.cardBgColor || 'transparent'}, ${style.cardBgColor2 || 'transparent'})`
      : 'none',
    color: style.cardTextColor || defaultText,
    padding: style.cardPadding !== undefined ? `${style.cardPadding}px` : undefined,
  };

  // Grid Maps specifically for Tailwind 4 JIT
  const gridLg = {
    1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 
    4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6'
  }[colsD as 1|2|3|4|5|6] || 'lg:grid-cols-3';

  const gridMd = {
    1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 
    4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6'
  }[colsT as 1|2|3|4|5|6] || 'md:grid-cols-2';

  const gridSm = {
    1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 
    4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6'
  }[colsM as 1|2|3|4|5|6] || 'grid-cols-1';

  // For Slider Widths
  const slSm = {
    1: 'w-full', 2: 'w-[calc((100%-2rem)/2)]', 3: 'w-[calc((100%-4rem)/3)]',
    4: 'w-[calc((100%-6rem)/4)]', 5: 'w-[calc((100%-8rem)/5)]', 6: 'w-[calc((100%-10rem)/6)]',
  }[colsM as 1|2|3|4|5|6] || 'w-full';

  const slMd = {
    1: 'md:w-full', 2: 'md:w-[calc((100%-2rem)/2)]', 3: 'md:w-[calc((100%-4rem)/3)]',
    4: 'md:w-[calc((100%-6rem)/4)]', 5: 'md:w-[calc((100%-8rem)/5)]', 6: 'md:w-[calc((100%-10rem)/6)]',
  }[colsT as 1|2|3|4|5|6] || 'md:w-[calc((100%-2rem)/2)]';

  const slLg = {
    1: 'lg:w-full', 2: 'lg:w-[calc((100%-2rem)/2)]', 3: 'lg:w-[calc((100%-4rem)/3)]',
    4: 'lg:w-[calc((100%-6rem)/4)]', 5: 'lg:w-[calc((100%-8rem)/5)]', 6: 'lg:w-[calc((100%-10rem)/6)]',
  }[colsD as 1|2|3|4|5|6] || 'lg:w-[calc((100%-4rem)/3)]';

  // Resolve grid and slider classes based on whether we are in editor or live
  const gridClass = viewport 
    ? ({
        1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 
        4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6'
      }[ (viewport === 'desktop' ? colsD : viewport === 'tablet' ? colsT : colsM) as 1|2|3|4|5|6] || 'grid-cols-1')
    : cn(gridSm, gridMd, gridLg);

  const sliderWidth = viewport
    ? ({
        1: 'w-full', 2: 'w-[calc((100%-2rem)/2)]', 3: 'w-[calc((100%-4rem)/3)]',
        4: 'w-[calc((100%-6rem)/4)]', 5: 'w-[calc((100%-8rem)/5)]', 6: 'w-[calc((100%-10rem)/6)]',
      }[ (viewport === 'desktop' ? colsD : viewport === 'tablet' ? colsT : colsM) as 1|2|3|4|5|6] || 'w-[calc((100%-4rem)/3)]')
    : cn(slSm, slMd, slLg);



  // ─── Shared sub-components ─────────────────────────────────────────
  const Stars = ({ count }: { count: number }) => (
    <div className="flex gap-1 shrink-0">
      {[...Array(5)].map((_, idx) => (
        <Star key={idx} size={14} className={cn(idx < count ? "text-amber-400 fill-amber-400" : "text-zinc-400 opacity-20")} />
      ))}
    </div>
  );

  const Avatar = ({ item, size, ratio }: { item: any; size?: number; ratio?: string }) => (
    item.avatar ? (
      <div
        style={{ width: `${size || avatarSize}px`, aspectRatio: ratio || avatarAspectRatio }}
        className={cn("overflow-hidden shrink-0 border border-black/5 dark:border-white/10 shadow-lg", avatarShape === 'circle' ? "rounded-full" : "rounded-2xl")}
      >
        <img src={resolveImageUrl(item.avatar, project)} alt={item.avatarAlt || item.name} className="w-full h-full object-cover" />
      </div>
    ) : null
  );

  const AuthorInfo = ({ item }: { item: any }) => (
    <div className={cn("min-w-0 flex-1", align === 'right' && "text-right")}>
      {(() => {
        const ItemTitleTag = (style.itemTitleTag || 'h4') as any;
        return (
          <ItemTitleTag
            style={{ fontSize: 'var(--item-title-fs)', fontWeight: 'var(--item-title-fw)' as any, fontStyle: 'var(--item-title-is)' as any }}
            className="tracking-tight leading-snug whitespace-normal break-words mb-1 rt-content"
          >{item.name}</ItemTitleTag>
        );
      })()}
      <p style={{ fontSize: 'var(--review-role-fs)', fontWeight: 'var(--review-role-fw)' as any, fontStyle: 'var(--review-role-is)' as any }}
        className="opacity-40 uppercase tracking-widest text-[9px] leading-snug whitespace-normal break-words rt-content"
      >{item.role}</p>
    </div>
  );

  const QuoteText = ({ item }: { item: any }) => (
    <p
      style={{ fontSize: 'var(--review-fs)', fontWeight: 'var(--review-fw)' as any, fontStyle: 'var(--review-is)' as any, textAlign: align as any }}
      className="leading-relaxed opacity-80 whitespace-pre-wrap break-words w-full rt-content"
    >{"\u201C"}{item.text}{"\u201D"}</p>
  );

  // ─── CARDS variant (default) ──────────────────────────────────────
  const CardsContent = ({ item }: { item: any }) => (
    <>
      <div className="flex-1 flex flex-col w-full min-w-0">
        <div className={cn("mb-8 flex", align === 'center' ? "justify-center" : align === 'right' ? "justify-end" : "justify-start")}>
          {visualType === 'stars' ? <Stars count={item.stars} /> : <QuoteIcon size={44} className="opacity-20 translate-y-2 shrink-0" />}
        </div>
        <div className="mb-10"><QuoteText item={item} /></div>
      </div>
      <div className={cn("flex items-center gap-5 mt-auto pt-8 border-t border-black/5 dark:border-white/5 w-full min-w-0", align === 'center' ? "justify-center" : align === 'right' ? "justify-end flex-row-reverse" : "justify-start")}>
        <Avatar item={item} />
        <AuthorInfo item={item} />
      </div>
    </>
  );

  // ─── MINIMAL variant — left border, no card bg ────────────────────
  const MinimalContent = ({ item }: { item: any }) => (
    <div className="flex gap-5 w-full">
      <div className="w-1 shrink-0 rounded-full self-stretch" style={{ background: 'color-mix(in srgb, currentColor 15%, transparent)' }} />
      <div className="flex-1 min-w-0 flex flex-col">
        {visualType === 'stars' && <div className="mb-3"><Stars count={item.stars} /></div>}
        <div className="mb-4"><QuoteText item={item} /></div>
        <div className="flex items-center gap-3 mt-auto">
          <Avatar item={item} size={Math.min(avatarSize, 36)} ratio="1/1" />
          <AuthorInfo item={item} />
        </div>
      </div>
    </div>
  );

  // ─── SPOTLIGHT variant — big centered quote ───────────────────────
  const SpotlightContent = ({ item }: { item: any }) => (
    <div className="flex flex-col items-center text-center w-full">
      <QuoteIcon size={48} className="opacity-10 mb-6" />
      <p
        style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)', fontWeight: 'var(--review-fw)' as any, fontStyle: 'var(--review-is)' as any }}
        className="leading-[1.6] opacity-80 mb-8 max-w-3xl mx-auto whitespace-pre-wrap break-words rt-content"
      >{item.text}</p>
      <Avatar item={item} />
      <div className="mt-4 text-center">
        <AuthorInfo item={item} />
      </div>
      {visualType === 'stars' && <div className="mt-3"><Stars count={item.stars} /></div>}
    </div>
  );

  // ─── BUBBLE variant — chat-style with avatar outside ──────────────
  const BubbleContent = ({ item }: { item: any }) => (
    <>
      <div className="flex-1 flex flex-col w-full min-w-0">
        {visualType === 'stars' && <div className="mb-3"><Stars count={item.stars} /></div>}
        <div className="mb-4"><QuoteText item={item} /></div>
      </div>
      <div className="flex items-center gap-3 mt-auto pt-4">
        <Avatar item={item} size={Math.min(avatarSize, 40)} ratio="1/1" />
        <div className="min-w-0">
          <span style={{ fontSize: 'var(--item-title-fs)', fontWeight: 'var(--item-title-fw)' as any }} className="tracking-tight block">{item.name}</span>
          {item.role && <span style={{ fontSize: 'var(--review-role-fs)' }} className="opacity-40 block">{item.role}</span>}
        </div>
      </div>
    </>
  );

  // ─── Pick the right content renderer ──────────────────────────────
  const CardContent = ({ item, index }: { item: any; index?: number }) => {
    switch (variant) {
      case 'minimal': return <MinimalContent item={item} />;
      case 'spotlight': return <SpotlightContent item={item} />;
      case 'bubble': return <BubbleContent item={item} />;
      default: return <CardsContent item={item} />;
    }
  };

  return (
    <section id={blockId} style={blockStyles} className="relative overflow-hidden quote-block">
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
      <div className="relative z-10 text-left">
        {content.title && (() => {
          const TitleTag = (style.titleTag || 'h2') as any;
          return onInlineEdit ? (
            <InlineEditable
              value={content.title || ''}
              onChange={(v) => onInlineEdit('title', v)}
              className="mb-16 tracking-tighter leading-tight"
              style={{
                fontSize: 'var(--title-fs)',
                fontWeight: style.titleBold ? '700' : '400',
                fontStyle: style.titleItalic ? 'italic' : 'normal',
                textAlign: align as any
              }}
              placeholder="Titolo..."
            />
          ) : (
            <TitleTag
              style={{
                fontSize: 'var(--title-fs)',
                fontWeight: style.titleBold ? '700' : '400',
                fontStyle: style.titleItalic ? 'italic' : 'normal',
                textAlign: align as any
              }}
              className="mb-16 tracking-tighter leading-tight"
            >
              {content.title}
            </TitleTag>
          );
        })()}

        {isSlider ? (
          <div className="relative group/quote">
            <div className="absolute top-1/2 left-2 md:-left-6 -translate-y-1/2 z-30 transition-all duration-300">
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
            <div className="absolute top-1/2 right-2 md:-right-6 -translate-y-1/2 z-30 transition-all duration-300">
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
                "flex gap-8 pb-4 items-stretch overflow-x-auto snap-x snap-mandatory scroll-container no-scrollbar transition-all",
                "flex-row"
              )}
            >
              {items.map((item: any, i: number) => (
                <div
                  key={i}
                  style={cardStyles}
                  className={cn(
                    "p-8 md:p-10 rounded-[3rem] border border-black/5 dark:border-white/5 flex flex-col shadow-sm shrink-0 min-w-0 snap-center",
                    sliderWidth,
                    colsD === 1 && "lg:max-w-4xl lg:mx-auto"
                  )}
                >
                  <CardContent item={item} index={i} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn("grid gap-8", gridClass)}>
            {items.map((item: any, i: number) => (
              <div
                key={i}
                style={cardStyles}
                className={cn(
                  "w-full p-8 md:p-10 rounded-[3rem] border border-black/5 dark:border-white/5 flex flex-col shadow-sm min-w-0",
                  colsD === 1 && "lg:max-w-4xl lg:mx-auto"
                )}
              >
                <CardContent item={item} index={i} />
              </div>
            ))}
          </div>
        )}

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
              const getS = () => card.offsetWidth + 32;
              if (l) l.onclick = () => c.scrollBy({ left: -getS(), behavior: 'smooth' });
              if (r) r.onclick = () => c.scrollBy({ left: getS(), behavior: 'smooth' });
            }
          })();
        </script>`}} />
      </div>
    </section>
  );
};

