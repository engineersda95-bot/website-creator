import React from 'react';
import { ListChecks } from 'lucide-react';
import { HowItWorks } from './HowItWorks';
import { HowItWorks as HowItWorksEditor } from '../sidebar/block-editors/HowItWorks';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
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


export const howItWorksDefinition: BlockDefinition = {
  type: 'how-it-works',
  label: 'Come Funziona',
  description: 'Spiega il processo o i passi del servizio in modo visivo e sequenziale.',
  thumbnail: Thumbnail,
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
  styleMapper: (style, block, project, viewport) => {
    const { vars } = getBaseStyleVars(style, block, project, viewport);
    return { ...vars };
  }
};
