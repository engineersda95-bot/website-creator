
import React from 'react';
import { cn, toPx, formatLink, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Page, Block } from '@/types/editor';
import { resolveImageUrl } from '@/lib/image-utils';
import { SitiImage } from '@/components/shared/SitiImage';
import { CTA } from '@/components/shared/CTA';
import { BACKGROUND_PATTERNS } from '@/lib/background-patterns';

interface HeroProps {
  content: {
    title: string;
    subtitle: string;
    cta: string;
    ctaUrl?: string;
    ctaTheme?: 'primary' | 'secondary';
    cta2?: string;
    cta2Url?: string;
    cta2Theme?: 'primary' | 'secondary';
    backgroundImage?: string;
    backgroundAlt?: string;
    sectionId?: string;
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
      id={block.id}
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
      {content.sectionId && (
        <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
      )}
      {/* Pattern Layer */}
      {(() => {
        const pattern = BACKGROUND_PATTERNS.find(p => p.id === style.patternType);
        if (!pattern || pattern.id === 'none') return null;
        return (
          <div 
            className="absolute inset-0 z-0 pointer-events-none transition-all duration-500 background-pattern"
            style={pattern.getStyle(
              style.patternColor || '#ffffff', 
              style.patternOpacity || 10, 
              style.patternScale || 40
            )}
          />
        );
      })()}

      {hasBg && (
        <>
          <SitiImage 
            src={content.backgroundImage}
            project={project}
            isStatic={isStatic}
            imageMemoryCache={imageMemoryCache}
            alt={content.backgroundAlt || ''}
            loading="eager"
            className="absolute inset-0 z-0 w-full h-full pointer-events-none transition-all duration-700" 
            style={{ 
              objectFit: (style.backgroundSize === 'auto' ? 'none' : style.backgroundSize) || 'cover',
              objectPosition: style.backgroundPosition || 'center',
              opacity: (style.opacity !== undefined ? style.opacity : 100) / 100,
              filter: `brightness(${style.brightness !== undefined ? style.brightness : 100}%) blur(${style.blur || 0}px)`
            } as any} 
          />
          {!style.overlayDisabled && (
            <div 
              className="absolute inset-0 z-[1] transition-all duration-500 pointer-events-none" 
              style={{ 
                backgroundColor: style.overlayType === 'gradient' ? 'transparent' : (style.overlayColor || '#000000'), 
                backgroundImage: style.overlayType === 'gradient' 
                  ? `linear-gradient(${style.overlayDirection || 'to bottom'}, ${style.overlayColor || '#000000'}, ${style.overlayColor2 || '#111111'})`
                  : 'none',
                opacity: (style.overlayOpacity !== undefined ? style.overlayOpacity : 40) / 100,
              }} 
            />
          )}
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
          {(() => {
            const TitleTag = (style.titleTag || 'h1') as any;
            return (
              <div className={cn(
                "tracking-tighter leading-[0.9] transition-all duration-500 rt-content",
              )} style={{ 
                fontSize: 'var(--title-fs)',
                textAlign: 'var(--block-align)' as any,
                fontWeight: 'var(--title-fw)' as any,
                fontStyle: 'var(--title-fs-style)' as any,
                letterSpacing: 'var(--title-ls)',
                lineHeight: 'var(--title-lh)',
                textTransform: 'var(--title-upper)' as any,
                color: 'inherit',
              }}
              dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
              />
            );
          })()}
          <div className={cn(
            "max-w-2xl leading-relaxed transition-all duration-500 rt-content",
          )} style={{
            fontSize: 'var(--subtitle-fs)',
            textAlign: 'var(--block-align)' as any,
            fontWeight: 'var(--subtitle-fw, 500)' as any,
            fontStyle: 'var(--subtitle-fs-style, normal)' as any,
            marginLeft: 'var(--block-ml-auto)',
            marginRight: 'var(--block-mr-auto)',
            color: 'inherit',
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
            <CTA 
              label={content.cta} 
              url={content.ctaUrl || (content as any).ctaLink} 
              project={project} 
              viewport={viewport as any} 
              theme={content.ctaTheme || style.buttonTheme} 
              isStatic={isStatic} 
            />
          )}
          {content.cta2 && (
            <CTA 
              label={content.cta2} 
              url={content.cta2Url} 
              project={project} 
              viewport={viewport as any} 
              theme={content.cta2Theme || 'secondary'} 
              isStatic={isStatic} 
            />
          )}
        </div>
      </div>
    </section>
  );
};
