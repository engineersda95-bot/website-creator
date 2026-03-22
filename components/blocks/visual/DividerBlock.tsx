import React from 'react';
import { cn } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';

interface DividerBlockProps {
  content: any;
  block: Block;
  isEditing?: boolean;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ block, project, viewport }) => {
  const { alignClass } = getBlockStyles(block, project, viewport || 'desktop');

  return (
    <section 
      className={cn("w-full flex transition-all duration-500", alignClass)}
      style={{
        backgroundColor: 'var(--block-bg)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        paddingLeft: 'var(--block-px)',
        paddingRight: 'var(--block-px)',
      }}
    >
      <div 
        className={cn("w-full flex transition-all duration-300", alignClass)}
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
