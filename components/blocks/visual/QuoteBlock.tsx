import React from 'react';
import { Block, Project } from '@/types/editor';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/image-utils';
import { Star, Quote as QuoteIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface QuoteBlockProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ block, project, viewport = 'desktop' }) => {
  const { content, style } = block;
  const items = content.items || [];
  
  if (items.length === 0 && !content.title) return null;

  const layout = content.layout || 'grid';
  const visualType = content.visualType || 'quotes';
  const avatarShape = content.avatarShape || 'circle';
  const avatarSize = content.avatarSize || 60;
  const avatarAspectRatio = content.avatarAspectRatio || '1/1';
  const align = style.align || 'center';
  const blockId = `quote-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const cardStyles = {
    backgroundColor: style.cardBgColor || undefined, // undefined will fallback to className
    color: style.cardTextColor || undefined,
  };

  const blockStyles = {
    paddingTop: `var(--block-pt, ${style.padding || 80}px)`,
    paddingBottom: `var(--block-pb, ${style.padding || 80}px)`,
    paddingLeft: `var(--block-px, ${style.hPadding || 40}px)`,
    paddingRight: `var(--block-px, ${style.hPadding || 40}px)`,
    marginTop: `${style.marginTop || 0}px`,
    marginBottom: `${style.marginBottom || 0}px`,
    backgroundColor: style.backgroundColor || 'transparent',
    color: style.textColor || 'inherit',
    borderRadius: `${style.borderRadius || 0}px`,
    borderWidth: `${style.borderWidth || 0}px`,
    borderColor: style.borderColor || 'transparent',
    borderStyle: style.borderWidth > 0 ? 'solid' : 'none',
  };

  const isSlider = layout === 'slider';
  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  // Responsive logic based on viewport prop + Tailwind fallbacks
  const gridCols = isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  const flexDir = (isSlider && !isMobile) ? 'flex-row' : 'flex-col';
  const cardWidth = isMobile ? 'w-full' : isTablet ? 'w-[calc((100%-2rem)/2)]' : 'w-full md:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]';

  const CardContent = ({ item }: { item: any }) => (
    <>
      <div className="flex-1 flex flex-col w-full min-w-0">
        <div className={cn("mb-8 flex", align === 'center' ? "justify-center" : align === 'right' ? "justify-end" : "justify-start")}>
          {visualType === 'stars' ? (
            <div className="flex gap-1 shrink-0">
              {[...Array(5)].map((_, idx) => (
                <Star key={idx} size={14} className={cn(idx < item.stars ? "text-amber-400 fill-amber-400" : "text-zinc-400 opacity-20")} />
              ))}
            </div>
          ) : (
            <QuoteIcon size={44} className="opacity-20 translate-y-2 shrink-0" />
          )}
        </div>
        
        <p 
          style={{ 
            fontSize: style.reviewSize ? `${style.reviewSize}px` : undefined, 
            fontWeight: style.reviewBold ? '700' : '400', 
            fontStyle: style.reviewItalic ? 'italic' : 'normal', 
            textAlign: align as any 
          }}
          className="leading-relaxed opacity-80 mb-10 whitespace-pre-wrap break-words w-full"
        >
          "{item.text}"
        </p>
      </div>

      <div className={cn(
        "flex items-center gap-5 mt-auto pt-8 border-t border-black/5 dark:border-white/5 w-full min-w-0",
        align === 'center' ? "justify-center" : align === 'right' ? "justify-end flex-row-reverse" : "justify-start"
      )}>
        {item.avatar && (
          <div 
            style={{ width: `${avatarSize}px`, aspectRatio: avatarAspectRatio }}
            className={cn(
              "overflow-hidden shrink-0 border border-black/5 dark:border-white/10 shadow-lg",
              avatarShape === 'circle' ? "rounded-full" : "rounded-2xl"
            )}
          >
            <img src={resolveImageUrl(item.avatar, project)} alt={item.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className={cn("min-w-0 flex-1 ml-0", align === 'right' && "text-right")}>
          <h4 
            style={{ 
              fontSize: style.nameSize ? `${style.nameSize}px` : undefined, 
              fontWeight: style.nameBold ? '700' : '400', 
              fontStyle: style.nameItalic ? 'italic' : 'normal' 
            }} 
            className="tracking-tight leading-snug whitespace-normal break-words mb-1"
          >
            {item.name}
          </h4>
          <p 
            style={{ 
              fontSize: style.roleSize ? `${style.roleSize}px` : undefined, 
              fontWeight: style.roleBold ? '700' : '400', 
              fontStyle: style.roleItalic ? 'italic' : 'normal' 
            }} 
            className="opacity-40 uppercase tracking-widest text-[9px] leading-snug whitespace-normal break-words"
          >
            {item.role}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <section id={blockId} style={blockStyles} className="relative overflow-hidden quote-block">
      <div className="max-w-[1400px] mx-auto relative px-4 text-left">
        {content.title && (
          <h2 
            style={{ 
              fontSize: style.titleSize ? `${style.titleSize}px` : undefined, 
              fontWeight: style.titleBold ? '700' : '400', 
              fontStyle: style.titleItalic ? 'italic' : 'normal',
              textAlign: align as any
            }}
            className="text-4xl md:text-6xl mb-16 tracking-tighter leading-tight"
          >
            {content.title}
          </h2>
        )}

        {isSlider ? (
          <div className="relative group/quote">
            {!isMobile && (
              <div className="hidden md:block">
                <div className="absolute top-[55%] -left-6 -translate-y-1/2 z-20 opacity-0 group-hover/quote:opacity-100 transition-all duration-300 translate-x-4 group-hover/quote:translate-x-0">
                  <button data-arrow="left" className="p-3 bg-zinc-900/10 dark:bg-white/10 hover:bg-zinc-900/20 dark:hover:hover:bg-white/20 backdrop-blur-xl rounded-full border border-black/5 dark:border-white/10 transition-all hover:scale-110 cursor-pointer">
                    <ChevronLeft size={24} />
                  </button>
                </div>
                <div className="absolute top-[55%] -right-6 -translate-y-1/2 z-20 opacity-0 group-hover/quote:opacity-100 transition-all duration-300 -translate-x-4 group-hover/quote:translate-x-0">
                  <button data-arrow="right" className="p-3 bg-zinc-900/10 dark:bg-white/10 hover:bg-zinc-900/20 dark:hover:hover:bg-white/20 backdrop-blur-xl rounded-full border border-black/5 dark:border-white/10 transition-all hover:scale-110 cursor-pointer">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            )}

            <div 
              className={cn(
                "flex gap-8 pb-12 no-scrollbar scroll-smooth scroll-container items-stretch",
                flexDir,
                !isMobile && "md:overflow-x-auto md:snap-x md:snap-mandatory"
              )} 
              style={isSlider && !isMobile ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
            >
              {items.map((item: any, i: number) => (
                <div 
                  key={i} 
                  style={cardStyles}
                  className={cn(
                    "p-8 md:p-10 rounded-[3rem] border border-black/5 dark:border-white/5 flex flex-col shadow-sm shrink-0 min-w-0",
                    !cardStyles.backgroundColor && "bg-zinc-900/5 dark:bg-white/5",
                    cardWidth,
                    !isMobile && "md:snap-center"
                  )}
                >
                  <CardContent item={item} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn("grid gap-8", gridCols)}>
            {items.map((item: any, i: number) => (
              <div 
                key={i} 
                style={cardStyles}
                className={cn(
                  "w-full p-8 md:p-10 rounded-[3rem] border border-black/5 dark:border-white/5 flex flex-col shadow-sm min-w-0",
                  !cardStyles.backgroundColor && "bg-zinc-900/5 dark:bg-white/5"
                )}
              >
                <CardContent item={item} />
              </div>
            ))}
          </div>
        )}

        {isSlider && !isMobile && (
          <script key={Math.random()} dangerouslySetInnerHTML={{ __html: `
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
          `}} />
        )}
      </div>
    </section>
  );
};
