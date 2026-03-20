'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn, toPx } from '@/lib/utils';
import { Quote } from 'lucide-react';

interface ReviewItem {
  name: string;
  role?: string;
  text: string;
  image?: string;
}

interface ReviewsProps {
  content: {
    title: string;
    subtitle: string;
    items: ReviewItem[];
    layout?: 'grid' | 'puzzle';
  };
  style: {
    padding?: string;
    marginTop?: string;
    marginBottom?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    minHeight?: string;
    gap?: string;
    titleSize?: string;
    titleBold?: boolean;
    titleItalic?: boolean;
    subtitleSize?: string;
    subtitleBold?: boolean;
    subtitleItalic?: boolean;
  };
}

export const ReviewsBlock: React.FC<ReviewsProps> = ({ content, style }) => {
  const isPuzzle = content.layout === 'puzzle';

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
        <div className="max-w-3xl mb-16 text-center mx-auto transition-all duration-500">
          <h2 className={cn(
            "tracking-tight transition-all duration-500",
            style.titleSize ? "" : "text-4xl md:text-5xl",
            style.titleBold === false ? "font-normal" : "font-black",
            style.titleItalic && "italic"
          )} style={{ fontSize: toPx(style.titleSize || style.fontSize, '3rem') }}>
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

        <div className={cn(
          isPuzzle ? "columns-1 md:columns-2 lg:columns-3 space-y-6 gap-6" : "grid grid-cols-1 md:grid-cols-3 gap-8",
        )} style={{ gap: isPuzzle ? undefined : toPx(style.gap, '2rem') }}>
          {content.items?.map((item, i) => (
            <div 
              key={i} 
              className={cn(
                "break-inside-avoid bg-white rounded-3xl p-8 shadow-xl border border-zinc-100 flex flex-col transition-all hover:scale-[1.02]",
                isPuzzle ? "mb-6" : ""
              )}
            >
              <Quote className="text-blue-500/20 mb-4" size={32} />
              <p className="text-zinc-600 italic leading-relaxed mb-8 flex-1">"{item.text}"</p>
              <div className="flex items-center gap-4">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                )}
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">{item.name}</h4>
                  {item.role && <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">{item.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
