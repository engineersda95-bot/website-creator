
// v2 - Managed Carousel Interactivity
import React from 'react';
import { cn, formatRichText } from '@/lib/utils';
import { InlineEditable } from '@/components/shared/InlineEditable';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';
import { SitiImage } from '@/components/shared/SitiImage';
import { CTA, getCTAOverrides } from '@/components/shared/CTA';
import { BACKGROUND_PATTERNS } from '@/lib/background-patterns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    carouselEnabled?: boolean;
    slides?: Array<{
      id: string;
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
    }>;
  };
  block: Block;
  isEditing?: boolean;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  onInlineEdit?: (field: string, value: string) => void;
  // Specific prop for slide edit (internal use)
  onSlideEdit?: (slideId: string, field: string, value: string) => void;
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
        loading="eager" fetchPriority="high"
        className={cn("absolute inset-0 z-0 w-full h-full pointer-events-none", imageClassName)}
        style={{
          objectFit: (style.backgroundSize === 'auto' ? 'none' : style.backgroundSize) || 'cover',
          objectPosition: style.backgroundPosition || 'center',
          opacity: (style.opacity !== undefined ? style.opacity : 100) / 100,
          filter: `brightness(${style.brightness !== undefined ? style.brightness : 100}%) blur(${style.blur || 0}px)`
        } as any}
      />
      {!style.overlayDisabled && (
        <div
          className={cn("absolute inset-0 z-[1] pointer-events-none", className)}
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
          {...getCTAOverrides(content, style, 'cta', content.ctaTheme || style.buttonTheme)}
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
          {...getCTAOverrides(content, style, 'cta2', content.cta2Theme || 'secondary')}
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
      className="absolute inset-0 z-0 pointer-events-none background-pattern"
      style={pattern.getStyle(style.patternColor || style.textColor || '#000000', style.patternOpacity || 10, style.patternScale || 40)}
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
          className="tracking-tighter leading-[0.9] rt-content w-full"
          style={titleStyle}
          placeholder="Titolo..."
          fieldId="title"
        />
      ) : (
        <div
          className="tracking-tighter leading-[0.9] rt-content"
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
            className={cn("max-w-2xl leading-relaxed rt-content w-full", subtitleClass)}
            style={subtitleStyle}
            placeholder="Sottotitolo..."
            richText
            multiline
            fieldId="subtitle"
          />
        ) : (
          <div
            className={cn("max-w-2xl leading-relaxed rt-content", subtitleClass)}
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
      className="relative flex flex-col overflow-hidden"
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
        className={cn("mx-auto relative z-10 w-full flex flex-col", hasBg && !style.textColor && "text-white")}
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
      className="relative overflow-hidden"
      style={{ background: 'var(--block-bg)', color: 'var(--block-color)', minHeight: 'var(--hero-min-height)' }}
    >
      {content.sectionId && <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />}
      <PatternLayer style={style} />
      <div className={cn("mx-auto relative z-10 w-full h-full", isMobile ? "flex flex-col" : "grid grid-cols-2")} style={{ minHeight: 'var(--hero-min-height)' }}>
        {/* Text side */}
        <div
          className="flex flex-col justify-center"
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
              loading="eager" fetchPriority="high"
              className="absolute inset-0 w-full h-full pointer-events-none"
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
      className="relative overflow-hidden"
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
            loading="eager" fetchPriority="high"
            className="absolute inset-0 w-full h-full pointer-events-none"
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
        className="relative z-10 mx-auto w-full flex flex-col"
        style={{ paddingTop: hasBg ? 'var(--block-gap)' : 'var(--block-pt)', paddingBottom: 'var(--block-pb)', paddingLeft: 'var(--block-px)', paddingRight: 'var(--block-px)', gap: 'var(--block-gap)', alignItems: 'var(--block-items)' as any, textAlign: 'var(--block-align)' as any }}
      >
        <HeroText content={content} style={style} anim={anim} onInlineEdit={onInlineEdit} />
        <HeroCTAs content={content} style={style} anim={anim} project={project} viewport={viewport} isStatic={isStatic} onInlineEdit={onInlineEdit} />
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// CAROUSEL WRAPPER — horizontal slider with fade transitions
// ═══════════════════════════════════════════════════════════════════════
const CarouselHero: React.FC<HeroProps> = (props) => {
  const { content, block, project, viewport, isStatic, isEditing } = props;
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  const slides = content.slides || [];

  // Preview Sync: check if the sidebar has indicated an active slide to show
  const activePreviewIndex = (content as any).activeSlideIndex !== undefined ? (content as any).activeSlideIndex : 0;

  if (slides.length === 0) {
    return <CenteredHero {...props} />;
  }

  const autoplay = style.carouselAutoplay !== false;
  const interval = style.carouselInterval || 5000;
  const showArrows = style.carouselArrows !== false;
  const showDots = style.carouselDots !== false;

  return (
    <div className="relative w-full overflow-hidden group/hero-carousel h-full min-h-[var(--hero-min-height)] hero-carousel-container">
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.7s ease-in-out;
          z-index: 0;
        }
        .hero-slide[data-active="true"] {
          opacity: 100;
          pointer-events: auto;
          z-index: 10;
        }
        .hero-dot {
          height: 6px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          outline: none;
          cursor: pointer;
        }
        .hero-dot[data-active="true"] {
          width: 32px;
          background: white;
        }
        .hero-dot:not([data-active="true"]):hover {
          background: rgba(255, 255, 255, 0.5);
        }
        @media (max-width: 768px) {
          [data-carousel-prev], [data-carousel-next] {
            display: none !important;
          }
        }
      `}} />

      {/* Slides Container */}
      <div className="relative w-full h-full min-h-[var(--hero-min-height)] slides-wrapper">
        {slides.map((slide: any, idx: number) => {
          const isActive = idx === activePreviewIndex;
          return (
            <div
              key={slide.id || idx}
              data-index={idx}
              data-active={isActive ? "true" : "false"}
              className="hero-slide"
            >
              <Hero 
                {...props} 
                content={{ 
                  ...content, 
                  ...slide, 
                  backgroundImage: slide.backgroundImage || (idx === 0 ? content.backgroundImage : undefined),
                  backgroundAlt: slide.backgroundAlt || (idx === 0 ? content.backgroundAlt : undefined),
                  carouselEnabled: false 
                }} 
                isEditing={false}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            data-carousel-prev
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover/hero-carousel:opacity-100 transition-all hover:bg-white/20 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            data-carousel-next
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover/hero-carousel:opacity-100 transition-all hover:bg-white/20 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              data-dot-index={idx}
              data-active={idx === activePreviewIndex ? "true" : "false"}
              className="hero-dot w-2"
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Script per l'interattività - rimosso in editing per evitare warning React e conflitti */}
      {!isEditing && (
        <div 
          key={`carousel-script-${activePreviewIndex}-${autoplay}-${interval}`}
          style={{ display: 'none' }}
          dangerouslySetInnerHTML={{ __html: `
            <script>
              (function() {
                var container = document.currentScript.closest('.hero-carousel-container');
                if (!container) return;
                
                // Cleanup existing timers if any (important for hot-reload)
                if (window._heroCarouselTimers && window._heroCarouselTimers[container.id]) {
                  clearInterval(window._heroCarouselTimers[container.id]);
                }
                if (!window._heroCarouselTimers) window._heroCarouselTimers = {};

                var slides = container.querySelectorAll('.hero-slide');
                var dots = container.querySelectorAll('.hero-dot');
                var prev = container.querySelector('[data-carousel-prev]');
                var next = container.querySelector('[data-carousel-next]');
                var total = slides.length;
                var interval = ${interval};
                var isEditingSlide = ${activePreviewIndex !== 0};
                var autoplay = ${autoplay} && !isEditingSlide;
                var timer;
                var currentIndex = ${activePreviewIndex};

                // Sync initial state based on server-side activePreviewIndex
                slides.forEach(function(s, i) { 
                  s.setAttribute('data-active', i === currentIndex ? 'true' : 'false'); 
                });
                dots.forEach(function(d, i) { 
                  d.setAttribute('data-active', i === currentIndex ? 'true' : 'false'); 
                });

                function update(newIndex) {
                  if (slides[currentIndex]) slides[currentIndex].setAttribute('data-active', 'false');
                  if (dots[currentIndex]) dots[currentIndex].setAttribute('data-active', 'false');
                  
                  currentIndex = (newIndex + total) % total;
                  
                  if (slides[currentIndex]) slides[currentIndex].setAttribute('data-active', 'true');
                  if (dots[currentIndex]) dots[currentIndex].setAttribute('data-active', 'true');
                  resetTimer();
                }

                function resetTimer() {
                  if (timer) clearInterval(timer);
                  if (autoplay) {
                    timer = setInterval(function() { update(currentIndex + 1); }, interval);
                    window._heroCarouselTimers[container.id] = timer;
                  }
                }

                if (prev) prev.onclick = function() { update(currentIndex - 1); };
                if (next) next.onclick = function() { update(currentIndex + 1); };
                
                dots.forEach(function(dot, idx) {
                  dot.onclick = function() {
                    if (idx !== currentIndex) update(idx);
                  };
                });

                // Touch Support
                var touchStartX = 0;
                container.addEventListener('touchstart', function(e) {
                  touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });

                container.addEventListener('touchend', function(e) {
                  var touchEndX = e.changedTouches[0].screenX;
                  var diff = touchStartX - touchEndX;
                  if (Math.abs(diff) > 50) {
                    if (diff > 0) update(currentIndex + 1);
                    else update(currentIndex - 1);
                  }
                }, { passive: true });

                resetTimer();
              })();
            </script>
          `}} 
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN EXPORT — switches on variant or carousel
// ═══════════════════════════════════════════════════════════════════════
export const Hero: React.FC<HeroProps> = (props) => {
  if (props.content.carouselEnabled && (props.content.slides?.length || 0) > 0) {
    return <CarouselHero {...props} />;
  }
  
  const variant = props.content.variant || 'centered';
  
  switch (variant) {
    case 'split': return <SplitHero {...props} />;
    case 'stacked': return <StackedHero {...props} />;
    default: return <CenteredHero {...props} />;
  }
};
