import React from 'react';
import { Block, Project } from '@/types/editor';
import { cn, formatRichText, formatLink } from '@/lib/utils';
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { SitiImage } from '@/components/shared/SitiImage';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { resolveImageUrl } from '@/lib/image-utils';
import { BlockBackground } from '@/components/shared/BlockBackground';


interface CardsBlockProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

export const CardsBlock: React.FC<CardsBlockProps> = ({ 
  block, 
  project, 
  viewport, 
  isStatic,
  imageMemoryCache
}) => {

  const { content } = block;
  const { style, isDark } = getBlockStyles(block, project, viewport);
  
  const items = content.items || [];
  const align = style.align || 'center';
  const blockId = `cards-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';
  const isSlider = content.layout === 'slider';

  const colsD = block.style?.columns || 3;
  const colsT = block.responsiveStyles?.tablet?.columns || 2;
  const colsM = block.responsiveStyles?.mobile?.columns || 1;


  const hasImageShadow = style.imageShadow !== false;
  const hasImageHover = style.imageHover !== false;
  
  // 1. Define Tailwind Breakpoint Maps (MUST BE LITERAL FOR JIT)
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

  // 2. Resolve final classes based on Environment (Editor vs Live)
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



  const CardItem = ({ item }: { item: any }) => {
    const cardContent = (
      <div 
        className={cn(
          "flex flex-col group/card h-full transition-all duration-500",
          align === 'center' ? "items-center text-center" : align === 'right' ? "items-end text-right" : "items-start text-left"
        )}
      >
        <div 
          className={cn(
            "relative w-full overflow-hidden mb-6 transition-all duration-700 bg-zinc-100 flex items-center justify-center",
            hasImageShadow && "shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
          )}
          style={{
            borderRadius: style.imageBorderRadius !== undefined ? `${style.imageBorderRadius}px` : '24px',
            aspectRatio: 'var(--image-aspect)'
          }}
        >
          {item.image ? (
            <SitiImage 
              src={item.image}
              project={project}
              isStatic={isStatic}
              imageMemoryCache={imageMemoryCache}
              alt={item.alt || item.title || ''}
              className={cn(
                "w-full h-full object-cover transition-transform duration-1000 ease-out",
                hasImageHover && "group-hover/card:scale-110"
              )}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-300">
              <ImageIcon size={40} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Nessuna Immagine</span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 w-full min-w-0">
          {(() => {
            const ItemTitleTag = (style.itemTitleTag || 'h3') as any;
            return (
              <div 
                className="mb-2 tracking-tight transition-all duration-500 leading-tight rt-content"
                style={{ 
                  fontSize: 'var(--item-title-fs)',
                  fontWeight: 'var(--item-title-fw)',
                  fontStyle: 'var(--item-title-is)',
                  color: 'inherit'
                }}
                dangerouslySetInnerHTML={{ __html: formatRichText(item.title || 'Titolo Card') }}
              />
            );
          })()}
          <div 
            className="opacity-70 leading-relaxed transition-all duration-500 rt-content"
            style={{ 
              fontSize: style.cardSubtitleSize ? `${style.cardSubtitleSize}px` : undefined,
              fontWeight: style.cardSubtitleBold ? '700' : '400',
              fontStyle: style.cardSubtitleItalic ? 'italic' : 'normal',
              color: 'inherit'
            }}
            dangerouslySetInnerHTML={{ __html: formatRichText(item.subtitle || 'Descrizione card.') }}
          />
        </div>
      </div>
    );

    if (item.url) {
      return (
        <a {...formatLink(item.url, isStatic)} className="no-underline text-inherit block h-full">
          {cardContent}
        </a>
      );
    }
    return cardContent;
  };

  const blockStyles = {
    background: 'var(--block-bg)',
    paddingTop: 'var(--block-pt)',
    paddingBottom: 'var(--block-pb)',
    paddingLeft: 'var(--block-px)',
    paddingRight: 'var(--block-px)',
    color: 'var(--block-color)',
  };

  const isGradient = style.cardBgType === 'gradient';
  const cardBgStyle = isGradient 
    ? { background: `linear-gradient(${style.cardBgDirection || 'to bottom'}, ${style.cardBgColor || 'transparent'}, ${style.cardBgColor2 || 'transparent'})` }
    : { backgroundColor: style.cardBgColor || 'transparent' };

  return (
    <section id={blockId} className="relative overflow-hidden cards-block" style={blockStyles}>
      {content.sectionId && (
        <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
      )}
      <BlockBackground 
        backgroundImage={content.backgroundImage} 
        backgroundAlt={content.backgroundAlt}
        style={style} 
        project={project} 
        imageMemoryCache={imageMemoryCache} 
        isStatic={isStatic}
      />
      <div className="relative z-10">
        {content.title && (() => {
          const TitleTag = (style.titleTag || 'h2') as any;
          return (
            <div 
              className="mb-16 tracking-tighter transition-all duration-500 leading-tight rt-content"
              style={{ 
                fontSize: 'var(--title-fs)',
                fontWeight: style.titleBold ? '700' : '400',
                fontStyle: style.titleItalic ? 'italic' : 'normal',
                textAlign: align as any,
                color: 'inherit'
              }}
              dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
            />
          );
        })()}

        {isSlider ? (
          <div className="relative group/slider">
            {/* Slider Navigation Arrows */}
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
                "flex gap-6 md:gap-8 pb-4 items-stretch flex-row overflow-x-auto snap-x snap-mandatory scroll-container no-scrollbar transition-all"
              )} 
            >
              {items.map((item: any, i: number) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex flex-col transition-all duration-500 min-w-0 shrink-0 snap-center",
                    sliderWidth,
                    colsD === 1 && "lg:max-w-4xl lg:mx-auto",
                    (style.cardBgColor || isGradient) && "rounded-[var(--card-radius),_2rem] border border-black/5 dark:border-white/5",
                    (style.cardBgColor || isGradient) && (colsD > 4 ? "p-4 md:p-6" : "p-6 md:p-8")
                  )}
                  style={{
                    color: style.cardTextColor || undefined,
                    padding: style.cardPadding !== undefined ? `${style.cardPadding}px` : undefined,
                    ...cardBgStyle
                  }}
                >
                  <CardItem item={item} />
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
                  const getS = () => card.offsetWidth + 32;
                  if (l) l.onclick = () => c.scrollBy({ left: -getS(), behavior: 'smooth' });
                  if (r) r.onclick = () => c.scrollBy({ left: getS(), behavior: 'smooth' });
                }
              })();
            </script>`}} />
          </div>
        ) : (
          <div 
            className={cn(
              "grid gap-6 md:gap-12 pb-8 md:pb-0",
              gridClass
            )}

          >
            {items.map((item: any, i: number) => (
              <div 
                key={i} 
                className={cn(
                  "flex flex-col transition-all duration-500 min-w-0 w-full",
                  colsD === 1 && "lg:max-w-4xl lg:mx-auto",
                  (style.cardBgColor || isGradient) && "rounded-[var(--card-radius),_2rem] border border-black/5 dark:border-white/5",
                  (style.cardBgColor || isGradient) && (colsD > 4 ? "p-4 md:p-6" : "p-6 md:p-8")
                )}
                style={{
                  color: style.cardTextColor || undefined,
                  padding: style.cardPadding !== undefined ? `${style.cardPadding}px` : undefined,
                  ...cardBgStyle
                }}
              >
                <CardItem item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};



