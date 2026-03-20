'use client';

import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn, toPx } from '@/lib/utils';

interface EmbedProps {
  content: {
    type: 'instagram' | 'x' | 'x-timeline' | 'google-review' | 'generic';
    url?: string;
    html?: string;
    title?: string;
    subtitle?: string;
  };
  style: {
    padding?: string;
    marginTop?: string;
    marginBottom?: string;
    backgroundColor?: string;
    textColor?: string;
    align?: 'left' | 'center' | 'right';
    maxWidth?: string;
    minHeight?: string;
    titleSize?: string;
    titleBold?: boolean;
    titleItalic?: boolean;
    subtitleSize?: string;
    subtitleBold?: boolean;
    subtitleItalic?: boolean;
  };
}

export const EmbedBlock: React.FC<EmbedProps> = ({ content, style }) => {
  const { project } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
        if (content.type === 'instagram' && (window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
        }
    }
  }, [content.url, content.html, content.type]);

  const renderEmbed = () => {
    const isDark = style.backgroundColor && style.backgroundColor.startsWith('#') && parseInt(style.backgroundColor.replace('#',''), 16) < 0x888888;
    const theme = isDark ? 'dark' : 'light';

    switch (content.type) {
      case 'instagram':
        if (!content.url) return <div className="p-10 bg-zinc-50 rounded-2xl border-2 border-dashed text-zinc-400 text-center uppercase text-[10px] font-black tracking-widest">Inserisci URL Post o Reel Instagram</div>;
        
        let instaId = '';
        if (content.url.includes('/p/')) instaId = content.url.split('/p/')[1]?.split('/')[0];
        else if (content.url.includes('/reels/')) instaId = content.url.split('/reels/')[1]?.split('/')[0];
        else if (content.url.includes('/reel/')) instaId = content.url.split('/reel/')[1]?.split('/')[0];
        
        if (!instaId) return <div className="p-10 bg-zinc-50 rounded-2xl border-2 border-dashed text-red-400 text-center uppercase text-[10px] font-black tracking-widest">URL non valido (es: instagram.com/p/ID)</div>;
        
        return (
          <div className="flex justify-center w-full overflow-hidden rounded-3xl shadow-2xl border border-zinc-100 bg-white">
            <iframe
              src={`https://www.instagram.com/p/${instaId}/embed`}
              width="400"
              height="720"
              frameBorder="0"
              scrolling="no"
              allowtransparency="true"
              className="max-w-full"
            />
          </div>
        );

      case 'x':
        if (!content.url) return <div className="p-10 bg-zinc-50 rounded-2xl border-2 border-dashed text-zinc-400 text-center uppercase text-[10px] font-black tracking-widest">Inserisci URL Post X (Twitter)</div>;
        const xId = content.url.split('/status/')[1]?.split('?')[0];
        
        if (!xId) return <div className="p-10 bg-zinc-50 rounded-2xl border-2 border-dashed text-red-400 text-center uppercase text-[10px] font-black tracking-widest">URL non valido (es: x.com/user/status/ID)</div>;
        
        return (
          <div className="flex justify-center w-full min-h-[500px]">
             <iframe
                frameBorder="0"
                height="600"
                width="550"
                src={`https://platform.twitter.com/embed/Tweet.html?id=${xId}&theme=${theme}`}
                className="max-w-full border-0"
             />
          </div>
        );

      case 'x-timeline':
        if (!content.url) return <div className="p-10 bg-zinc-50 rounded-2xl border-2 border-dashed text-zinc-400 text-center uppercase text-[10px] font-black tracking-widest">Inserisci URL Profilo X (es: twitter.com/apple)</div>;
        const profileHandle = content.url.split('twitter.com/')[1]?.split('/')[0] || content.url.split('x.com/')[1]?.split('/')[0];
        return (
          <div className="w-full max-w-xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 bg-white min-h-[600px]">
             <iframe
                src={`https://syndication.twitter.com/srv/timeline-profile/screen-name/${profileHandle}?showReplies=false&transparent=false&theme=${theme}`}
                width="100%"
                height="600"
                frameBorder="0"
                title="X Timeline"
             />
          </div>
        );

      case 'google-review':
        return (
          <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-xl border border-zinc-100 italic text-zinc-600">
             {content.html ? (
                 <div dangerouslySetInnerHTML={{ __html: content.html }} />
             ) : (
                 <div className="text-center space-y-4">
                    <div className="flex justify-center gap-1 text-amber-400">
                        {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                    </div>
                    <p className="text-lg">"Inserisci qui il codice embed della tua recensione Google o il testo della recensione."</p>
                    <p className="text-sm font-bold text-zinc-400">— Nome Cliente</p>
                 </div>
             )}
          </div>
        );

      case 'generic':
        return (
          <div className="w-full flex justify-center" dangerouslySetInnerHTML={{ __html: content.html || '<div class="text-zinc-400">Inserisci codice HTML o Iframe</div>' }} />
        );

      default:
        return null;
    }
  };

  return (
    <section 
      className="py-24 transition-all duration-500 overflow-hidden"
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
      <div className={cn(
        "max-w-7xl mx-auto px-8 w-full flex flex-col items-center text-center",
        style.align === 'center' ? "items-center text-center" : style.align === 'right' ? "items-end text-right" : "items-start text-left"
      )}>
        {(content.title || content.subtitle) && (
          <div className={cn(
            "max-w-3xl mb-12",
            style.align === 'center' ? "text-center" : style.align === 'right' ? "text-right ml-auto" : "text-left mr-auto"
          )}>
            {content.title && (
              <h2 className={cn(
                "tracking-tight leading-tight transition-all duration-500",
                style.titleSize ? "" : "text-3xl md:text-4xl"
              )} style={{
                fontSize: toPx(style.titleSize),
                fontWeight: style.titleBold === false ? 400 : 900,
                fontStyle: style.titleItalic ? 'italic' : 'normal'
              }}>
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className={cn(
                "mt-2 leading-relaxed transition-all duration-500",
                style.subtitleSize ? "" : "text-lg",
                !style.textColor && "opacity-80"
              )} style={{
                fontSize: toPx(style.subtitleSize),
                fontWeight: style.subtitleBold ? 700 : 500,
                fontStyle: style.subtitleItalic ? 'italic' : 'normal'
              }}>
                {content.subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className="w-full flex justify-center" style={{ maxWidth: style.maxWidth || '800px' }}>
          {renderEmbed()}
        </div>
      </div>
    </section>
  );
};
