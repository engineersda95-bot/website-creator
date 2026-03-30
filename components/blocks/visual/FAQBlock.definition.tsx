import React from 'react';
import { FileText } from 'lucide-react';
import { FAQBlock } from './FaqBlock';
import { FAQContent } from '../sidebar/block-editors/FaqContent';
import { FAQStyle } from '../sidebar/block-editors/FaqStyle';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

// Mini SVG preview components for variant picker
const PreviewAccordion: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect x="20" y="10" width="160" height="24" rx="6" fill="#f4f4f5" stroke="#e4e4e7" />
    <rect x="28" y="19" width="80" height="6" rx="2" fill="#a1a1aa" />
    <rect x="160" y="19" width="12" height="6" rx="1" fill="#d4d4d8" />
    <rect x="20" y="40" width="160" height="24" rx="6" fill="#fafafa" stroke="#e4e4e7" />
    <rect x="28" y="49" width="70" height="6" rx="2" fill="#a1a1aa" />
    <rect x="160" y="49" width="12" height="6" rx="1" fill="#d4d4d8" />
    <rect x="20" y="70" width="160" height="40" rx="6" fill="#f0f9ff" stroke="#bae6fd" />
    <rect x="28" y="79" width="90" height="6" rx="2" fill="#0284c7" />
    <rect x="160" y="79" width="12" height="6" rx="1" fill="#0284c7" />
    <rect x="28" y="92" width="140" height="4" rx="1" fill="#bae6fd" />
    <rect x="28" y="100" width="110" height="4" rx="1" fill="#bae6fd" />
  </svg>
);

const PreviewClassic: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect x="15" y="8" width="170" height="100" rx="16" fill="#fafafa" stroke="#e4e4e7" />
    <rect x="28" y="22" width="80" height="6" rx="2" fill="#a1a1aa" />
    <path d="M158 23 L162 27 L166 23" stroke="#d4d4d8" strokeWidth="2" fill="none" strokeLinecap="round" />
    <line x1="28" y1="38" x2="172" y2="38" stroke="#f4f4f5" />
    <rect x="28" y="48" width="70" height="6" rx="2" fill="#a1a1aa" />
    <path d="M158 49 L162 53 L166 49" stroke="#d4d4d8" strokeWidth="2" fill="none" strokeLinecap="round" />
    <line x1="28" y1="64" x2="172" y2="64" stroke="#f4f4f5" />
    <rect x="28" y="74" width="90" height="6" rx="2" fill="#a1a1aa" />
    <path d="M158 75 L162 79 L166 75" stroke="#d4d4d8" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const PreviewSideBySide: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect x="10" y="10" width="75" height="6" rx="2" fill="#71717a" />
    <rect x="100" y="10" width="90" height="4" rx="1" fill="#d4d4d8" />
    <rect x="100" y="18" width="80" height="4" rx="1" fill="#d4d4d8" />
    <line x1="10" y1="32" x2="190" y2="32" stroke="#e4e4e7" />
    <rect x="10" y="40" width="70" height="6" rx="2" fill="#71717a" />
    <rect x="100" y="40" width="85" height="4" rx="1" fill="#d4d4d8" />
    <rect x="100" y="48" width="75" height="4" rx="1" fill="#d4d4d8" />
    <line x1="10" y1="62" x2="190" y2="62" stroke="#e4e4e7" />
    <rect x="10" y="70" width="65" height="6" rx="2" fill="#71717a" />
    <rect x="100" y="70" width="90" height="4" rx="1" fill="#d4d4d8" />
    <rect x="100" y="78" width="70" height="4" rx="1" fill="#d4d4d8" />
    <line x1="10" y1="92" x2="190" y2="92" stroke="#e4e4e7" />
    <rect x="10" y="100" width="80" height="6" rx="2" fill="#71717a" />
    <rect x="100" y="100" width="80" height="4" rx="1" fill="#d4d4d8" />
  </svg>
);

const PreviewNumbered: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <circle cx="24" cy="22" r="12" fill="#f4f4f5" stroke="#e4e4e7" />
    <text x="24" y="26" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="bold">1</text>
    <rect x="44" y="16" width="80" height="6" rx="2" fill="#71717a" />
    <rect x="44" y="26" width="140" height="4" rx="1" fill="#d4d4d8" />
    <circle cx="24" cy="56" r="12" fill="#f4f4f5" stroke="#e4e4e7" />
    <text x="24" y="60" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="bold">2</text>
    <rect x="44" y="50" width="90" height="6" rx="2" fill="#71717a" />
    <rect x="44" y="60" width="130" height="4" rx="1" fill="#d4d4d8" />
    <circle cx="24" cy="90" r="12" fill="#f4f4f5" stroke="#e4e4e7" />
    <text x="24" y="94" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="bold">3</text>
    <rect x="44" y="84" width="70" height="6" rx="2" fill="#71717a" />
    <rect x="44" y="94" width="120" height="4" rx="1" fill="#d4d4d8" />
  </svg>
);

export const faqDefinition: BlockDefinition = {
  type: 'faq',
  label: 'FAQ',
  icon: FileText,
  visual: FAQBlock,
  contentEditor: FAQContent,
  styleEditor: FAQStyle,
  defaults: {
    content: {
      variant: 'accordion',
      items: [
        { question: 'Come posso iniziare?', answer: 'Basta contattarci tramite il modulo sottostante.' },
        { question: 'Quali sono i tempi di consegna?', answer: 'In genere variano tra 2 e 4 settimane.' }
      ]
    },
    style: {
      padding: 80,
      align: 'center',
      gap: 48,
      titleBold: false,
      titleTag: 'h2',
      itemTitleTag: 'h3',
      itemTitleBold: true,
      patternType: 'none',
      patternScale: 40,
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    }
  },
  variants: [
    {
      id: 'accordion',
      label: 'Accordion',
      description: 'Linee separatrici con icona +/-',
      preview: PreviewAccordion,
    },
    {
      id: 'classic',
      label: 'Classico',
      description: 'Container arrotondato con chevron',
      preview: PreviewClassic,
    },
    {
      id: 'side-by-side',
      label: 'Affiancato',
      description: 'Domanda a sinistra, risposta a destra',
      preview: PreviewSideBySide,
    },
    {
      id: 'numbered',
      label: 'Numerato',
      description: 'Con numeri progressivi, stile minimal',
      preview: PreviewNumbered,
    },
  ],
  styleMapper: (style, block, project, viewport) => {
    const s_mig = { ...style };
    if (s_mig.questionSize !== undefined && s_mig.itemTitleSize === undefined) s_mig.itemTitleSize = s_mig.questionSize;
    if (s_mig.questionBold !== undefined && s_mig.itemTitleBold === undefined) s_mig.itemTitleBold = s_mig.questionBold;
    if (s_mig.questionItalic !== undefined && s_mig.itemTitleItalic === undefined) s_mig.itemTitleItalic = s_mig.questionItalic;

    const { vars, style: s } = getBaseStyleVars(s_mig, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;

    return {
      ...vars,
      '--faq-a-fs': toPx(val('answerSize', '1rem')),
      '--faq-a-fw': val('answerBold', false) ? '600' : '400',
    };
  }


};
