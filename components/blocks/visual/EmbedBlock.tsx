import React from 'react';
import { cn } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';

interface EmbedBlockProps {
  content: {
    type: 'youtube' | 'map' | 'instagram' | 'x' | 'custom';
    url: string;
    title?: string;
  };
  block: Block;
  isEditing?: boolean;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
}

export const EmbedBlock: React.FC<EmbedBlockProps> = ({ content, block, project, viewport, isStatic }) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');

  const getEmbedUrl = () => {
    if (!content.url) return null;

    switch (content.type) {
      case 'youtube': {
        // Handle full URL or ID
        let id = content.url;
        if (content.url.includes('v=')) {
          id = content.url.split('v=')[1].split('&')[0];
        } else if (content.url.includes('youtu.be/')) {
          id = content.url.split('youtu.be/')[1].split('?')[0];
        }
        return `https://www.youtube.com/embed/${id}`;
      }
      case 'instagram': {
        // Strip parameters and ensure /embed suffix
        let url = content.url.split('?')[0];
        if (!url.endsWith('/')) url += '/';
        if (!url.includes('/embed')) {
            url += 'embed';
        }
        return url;
      }
      case 'x': {
        if (!content.url) return null;
        
        // Detect if it's a single Tweet
        const tweetMatch = content.url.match(/status\/(\d+)/);
        if (tweetMatch && tweetMatch[1]) {
          return `https://platform.twitter.com/embed/Tweet.html?id=${tweetMatch[1]}&theme=light`;
        }

        // Otherwise (Profile or other), use Twitframe with normalized URL
        const normalizedUrl = content.url.replace('x.com', 'twitter.com');
        return `https://twitframe.com/show?url=${encodeURIComponent(normalizedUrl)}`;
      }
      case 'map': {
        // Iframe code or simple address
        if (content.url.trim().startsWith('<iframe') || content.url.includes('google.com/maps/embed')) {
            return content.url;
        }
        // Simple search address
        return `https://www.google.com/maps?q=${encodeURIComponent(content.url)}&output=embed`;
      }
      case 'custom':
      default:
        return content.url;
    }
  };

  const embedUrl = getEmbedUrl();
  const isIframeCode = content.url?.trim().startsWith('<iframe');
  const alignment = style?.align || 'center';

  return (
    <section 
      className={cn("w-full transition-all duration-500 overflow-hidden relative flex flex-col justify-center")}
      style={{
        background: 'var(--block-bg)',
        color: 'var(--block-color)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        paddingLeft: 'var(--block-px)',
        paddingRight: 'var(--block-px)',
        minHeight: 'var(--block-min-height, auto)',
      }}
    >
      <div 
        className={cn(
          "w-full flex flex-col transition-all duration-500",
          alignment === 'center' ? "mx-auto" : alignment === 'right' ? "ml-auto mr-0" : "mr-0 ml-0"
        )}
        style={{ 
          maxWidth: 'var(--block-max-width)',
          alignItems: (alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start') as any,
        }}
      >
        {content.title && (
          <h2 
            className="w-full transition-all duration-500"
            style={{ 
                fontSize: 'var(--title-fs, 2rem)',
                fontWeight: 'var(--title-fw)' as any,
                fontStyle: 'var(--title-fs-style)' as any,
                textTransform: 'var(--title-upper)' as any,
                textAlign: 'var(--block-align)' as any,
                color: 'inherit',
                marginBottom: 'var(--block-gap, 2rem)'
            }}
          >
            {content.title}
          </h2>
        )}

        <div 
          className={cn(
            "overflow-hidden relative transition-all duration-500",
            (content.type === 'map' || content.type === 'custom') && "flex-grow",
            alignment === 'center' ? "mx-auto" : alignment === 'right' ? "ml-auto mr-0" : "mr-auto ml-0"
          )}
          style={{
            borderRadius: 'var(--block-border-radius)',
            border: 'var(--block-border-width) solid var(--block-border-color)',
            aspectRatio: content.type === 'youtube' ? '16/9' : (content.type === 'map' ? '16/9' : (content.type === 'instagram' ? '1 / 1.4' : 'auto')),
            minHeight: content.type === 'custom' ? 'auto' : 
                       content.type === 'youtube' ? 'auto' : 
                       content.type === 'instagram' ? (style?.minHeight ? 'auto' : 'initial') : 
                       'var(--block-min-height, 450px)',
            maxWidth: style?.contentWidth ? `${style.contentWidth}px` : (content.type === 'instagram' ? '540px' : '100%'),
            width: content.type === 'custom' && isIframeCode ? 'auto' : '100%',
            height: (content.type === 'map' || (content.type === 'custom' && !isIframeCode)) ? '100%' : 'auto'
          }}
        >
          {isIframeCode || (content.type === 'map' && content.url.trim().startsWith('<iframe')) ? (
            <div 
                className={cn(
                  "max-w-full overflow-auto",
                  content.type === 'instagram' && !style?.minHeight && "min-h-[500px] md:min-h-[750px]"
                )}
                dangerouslySetInnerHTML={{ __html: content.url }} 
            />
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              className={cn(
                "w-full h-full border-0 absolute inset-0",
                content.type === 'instagram' && !style?.minHeight && "min-h-[500px] md:min-h-[750px]"
              )}
              style={{ minHeight: 'inherit' }}
              scrolling={content.type === 'custom' ? 'yes' : 'no'}
              allowFullScreen
              loading="lazy"
              title={content.title || 'Embedded content'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          ) : (
            <div className="w-full h-[450px] bg-zinc-100 flex items-center justify-center text-zinc-400 font-medium border-2 border-dashed border-zinc-200">
               Configura l'Embed nella sidebar
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
