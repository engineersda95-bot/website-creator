import React from 'react';
import { cn, toPx, getButtonStyle, formatLink, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Page, Block } from '@/types/editor';
import { resolveImageUrl } from '@/lib/image-utils';
import { SitiImage } from '@/components/shared/SitiImage';

interface HeroProps {
  content: {
    title: string;
    subtitle: string;
    cta: string;
    ctaUrl?: string;
    backgroundImage?: string;
  };
  block: Block;
  isEditing?: boolean;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

export const Hero: React.FC<HeroProps> = ({ content, block, project, viewport, isStatic, imageMemoryCache }) => {
  const { style, alignClass } = getBlockStyles(block, project, viewport || 'desktop');
  
  const pColor = project?.settings?.primaryColor || '#3b82f6';
  const secondaryColor = project?.settings?.secondaryColor || '#10b981';
  const activeColor = style.buttonTheme === 'secondary' ? secondaryColor : pColor;

  const hasBg = !!content.backgroundImage;
  const overlayOpacity = style.overlayOpacity !== undefined ? style.overlayOpacity / 100 : 0.4;
  const overlayColor = style.overlayColor || '#000000';

  return (
    <section 
      className={cn(
        "relative flex flex-col overflow-hidden transition-all duration-500",
      )}
      style={{
        background: 'var(--block-bg)',
        minHeight: 'var(--hero-min-height)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        justifyContent: 'var(--text-v-align)' as any,
        color: 'var(--block-color)',
      }}
    >
      {hasBg && (
        <>
          <SitiImage 
            src={content.backgroundImage}
            project={project}
            isStatic={isStatic}
            imageMemoryCache={imageMemoryCache}
            alt=""
            loading="eager"
            className="absolute inset-0 z-0 w-full h-full pointer-events-none transition-all duration-700 object-cover" 
            style={{ 
              objectPosition: style.backgroundPosition || 'center',
              opacity: (style.opacity !== undefined ? style.opacity : 100) / 100,
              filter: `brightness(${style.brightness !== undefined ? style.brightness : 100}%) blur(${style.blur || 0}px)`
            } as any} 
          />
          <div 
            className="absolute inset-0 z-[1] transition-all duration-500 pointer-events-none" 
            style={{ 
              backgroundColor: style.overlayType === 'gradient' ? 'transparent' : (style.overlayColor || '#000000'), 
              backgroundImage: style.overlayType === 'gradient' 
                ? `linear-gradient(${style.overlayDirection || 'to bottom'}, ${style.overlayColor || '#000000'}, ${style.overlayColor2 || '#111111'})`
                : (style.backgroundImage ? `url(${resolveImageUrl(style.backgroundImage, project || null, imageMemoryCache, isStatic)})` : 'none'),
              opacity: (style.overlayOpacity !== undefined ? style.overlayOpacity : 40) / 100,
            }} 
          />
        </>
      )}
      
      <div className={cn(
        "mx-auto relative z-10 w-full flex flex-col transition-all duration-500",
        hasBg && !style.textColor && "text-white",
      )} style={{ 
        gap: 'var(--block-gap)',
        paddingLeft: 'var(--block-px)',
        paddingRight: 'var(--block-px)',
        alignItems: 'var(--block-items)' as any,
        textAlign: 'var(--block-align)' as any,
      }}>
        <div className={cn(
          "space-y-4 w-full flex flex-col",
        )} style={{
          alignItems: 'var(--block-items)' as any,
        }}>
          <h1 className={cn(
            "tracking-tighter leading-[0.9] transition-all duration-500",
          )} style={{ 
            fontSize: 'var(--title-fs)',
            textAlign: 'var(--block-align)' as any,
            fontWeight: 'var(--title-fw)' as any,
            fontStyle: 'var(--title-fs-style)' as any,
            letterSpacing: 'var(--title-ls)',
            lineHeight: 'var(--title-lh)',
            textTransform: 'var(--title-upper)' as any
          }}
          dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
          />
          <p className={cn(
            "max-w-2xl leading-relaxed transition-all duration-500",
          )} style={{
            fontSize: 'var(--subtitle-fs)',
            textAlign: 'var(--block-align)' as any,
            fontWeight: 'var(--subtitle-fw, 500)' as any,
            fontStyle: 'var(--subtitle-fs-style, normal)' as any,
            marginLeft: 'var(--block-ml-auto)',
            marginRight: 'var(--block-mr-auto)',
          }}
          dangerouslySetInnerHTML={{ __html: formatRichText(content.subtitle) }}
          />
        </div>
        
        <div 
          className="flex flex-wrap gap-4 mt-4"
          style={{ 
            justifyContent: 'var(--block-justify)',
            alignItems: 'var(--block-items)',
          }}
        >
          {content.cta && (
            <a 
              {...formatLink(content.ctaUrl || '#')}
              className="font-bold transition-all active:scale-95 border-0 outline-none no-underline inline-flex items-center justify-center"
              style={getButtonStyle(project, activeColor, (viewport as any) || 'desktop', style.buttonTheme, !!(isStatic || !viewport))}
            >
              {content.cta}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
