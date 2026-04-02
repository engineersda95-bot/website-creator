import React from 'react';
import { cn } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';
import { BlockBackground } from '@/components/shared/BlockBackground';

interface DividerBlockProps {
  content: any;
  block: Block;
  isEditing?: boolean;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ block, project, viewport, isStatic, imageMemoryCache }) => {
  const { style, alignClass } = getBlockStyles(block, project, viewport || 'desktop');
  const { content } = block;

  return (
    <section id={block.id} 
      className={cn("w-full flex relative overflow-hidden", alignClass)}
      style={{
        background: 'var(--block-bg)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        paddingLeft: 'var(--block-px)',
        paddingRight: 'var(--block-px)',
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
        className={cn("w-full flex transition-all duration-300 relative z-10", alignClass)}
      >
        <div 
          className="transition-all duration-300"
          style={{ 
            width: 'var(--divider-width, 100%)',
            height: 'var(--divider-stroke, 1px)',
            backgroundColor: 'var(--divider-color, currentColor)',
            borderRadius: '9999px',
            maxWidth: 'var(--block-max-width)',
          }}
        />
      </div>
    </section>
  );
};
