import { Layout } from 'lucide-react';
import { FooterBlock } from './FooterBlock';
import { FooterContent } from '../sidebar/block-editors/FooterContent';
import { FooterStyle } from '../sidebar/block-editors/FooterStyle';
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
  defaults: {
    content: { copyright: '© 2024 Tutti i diritti riservati' },
    style: { 
      padding: 40,
      patternType: 'none',
      patternColor: '#ffffff',
      patternOpacity: 10,
      patternScale: 40
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    
    return {
      ...vars,
      '--copyright-fs': toPx(val('copyrightSize', '12px')),
      '--logo-fs': toPx(val('titleSize', '40px')),
      '--logo-text-fs': toPx(val('titleSize', '24px')),
      '--social-icon-size': toPx(val('socialIconSize', 20)),
    };
  }
};
