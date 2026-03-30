
import React from 'react';
import { cn, formatRichText } from '@/lib/utils';
import { InlineEditable } from '@/components/shared/InlineEditable';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';
import { BlockBackground } from '@/components/shared/BlockBackground';

interface TextBlockProps {
  content: {
    title?: string;
    text: string;
    backgroundImage?: string;
    backgroundAlt?: string;
    sectionId?: string;
  };
  block: Block;
  isEditing?: boolean;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  onInlineEdit?: (field: string, value: string) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({ content, block, project, viewport, isStatic, imageMemoryCache, onInlineEdit }) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  
  // Clean title check
  const hasTitle = content.title && content.title.replace(/<[^>]*>/g, '').trim().length > 0;

  // Animation attributes
  const animType = style.animationType || 'none';
  const animDuration = style.animationDuration || 0.8;
  const baseDelay = style.animationDelay || 0;
  const animKey = !isStatic ? `${block.id}-${animType}-${animDuration}-${baseDelay}` : 'static';

  return (
    <section
      key={animKey}
      className={cn("w-full transition-all duration-500 overflow-hidden relative")}
      style={{
        background: 'var(--block-bg)',
        color: 'var(--block-color)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        borderRadius: 'var(--block-radius)',
        borderWidth: 'var(--block-border-w)',
        borderColor: 'var(--block-border-c)',
      }}
    >
      {/* Anchor for external links */}
      {(content.sectionId || block.id) && (
        <span id={content.sectionId || block.id} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
      )}
      
      <BlockBackground
        backgroundImage={content.backgroundImage}
        backgroundAlt={content.backgroundAlt || (content as any).backgroundAlt}
        style={style}
        project={project}
        isStatic={isStatic}
        imageMemoryCache={imageMemoryCache}
      />
      <div
        id={block.id} // EDITOR TARGET - Restricts width only here
        className={cn("w-full mx-auto relative z-10 flex flex-col transition-all duration-500")}
        style={{
          paddingLeft: 'var(--block-px)',
          paddingRight: 'var(--block-px)',
          maxWidth: 'var(--block-max-width)',
          alignItems: 'var(--block-items)' as any,
          textAlign: 'var(--block-align)' as any,
          margin: '0 auto',
        }}
      >
        {(hasTitle || onInlineEdit) && (
          <div 
            className="w-full" 
            style={{ 
              marginBottom: hasTitle ? 'var(--block-gap)' : '0px',
              '--siti-anim-duration': animDuration + 's',
              '--siti-anim-delay': baseDelay + 's'
            } as any}
            data-siti-anim={animType}
            data-siti-anim-duration={animDuration}
            data-siti-anim-delay={baseDelay}
          >
            {onInlineEdit ? (
              <InlineEditable
                value={content.title || ''}
                onChange={(v) => onInlineEdit('title', v)}
                className="tracking-tighter transition-all duration-500 rt-content w-full"
                style={{
                  fontSize: 'var(--title-fs)',
                  fontWeight: 'var(--title-fw)' as any,
                  fontStyle: 'var(--title-fs-style)' as any,
                  lineHeight: 'var(--title-lh)',
                  textAlign: 'inherit',
                  color: 'inherit',
                }}
                placeholder="Titolo..."
              />
            ) : (
              <div
                className="tracking-tighter transition-all duration-500 rt-content"
                style={{
                  fontSize: 'var(--title-fs)',
                  fontWeight: 'var(--title-fw)' as any,
                  fontStyle: 'var(--title-fs-style)' as any,
                  lineHeight: 'var(--title-lh)',
                  textAlign: 'inherit',
                  color: 'inherit',
                }}
                dangerouslySetInnerHTML={{ __html: formatRichText(content.title || '') }}
              />
            )}
          </div>
        )}

        <div 
          className="w-full"
          style={{
            '--siti-anim-duration': animDuration + 's',
            '--siti-anim-delay': (baseDelay + 0.1) + 's'
          } as any}
          data-siti-anim={animType}
          data-siti-anim-duration={animDuration}
          data-siti-anim-delay={baseDelay + 0.1}
        >
          {onInlineEdit ? (
            <InlineEditable
              value={content.text}
              onChange={(v) => onInlineEdit('text', v)}
              className="rt-content max-w-none transition-all duration-500 w-full"
              style={{
                fontSize: 'var(--content-fs)',
                fontWeight: 'var(--content-fw)' as any,
                fontStyle: 'var(--content-fst)' as any,
                color: 'inherit',
                textAlign: 'inherit',
                lineHeight: '1.6',
              }}
              placeholder="Testo..."
              multiline
              richText
            />
          ) : (
            <div
              className="rt-content max-w-none transition-all duration-500"
              style={{
                fontSize: 'var(--content-fs)',
                fontWeight: 'var(--content-fw)' as any,
                fontStyle: 'var(--content-fst)' as any,
                color: 'inherit',
                textAlign: 'inherit',
                lineHeight: '1.6',
              }}
              dangerouslySetInnerHTML={{ __html: formatRichText(content.text) }}
            />
          )}
        </div>
      </div>
    </section>
  );
};
