'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn, toPx } from '@/lib/utils';

interface ServiceItem {
  title: string;
  description: string;
  image?: string;
  icon?: string;
  link?: string;
}

interface ServicesProps {
  content: {
    title: string;
    subtitle: string;
    items: ServiceItem[];
  };
  style: {
    padding?: string;
    marginTop?: string;
    marginBottom?: string;
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    minHeight?: string;
    gap?: string;
    columns?: number;
    titleSize?: string;
    titleBold?: boolean;
    titleItalic?: boolean;
    subtitleSize?: string;
    subtitleBold?: boolean;
    subtitleItalic?: boolean;
  };
}

export const ServicesBlock: React.FC<ServicesProps> = ({ content, style }) => {
  const { project } = useEditorStore();
  const primaryColor = project?.settings?.primaryColor || '#3b82f6';
  
  const columns = style.columns || 3;
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns as 1|2|3|4] || 'grid-cols-1 md:grid-cols-3';

  return (
    <section 
      className="py-24 transition-all duration-500 overflow-hidden flex flex-col justify-center"
      style={{
        backgroundColor: style.backgroundColor,
        color: style.textColor,
        paddingTop: toPx(style.padding),
        paddingBottom: toPx(style.padding),
        marginTop: toPx(style.marginTop),
        marginBottom: toPx(style.marginBottom),
        minHeight: toPx(style.minHeight)
      }}
    >
      <div className="max-w-7xl mx-auto px-8 w-full">
        <div className={cn(
          "max-w-3xl mb-16",
          style.align === 'center' ? "mx-auto text-center" : style.align === 'right' ? "ml-auto text-right" : "text-left"
        )}>
          <h2 className={cn(
            "tracking-tight leading-tight transition-all duration-500",
            style.titleSize ? "" : "text-4xl md:text-5xl",
            style.titleBold === false ? "font-normal" : "font-black",
            style.titleItalic && "italic"
          )} style={{ fontSize: toPx(style.titleSize || style.fontSize) }}>
            {content.title}
          </h2>
          <p className={cn(
            "mt-4 leading-relaxed transition-all duration-500",
            style.subtitleSize ? "" : "text-lg",
            style.subtitleBold ? "font-bold" : "font-medium",
            style.subtitleItalic && "italic",
            !style.textColor && "opacity-80"
          )} style={{ fontSize: toPx(style.subtitleSize) }}>
            {content.subtitle}
          </p>
        </div>

        <div className={cn("grid gap-8", gridCols)} style={{ gap: toPx(style.gap, '2rem') }}>
          {content.items?.map((item, i) => (
            <div 
              key={i} 
              className="group bg-white rounded-3xl p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col"
            >
              {item.image && (
                <div className="aspect-video mb-6 rounded-2xl overflow-hidden bg-zinc-100">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              )}
              <h3 className="text-xl font-bold mb-3 text-zinc-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6 flex-1">
                {item.description}
              </p>
              {item.link && (
                <div className="pt-4 border-t border-zinc-50">
                  <span className="text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: primaryColor }}>
                    Scopri di più →
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
