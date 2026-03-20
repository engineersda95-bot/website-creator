'use client';

import React from 'react';
import { cn, toPx } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface GalleryItem {
  url: string;
  title?: string;
  subtitle?: string;
}

interface GalleryProps {
  content: {
    items: GalleryItem[];
    columns?: number;
    showTitles?: boolean;
    aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  };
  style: {
    padding?: string;
    marginTop?: string;
    marginBottom?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    shadow?: 'none' | 'S' | 'M' | 'L';
    gap?: string;
    grayscale?: boolean;
    brightness?: number;
    minHeight?: string;
    alignment?: 'left' | 'center' | 'right';
    maxWidth?: number;
  };
}

export const Gallery: React.FC<GalleryProps> = ({ content, style }) => {
  const items = content.items || [];
  const columns = content.columns || 3;
  const alignment = style.alignment || 'center';

  const shadowMap = { 
    none: 'shadow-none', 
    S: 'shadow-md', 
    M: 'shadow-2xl shadow-zinc-200', 
    L: 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]' 
  };

  const aspectMap = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: 'aspect-auto'
  };

  return (
    <section 
      className="w-full transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: style.backgroundColor,
        paddingTop: toPx(style.padding),
        paddingBottom: toPx(style.padding),
        marginTop: toPx(style.marginTop),
        marginBottom: toPx(style.marginBottom),
        minHeight: toPx(style.minHeight)
      }}
    >
      <div className="mx-auto px-8" style={{ maxWidth: toPx(style.maxWidth || 1200, '1200px') }}>
        <div 
          className="grid w-full" 
          style={{ 
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: toPx(style.gap, '1.5rem') 
          }}
        >
          {items.length > 0 ? (
            items.map((item, i) => (
              <div key={i} className="group flex flex-col gap-4">
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-500 hover:scale-[1.03] cursor-pointer",
                    shadowMap[style.shadow as keyof typeof shadowMap] || 'shadow-lg',
                    aspectMap[content.aspectRatio || 'square']
                  )}
                  style={{ borderRadius: style.borderRadius || '1.5rem' }}
                >
                  <img 
                    src={item.url} 
                    alt={item.title || `Gallery ${i}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    style={{ filter: `${style.grayscale ? 'grayscale(100%)' : ''} ${style.brightness ? `brightness(${style.brightness}%)` : ''}`.trim() }}
                  />
                </div>
                {content.showTitles && item.title && (
                  <div className={cn(
                    "transition-all duration-500",
                    alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left'
                  )}>
                    <h4 className="font-bold text-sm tracking-tight" style={{ color: style.textColor }}>{item.title}</h4>
                    {item.subtitle && <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest mt-1" style={{ color: style.textColor }}>{item.subtitle}</p>}
                  </div>
                )}
              </div>
            ))
          ) : (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center text-zinc-300 italic">
                <ImageIcon size={32} strokeWidth={1} />
                <span className="mt-2 text-xs">Aggiungi foto</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
