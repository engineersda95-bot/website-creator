
import React from 'react';
import { cn, formatRichText } from '@/lib/utils';
import { InlineEditable } from '@/components/shared/InlineEditable';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';
import { SitiImage } from '@/components/shared/SitiImage';
import { CTA, getCTAOverrides } from '@/components/shared/CTA';
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
    variant?: 'centered' | 'split' | 'stacked';
  };
  block: Block;
  isEditing?: boolean;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  onInlineEdit?: (field: string, value: string) => void;
}

// ─── Shared background + overlay layer ──────────────────────────────────
const HeroBg: React.FC<{
  content: HeroProps['content'];
  style: any;
  project?: Project;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  className?: string;
  imageClassName?: string;
}> = ({ content, style, project, isStatic, imageMemoryCache, className, imageClassName }) => {
  const hasBg = !!content.backgroundImage;
  if (!hasBg) return null;
  return (
    <>
      <SitiImage
        src={content.backgroundImage}
        project={project}
        isStatic={isStatic}
        imageMemoryCache={imageMemoryCache}
        alt={content.backgroundAlt || ''}
        loading="eager"
        className={cn("absolute inset-0 z-0 w-full h-full pointer-events-none transition-all duration-700", imageClassName)}
        style={{
          objectFit: (style.backgroundSize === 'auto' ? 'none' : style.backgroundSize) || 'cover',
          objectPosition: style.backgroundPosition || 'center',
          opacity: (style.opacity !== undefined ? style.opacity : 100) / 100,
          filter: `brightness(${style.brightness !== undefined ? style.brightness : 100}%) blur(${style.blur || 0}px)`
        } as any}
      />
      {!style.overlayDisabled && (
        <div
          className={cn("absolute inset-0 z-[1] transition-all duration-500 pointer-events-none", className)}
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
  );
};

// ─── CTA buttons row ────────────────────────────────────────────────────
const HeroCTAs: React.FC<{
  content: HeroProps['content'];
  style: any;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
  justify?: string;
  anim?: { type: string; duration: number; delay: number };
  onInlineEdit?: (field: string, value: string) => void;
}> = ({ content, style, project, viewport, isStatic, justify, anim, onInlineEdit }) => {
  const variant = content.variant || 'centered';
  const align = style.align || (variant === 'split' ? 'left' : 'center');
  const ta = justify === 'flex-start' ? 'left' : (align === 'center' ? 'center' : align === 'right' ? 'right' : 'left');

  const animType = anim?.type || 'none';
  const animDuration = anim?.duration || 0.8;
  const baseDelay = anim?.delay || 0;

  return (
  <div style={{ textAlign: ta as any, width: '100%' }}>
    <div 
      className="inline-flex flex-wrap gap-4 mt-4"
      data-siti-anim={animType}
      data-siti-anim-duration={animDuration}
      data-siti-anim-delay={baseDelay + 0.3}
      style={{
        '--siti-anim-duration': animDuration + 's',
        '--siti-anim-delay': (baseDelay + 0.3) + 's',
      } as any}
    >
      {content.cta && (
        <CTA 
          label={content.cta} 
          url={content.ctaUrl || (content as any).ctaLink} 
          project={project} 
          viewport={viewport as any} 
          theme={content.ctaTheme || style.buttonTheme} 
          isStatic={isStatic} 
          onLabelChange={onInlineEdit ? (v) => onInlineEdit('cta', v) : undefined} 
          fieldId="cta" 
          {...getCTAOverrides(content, 'cta', content.ctaTheme || style.buttonTheme)}
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
          onLabelChange={onInlineEdit ? (v) => onInlineEdit('cta2', v) : undefined} 
          fieldId="cta2" 
          {...getCTAOverrides(content, 'cta2', content.cta2Theme || 'secondary')}
        />
      )}
    </div>
  </div>
  );
};

// ─── Pattern layer ──────────────────────────────────────────────────────
const PatternLayer: React.FC<{ style: any }> = ({ style }) => {
  const pattern = BACKGROUND_PATTERNS.find(p => p.id === style.patternType);
  if (!pattern || pattern.id === 'none') return null;
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none transition-all duration-500 background-pattern"
      style={pattern.getStyle(style.patternColor || '#000000', style.patternOpacity || 10, style.patternScale || 40)}
    />
  );
};

// ─── Title + Subtitle ───────────────────────────────────────────────────
const HeroText: React.FC<{
  content: HeroProps['content'];
  style: any;
  subtitleClass?: string;
  anim?: { type: string; duration: number; delay: number };
  onInlineEdit?: (field: string, value: string) => void;
}> = ({ content, style, subtitleClass, anim, onInlineEdit }) => {
  const titleStyle = {
    fontSize: 'var(--title-fs)',
    textAlign: 'var(--block-align)' as any,
    fontWeight: 'var(--title-fw)' as any,
    fontStyle: 'var(--title-fs-style)' as any,
    letterSpacing: 'var(--title-ls)',
    lineHeight: 'var(--title-lh)',
    textTransform: 'var(--title-upper)' as any,
    color: 'inherit',
  };
  const subtitleStyle = {
    fontSize: 'var(--subtitle-fs)',
    textAlign: 'var(--block-align)' as any,
    fontWeight: 'var(--subtitle-fw, 500)' as any,
    fontStyle: 'var(--subtitle-fs-style, normal)' as any,
    marginLeft: 'var(--block-ml-auto)',
    marginRight: 'var(--block-mr-auto)',
    color: 'inherit',
  };

  const animType = anim?.type || 'none';
  const animDuration = anim?.duration || 0.8;
  const baseDelay = anim?.delay || 0;

  return (
  <div className="space-y-4 w-full flex flex-col" style={{ alignItems: 'var(--block-items)' as any }}>
    <div 
      data-siti-anim={animType} 
      data-siti-anim-duration={animDuration} 
      data-siti-anim-delay={baseDelay}
      className="w-full"
      style={{
        '--siti-anim-duration': animDuration + 's',
        '--siti-anim-delay': baseDelay + 's',
      } as any}
    >
      {onInlineEdit ? (
        <InlineEditable
          value={content.title}
          onChange={(v) => onInlineEdit('title', v)}
          className="tracking-tighter leading-[0.9] transition-all duration-500 rt-content w-full"
          style={titleStyle}
          placeholder="Titolo..."
          fieldId="title"
        />
      ) : (
        <div
          className="tracking-tighter leading-[0.9] transition-all duration-500 rt-content"
          style={titleStyle}
          dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
        />
      )}
    </div>
    {(content.subtitle || onInlineEdit) && (
      <div 
        data-siti-anim={animType} 
        data-siti-anim-duration={animDuration} 
        data-siti-anim-delay={baseDelay + 0.15}
        className="w-full"
        style={{
          '--siti-anim-duration': animDuration + 's',
          '--siti-anim-delay': (baseDelay + 0.15) + 's',
        } as any}
      >
        {onInlineEdit ? (
          <InlineEditable
            value={content.subtitle}
            onChange={(v) => onInlineEdit('subtitle', v)}
            className={cn("max-w-2xl leading-relaxed transition-all duration-500 rt-content w-full", subtitleClass)}
            style={subtitleStyle}
            placeholder="Sottotitolo..."
            richText
            multiline
            fieldId="subtitle"
          />
        ) : (
          <div
            className={cn("max-w-2xl leading-relaxed transition-all duration-500 rt-content", subtitleClass)}
            style={subtitleStyle}
            dangerouslySetInnerHTML={{ __html: formatRichText(content.subtitle) }}
          />
        )}
      </div>
    )}
  </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// CENTERED — default (original layout)
// ═══════════════════════════════════════════════════════════════════════
const CenteredHero: React.FC<HeroProps> = ({ content, block, project, viewport, isStatic, imageMemoryCache, onInlineEdit }) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  const hasBg = !!content.backgroundImage;

  const anim = {
    type: style.animationType || 'none',
    duration: style.animationDuration || 0.8,
    delay: style.animationDelay || 0
  };

  const animKey = !isStatic ? `${block.id}-${anim.type}-${anim.duration}` : 'static';

  return (
    <section
      key={animKey}
      id={block.id}
      className="relative flex flex-col overflow-hidden transition-all duration-500"
      style={{
        background: 'var(--block-bg)',
        minHeight: 'var(--hero-min-height)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        justifyContent: 'var(--text-v-align)' as any,
        color: 'var(--block-color)',
      }}
    >
      {content.sectionId && <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />}
      <PatternLayer style={style} />
      <HeroBg content={content} style={style} project={project} isStatic={isStatic} imageMemoryCache={imageMemoryCache} />
      <div
        className={cn("mx-auto relative z-10 w-full flex flex-col transition-all duration-500", hasBg && !style.textColor && "text-white")}
        style={{ gap: 'var(--block-gap)', paddingLeft: 'var(--block-px)', paddingRight: 'var(--block-px)', alignItems: 'var(--block-items)' as any, textAlign: 'var(--block-align)' as any }}
      >
        <HeroText content={content} style={style} anim={anim} onInlineEdit={onInlineEdit} />
        <HeroCTAs content={content} style={style} anim={anim} project={project} viewport={viewport} isStatic={isStatic} onInlineEdit={onInlineEdit} />
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SPLIT — text left, image right (50/50)
// ═══════════════════════════════════════════════════════════════════════
const SplitHero: React.FC<HeroProps> = ({ content, block, project, viewport, isStatic, imageMemoryCache, onInlineEdit }) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  const hasBg = !!content.backgroundImage;
  const isMobile = viewport === 'mobile';

  const anim = {
    type: style.animationType || 'none',
    duration: style.animationDuration || 0.8,
    delay: style.animationDelay || 0
  };

  const animKey = !isStatic ? `${block.id}-${anim.type}-${anim.duration}` : 'static';

  return (
    <section
      key={animKey}
      id={block.id}
      className="relative overflow-hidden transition-all duration-500"
      style={{ background: 'var(--block-bg)', color: 'var(--block-color)', minHeight: 'var(--hero-min-height)' }}
    >
      {content.sectionId && <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />}
      <PatternLayer style={style} />
      <div className={cn("mx-auto relative z-10 w-full h-full", isMobile ? "flex flex-col" : "grid grid-cols-2")} style={{ minHeight: 'var(--hero-min-height)' }}>
        {/* Text side */}
        <div
          className="flex flex-col justify-center transition-all duration-500"
          style={{ paddingTop: 'var(--block-pt)', paddingBottom: 'var(--block-pb)', paddingLeft: 'var(--block-px)', paddingRight: 'var(--block-px)', gap: 'var(--block-gap)', textAlign: 'var(--block-align)' as any, alignItems: 'var(--block-items)' as any }}
        >
          <HeroText content={content} style={style} subtitleClass="!ml-0 !mr-0" anim={anim} onInlineEdit={onInlineEdit} />
          <HeroCTAs content={content} style={style} anim={anim} project={project} viewport={viewport} isStatic={isStatic} onInlineEdit={onInlineEdit} />
        </div>
        {/* Image side */}
        {hasBg ? (
          <div className={cn("relative overflow-hidden", isMobile ? "aspect-video" : "h-auto")}>
            <SitiImage
              src={content.backgroundImage}
              project={project}
              isStatic={isStatic}
              imageMemoryCache={imageMemoryCache}
              alt={content.backgroundAlt || ''}
              loading="eager"
              className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-700"
              style={{ objectFit: 'cover', objectPosition: style.backgroundPosition || 'center' } as any}
            />
          </div>
        ) : (
          <div className="bg-current/[0.03]" />
        )}
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// STACKED — image top full-width, text below
// ═══════════════════════════════════════════════════════════════════════
const StackedHero: React.FC<HeroProps> = ({ content, block, project, viewport, isStatic, imageMemoryCache, onInlineEdit }) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  const hasBg = !!content.backgroundImage;

  const anim = {
    type: style.animationType || 'none',
    duration: style.animationDuration || 0.8,
    delay: style.animationDelay || 0
  };

  const animKey = !isStatic ? `${block.id}-${anim.type}-${anim.duration}` : 'static';

  return (
    <section
      key={animKey}
      id={block.id}
      className="relative overflow-hidden transition-all duration-500"
      style={{ background: 'var(--block-bg)', color: 'var(--block-color)' }}
    >
      {content.sectionId && <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />}
      <PatternLayer style={style} />
      {/* Image top */}
      {hasBg && (
        <div className="relative w-full aspect-[16/7]">
          <SitiImage
            src={content.backgroundImage}
            project={project}
            isStatic={isStatic}
            imageMemoryCache={imageMemoryCache}
            alt={content.backgroundAlt || ''}
            loading="eager"
            className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-700"
            style={{ objectFit: 'cover', objectPosition: style.backgroundPosition || 'center' } as any}
          />
          {!style.overlayDisabled && (
            <div
              className="absolute inset-0 z-[1] pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, transparent 50%, var(--block-bg, #ffffff) 100%)`,
              }}
            />
          )}
        </div>
      )}
      {/* Text below */}
      <div
        className="relative z-10 mx-auto w-full flex flex-col transition-all duration-500"
        style={{ paddingTop: hasBg ? 'var(--block-gap)' : 'var(--block-pt)', paddingBottom: 'var(--block-pb)', paddingLeft: 'var(--block-px)', paddingRight: 'var(--block-px)', gap: 'var(--block-gap)', alignItems: 'var(--block-items)' as any, textAlign: 'var(--block-align)' as any }}
      >
        <HeroText content={content} style={style} anim={anim} onInlineEdit={onInlineEdit} />
        <HeroCTAs content={content} style={style} anim={anim} project={project} viewport={viewport} isStatic={isStatic} onInlineEdit={onInlineEdit} />
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN EXPORT — switches on variant
// ═══════════════════════════════════════════════════════════════════════
export const Hero: React.FC<HeroProps> = (props) => {
  const variant = props.content.variant || 'centered';
  
  switch (variant) {
    case 'split': return <SplitHero {...props} />;
    case 'stacked': return <StackedHero {...props} />;
    default: return <CenteredHero {...props} />;
  }
};
