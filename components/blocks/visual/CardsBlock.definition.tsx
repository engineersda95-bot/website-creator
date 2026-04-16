import { Grid } from 'lucide-react';
import { CardsBlock } from './CardsBlock';
import { Cards } from '../sidebar/block-editors/Cards';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';
import React from 'react';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#fafafa" />
    <rect x="8" y="24" width="56" height="72" rx="6" fill="#ffffff" stroke="#e4e4e7" />
    <rect x="8" y="24" width="56" height="34" rx="6" fill="#e4e4e7" />
    <rect x="14" y="65" width="34" height="5" rx="1.5" fill="#18181b" />
    <rect x="14" y="75" width="40" height="3" rx="1" fill="#a1a1aa" />
    <rect x="72" y="24" width="56" height="72" rx="6" fill="#ffffff" stroke="#e4e4e7" />
    <rect x="72" y="24" width="56" height="34" rx="6" fill="#e4e4e7" />
    <rect x="78" y="65" width="34" height="5" rx="1.5" fill="#18181b" />
    <rect x="78" y="75" width="40" height="3" rx="1" fill="#a1a1aa" />
    <rect x="136" y="24" width="56" height="72" rx="6" fill="#ffffff" stroke="#e4e4e7" />
    <rect x="136" y="24" width="56" height="34" rx="6" fill="#e4e4e7" />
    <rect x="142" y="65" width="34" height="5" rx="1.5" fill="#18181b" />
    <rect x="142" y="75" width="40" height="3" rx="1" fill="#a1a1aa" />
  </svg>
);

export const cardsDefinition: BlockDefinition = {
  type: 'cards',
  label: 'Carosello / Cards',
  description: 'Griglia di card con immagine, titolo e sottotitolo. Ideale per servizi, prodotti o team.',
  thumbnail: Thumbnail,
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
      imageShadow: false,
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
