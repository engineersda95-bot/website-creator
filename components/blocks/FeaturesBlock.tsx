'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn, toPx } from '@/lib/utils';
import { 
  Star, 
  Zap, 
  Check, 
  Heart, 
  Smile, 
  Award, 
  Briefcase, 
  Code, 
  Camera,
  Layers,
  Rocket
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  star: Star,
  zap: Zap,
  check: Check,
  heart: Heart,
  smile: Smile,
  award: Award,
  briefcase: Briefcase,
  code: Code,
  camera: Camera,
  layers: Layers,
  rocket: Rocket
};

interface FeaturesProps {
  content: {
    items: Array<{
      title: string;
      description: string;
      url?: string;
      icon?: string;
    }>;
  };
  style: {
    padding?: string;
    marginTop?: string;
    marginBottom?: string;
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    buttonTheme?: 'primary' | 'secondary';
    gap?: string;
    cardStyle?: 'none' | 'flat' | 'elevated' | 'glass';
    titleSize?: string;
    titleBold?: boolean;
    titleItalic?: boolean;
    subtitleSize?: string;
    subtitleBold?: boolean;
    subtitleItalic?: boolean;
  };
}

export const FeaturesBlock: React.FC<FeaturesProps> = ({ content, style }) => {
  const { project } = useEditorStore();
  const primaryColor = project?.settings?.primaryColor || '#3b82f6';
  const secondaryColor = project?.settings?.secondaryColor || '#10b981';
  const activeColor = style.buttonTheme === 'secondary' ? secondaryColor : primaryColor;
  
  const alignMap = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const { items = [] } = content;

  const cardClasses = {
    none: '',
    flat: 'p-8 rounded-3xl border border-zinc-100 bg-zinc-50/50',
    elevated: 'p-8 rounded-3xl border border-white bg-white shadow-xl shadow-zinc-200/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2',
    glass: 'p-8 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl'
  };

  return (
    <div 
      className={cn("w-full transition-all overflow-hidden")} 
      style={{ 
        backgroundColor: style.backgroundColor, 
        color: style.textColor,
        paddingTop: style.padding,
        paddingBottom: style.padding,
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
      }}
    >
      <div className={cn(
        "max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3"
      )} style={{ gap: style.gap }}>
        {items.map((item, i) => (
          <div key={i} className={cn(
            "flex flex-col group transition-all duration-500", 
            alignMap[style.align as keyof typeof alignMap] || 'items-center text-center',
            cardClasses[style.cardStyle as keyof typeof cardClasses] || ''
          )}>
            <div 
              className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl mb-6 shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3"
              style={{ backgroundColor: activeColor }}
            >
              {item.icon && ICON_MAP[item.icon] ? (
                React.createElement(ICON_MAP[item.icon], { size: 32, strokeWidth: 2.5 })
              ) : (
                i + 1
              )}
            </div>
            <h3 className={cn(
              "tracking-tighter mb-4 transition-all duration-500",
              style.titleSize ? "" : "text-2xl",
              style.titleBold === false ? "font-normal" : "font-black",
              style.titleItalic && "italic"
            )} style={{ fontSize: toPx(style.titleSize) }}>
              {item.title}
            </h3>
            <p className={cn(
              "leading-relaxed font-medium transition-all duration-500",
              style.subtitleSize ? "" : "",
              style.subtitleBold ? "font-bold" : "font-medium",
              style.subtitleItalic && "italic",
              !style.textColor && "text-zinc-500"
            )} style={{ fontSize: toPx(style.subtitleSize) }}>
              {item.description}
            </p>
            {item.url && (
              <a href={item.url} className="mt-4 text-sm font-bold underline underline-offset-4 decoration-2 decoration-zinc-200 hover:decoration-current transition-all">Scopri di più</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
