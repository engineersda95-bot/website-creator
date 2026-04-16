import React from 'react';
import { Star } from 'lucide-react';
import { Benefits } from './Benefits';
import { Benefits as BenefitsEditor } from '../sidebar/block-editors/Benefits';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect x="8" y="15" width="55" height="90" rx="8" fill="#fafafa" stroke="#e4e4e7" />
    <circle cx="35" cy="38" r="10" fill="#f4f4f5" />
    <rect x="20" y="56" width="30" height="4" rx="1" fill="#71717a" />
    <rect x="16" y="65" width="38" height="3" rx="1" fill="#d4d4d8" />
    <rect x="72" y="15" width="55" height="90" rx="8" fill="#fafafa" stroke="#e4e4e7" />
    <circle cx="100" cy="38" r="10" fill="#f4f4f5" />
    <rect x="85" y="56" width="30" height="4" rx="1" fill="#71717a" />
    <rect x="80" y="65" width="40" height="3" rx="1" fill="#d4d4d8" />
    <rect x="137" y="15" width="55" height="90" rx="8" fill="#fafafa" stroke="#e4e4e7" />
    <circle cx="165" cy="38" r="10" fill="#f4f4f5" />
    <rect x="150" y="56" width="30" height="4" rx="1" fill="#71717a" />
    <rect x="145" y="65" width="40" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

export const benefitsDefinition: BlockDefinition = {
  type: 'benefits',
  label: 'Vantaggi',
  description: 'Mostra i punti di forza o i servizi offerti con icone e descrizioni brevi.',
  thumbnail: Thumbnail,
  icon: Star,
  visual: Benefits,
  unifiedEditor: BenefitsEditor,
  defaults: {
    content: {
      variant: 'cards',
      title: 'Perché scegliere noi',
      subtitle: 'Scopri i vantaggi competitivi che offriamo ai nostri clienti ogni giorno.',
      items: [
        { icon: 'Zap', title: 'Velocità', description: 'Soluzioni rapide e performanti per il tuo business.' },
        { icon: 'ShieldCheck', title: 'Affidabilità', description: 'Sistemi sicuri e garantiti al 100%.' },
        { icon: 'TrendingUp', title: 'Crescita', description: 'Strategie mirate per scalare il tuo mercato.' }
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
    return { ...vars };
  }
};
