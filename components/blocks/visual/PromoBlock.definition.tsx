import { Tag } from 'lucide-react';
import { PromoBlock } from './PromoBlock';
import { Promo as PromoEditor } from '../sidebar/block-editors/Promo';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const promoDefinition: BlockDefinition = {
  type: 'promo',
  label: 'Promo / Banner',
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
      ]
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
      overlayColor: 'rgba(0,0,0,0.4)',
      verticalAlign: 'center',
      horizontalAlign: 'center',
      itemTitleBold: true,
      itemTitleItalic: false,
      itemTitleSize: null,
      itemTextSize: null,
      textColorOverride: '#ffffff',
      minHeight: 60,
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
    
    // Fallback to base vars for typography if not explicitly set in the mapper
    // But actually getBaseStyleVars already calculates '--item-title-fs' correctly!
    return {
      ...vars,
      '--promo-min-h': `${val('minHeight', 60)}vh`,
      // item-title-fs is already handled by getBaseStyleVars if it's in s.itemTitleSize
      // if s.itemTitleSize is null, getBaseStyleVars uses var(--global-h3-fs)
    };
  }
};

