import React from 'react';
import { Block, Project } from '@/types/editor';
import { cn, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { InlineEditable } from '@/components/shared/InlineEditable';
import * as LucideIcons from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BenefitsBlockProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  onInlineEdit?: (field: string, value: string) => void;
}

export const Benefits: React.FC<BenefitsBlockProps> = ({
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
  const blockId = `benefits-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const isMobile = viewport === 'mobile';
  const isSlider = content.layout === 'slider';
  
  const colsD = block.style?.columns || 3;
  const colsT = block.responsiveStyles?.tablet?.columns || 2;
  const colsM = block.responsiveStyles?.mobile?.columns || 1;

  const gridClass = viewport 
    ? ({
        1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4'
      }[ (viewport === 'desktop' ? colsD : viewport === 'tablet' ? colsT : colsM) as 1|2|3|4] || 'grid-cols-1')
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  const sliderWidth = viewport
    ? ({
        1: 'w-full', 2: 'w-[calc((100%-2rem)/2)]', 3: 'w-[calc((100%-4rem)/3)]', 4: 'w-[calc((100%-6rem)/4)]'
      }[ (viewport === 'desktop' ? colsD : viewport === 'tablet' ? colsT : colsM) as 1|2|3|4] || 'w-[calc((100%-4rem)/3)]')
    : 'w-full md:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]';

  const boxStyle = content.boxStyle || 'plain'; 
  const isCard = boxStyle === 'card';

  const renderIcon = (iconName: string, itemStyle: any) => {
    if (!iconName) return null;
    
    // Normalization: capitalize first letter
    const normalizedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    const Icon = (LucideIcons as any)[normalizedName] || (LucideIcons as any)[iconName];
    
    const iconSize = style.iconSize || (isMobile ? 32 : 40);
    const iconColor = itemStyle.color || 'inherit';
    
    if (Icon) return <Icon size={iconSize} strokeWidth={1.5} style={{ color: iconColor }} />;
    return <span style={{ fontSize: `${iconSize}px` }}>{iconName}</span>; 
  };

  const blockStyles = {
    background: 'var(--block-bg)',
    paddingTop: 'var(--block-pt)',
    paddingBottom: 'var(--block-pb)',
    paddingLeft: 'var(--block-px)',
    paddingRight: 'var(--block-px)',
    color: 'var(--block-color)',
  };

  const itemTitleStyle = {
    fontSize: style.itemTitleSize ? `${style.itemTitleSize}px` : undefined,
    fontWeight: style.itemTitleBold ? '700' : 'bold',
  };

  const itemSubtitleStyle = {
    fontSize: style.itemSubtitleSize ? `${style.itemSubtitleSize}px` : undefined,
  };

  const variant = content.variant || 'cards';

  // Shared sub-components
  const ItemTitle = ({ item }: { item: any }) => (
    <div
      className="tracking-tight transition-all duration-300 rt-content"
      style={{ fontSize: 'var(--item-title-fs)', fontWeight: 'var(--item-title-fw)', fontStyle: 'var(--item-title-is)', color: 'inherit' }}
      data-sidebar-section="items"
      dangerouslySetInnerHTML={{ __html: formatRichText(item.title || 'Vantaggio') }}
    />
  );
  const ItemDesc = ({ item }: { item: any }) => (
    <div
      className="opacity-70 leading-relaxed transition-all duration-300 rt-content"
      style={{ ...itemSubtitleStyle, color: 'inherit' }}
      dangerouslySetInnerHTML={{ __html: formatRichText(item.description || 'Spiegazione del vantaggio.') }}
    />
  );

  const cardStyle = isCard ? {
    backgroundColor: content.cardBgColor || 'white',
    color: content.cardTextColor || 'inherit',
    borderRadius: style.cardBorderRadius !== undefined ? `${style.cardBorderRadius}px` : '1.5rem',
    padding: style.cardPadding !== undefined ? `${style.cardPadding}px` : '2rem',
  } : {};

  // ─── CARDS (default) ─────────────────────────────────────────────
  const CardsItem = ({ item }: { item: any }) => (
    <div
      className={cn(
        "flex flex-col transition-all duration-500 h-full",
        align === 'center' ? "items-center text-center" : align === 'right' ? "items-end text-right" : "items-start text-left",
        isCard && "border border-black/5 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm"
      )}
      style={cardStyle}
    >
      <div className="mb-6 h-12 flex items-center justify-center transition-all duration-300">
        {renderIcon(item.icon, cardStyle)}
      </div>
      <div className="mb-3"><ItemTitle item={item} /></div>
      <ItemDesc item={item} />
    </div>
  );

  // ─── MINIMAL — icon left, text right ─────────────────────────────
  const MinimalItem = ({ item }: { item: any }) => (
    <div className="flex gap-5 h-full">
      <div className="shrink-0 pt-1">
        {renderIcon(item.icon, {})}
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-2"><ItemTitle item={item} /></div>
        <ItemDesc item={item} />
      </div>
    </div>
  );

  // ─── CENTERED — big icon, text below ─────────────────────────────
  const CenteredItem = ({ item }: { item: any }) => (
    <div className="flex flex-col items-center text-center h-full">
      <div className="mb-5 transition-all duration-300">
        {renderIcon(item.icon, {})}
      </div>
      <div className="mb-2"><ItemTitle item={item} /></div>
      <ItemDesc item={item} />
    </div>
  );

  // ─── LIST — icon + title inline, desc below, separator ───────────
  const ListItem = ({ item }: { item: any }) => (
    <div
      className="py-5 first:pt-0 last:pb-0 border-b last:border-b-0"
      style={{ borderColor: 'color-mix(in srgb, currentColor 8%, transparent)' }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="shrink-0">{renderIcon(item.icon, {})}</div>
        <ItemTitle item={item} />
      </div>
      <ItemDesc item={item} />
    </div>
  );

  const BenefitItem = ({ item }: { item: any }) => {
    switch (variant) {
      case 'minimal': return <MinimalItem item={item} />;
      case 'centered': return <CenteredItem item={item} />;
      case 'list': return <ListItem item={item} />;
      default: return <CardsItem item={item} />;
    }
  };

  // Animation attributes
  const animType = style.animationType || 'none';
  const animDuration = style.animationDuration || 0.8;
  const baseDelay = style.animationDelay || 0;
  const animKey = !isStatic ? `${block.id}-${animType}-${animDuration}-${baseDelay}` : 'static';

  return (
    <section key={animKey} id={blockId} className="relative overflow-hidden benefits-block" style={blockStyles}>
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
      <div className="relative z-10 w-full mx-auto">
        {(content.title || content.subtitle) && (
          <div 
            data-siti-anim={animType}
            data-siti-anim-duration={animDuration}
            data-siti-anim-delay={baseDelay}
            style={{
              '--siti-anim-duration': animDuration + 's',
              '--siti-anim-delay': baseDelay + 's'
            } as any}
            className={cn("mb-16", align === 'center' ? "text-center" : align === 'right' ? "text-right" : "text-left")}
          >
            {content.title && (() => {
              const TitleTag = (style.titleTag || 'h2') as any;
              return onInlineEdit ? (
                <InlineEditable
                  fieldId="title"
                  value={content.title || ''}
                  onChange={(v) => onInlineEdit('title', v)}
                  className="mb-4 tracking-tighter transition-all duration-500 leading-tight rt-content"
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
                  className="mb-4 tracking-tighter transition-all duration-500 leading-tight rt-content"
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
            {content.subtitle && (
              onInlineEdit ? (
                <InlineEditable
                  fieldId="subtitle"
                  value={content.subtitle || ''}
                  onChange={(v) => onInlineEdit('subtitle', v)}
                  className="opacity-70 max-w-2xl mx-auto leading-relaxed transition-all duration-500 rt-content"
                  style={{
                    fontSize: style.subtitleSize ? `${style.subtitleSize}px` : (isMobile ? '18px' : '20px'),
                    fontWeight: style.subtitleBold ? '700' : '400',
                    marginRight: align === 'right' ? '0' : align === 'center' ? 'auto' : 'unset',
                    marginLeft: align === 'left' ? '0' : align === 'center' ? 'auto' : 'unset',
                    color: 'inherit'
                  }}
                  placeholder="Sottotitolo..."
                  richText
                  multiline
                />
              ) : (
                <div
                  className="opacity-70 max-w-2xl mx-auto leading-relaxed transition-all duration-500 rt-content"
                  style={{
                    fontSize: style.subtitleSize ? `${style.subtitleSize}px` : (isMobile ? '18px' : '20px'),
                    fontWeight: style.subtitleBold ? '700' : '400',
                    marginRight: align === 'right' ? '0' : align === 'center' ? 'auto' : 'unset',
                    marginLeft: align === 'left' ? '0' : align === 'center' ? 'auto' : 'unset',
                    color: 'inherit'
                  }}
                  dangerouslySetInnerHTML={{ __html: formatRichText(content.subtitle) }}
                />
              )
            )}
          </div>
        )}

        {isSlider ? (
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
                "flex gap-6 md:gap-8 pb-4 items-stretch flex-row overflow-x-auto snap-x snap-mandatory scroll-container no-scrollbar transition-all"
              )} 
            >
              {items.map((item: any, i: number) => {
                const itemDelay = baseDelay + 0.1 + (i * 0.05);
                return (
                  <div 
                    key={i} 
                    data-siti-anim={animType}
                    data-siti-anim-duration={animDuration}
                    data-siti-anim-delay={itemDelay}
                    style={{
                      '--siti-anim-duration': animDuration + 's',
                      '--siti-anim-delay': itemDelay + 's'
                    } as any}
                    className={cn(
                      "flex flex-col transition-all duration-500 min-w-0 shrink-0 snap-center",
                      sliderWidth,
                      colsD === 1 && "lg:max-w-4xl lg:mx-auto"
                    )}
                  >
                    <BenefitItem item={item} />
                  </div>
                );
              })}
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
          <div className={cn("grid gap-8 md:gap-12", gridClass)}>
            {items.map((item: any, i: number) => {
              const itemDelay = baseDelay + 0.1 + (i * 0.05);
              return (
                <div 
                  key={i}
                  data-siti-anim={animType}
                  data-siti-anim-duration={animDuration}
                  data-siti-anim-delay={itemDelay}
                  style={{
                    '--siti-anim-duration': animDuration + 's',
                    '--siti-anim-delay': itemDelay + 's'
                  } as any}
                >
                  <BenefitItem item={item} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
