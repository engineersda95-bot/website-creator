'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn, toPx } from '@/lib/utils';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

interface ProductItem {
  title: string;
  description: string;
  image: string;
  url: string;
}

interface ProductCarouselProps {
  content: {
    title: string;
    items: ProductItem[];
  };
  style: {
    padding?: string;
    marginTop?: string;
    marginBottom?: string;
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    titleSize?: string;
    titleBold?: boolean;
    titleItalic?: boolean;
    minHeight?: string;
  };
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ content, style }) => {
  const { project } = useEditorStore();
  const primaryColor = project?.settings?.primaryColor || '#3b82f6';
  const secondaryColor = project?.settings?.secondaryColor || '#10b981';
  
  // Button global settings
  const btnRadius = project?.settings?.buttonRadius || '9999px';
  const btnShadow = {
    none: 'none',
    S: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    M: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    L: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }[project?.settings?.buttonShadow || 'M'];
  const btnBorder = project?.settings?.buttonBorder ? '1px solid currentColor' : 'none';
  const btnUpper = project?.settings?.buttonUppercase ? 'uppercase' : 'none';

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="py-24 transition-all duration-500 overflow-hidden flex flex-col justify-center bg-white"
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
        <div className="flex items-center justify-between mb-12">
          <h2 className={cn(
            "tracking-tight leading-tight transition-all duration-500",
            style.titleSize ? "" : "text-4xl md:text-5xl",
            style.titleBold === false ? "font-normal" : "font-black",
            style.titleItalic && "italic"
          )} style={{ fontSize: toPx(style.titleSize), textAlign: style.align || 'left' }}>
            {content.title}
          </h2>
          
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {content.items?.map((item, i) => (
            <div 
              key={i} 
              className="snap-start flex-shrink-0 w-80 group bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-lg shadow-zinc-200/50 hover:shadow-2xl transition-all duration-500"
            >
              <div className="aspect-[4/5] overflow-hidden bg-zinc-100 relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-zinc-900">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-6 line-clamp-2">
                  {item.description}
                </p>
                
                <a 
                   href={item.url || '#'} 
                   target={item.url?.startsWith('http') ? '_blank' : '_self'}
                   rel={item.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                   className="inline-flex items-center gap-2 text-sm font-bold transition-all px-5 py-2.5 no-underline"
                   style={{ 
                     backgroundColor: primaryColor,
                     color: 'white',
                     borderRadius: btnRadius,
                     boxShadow: btnShadow,
                     border: btnBorder,
                     textTransform: btnUpper as any
                   }}
                >
                  Dettagli {item.url?.startsWith('http') && <ExternalLink size={14}/>}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
