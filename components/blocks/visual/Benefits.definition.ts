import { Star } from 'lucide-react';
import { Benefits } from './Benefits';
import { BenefitsContent } from '../sidebar/block-editors/BenefitsContent';
import { BenefitsStyle } from '../sidebar/block-editors/BenefitsStyle';
import { BenefitsUnified } from '../sidebar/block-editors/BenefitsUnified';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

export const benefitsDefinition: BlockDefinition = {
  type: 'benefits',
  label: 'Vantaggi',
  icon: Star,
  visual: Benefits,
  contentEditor: BenefitsContent,
  styleEditor: BenefitsStyle,
  unifiedEditor: BenefitsUnified,
  defaults: {
    content: {
      title: 'Perché scegliere noi',
      subtitle: 'Scopri i vantaggi competitivi che offriamo ai nostri clienti ogni giorno.',
      items: [
        {
          icon: 'Zap',
          title: 'Velocità',
          description: 'Soluzioni rapide e performanti per il tuo business.'
        },
        {
          icon: 'ShieldCheck',
          title: 'Affidabilità',
          description: 'Sistemi sicuri e garantiti al 100%.'
        },
        {
          icon: 'TrendingUp',
          title: 'Crescita',
          description: 'Strategie mirate per scalare il tuo mercato.'
        }
      ]
    },
    style: {
      padding: 80,
      columns: 3,
      align: 'center',
      titleTag: 'h2',
      itemTitleTag: 'h3',
      boxStyle: 'card',
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars } = getBaseStyleVars(style, block, project, viewport);
    return {
      ...vars,
    };
  }
};
