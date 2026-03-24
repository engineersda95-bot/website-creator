import { Plus } from 'lucide-react';
import { EmbedBlock } from './EmbedBlock';
import { EmbedContent } from '../sidebar/block-editors/EmbedContent';
import { EmbedStyle } from '../sidebar/block-editors/EmbedStyle';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

export const embedDefinition: BlockDefinition = {
  type: 'embed',
  label: 'Embed (Video/Code)',
  icon: Plus,
  visual: EmbedBlock,
  contentEditor: EmbedContent,
  styleEditor: EmbedStyle,
  defaults: {
    content: {
      type: 'youtube',
      code: ''
    },
    style: {
      padding: 60,
      patternType: 'none',
      patternColor: '#ffffff',
      patternOpacity: 10,
      patternScale: 40
    }
  },
  styleMapper: (style, block, project, viewport) => {
    return getBaseStyleVars(style, block, project, viewport).vars;
  }
};
