import { Type } from 'lucide-react';
import { TextBlock } from './TextBlock';
import { TextContent } from '../sidebar/block-editors/TextContent';
import { TextStyle } from '../sidebar/block-editors/TextStyle';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

export const textDefinition: BlockDefinition = {
  type: 'text',
  label: 'Testo',
  icon: Type,
  visual: TextBlock,
  contentEditor: TextContent,
  styleEditor: TextStyle,
  defaults: {
    content: {
      text: 'Il tuo contenuto va qui. Usa questo blocco per descrivere la tua attività, i tuoi valori o qualsiasi altra informazione importante.'
    },
    style: {
      padding: 60,
      align: 'left',
      width: 'max-w-4xl',
      titleBold: false,
      titleTag: 'h2',
      patternScale: 40
    }
  },
  styleMapper: (style, block, project, viewport) => {
    return getBaseStyleVars(style, block, project, viewport).vars;
  }
};
