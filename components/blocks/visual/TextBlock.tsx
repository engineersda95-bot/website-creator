
import React from 'react';
import { cn, toPx, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';
import { BlockBackground } from '@/components/shared/BlockBackground';

interface TextBlockProps {
  content: {
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
}

export const TextBlock: React.FC<TextBlockProps> = ({ content, block, project, viewport, isStatic, imageMemoryCache }) => {
  const { style, alignClass } = getBlockStyles(block, project, viewport || 'desktop');

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
        }}
      >
        {(() => {
          const TextTag = (style.titleTag || 'div') as any;
          return (
            <TextTag
              className={cn(
                "rt-content max-w-none transition-all duration-500",
              )}
              style={{
                fontSize: 'var(--title-fs)',
                color: 'inherit',
                fontWeight: 'var(--title-fw)' as any,
                lineHeight: 'var(--title-lh)',
                textAlign: 'var(--block-align)' as any,
                fontStyle: 'var(--title-fs-style)' as any,
                marginLeft: 'var(--block-ml-auto)',
                marginRight: 'var(--block-mr-auto)',
              }}
              dangerouslySetInnerHTML={{ __html: formatRichText(content.text) }}
            />
          );
        })()}
      </div>
    </section>
  );
};
