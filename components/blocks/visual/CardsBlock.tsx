import React from 'react';
import { Block, Project } from '@/types/editor';
import { cn, formatRichText, formatLink } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';
import { SitiImage } from '@/components/shared/SitiImage';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';

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
  viewport = 'desktop', 
  isStatic,
  imageMemoryCache
}) => {
  const { content } = block;
  const { style } = getBlockStyles(block, project, viewport);
  
  const items = content.items || [];
  const align = style.align || 'center';
  const blockId = `cards-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  const hasImageShadow = style.imageShadow !== false;
  const hasImageHover = style.imageHover !== false;
  
  // Responsive Columns (Max 4)
  const count = items.length;
  const gridCols = isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 
                   count === 1 ? 'grid-cols-1' :
                   count === 2 ? 'grid-cols-2' : 
                   count === 3 ? 'grid-cols-3' : 
                   'md:grid-cols-2 lg:grid-cols-4';

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
            borderRadius: 'var(--img-radius, 24px)',
            aspectRatio: 'var(--img-aspect, 16/9)'
          }}
        >
          {item.image ? (
            <SitiImage 
              src={item.image}
              project={project}
              isStatic={isStatic}
              imageMemoryCache={imageMemoryCache}
              alt={item.title || ''}
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
          <h3 
            className="mb-2 tracking-tight transition-all duration-500 leading-tight"
            style={{ 
              fontSize: 'var(--card-title-fs)',
              fontWeight: style.cardTitleBold ? '700' : '400',
              fontStyle: style.cardTitleItalic ? 'italic' : 'normal',
            }}
            dangerouslySetInnerHTML={{ __html: formatRichText(item.title || 'Titolo Card') }}
          />
          <p 
            className="opacity-70 leading-relaxed transition-all duration-500"
            style={{ 
              fontSize: 'var(--card-subtitle-fs)',
              fontWeight: style.cardSubtitleBold ? '700' : '400',
              fontStyle: style.cardSubtitleItalic ? 'italic' : 'normal',
            }}
            dangerouslySetInnerHTML={{ __html: formatRichText(item.subtitle || 'Descrizione card.') }}
          />
        </div>
      </div>
    );

    if (item.url) {
      return (
        <a {...formatLink(item.url)} className="no-underline text-inherit block h-full">
          {cardContent}
        </a>
      );
    }
    return cardContent;
  };

  return (
    <section 
      id={blockId} 
      className="relative overflow-hidden cards-block"
      style={{
        background: 'var(--block-bg)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        paddingLeft: 'var(--block-px)',
        paddingRight: 'var(--block-px)',
        marginTop: 'var(--block-mt)',
        marginBottom: 'var(--block-mb)',
        color: 'var(--block-color)',
        borderRadius: 'var(--block-radius)',
        border: 'var(--block-border-w) solid var(--block-border-c)',
      }}
    >
      <div className="max-w-[1400px] mx-auto relative px-4">
        {content.title && (
          <h2 
            className="mb-16 tracking-tighter transition-all duration-500 leading-tight"
            style={{ 
              fontSize: 'var(--title-fs)',
              fontWeight: 'var(--title-fw)' as any,
              fontStyle: 'var(--title-fs-style)' as any,
              textAlign: align as any
            }}
            dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
          />
        )}

        <div 
          className={cn(
            "flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none gap-6 md:gap-12 pb-8 md:pb-0 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth",
            gridCols
          )}
        >
          {items.map((item: any, i: number) => (
            <div 
              key={i} 
              className={cn(
                "flex flex-col transition-all duration-500 min-w-0",
                "w-[85%] md:w-full snap-center shrink-0 md:shrink md:snap-align-none",
                style.cardBgColor && "p-8 rounded-[var(--card-radius)] border border-black/5 dark:border-white/5"
              )}
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--card-color)',
                padding: (style.cardBgColor && !isMobile) ? 'var(--card-padding)' : (style.cardBgColor && isMobile) ? '24px' : undefined,
              }}
            >
              <CardItem item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
