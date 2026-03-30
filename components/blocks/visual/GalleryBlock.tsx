import React from 'react';
import { Block, Project } from '@/types/editor';
import { resolveImageUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { SitiImage } from '@/components/shared/SitiImage';

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
  const { style } = getBlockStyles(block, project, viewport);
  const images = content.images || [];
  
  const customGap = !isStatic && style.gap !== undefined ? { '--gallery-gap': `${style.gap}px` } as React.CSSProperties : {};
  const customColumns = !isStatic && style.columns !== undefined ? { '--gallery-columns': style.columns } as React.CSSProperties : {};

  // Resolve Title Tag
  const TitleTag: any = style.titleTag || 'h2';
  const tagStr = String(style.titleTag || 'h2');
  const isTitleBold = style.titleBold || false;
  const isTitleItalic = style.titleItalic || false;

  const renderImage = (img: any, index: number, extraClass?: string) => {
    if (!img.image) return null;

    const aspect = style.imageAspectRatio || 'original';
    
    // In masonry (original aspect), we still want a minimum height or a reasonable 
    // fallback area to prevent the "step" effect before the image is fetched.
    const aspectClass = aspect === '1/1' ? 'aspect-square' : 
                        aspect === '4/3' ? 'aspect-[4/3]' : 
                        aspect === '16/9' ? 'aspect-video' : 
                        'min-h-[200px] w-full h-auto'; // Standardized fallback for masonry

    return (
      <div 
        key={index}
        className={cn(
          "group relative overflow-hidden rounded-[var(--image-radius)] w-full block",
          style.imageShadow ? 'shadow-lg' : '',
          style.imageHover ? 'transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:z-10' : '',
          extraClass,
          'mb-[var(--gallery-gap)] break-inside-avoid'
        )}
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
        )}

        <div 
          className="w-full relative gap-[var(--gallery-gap)]"
          style={{ columnCount: 'var(--gallery-columns)' }}
        >
          {images.map((img: any, idx: number) => renderImage(img, idx))}
        </div>
        
      </div>
    </div>
  );
};
