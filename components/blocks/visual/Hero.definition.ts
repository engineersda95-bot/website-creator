import { Square } from 'lucide-react';
import { Hero } from './Hero';
import { HeroContent } from '../sidebar/block-editors/HeroContent';
import { HeroStyle } from '../sidebar/block-editors/HeroStyle';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const heroDefinition: BlockDefinition = {
  type: 'hero',
  label: 'Hero',
  icon: Square,
  visual: Hero,
  contentEditor: HeroContent,
  styleEditor: HeroStyle,
  defaults: {
    content: {
      title: 'La tua Visione, Reale',
      subtitle: 'Costruiamo esperienze digitali che lasciano il segno.',
      cta: 'Inizia Ora',
      ctaUrl: '#'
    },
    style: {
      padding: 120,
      align: 'center',
      buttonTheme: 'primary'
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    
    return {
      ...vars,
      '--hero-min-height': toPx(val('minHeight', '600px')),
      '--text-v-align': viewport === 'mobile' ? 'flex-start' : (val('verticalAlign', 'center') === 'top' ? 'flex-start' : val('verticalAlign', 'center') === 'bottom' ? 'flex-end' : 'center'),
    };
  }
};
