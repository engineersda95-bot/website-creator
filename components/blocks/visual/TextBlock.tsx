import React from 'react';
import { cn, toPx, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';

interface TextBlockProps {
  content: {
    text: string;
  };
  block: Block;
  isEditing?: boolean;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
}

export const TextBlock: React.FC<TextBlockProps> = ({ content, block, project, viewport, isStatic }) => {
  const { style, alignClass } = getBlockStyles(block, project, viewport || 'desktop');

  return (
    <section 
      className={cn("w-full transition-all duration-500")}
      style={{
        backgroundColor: 'var(--block-bg)',
        color: 'var(--block-color)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        marginTop: 'var(--block-mt)',
        marginBottom: 'var(--block-mb)',
        marginLeft: 'var(--block-ml)',
        marginRight: 'var(--block-mr)',
        borderRadius: 'var(--block-radius)',
        width: 'var(--block-width)'
      }}
    >
      <div 
        className={cn("mx-auto w-full flex flex-col px-8")}
        style={{ 
          maxWidth: 'var(--block-max-width)',
          gap: 'var(--block-gap)',
          alignItems: 'var(--block-items)' as any,
        }}
      >
        <div 
          className={cn(
            "prose prose-sm md:prose-base max-w-none transition-all duration-500",
          )}
          style={{ 
            fontSize: 'var(--base-fs)',
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
      </div>
    </section>
  );
};
