import React from 'react';
import { FileText } from 'lucide-react';
import { QuoteBlock } from './QuoteBlock';
import { QuoteContent } from '../sidebar/block-editors/QuoteContent';
import { QuoteStyle } from '../sidebar/block-editors/QuoteStyle';
import { QuoteUnified } from '../sidebar/block-editors/QuoteUnified';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

const PreviewCards: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect x="8" y="10" width="85" height="100" rx="12" fill="#fafafa" stroke="#e4e4e7" />
    <rect x="20" y="22" width="14" height="10" rx="3" fill="#e4e4e7" />
    <rect x="20" y="40" width="62" height="3" rx="1" fill="#d4d4d8" />
    <rect x="20" y="47" width="55" height="3" rx="1" fill="#d4d4d8" />
    <line x1="20" y1="72" x2="80" y2="72" stroke="#f4f4f5" />
    <circle cx="32" cy="86" r="8" fill="#e4e4e7" />
    <rect x="44" y="82" width="30" height="4" rx="1" fill="#a1a1aa" />
    <rect x="44" y="90" width="22" height="3" rx="1" fill="#d4d4d8" />
    <rect x="107" y="10" width="85" height="100" rx="12" fill="#fafafa" stroke="#e4e4e7" />
    <rect x="119" y="22" width="14" height="10" rx="3" fill="#e4e4e7" />
    <rect x="119" y="40" width="58" height="3" rx="1" fill="#d4d4d8" />
    <rect x="119" y="47" width="62" height="3" rx="1" fill="#d4d4d8" />
    <line x1="119" y1="72" x2="179" y2="72" stroke="#f4f4f5" />
    <circle cx="131" cy="86" r="8" fill="#e4e4e7" />
    <rect x="143" y="82" width="28" height="4" rx="1" fill="#a1a1aa" />
    <rect x="143" y="90" width="20" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

const PreviewMinimal: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect x="16" y="15" width="3" height="35" rx="1.5" fill="#d4d4d8" />
    <rect x="28" y="18" width="140" height="4" rx="1" fill="#a1a1aa" />
    <rect x="28" y="26" width="130" height="4" rx="1" fill="#a1a1aa" />
    <rect x="28" y="34" width="100" height="4" rx="1" fill="#a1a1aa" />
    <rect x="28" y="46" width="50" height="4" rx="1" fill="#71717a" />
    <rect x="82" y="46" width="35" height="3" rx="1" fill="#d4d4d8" />
    <rect x="16" y="70" width="3" height="35" rx="1.5" fill="#d4d4d8" />
    <rect x="28" y="73" width="135" height="4" rx="1" fill="#a1a1aa" />
    <rect x="28" y="81" width="120" height="4" rx="1" fill="#a1a1aa" />
    <rect x="28" y="89" width="110" height="4" rx="1" fill="#a1a1aa" />
    <rect x="28" y="101" width="45" height="4" rx="1" fill="#71717a" />
    <rect x="77" y="101" width="38" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

const PreviewBubble: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <circle cx="22" cy="28" r="10" fill="#e4e4e7" />
    <rect x="40" y="12" width="140" height="38" rx="10" fill="#fafafa" stroke="#e4e4e7" />
    <rect x="52" y="22" width="110" height="3" rx="1" fill="#d4d4d8" />
    <rect x="52" y="29" width="90" height="3" rx="1" fill="#d4d4d8" />
    <rect x="52" y="36" width="50" height="3" rx="1" fill="#d4d4d8" />
    <circle cx="178" cy="82" r="10" fill="#e4e4e7" />
    <rect x="20" y="66" width="140" height="38" rx="10" fill="#fafafa" stroke="#e4e4e7" />
    <rect x="32" y="76" width="115" height="3" rx="1" fill="#d4d4d8" />
    <rect x="32" y="83" width="95" height="3" rx="1" fill="#d4d4d8" />
    <rect x="32" y="90" width="60" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

export const quoteDefinition: BlockDefinition = {
  type: 'quote',
  label: 'Citazioni',
  icon: FileText,
  visual: QuoteBlock,
  contentEditor: QuoteContent,
  styleEditor: QuoteStyle,
  unifiedEditor: QuoteUnified,
  defaults: {
    content: {
      variant: 'cards',
      items: [
        {
          name: 'Marco Rossi',
          role: 'CEO, Tech Solutions',
          text: 'Un servizio impeccabile. La velocità di risposta e la personalizzazione offerta superano ogni aspettativa.',
          stars: 5,
          avatar: ''
        },
        {
          name: 'Sara Bianchi',
          role: 'Marketing Manager',
          text: 'Design moderno e pulito. Esattamente quello che cercavamo per il nostro nuovo progetto digitale.',
          stars: 4,
          avatar: ''
        }
      ],
      layout: 'grid'
    },
    style: {
      padding: 80,
      columns: 3,
      titleTag: 'h2',
      itemTitleTag: 'h3',
      itemTitleBold: true,
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40,
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    },
    responsiveStyles: {
      tablet: { columns: 2 },
      mobile: { columns: 1 }
    }
  },
  variants: [
    {
      id: 'cards',
      label: 'Cards',
      description: 'Griglia di card arrotondate',
      preview: PreviewCards,
    },
    {
      id: 'minimal',
      label: 'Minimal',
      description: 'Linea laterale, senza card',
      preview: PreviewMinimal,
    },
    {
      id: 'bubble',
      label: 'Bubble',
      description: 'Stile chat con avatar a lato',
      preview: PreviewBubble,
    },
  ],
  styleMapper: (style, block, project, viewport) => {
    const s_mig = { ...style };
    if (s_mig.nameSize !== undefined && s_mig.itemTitleSize === undefined) s_mig.itemTitleSize = s_mig.nameSize;
    if (s_mig.nameBold !== undefined && s_mig.itemTitleBold === undefined) s_mig.itemTitleBold = s_mig.nameBold;
    if (s_mig.nameItalic !== undefined && s_mig.itemTitleItalic === undefined) s_mig.itemTitleItalic = s_mig.nameItalic;

    const { vars, style: s } = getBaseStyleVars(s_mig, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    const toPx = (v: any) => typeof v === 'number' ? `${v}px` : v;

    return {
      ...vars,
      '--review-fs': toPx(val('reviewSize', 18)),
      '--review-fw': val('reviewBold', false) ? '700' : '400',
      '--review-is': val('reviewItalic', true) ? 'italic' : 'normal',
      '--review-role-fs': toPx(val('roleSize', 11)),
      '--review-role-fw': val('roleBold', false) ? '700' : '400',
      '--review-role-is': val('roleItalic', false) ? 'italic' : 'normal',
    };
  }
};
