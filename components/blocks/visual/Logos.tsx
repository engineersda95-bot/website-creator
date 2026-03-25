import React from 'react';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/image-utils';
import { BlockBackground } from '@/components/shared/BlockBackground';

export const Logos: React.FC<any> = ({
  block,
  project,
  isStatic,
  imageMemoryCache
}) => {
  const { content, style, id } = block;
  const items = content.items || [];
  const title = content.title;

  return (
    <section 
      id={id}
      className="relative overflow-hidden"
      style={{
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        paddingLeft: 'var(--block-px)',
        paddingRight: 'var(--block-px)',
        backgroundColor: 'var(--block-bg)',
        color: 'var(--block-color)',
      }}
    >
      {content.sectionId && (
        <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
      )}
      <BlockBackground 
        backgroundImage={content.backgroundImage} 
        style={style} 
        project={project} 
        imageMemoryCache={imageMemoryCache} 
        isStatic={isStatic}
      />
      
      <div className="container mx-auto relative z-10">
        {title && (
          <h2 
            className="text-center mb-12 tracking-tight"
            style={{ 
              fontSize: 'var(--title-fs)',
              fontWeight: 'var(--title-fw)',
              fontStyle: 'var(--title-fs-style)',
              textTransform: 'var(--title-upper)' as any,
              lineHeight: '1.2'
            }}
          >
            {title}
          </h2>
        )}

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden mask-fade-edges group">
          <div 
            className="flex items-center w-max animate-marquee group-hover:[animation-play-state:paused]"
            style={{
              animationDuration: 'var(--scroll-speed, 40s)',
            }}
          >
            {/* We repeat the items many times (10x) to ensure the row is ALWAYS 
                much wider than the viewport, preventing "holes" at any screen size. */}
            {Array(10).fill(items).flat().map((item: any, idx: number) => (
              <div 
                key={idx}
                className="flex-shrink-0 flex items-center justify-center logo-item"
                style={{
                  width: 'var(--logo-width)',
                  paddingRight: 'var(--logo-gap)',
                  aspectRatio: style.aspectRatio === 'original' ? 'auto' : style.aspectRatio.replace(':', '/'),
                }}
              >
                {item.image ? (
                  <img 
                    src={resolveImageUrl(item.image, project, imageMemoryCache)} 
                    alt="Partner"
                    className="max-w-full max-h-full object-contain pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-20 bg-zinc-200/50 rounded-xl flex items-center justify-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Logo
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          /* We move exactly 1 set (1/10 of the total width) */
          100% { transform: translateX(-10%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
          will-change: transform;
        }
        .logo-item {
          filter: var(--logo-filter);
          transition: filter 0.5s ease, transform 0.5s ease;
        }
        .logo-item:hover {
          filter: var(--logo-hover-filter);
          transform: scale(1.1);
          z-index: 10;
        }
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}} />
    </section>
  );
};
