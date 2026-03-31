import React from 'react';
import { Block, Project } from '@/types/editor';
import { resolveImageUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { SitiImage } from '@/components/shared/SitiImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryBlockProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({
  block,
  project,
  viewport = 'desktop',
  isStatic = false,
  imageMemoryCache
}) => {
  const content = block.content;
  const variant = content.variant || 'masonry';
  const { style } = getBlockStyles(block, project, viewport);
  const images = content.images || [];
  
  const customGap = !isStatic && style.gap !== undefined ? { '--gallery-gap': `${style.gap}px` } as React.CSSProperties : {};
  const customColumns = !isStatic && style.columns !== undefined ? { '--gallery-columns': style.columns } as React.CSSProperties : {};

  // Resolve Title Tag
  const TitleTag: any = style.titleTag || 'h2';
  const tagStr = String(style.titleTag || 'h2');
  const isTitleBold = style.titleBold || false;
  const isTitleItalic = style.titleItalic || false;

  const animType = style.animationType || 'none';
  const animDuration = style.animationDuration || 0.8;
  const baseDelay = style.animationDelay || 0;
  const animKey = !isStatic ? `${block.id}-${animType}-${animDuration}` : 'static';

  const renderImage = (img: any, index: number, extraClass?: string) => {
    if (!img.image) return null;

    const aspect = style.imageAspectRatio || 'original';
    const aspectClass = aspect === '1/1' ? 'aspect-square' : 
                        aspect === '4/3' ? 'aspect-[4/3]' : 
                        aspect === '16/9' ? 'aspect-video' : 
                        'min-h-[200px] w-full h-auto';

    const itemDelay = baseDelay + 0.1 + (index * 0.05);

    return (
      <div 
        key={index}
        data-siti-anim={animType}
        data-siti-anim-duration={animDuration}
        data-siti-anim-delay={itemDelay}
        className={cn(
          "group relative overflow-hidden rounded-[var(--image-radius)] w-full block",
          style.imageShadow ? 'shadow-lg' : '',
          style.imageHover ? 'transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:z-10' : '',
          extraClass,
          'mb-[var(--gallery-gap)] break-inside-avoid'
        )}
        style={{
          '--siti-anim-duration': animDuration + 's',
          '--siti-anim-delay': itemDelay + 's'
        } as any}
      >
        <SitiImage
          src={img.image}
          project={project}
          isStatic={isStatic}
          imageMemoryCache={imageMemoryCache}
          alt={img.alt || `Gallery Image ${index + 1}`}
          loading={index < 4 ? "eager" : "lazy"}
          className={cn(
            "object-cover w-full h-full",
            aspectClass,
            style.imageHover ? 'transition-transform duration-700 group-hover:scale-105' : ''
          )}
        />
        {style.imageHover && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />
        )}
      </div>
    );
  };

  return (
    <div 
      key={animKey}
      className={cn(
        "relative w-full overflow-hidden flex flex-col",
        "pt-[var(--block-pt)] pb-[var(--block-pb)] px-[var(--block-px)]"
      )}
      style={{
        background: 'var(--block-bg)',
        color: 'var(--block-color)',
        ...(!isStatic ? getBaseStyleVars(style, block, project, viewport).vars : {}),
        ...customGap,
        ...customColumns
      } as React.CSSProperties}
    >
      <BlockBackground 
        backgroundImage={content.backgroundImage} 
        backgroundAlt={content.backgroundAlt}
        style={style} 
        project={project} 
        isStatic={isStatic}
        imageMemoryCache={imageMemoryCache}
      />

      <div className={cn(
        "relative w-full mx-auto max-w-[var(--block-max-width)] flex flex-col z-10",
        "gap-[var(--block-gap)] items-[var(--block-items)] text-[var(--block-align)]"
      )}>
        {/* Gallery Title */}
        {content.title && (
          <div
            data-siti-anim={animType}
            data-siti-anim-duration={animDuration}
            data-siti-anim-delay={baseDelay}
            className="w-full"
            style={{
              '--siti-anim-duration': animDuration + 's',
              '--siti-anim-delay': baseDelay + 's'
            } as any}
          >
            <TitleTag 
              className="font-heading leading-tight w-full"
              style={{
                fontSize: 'var(--title-fs)',
                textAlign: 'var(--block-align)' as any,
                fontWeight: 'var(--title-fw)',
                fontStyle: 'var(--title-fs-style)',
                lineHeight: 'var(--title-lh)',
                letterSpacing: 'var(--title-ls)',
                textTransform: 'var(--title-upper)' as any,
                color: 'var(--block-color)'
              }}
            >
              {content.title}
            </TitleTag>
          </div>
        )}

        {/* ─── MASONRY (default) ─── */}
        {variant === 'masonry' && (
          <div
            className="w-full relative gap-[var(--gallery-gap)]"
            style={{ columnCount: 'var(--gallery-columns)' }}
          >
            {images.map((img: any, idx: number) => renderImage(img, idx))}
          </div>
        )}

        {/* ─── GRID — uniform aspect ratio ─── */}
        {variant === 'grid' && (
          <div
            className="w-full grid gap-[var(--gallery-gap)]"
            style={{ gridTemplateColumns: `repeat(var(--gallery-columns), 1fr)` }}
          >
            {images.map((img: any, idx: number) => renderImage(img, idx, '!mb-0 aspect-[4/3]'))}
          </div>
        )}

        {/* ─── SLIDER — horizontal carousel ─── */}
        {variant === 'slider' && (
          <div className="relative group/gallery">
            <div className="absolute top-1/2 left-2 -translate-y-1/2 z-30">
              <button data-arrow="left" className="p-3 bg-white/90 backdrop-blur-sm shadow-lg rounded-full border border-black/5 transition-all hover:scale-110 active:scale-90 cursor-pointer">
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="absolute top-1/2 right-2 -translate-y-1/2 z-30">
              <button data-arrow="right" className="p-3 bg-white/90 backdrop-blur-sm shadow-lg rounded-full border border-black/5 transition-all hover:scale-110 active:scale-90 cursor-pointer">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex gap-[var(--gallery-gap)] overflow-x-auto snap-x snap-mandatory scroll-container no-scrollbar pb-2">
              {images.map((img: any, idx: number) => (
                <div key={idx} className="shrink-0 snap-center" style={{ width: `calc((100% - var(--gallery-gap) * 2) / 3)` }}>
                  {renderImage(img, idx, '!mb-0 aspect-[3/4]')}
                </div>
              ))}
            </div>
            <div dangerouslySetInnerHTML={{ __html: `<script>
              (function() {
                var b = document.querySelector('[key="${animKey}"]') || document.currentScript?.closest('div');
                if (!b) return;
                var c = b.querySelector('.scroll-container');
                var l = b.querySelector('[data-arrow="left"]');
                var r = b.querySelector('[data-arrow="right"]');
                if (c) {
                  var card = c.querySelector('div');
                  if (!card) return;
                  var g = parseInt(getComputedStyle(c).gap) || 16;
                  var getS = function() { return card.offsetWidth + g; };
                  if (l) l.onclick = function() { c.scrollBy({ left: -getS(), behavior: 'smooth' }); };
                  if (r) r.onclick = function() { c.scrollBy({ left: getS(), behavior: 'smooth' }); };
                }
              })();
            </script>`}} />
          </div>
        )}

        {/* ─── FEATURED — first image large, rest small grid ─── */}
        {variant === 'featured' && images.length > 0 && (
          <div className="w-full grid gap-[var(--gallery-gap)]" style={{ gridTemplateColumns: viewport === 'mobile' ? '1fr' : '2fr 1fr' }}>
            <div className="row-span-1" style={{ gridRow: viewport === 'mobile' ? 'auto' : `span ${Math.min(images.length - 1, 3)}` }}>
              {renderImage(images[0], 0, '!mb-0 h-full')}
            </div>
            <div className="flex flex-col gap-[var(--gallery-gap)]">
              {images.slice(1, 4).map((img: any, idx: number) => renderImage(img, idx + 1, '!mb-0 aspect-[4/3]'))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
