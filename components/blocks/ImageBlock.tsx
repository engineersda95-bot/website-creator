'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface ImageProps {
  content: {
    image: string;
    alt?: string;
    caption?: string;
  };
  style: {
    padding?: string;
    marginTop?: string;
    marginBottom?: string;
    align?: 'left' | 'center' | 'right';
    aspectRatio?: 'original' | 'square' | 'video' | 'fill';
    backgroundColor?: string;
    borderRadius?: string;
    shadow?: 'none' | 'S' | 'M' | 'L';
    grayscale?: boolean;
    brightness?: number;
    blur?: number;
    objectPosition?: string;
  };
}

export const ImageBlock: React.FC<ImageProps> = ({ content, style }) => {
  const alignMap = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const aspectMap = {
    original: 'aspect-auto',
    square: 'aspect-square',
    video: 'aspect-video',
    fill: 'aspect-[21/9]',
  };

  const shadowMap = { 
    none: 'shadow-none', 
    S: 'shadow-md', 
    M: 'shadow-2xl shadow-zinc-200', 
    L: 'shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]' 
  };

  const filterStyle: React.CSSProperties = {
    filter: `
      ${style.grayscale ? 'grayscale(100%)' : 'grayscale(0%)'} 
      ${style.brightness ? `brightness(${style.brightness}%)` : 'brightness(100%)'} 
      ${style.blur ? `blur(${style.blur}px)` : 'blur(0px)'}
    `.trim(),
    backgroundColor: style.backgroundColor,
    borderRadius: style.borderRadius,
    objectPosition: style.objectPosition || 'center',
  };

  return (
    <section 
      className={cn(
        "px-8 max-w-6xl mx-auto flex transition-all duration-500",
        alignMap[style.align as keyof typeof alignMap] || 'justify-center'
      )}
      style={{
        paddingTop: style.padding,
        paddingBottom: style.padding,
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
      }}
    >
      <div 
        className={cn(
          "w-full max-w-5xl group relative overflow-hidden transition-all duration-700 hover:scale-[1.01]",
          shadowMap[style.shadow as keyof typeof shadowMap] || 'shadow-2xl shadow-zinc-100'
        )}
        style={filterStyle}
      >
        {content.image ? (
          <img 
            src={content.image} 
            alt={content.alt || ''} 
            className={cn(
              "w-full object-cover transition-all duration-700", 
              aspectMap[style.aspectRatio as keyof typeof aspectMap] || 'aspect-auto'
            )} 
          />
        ) : (
          <div className="bg-zinc-50 aspect-video flex flex-col items-center justify-center text-zinc-300 border-2 border-dashed border-zinc-100 italic">
             <ImageIcon size={48} strokeWidth={1} />
             <p className="mt-4 text-sm">Seleziona un'immagine per iniziare</p>
          </div>
        )}
        
        {content.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
            <p className="text-sm font-medium tracking-tight opacity-90">{content.caption}</p>
          </div>
        )}
      </div>
    </section>
  );
};
