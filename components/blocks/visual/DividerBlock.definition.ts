import { Minus } from 'lucide-react';
import { DividerBlock } from './DividerBlock';
import { Divider } from '../sidebar/block-editors/Divider';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const dividerDefinition: BlockDefinition = {
  type: 'divider',
  label: 'Separatore',
  icon: Minus,
  visual: DividerBlock,
  unifiedEditor: Divider,
  defaults: {
    content: { type: 'line' },
    style: { 
      padding: 40,
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40
    }
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
