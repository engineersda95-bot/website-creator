'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn, toPx, getButtonStyle } from '@/lib/utils';

interface ImageTextProps {
  content: {
    title: string;
    text: string;
    image: string;
    imageSide?: 'left' | 'right';
    cta?: string;
    ctaUrl?: string;
  };
  style: {
    padding?: string;
    marginTop?: string;
    marginBottom?: string;
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    borderRadius?: string;
    shadow?: 'none' | 'S' | 'M' | 'L';
    gap?: string;
    buttonTheme?: 'primary' | 'secondary';
    grayscale?: boolean;
    brightness?: number;
    blur?: number;
    objectPosition?: string;
    minHeight?: string;
    imageFormat?: 'original' | 'square' | 'video' | 'fill';
    titleSize?: string;
    titleBold?: boolean;
    titleItalic?: boolean;
    subtitleSize?: string;
    subtitleBold?: boolean;
    subtitleItalic?: boolean;
  };
}

export const ImageText: React.FC<ImageTextProps & { viewport?: string }> = ({ content, style, viewport }) => {
  const { project } = useEditorStore();
  const primaryColor = project?.settings?.primaryColor || '#3b82f6';
  const secondaryColor = project?.settings?.secondaryColor || '#10b981';
  const activeColor = style.buttonTheme === 'secondary' ? secondaryColor : primaryColor;

  const imageSide = content.imageSide || 'left';
  
  const shadowMap = { 
    none: 'shadow-none', 
    S: 'shadow-md', 
    M: 'shadow-2xl shadow-zinc-200', 
    L: 'shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]' 
  };

  return (
    <section 
      className="px-8 overflow-hidden transition-all duration-500 flex flex-col justify-center"
      style={{
        backgroundColor: style.backgroundColor,
        color: style.textColor,
        paddingTop: toPx(style.padding, '6rem'),
        paddingBottom: toPx(style.padding, '6rem'),
        marginTop: toPx(style.marginTop),
        marginBottom: toPx(style.marginBottom),
        minHeight: toPx(style.minHeight),
      }}
    >
      <div className={cn(
        "max-w-7xl mx-auto flex flex-col md:flex-row items-center",
        imageSide === 'right' ? "md:flex-row-reverse" : "",
        "transition-all"
      )} style={{ gap: toPx(style.gap, '4rem') }}>
        
        <div className="flex-1 w-full">
          <div 
            className={cn(
              "overflow-hidden transition-all duration-700 hover:scale-[1.02]",
              shadowMap[style.shadow as keyof typeof shadowMap] || 'shadow-2xl'
            )}
            style={{ borderRadius: style.borderRadius || '2rem' }}
          >
            {content.image ? (
              <img 
                src={content.image} 
                alt={content.title} 
                className={cn(
                  "w-full object-cover transition-all duration-700",
                  style.imageFormat === 'square' ? "aspect-square" : 
                  style.imageFormat === 'video' ? "aspect-video" : 
                  style.imageFormat === 'fill' ? "h-full min-h-[400px]" : "aspect-auto"
                )}
                style={{ 
                  filter: `${style.grayscale ? 'grayscale(100%)' : ''} ${style.brightness ? `brightness(${style.brightness}%)` : ''} ${style.blur ? `blur(${style.blur}px)` : ''}`.trim(),
                  objectPosition: style.objectPosition || 'center'
                }}
              />
            ) : (
              <div className="aspect-square bg-zinc-100 flex items-center justify-center text-zinc-300 italic border-2 border-dashed border-zinc-200">
                Immagine side-by-side
              </div>
            )}
          </div>
        </div>

        <div className={cn(
          "flex-1 w-full space-y-6 flex flex-col",
          style.align === 'center' ? 'text-center items-center' : style.align === 'right' ? 'text-right items-end' : 'text-left items-start'
        )}>
          <h2 className={cn(
            "tracking-tighter leading-tight transition-all duration-500",
            style.titleSize ? "" : "text-4xl md:text-5xl"
          )} style={{ 
            fontSize: toPx(style.titleSize || style.fontSize),
            textAlign: style.align || 'left',
            fontWeight: style.titleBold === false ? 400 : 900,
            fontStyle: style.titleItalic ? 'italic' : 'normal'
          }}>
            {content.title}
          </h2>
          <p className={cn(
            "leading-relaxed transition-all duration-500 whitespace-pre-wrap opacity-80",
            style.subtitleSize ? "" : "text-lg",
            style.align === 'center' ? "mx-auto" : style.align === 'right' ? "ml-auto" : ""
          )} style={{ 
            textAlign: style.align || 'left',
            fontSize: toPx(style.subtitleSize),
            fontWeight: style.subtitleBold ? 700 : 500,
            fontStyle: style.subtitleItalic ? 'italic' : 'normal'
          }}>
            {content.text}
          </p>
          {content.cta && (
            <div className={cn("pt-4 flex w-full", style.align === 'center' ? "justify-center" : style.align === 'right' ? "justify-end" : "justify-start")}>
              <button 
                className="font-bold transition-all hover:brightness-110 active:scale-[0.98] border-0 no-underline flex items-center justify-center"
                style={getButtonStyle(project, activeColor, viewport as any)}
              >
                {content.cta}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
