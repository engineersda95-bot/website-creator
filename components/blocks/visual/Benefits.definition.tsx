import React from 'react';
import { Star } from 'lucide-react';
import { Benefits } from './Benefits';
import { Benefits as BenefitsEditor } from '../sidebar/block-editors/Benefits';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

const PreviewCards: React.FC<{ className?: string }> = ({ className }) => (
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

const PreviewMinimal: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <circle cx="20" cy="24" r="8" fill="#f4f4f5" stroke="#e4e4e7" />
    <rect x="36" y="18" width="50" height="5" rx="2" fill="#71717a" />
    <rect x="36" y="28" width="150" height="3" rx="1" fill="#d4d4d8" />
    <circle cx="20" cy="58" r="8" fill="#f4f4f5" stroke="#e4e4e7" />
    <rect x="36" y="52" width="60" height="5" rx="2" fill="#71717a" />
    <rect x="36" y="62" width="140" height="3" rx="1" fill="#d4d4d8" />
    <circle cx="20" cy="92" r="8" fill="#f4f4f5" stroke="#e4e4e7" />
    <rect x="36" y="86" width="45" height="5" rx="2" fill="#71717a" />
    <rect x="36" y="96" width="130" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

const PreviewCentered: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <circle cx="35" cy="30" r="14" fill="#f4f4f5" stroke="#e4e4e7" />
    <rect x="15" y="52" width="40" height="5" rx="2" fill="#71717a" />
    <rect x="10" y="62" width="50" height="3" rx="1" fill="#d4d4d8" />
    <rect x="12" y="69" width="46" height="3" rx="1" fill="#d4d4d8" />
    <circle cx="100" cy="30" r="14" fill="#f4f4f5" stroke="#e4e4e7" />
    <rect x="80" y="52" width="40" height="5" rx="2" fill="#71717a" />
    <rect x="75" y="62" width="50" height="3" rx="1" fill="#d4d4d8" />
    <rect x="77" y="69" width="46" height="3" rx="1" fill="#d4d4d8" />
    <circle cx="165" cy="30" r="14" fill="#f4f4f5" stroke="#e4e4e7" />
    <rect x="145" y="52" width="40" height="5" rx="2" fill="#71717a" />
    <rect x="140" y="62" width="50" height="3" rx="1" fill="#d4d4d8" />
    <rect x="142" y="69" width="46" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

const PreviewList: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <circle cx="16" cy="22" r="6" fill="#f4f4f5" stroke="#e4e4e7" />
    <rect x="28" y="19" width="50" height="5" rx="2" fill="#71717a" />
    <rect x="28" y="30" width="160" height="3" rx="1" fill="#d4d4d8" />
    <line x1="10" y1="42" x2="190" y2="42" stroke="#f4f4f5" />
    <circle cx="16" cy="56" r="6" fill="#f4f4f5" stroke="#e4e4e7" />
    <rect x="28" y="53" width="60" height="5" rx="2" fill="#71717a" />
    <rect x="28" y="64" width="150" height="3" rx="1" fill="#d4d4d8" />
    <line x1="10" y1="76" x2="190" y2="76" stroke="#f4f4f5" />
    <circle cx="16" cy="90" r="6" fill="#f4f4f5" stroke="#e4e4e7" />
    <rect x="28" y="87" width="45" height="5" rx="2" fill="#71717a" />
    <rect x="28" y="98" width="140" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

export const benefitsDefinition: BlockDefinition = {
  type: 'benefits',
  label: 'Vantaggi',
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
  variants: [
    { id: 'cards', label: 'Cards', description: 'Card con icona, titolo e descrizione', preview: PreviewCards },
    { id: 'minimal', label: 'Minimal', description: 'Icona a sinistra, testo a destra', preview: PreviewMinimal },
    { id: 'centered', label: 'Centrato', description: 'Icona grande centrata, testo sotto', preview: PreviewCentered },
    { id: 'list', label: 'Lista', description: 'Icona e titolo inline, stile lista', preview: PreviewList },
  ],
  styleMapper: (style, block, project, viewport) => {
    const { vars } = getBaseStyleVars(style, block, project, viewport);
    return { ...vars };
  }
};
