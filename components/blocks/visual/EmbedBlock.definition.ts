import { Plus } from 'lucide-react';
import { EmbedBlock } from './EmbedBlock';
import { Embed } from '../sidebar/block-editors/Embed';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

export const embedDefinition: BlockDefinition = {
  type: 'embed',
  label: 'Embed (Video/Post)',
  icon: Plus,
  visual: EmbedBlock,
  unifiedEditor: Embed,
  defaults: {
    content: {
      type: 'youtube',
      code: ''
    },
    style: {
      padding: 60,
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40,
      titleTag: 'h2'
    }
  },
  styleMapper: (style, block, project, viewport) => {
    return getBaseStyleVars(style, block, project, viewport).vars;
  }
};
