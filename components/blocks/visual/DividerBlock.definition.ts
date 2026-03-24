import { Minus } from 'lucide-react';
import { DividerBlock } from './DividerBlock';
import { DividerContent } from '../sidebar/block-editors/DividerContent';
import { DividerStyle } from '../sidebar/block-editors/DividerStyle';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const dividerDefinition: BlockDefinition = {
  type: 'divider',
  label: 'Separatore',
  icon: Minus,
  visual: DividerBlock,
  contentEditor: DividerContent,
  styleEditor: DividerStyle,
  defaults: {
    content: { type: 'line' },
    style: { padding: 40 }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    
    return {
      ...vars,
      '--divider-width': val('dividerWidth', 100) + '%',
      '--divider-stroke': toPx(val('dividerStroke', 1)),
      '--divider-color': val('dividerColor', val('textColor', 'currentColor')),
    };
  }
};
