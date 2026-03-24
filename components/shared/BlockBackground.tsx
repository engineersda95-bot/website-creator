
import React from 'react';
import { cn } from '@/lib/utils';
import { Project } from '@/types/editor';
import { SitiImage } from './SitiImage';

interface BlockBackgroundProps {
  backgroundImage?: string;
  style: any;
  project?: Project | null;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

import { BACKGROUND_PATTERNS } from '@/lib/background-patterns';

/**
 * BlockBackground: A standard component for rendering block background images with overlays.
 * Used across multiple blocks to ensure visual consistency and code reusability.
 */
export const BlockBackground: React.FC<BlockBackgroundProps> = ({ 
  backgroundImage, 
  style, 
  project, 
  isStatic, 
  imageMemoryCache 
}) => {
  const pattern = BACKGROUND_PATTERNS.find(p => p.id === style.patternType);

  return (
    <>
      {pattern && pattern.id !== 'none' && (
        <div 
          className="absolute inset-0 z-[0] pointer-events-none transition-all duration-500 background-pattern"
          style={pattern.getStyle(
            style.patternColor || '#ffffff', 
            style.patternOpacity || 10, 
            style.patternScale || 40
          )}
        />
      )}
      <SitiImage 
        src={backgroundImage}
        project={project}
        isStatic={isStatic}
        imageMemoryCache={imageMemoryCache}
        alt=""
        loading="lazy"
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
  );
};
