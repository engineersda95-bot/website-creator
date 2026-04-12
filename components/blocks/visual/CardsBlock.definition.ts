import { Grid } from 'lucide-react';
import { CardsBlock } from './CardsBlock';
import { Cards } from '../sidebar/block-editors/Cards';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const cardsDefinition: BlockDefinition = {
  type: 'cards',
  label: 'Carosello / Cards',
  icon: Grid,
  visual: CardsBlock,
  unifiedEditor: Cards,
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
      titleBold: false,
      titleTag: 'h2',
      imageAspectRatio: '16/9',
      imageBorderRadius: 24,
      imageShadow: true,
      imageHover: true,
      cardTitleBold: false,
      itemTitleTag: 'h3',
      cardSubtitleBold: false,
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40,
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
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
      '--card-radius': toPx(val('cardBorderRadius', 32), '32px'),
      '--card-padding': toPx(val('cardPadding', 32), '32px'),
      '--card-title-fs': val('cardTitleSize', null) !== null ? toPx(val('cardTitleSize', null), '1.75rem') : `var(--global-${val('itemTitleTag', 'h3')}-fs)`,
      '--card-subtitle-fs': toPx(val('cardSubtitleSize', '1rem'), '1rem'),
      '--image-radius': toPx(val('imageBorderRadius', 24), '24px'),
      '--image-aspect': block.content?.imageAspectRatio || val('imageAspectRatio', '16/9'),
      '--text-v-align': (val('verticalAlign', 'center') === 'top' ? 'flex-start' : val('verticalAlign', 'center') === 'bottom' ? 'flex-end' : 'center'),
    };
  }
};
