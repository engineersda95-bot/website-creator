import { Type } from 'lucide-react';
import { TextBlock } from './TextBlock';
import { Text } from '../sidebar/block-editors/Text';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

export const textDefinition: BlockDefinition = {
  type: 'text',
  label: 'Testo',
  icon: Type,
  visual: TextBlock,
  unifiedEditor: Text,
  defaults: {
    content: {
      title: 'Il Tuo Titolo Qui',
      text: 'Il tuo contenuto va qui. Usa questo blocco per descrivere la tua attività, i tuoi valori o qualsiasi altra informazione importante.'
    },
    style: {
      padding: 60,
      align: 'left',
      width: 'max-w-4xl',
      titleBold: false,
      titleTag: 'h2',
      patternScale: 40,
      contentSize: 18,
      contentBold: false,
      contentItalic: false,
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    
    return {
      ...vars,
      '--content-fs': typeof val('contentSize', 18) === 'number' ? `${val('contentSize', 18)}px` : val('contentSize', '18px'),
      '--content-fw': val('contentBold', false) ? '700' : '400',
      '--content-fst': val('contentItalic', false) ? 'italic' : 'normal',
    };
  }


};
