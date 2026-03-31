import { Layout } from 'lucide-react';
import { FooterBlock } from './FooterBlock';
import { FooterContent } from '../sidebar/block-editors/FooterContent';
import { FooterStyle } from '../sidebar/block-editors/FooterStyle';
import { FooterUnified } from '../sidebar/block-editors/FooterUnified';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const footerDefinition: BlockDefinition = {
  type: 'footer',
  label: 'Footer',
  icon: Layout,
  visual: FooterBlock,
  contentEditor: FooterContent,
  styleEditor: FooterStyle,
  unifiedEditor: FooterUnified,
  defaults: {
    content: { 
      copyright: '© 2024 Tutti i diritti riservati',
      description: '<p>Benvenuti nell\'editor di siti web più avanzato del mondo.</p>'
    },
    style: { 
      padding: 40,
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    const toPx = (v: any) => typeof v === 'number' ? `${v}px` : v;
    
    return {
      ...vars,
      '--copyright-fs': toPx(val('copyrightSize', '10px')),
      '--copyright-fw': val('copyrightBold', false) ? '700' : '400',
      '--copyright-fst': val('copyrightItalic', false) ? 'italic' : 'normal',
      '--description-fs': toPx(val('descriptionSize', '14px')),
      '--description-fw': val('descriptionBold', false) ? '700' : '400',
      '--description-fst': val('descriptionItalic', false) ? 'italic' : 'normal',
      '--links-title-fs': toPx(val('linksTitleSize', '12px')),
      '--links-title-fw': val('linksTitleBold', false) ? '700' : '400',
      '--links-title-fst': val('linksTitleItalic', false) ? 'italic' : 'normal',
      '--logo-fs': toPx(val('titleSize', '40px')),
      '--logo-text-fs': toPx(val('titleSize', '24px')),
      '--logo-fw': val('titleBold', true) ? '900' : '400',
      '--logo-fst': val('titleItalic', false) ? 'italic' : 'normal',
      '--social-icon-size': toPx(val('socialIconSize', 20)),
    };
  }
};
