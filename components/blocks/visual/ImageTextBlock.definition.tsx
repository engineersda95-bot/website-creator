import { Grid } from 'lucide-react';
import { ImageTextBlock } from './ImageTextBlock';
import { ImageText } from '../sidebar/block-editors/ImageText';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';
import React from 'react';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#fafafa" />
    <rect x="10" y="14" width="85" height="92" rx="6" fill="#e4e4e7" />
    <rect x="108" y="26" width="72" height="8" rx="2" fill="#18181b" />
    <rect x="108" y="42" width="70" height="3" rx="1" fill="#a1a1aa" />
    <rect x="108" y="50" width="64" height="3" rx="1" fill="#a1a1aa" />
    <rect x="108" y="58" width="68" height="3" rx="1" fill="#a1a1aa" />
    <rect x="108" y="72" width="48" height="12" rx="6" fill="#18181b" />
    <rect x="115" y="75.5" width="34" height="5" rx="1.5" fill="#ffffff" />
  </svg>
);

export const imageTextDefinition: BlockDefinition = {
  type: 'image-text',
  label: 'Immagine e Testo',
  description: 'Immagine affiancata a testo con CTA. Ottimo per sezioni "chi siamo", prodotti o storytelling.',
  thumbnail: Thumbnail,
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
      animationDelay: 0,
      splitRatio: 50
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
      '--text-v-align': (val('verticalAlign', 'center') === 'top' ? 'flex-start' : val('verticalAlign', 'center') === 'bottom' ? 'flex-end' : 'center'),
      '--split-ratio': `${val('splitRatio', 50)}fr ${100 - val('splitRatio', 50)}fr`,
    };
  }
};
