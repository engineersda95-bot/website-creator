import React from 'react';
import { Block, Project } from '@/types/editor';
import { cn, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HowItWorksBlockProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

export const HowItWorks: React.FC<HowItWorksBlockProps> = ({ 
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

  const StepItem = ({ item, index, layoutType }: { item: any, index: number, layoutType: string }) => {
    const ItemTitleTag = (style.itemTitleTag || 'h3') as any;
    
    return (
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
        {/* Number Icon */}
        <div 
          className={cn(
            "rounded-2xl flex items-center justify-center font-black text-white shrink-0 shadow-lg z-10 transition-all",
            layoutType === 'grid' ? "w-[56px] h-[56px] text-xl mb-6 group-hover:scale-110" : 
            "w-[48px] h-[48px] md:w-[64px] md:h-[64px] text-lg md:text-2xl"
          )}
          style={numberStyle}
        >
          {item.number || (index + 1)}
        </div>

        {/* Content */}
        <div className="flex-1">
          <ItemTitleTag 
            className="mb-2 tracking-tight transition-all duration-300" 
            style={{
              fontSize: style.itemTitleSize ? `${style.itemTitleSize}px` : `var(--global-${style.itemTitleTag || 'h3'}-fs)`,
              fontWeight: style.itemTitleBold ? '700' : 'bold',
            }}
          >
            {item.title || `Step ${index + 1}`}
          </ItemTitleTag>
          <p className="opacity-70 leading-relaxed transition-all duration-300" style={descStyles}>
            {item.description || 'Descrizione del passaggio.'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section id={blockId} className="relative overflow-hidden how-it-works-block" style={blockStyles}>
      {content.sectionId && (
        <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
      )}
      <BlockBackground 
        backgroundImage={content.backgroundImage} 
        style={style} 
        project={project} 
        isStatic={isStatic} 
        imageMemoryCache={imageMemoryCache}
      />
      <div className="relative z-10 max-w-7xl mx-auto">
        {content.title && (() => {
          const TitleTag = (style.titleTag || 'h2') as any;
          return (
            <TitleTag 
              className={cn(
                  "mb-16 tracking-tighter transition-all duration-500 leading-tight",
                  align === 'center' ? "text-center" : align === 'right' ? "text-right" : "text-left"
              )}
              style={{ 
                fontSize: 'var(--title-fs)',
                fontWeight: style.titleBold ? '700' : '400',
                fontStyle: style.titleItalic ? 'italic' : 'normal',
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
            <div className="absolute top-1/2 right-2 md:right-4 lg:-left-6 -translate-y-1/2 z-30 transition-all duration-300">
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
              style={{ gap: 'var(--block-gap, 2rem)' }}
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
