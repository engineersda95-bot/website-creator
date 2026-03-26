import React from 'react';
import { Block, Project } from '@/types/editor';
import { cn, formatLink } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { SitiImage } from '@/components/shared/SitiImage';
import { ImageIcon } from 'lucide-react';

interface SingleImageBlockProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

export const SingleImage: React.FC<SingleImageBlockProps> = ({ 
  block, 
  project, 
  viewport, 
  isStatic,
  imageMemoryCache
}) => {
  const { content } = block;
  const { style } = getBlockStyles(block, project, viewport);
  
  const blockId = `image-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const align = style.align || 'center';

  const blockStyles = {
    background: 'var(--block-bg)',
    paddingTop: 'var(--block-pt)',
    paddingBottom: 'var(--block-pb)',
    paddingLeft: 'var(--block-px)',
    paddingRight: 'var(--block-px)',
    color: 'var(--block-color)',
  };

  const imageContainerStyle = {
    maxWidth: style.imageMaxWidth ? `${style.imageMaxWidth}%` : '100%',
    marginLeft: align === 'center' ? 'auto' : align === 'right' ? 'auto' : '0',
    marginRight: align === 'center' ? 'auto' : align === 'left' ? 'auto' : '0',
    aspectRatio: style.imageAspectRatio || '16/9',
    borderRadius: style.imageBorderRadius !== undefined ? `${style.imageBorderRadius}px` : '1rem',
    overflow: 'hidden',
  };

  const hasImageShadow = style.imageShadow !== false && style.imageShadow !== 'none';
  const hasImageHover = style.imageHover !== false;

  const ImageElement = (
    <div 
      className={cn(
        "relative w-full transition-all duration-700 bg-zinc-100 flex items-center justify-center group/image",
        hasImageShadow && "shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
      )}
      style={imageContainerStyle}
    >
      {content.image ? (
        <SitiImage 
          src={content.image}
          project={project}
          isStatic={isStatic}
          imageMemoryCache={imageMemoryCache}
          alt={content.alt || ''}
          className={cn(
            "w-full h-full object-cover transition-transform duration-1000 ease-out",
            hasImageHover && "group-hover/image:scale-105"
          )}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-zinc-300 py-20">
          <ImageIcon size={48} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Nessuna Immagine</span>
        </div>
      )}
    </div>
  );

  return (
    <section id={blockId} className="relative overflow-hidden single-image-block" style={blockStyles}>
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
      <div className="relative z-10">
        {content.url ? (
          <a {...formatLink(content.url, isStatic)} className="block no-underline">
            {ImageElement}
          </a>
        ) : (
          ImageElement
        )}
      </div>
    </section>
  );
};
