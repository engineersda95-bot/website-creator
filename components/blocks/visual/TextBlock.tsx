
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

  return (
    <section
      className={cn("w-full transition-all duration-500 overflow-hidden relative")}
      style={{
        background: 'var(--block-bg)',
        color: 'var(--block-color)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
      }}
    >
      {content.sectionId && (
        <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
      )}
      <BlockBackground
        backgroundImage={content.backgroundImage}
        backgroundAlt={(content as any).backgroundAlt}
        style={style}
        project={project}
        isStatic={isStatic}
        imageMemoryCache={imageMemoryCache}
      />
      <div
        className={cn("w-full flex flex-col transition-all duration-500 relative z-10")}
        style={{
          paddingLeft: 'var(--block-px)',
          paddingRight: 'var(--block-px)',
          marginLeft: 'var(--block-ml-auto)',
          marginRight: 'var(--block-mr-auto)',
          gap: 'var(--block-gap)',
          alignItems: 'var(--block-items)' as any,
          maxWidth: 'var(--block-max-width)',
        }}
      >
        {(content.title || onInlineEdit) && (() => {
          const titleStyle = {
            fontSize: 'var(--title-fs)',
            fontWeight: 'var(--title-fw)' as any,
            fontStyle: 'var(--title-fs-style)' as any,
            lineHeight: 'var(--title-lh)',
            textAlign: 'var(--block-align)' as any,
            color: 'inherit',
          };
          return onInlineEdit ? (
            <InlineEditable
              value={content.title || ''}
              onChange={(v) => onInlineEdit('title', v)}
              className="tracking-tighter transition-all duration-500 rt-content w-full"
              style={titleStyle}
              placeholder="Titolo..."
            />
          ) : (
            <div
              className="tracking-tighter transition-all duration-500 rt-content"
              style={titleStyle}
              dangerouslySetInnerHTML={{ __html: formatRichText(content.title || '') }}
            />
          );
        })()}

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
              textAlign: 'var(--block-align)' as any,
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
              textAlign: 'var(--block-align)' as any,
              lineHeight: '1.6',
            }}
            dangerouslySetInnerHTML={{ __html: formatRichText(content.text) }}
          />
        )}
      </div>
    </section>
  );
};
