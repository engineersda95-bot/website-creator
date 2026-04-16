import React from 'react';
import { Tag } from 'lucide-react';
import { PromoBlock } from './PromoBlock';
import { Promo as PromoEditor } from '../sidebar/block-editors/Promo';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#fafafa" />
    <rect x="10" y="14" width="180" height="92" rx="8" fill="#e4e4e7" />
    <rect x="10" y="14" width="180" height="92" fill="#18181b" fillOpacity="0.35" rx="8" />
    <rect x="30" y="36" width="90" height="9" rx="2" fill="#ffffff" />
    <rect x="30" y="52" width="100" height="3.5" rx="1" fill="#ffffff" fillOpacity="0.6" />
    <rect x="30" y="59" width="80" height="3.5" rx="1" fill="#ffffff" fillOpacity="0.6" />
    <rect x="30" y="74" width="58" height="14" rx="7" fill="#ffffff" />
    <rect x="38" y="78" width="42" height="6" rx="1.5" fill="#18181b" />
  </svg>
);

export const promoDefinition: BlockDefinition = {
  type: 'promo',
  label: 'Promo / Banner',
  description: 'Banner promozionale con immagine di sfondo, titolo e CTA. Perfetto per offerte e campagne.',
  thumbnail: Thumbnail,
  icon: Tag,
  visual: PromoBlock,
  unifiedEditor: PromoEditor,
  defaults: {
    content: {
      items: [
        {
          image: '',
          title: 'Special Offer',
          text: 'Approfitta della promozione',
          url: ''
        }
      ],
      title: ''
    },
    style: {
      padding: 60,
      hPadding: 40,
      align: 'center',
      gap: 32,
      columns: 1,
      imageAspectRatio: '16/9',
      imageBorderRadius: 24,
      itemTitleTag: 'h3',
      overlayDisabled: true,
      overlayColor: '#000000',
      overlayOpacity: 40,
      verticalAlign: 'center',
      horizontalAlign: 'center',
      itemTitleBold: true,
      itemTitleItalic: false,
      itemTitleSize: null,
      itemTextSize: null,
      titleSize: 42,
      titleTag: 'h2',
      titleBold: true,
      titleItalic: false,
      titleAlign: null,
      textColorOverride: '#ffffff',
      minHeight: 60,
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    },
    responsiveStyles: {
      tablet: { },
      mobile: { }
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;

    return {
      ...vars,
      '--promo-min-h': `${val('minHeight', 60)}vh`,
    };
  }
};
