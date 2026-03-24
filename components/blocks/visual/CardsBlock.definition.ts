import { Grid } from 'lucide-react';
import { CardsBlock } from './CardsBlock';
import { CardsContent } from '../sidebar/block-editors/CardsContent';
import { CardsStyle } from '../sidebar/block-editors/CardsStyle';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const cardsDefinition: BlockDefinition = {
  type: 'cards',
  label: 'Carosello / Cards',
  icon: Grid,
  visual: CardsBlock,
  contentEditor: CardsContent,
  styleEditor: CardsStyle,
  defaults: {
    content: {
      title: 'Le Nostre Eccellenze',
      layout: 'grid',
      items: [
        { image: '', title: 'Servizio Premium', subtitle: 'Descrizione del servizio offerto' },
        { image: '', title: 'Ingegneria Avanzata', subtitle: 'Descrizione del servizio offerto' },
        { image: '', title: 'Design Moderno', subtitle: 'Descrizione del servizio offerto' }
      ]
    },
    style: {
      padding: 80,
      align: 'center',
      gap: 48,
      columns: 3,
      titleSize: 48,
      titleBold: false,
      imageAspectRatio: '16/9',
      imageBorderRadius: 24,
      imageShadow: true,
      imageHover: true,
      cardTitleBold: false,
      cardTitleSize: 28,
      cardSubtitleBold: false,
      cardSubtitleSize: 16
    },
    responsiveStyles: {
      tablet: { columns: 2 },
      mobile: { columns: 1 }
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    
    return {
      ...vars,
      '--card-bg': val('cardBgColor', 'transparent'),
      '--card-color': val('cardTextColor', 'inherit'),
      '--card-radius': toPx(val('cardBorderRadius', 32)),
      '--card-padding': toPx(val('cardPadding', 32)),
      '--card-title-fs': toPx(val('cardTitleSize', 24)),
      '--card-subtitle-fs': toPx(val('cardSubtitleSize', 16)),
      '--image-radius': toPx(val('imageBorderRadius', 24)),
      '--image-aspect': block.content?.imageAspectRatio || val('imageAspectRatio', '16/9'),
      '--text-v-align': viewport === 'mobile' ? 'flex-start' : (val('verticalAlign', 'center') === 'top' ? 'flex-start' : val('verticalAlign', 'center') === 'bottom' ? 'flex-end' : 'center'),
    };
  }
};
