import React from 'react';
import { cn, toPx, getButtonStyle, formatLink, formatRichText } from '@/lib/utils';
import { Project, ProjectSettings } from '@/types/editor';

interface HeroProps {
  content: {
    title: string;
    subtitle: string;
    cta: string;
    ctaUrl?: string;
    backgroundImage?: string;
  };
  style: {
    minHeight?: string;
    padding?: string;
    hPadding?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    aspectRatio?: 'original' | 'square' | 'video' | 'fill';
    buttonTheme?: 'primary' | 'secondary';
    buttonSize?: 'S' | 'M' | 'L';
    gap?: string;
    backgroundSize?: 'cover' | 'contain' | 'auto';
    backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    grayscale?: boolean;
    brightness?: number;
    blur?: number;
    overlayColor?: string;
    overlayOpacity?: number;
    borderRadius?: string;
    titleSize?: string;
    titleBold?: boolean;
    titleItalic?: boolean;
    subtitleSize?: string;
    subtitleBold?: boolean;
    subtitleItalic?: boolean;
    buttonFontSize?: string;
  };
  isEditing?: boolean;
  project?: Project;
  viewport?: string;
}

export const Hero: React.FC<HeroProps> = ({ content, style, project, viewport }) => {
  const primaryColor = project?.settings?.primaryColor || '#3b82f6';
  const secondaryColor = project?.settings?.secondaryColor || '#10b981';
  const activeColor = style.buttonTheme === 'secondary' ? secondaryColor : primaryColor;

  const isDark = project?.settings?.appearance === 'dark';
  const themeColors = project?.settings?.themeColors;
  const defaultText = isDark 
    ? (themeColors?.dark?.text || '#ffffff') 
    : (themeColors?.light?.text || '#000000');

  const alignMap = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const hasBg = !!content.backgroundImage;
  
  // Removed customStyles and bgStyle as they are now handled directly or in separate divs

  const overlayOpacity = style.overlayOpacity !== undefined ? style.overlayOpacity / 100 : 0.4;
  const overlayColor = style.overlayColor || '#000000';

  return (
    <section 
      className={cn(
        "relative flex flex-col justify-center overflow-hidden transition-all duration-500",
      )}
      style={{
        backgroundColor: style.backgroundColor, // Always apply background color from style
        minHeight: toPx(style.minHeight, '600px'),
        marginTop: toPx(style.marginTop),
        marginBottom: toPx(style.marginBottom),
        marginLeft: toPx(style.marginLeft),
        marginRight: toPx(style.marginRight),
        paddingTop: toPx(style.padding),
        paddingBottom: toPx(style.padding),
        borderRadius: toPx(style.borderRadius), // Apply borderRadius to the section
        color: style.textColor || defaultText, // Ensure textColor is applied to the section
      }}
    >
      {hasBg && (
        <>
          <div 
            className="absolute inset-0 z-0 transition-all duration-700" 
            style={{ 
              backgroundImage: `url(${content.backgroundImage})`,
              backgroundSize: style.backgroundSize || 'cover',
              backgroundPosition: style.backgroundPosition || 'center',
              backgroundRepeat: 'no-repeat',
              filter: `${style.grayscale ? 'grayscale(100%)' : ''} ${style.brightness ? `brightness(${style.brightness}%)` : ''} ${style.blur ? `blur(${style.blur}px)` : ''}`.trim(),
            }} 
          />
          <div 
            className="absolute inset-0 z-[1] transition-all duration-500" 
            style={{ 
              backgroundColor: overlayColor, 
              opacity: overlayOpacity,
            }} 
          />
        </>
      )}
      
      <div className={cn(
        "mx-auto relative z-10 w-full flex flex-col transition-all duration-500",
        hasBg && !style.textColor && "text-white",
        alignMap[style.align as keyof typeof alignMap] || alignMap.center
      )} style={{ 
        gap: toPx(style.gap, '2rem'),
        paddingLeft: toPx(style.hPadding, '2rem'),
        paddingRight: toPx(style.hPadding, '2rem'),
        color: style.textColor // Ensure text color is applied to content
      }}>
        <div className={cn(
          "space-y-4 w-full flex flex-col",
          alignMap[style.align as keyof typeof alignMap] || alignMap.center
        )}>
          <h1 className={cn(
            "tracking-tighter leading-[0.9] transition-all duration-500",
          )} style={{ 
            fontSize: toPx(style.titleSize || style.fontSize, '5rem'),
            textAlign: style.align || 'center',
            fontWeight: style.titleBold === false ? 400 : 900,
            fontStyle: style.titleItalic ? 'italic' : 'normal'
          }}
          dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
          />
          <p className={cn(
            "max-w-2xl leading-relaxed transition-all duration-500",
            style.subtitleSize ? "" : "text-xl sm:text-2xl",
            style.align === 'center' ? 'mx-auto' : style.align === 'right' ? 'ml-auto' : 'mr-auto'
          )} style={{
            fontSize: toPx(style.subtitleSize),
            textAlign: style.align || 'center',
            fontWeight: style.subtitleBold ? 700 : 500,
            fontStyle: style.subtitleItalic ? 'italic' : 'normal'
          }}
          dangerouslySetInnerHTML={{ __html: formatRichText(content.subtitle) }}
          />
        </div>
        
        <div 
          className="flex flex-wrap gap-4 mt-4"
          style={{ 
            justifyContent: style.align === 'center' ? 'center' : style.align === 'right' ? 'flex-end' : 'flex-start',
            alignItems: style.align === 'center' ? 'center' : style.align === 'right' ? 'flex-end' : 'flex-start',
          }}
        >
          {content.cta && (
            <a 
              {...formatLink(content.ctaUrl || '#')}
              className="font-bold transition-all active:scale-95 border-0 outline-none no-underline inline-flex items-center justify-center"
              style={getButtonStyle(project, activeColor, viewport as any, style.buttonTheme)}
            >
              {content.cta}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
