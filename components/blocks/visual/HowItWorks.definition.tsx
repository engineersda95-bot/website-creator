import React from 'react';
import { ListChecks } from 'lucide-react';
import { HowItWorks } from './HowItWorks';
import { HowItWorks as HowItWorksEditor } from '../sidebar/block-editors/HowItWorks';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

const PreviewCards: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect x="10" y="20" width="50" height="80" rx="8" fill="#fafafa" stroke="#e4e4e7" />
    <rect x="22" y="30" width="26" height="26" rx="8" fill="#18181b" />
    <text x="35" y="48" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">1</text>
    <rect x="18" y="64" width="34" height="4" rx="1" fill="#71717a" />
    <rect x="16" y="72" width="38" height="3" rx="1" fill="#d4d4d8" />
    <rect x="75" y="20" width="50" height="80" rx="8" fill="#fafafa" stroke="#e4e4e7" />
    <rect x="87" y="30" width="26" height="26" rx="8" fill="#18181b" />
    <text x="100" y="48" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">2</text>
    <rect x="83" y="64" width="34" height="4" rx="1" fill="#71717a" />
    <rect x="81" y="72" width="38" height="3" rx="1" fill="#d4d4d8" />
    <rect x="140" y="20" width="50" height="80" rx="8" fill="#fafafa" stroke="#e4e4e7" />
    <rect x="152" y="30" width="26" height="26" rx="8" fill="#18181b" />
    <text x="165" y="48" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">3</text>
    <rect x="148" y="64" width="34" height="4" rx="1" fill="#71717a" />
    <rect x="146" y="72" width="38" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

const PreviewMinimal: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <text x="14" y="32" fill="#e4e4e7" fontSize="28" fontWeight="900">01</text>
    <rect x="52" y="18" width="70" height="5" rx="2" fill="#71717a" />
    <rect x="52" y="28" width="130" height="3" rx="1" fill="#d4d4d8" />
    <line x1="10" y1="44" x2="190" y2="44" stroke="#f4f4f5" />
    <text x="14" y="70" fill="#e4e4e7" fontSize="28" fontWeight="900">02</text>
    <rect x="52" y="56" width="80" height="5" rx="2" fill="#71717a" />
    <rect x="52" y="66" width="120" height="3" rx="1" fill="#d4d4d8" />
    <line x1="10" y1="82" x2="190" y2="82" stroke="#f4f4f5" />
    <text x="14" y="108" fill="#e4e4e7" fontSize="28" fontWeight="900">03</text>
    <rect x="52" y="94" width="65" height="5" rx="2" fill="#71717a" />
    <rect x="52" y="104" width="110" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

const PreviewTimeline: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <line x1="30" y1="10" x2="30" y2="110" stroke="#e4e4e7" strokeWidth="2" />
    <circle cx="30" cy="22" r="6" fill="#18181b" />
    <rect x="48" y="16" width="60" height="5" rx="2" fill="#71717a" />
    <rect x="48" y="25" width="120" height="3" rx="1" fill="#d4d4d8" />
    <circle cx="30" cy="58" r="6" fill="#18181b" />
    <rect x="48" y="52" width="70" height="5" rx="2" fill="#71717a" />
    <rect x="48" y="61" width="110" height="3" rx="1" fill="#d4d4d8" />
    <circle cx="30" cy="94" r="6" fill="#18181b" />
    <rect x="48" y="88" width="55" height="5" rx="2" fill="#71717a" />
    <rect x="48" y="97" width="130" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

const PreviewCompact: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <circle cx="20" cy="24" r="10" fill="#f4f4f5" stroke="#e4e4e7" />
    <text x="20" y="28" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="bold">1</text>
    <rect x="38" y="19" width="60" height="5" rx="2" fill="#71717a" />
    <rect x="38" y="28" width="150" height="3" rx="1" fill="#d4d4d8" />
    <circle cx="20" cy="58" r="10" fill="#f4f4f5" stroke="#e4e4e7" />
    <text x="20" y="62" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="bold">2</text>
    <rect x="38" y="53" width="70" height="5" rx="2" fill="#71717a" />
    <rect x="38" y="62" width="140" height="3" rx="1" fill="#d4d4d8" />
    <circle cx="20" cy="92" r="10" fill="#f4f4f5" stroke="#e4e4e7" />
    <text x="20" y="96" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="bold">3</text>
    <rect x="38" y="87" width="55" height="5" rx="2" fill="#71717a" />
    <rect x="38" y="96" width="130" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

export const howItWorksDefinition: BlockDefinition = {
  type: 'how-it-works',
  label: 'Come Funziona',
  icon: ListChecks,
  visual: HowItWorks,
  unifiedEditor: HowItWorksEditor,
  defaults: {
    content: {
      variant: 'cards',
      title: 'Il nostro metodo in 3 passi',
      items: [
        { number: '1', title: 'Strategia', description: 'Analizziamo le tue necessità e definiamo gli obiettivi.' },
        { number: '2', title: 'Sviluppo', description: 'Creiamo la soluzione perfetta per il tuo business.' },
        { number: '3', title: 'Lancio', description: 'Mettiamo online il progetto e monitoriamo i risultati.' }
      ]
    },
    style: {
      padding: 80,
      layout: 'grid',
      align: 'center',
      numberBgColor: '',
      numberTextColor: '',
      titleTag: 'h2',
      itemTitleTag: 'h3',
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    }
  },
  variants: [
    { id: 'cards', label: 'Cards', description: 'Numero in box con titolo e descrizione', preview: PreviewCards },
    { id: 'minimal', label: 'Minimal', description: 'Numeri grandi sbiaditi, testo a destra', preview: PreviewMinimal },
    { id: 'timeline', label: 'Timeline', description: 'Linea verticale con pallini', preview: PreviewTimeline },
    { id: 'compact', label: 'Compatto', description: 'Numero inline, stile lista', preview: PreviewCompact },
  ],
  styleMapper: (style, block, project, viewport) => {
    const { vars } = getBaseStyleVars(style, block, project, viewport);
    return { ...vars };
  }
};
