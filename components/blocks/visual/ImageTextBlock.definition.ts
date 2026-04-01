import { Grid } from 'lucide-react';
import { ImageTextBlock } from './ImageTextBlock';
import { ImageText } from '../sidebar/block-editors/ImageText';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const imageTextDefinition: BlockDefinition = {
  type: 'image-text',
  label: 'Immagine e Testo',
  icon: Grid,
  visual: ImageTextBlock,
  unifiedEditor: ImageText,
  defaults: {
    content: {
      title: 'Innovazione in ogni dettaglio',
      text: 'Ogni progetto è un viaggio unico verso l\'eccellenza digitale.',
      imageSide: 'right',
      cta: 'Scopri di più'
    },
    style: {
      padding: 80,
      align: 'left',
      gap: 60,
      buttonTheme: 'secondary',
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40,
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
      '--image-order': val('imagePosition', 'left') === 'left' ? '0' : '1',
      '--text-order': val('imagePosition', 'left') === 'left' ? '1' : '0',
      '--image-radius': toPx(val('imageBorderRadius', 24)),
      '--image-aspect': block.content?.imageAspectRatio || val('imageAspectRatio', '16/9'),
      '--text-v-align': viewport === 'mobile' ? 'flex-start' : (val('verticalAlign', 'center') === 'top' ? 'flex-start' : val('verticalAlign', 'center') === 'bottom' ? 'flex-end' : 'center'),
    };
  }
};
