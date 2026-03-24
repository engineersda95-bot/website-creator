import { Building2 } from 'lucide-react';
import { BlockDefinition } from '@/types/block-definition';
import { Logos } from './Logos';
import { LogosContent } from '../sidebar/block-editors/LogosContent';
import { LogosStyle } from '../sidebar/block-editors/LogosStyle';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const logosDefinition: BlockDefinition = {
  type: 'logos',
  label: 'Loghi Partner',
  icon: Building2,
  visual: Logos,
  contentEditor: LogosContent,
  styleEditor: LogosStyle,
  defaults: {
    content: {
      title: 'Partner & Collaborazioni',
      items: [
         { image: '' },
         { image: '' },
         { image: '' },
         { image: '' },
      ]
    },
    style: {
      padding: 60,
      gap: 40,
      align: 'center',
      grayscale: true,
      scrollSpeed: 40,
      aspectRatio: '1:1',
      logoWidth: 120,
      titleSize: 24,
      background: 'transparent',
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars } = getBaseStyleVars(style, block, project, viewport);
    return {
      ...vars,
      '--logo-width': toPx(style.logoWidth, '120px'),
      '--logo-gap': toPx(style.gap, '40px'),
      '--title-fs': toPx(style.titleSize, '24px'),
      '--scroll-speed': `${style.scrollSpeed || 40}s`,
      '--logo-filter': style.grayscale ? 'grayscale(100%) opacity(0.5)' : 'none',
      '--logo-hover-filter': style.grayscale ? 'grayscale(0%) opacity(1)' : 'none',
    };
  }
};
