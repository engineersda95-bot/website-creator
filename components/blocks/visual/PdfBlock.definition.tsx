import { BookOpen } from 'lucide-react';
import { PdfBlock } from './PdfBlock';
import { Pdf } from '../sidebar/block-editors/Pdf';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';
import React from 'react';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#fafafa" />
    <rect x="55" y="8" width="90" height="104" rx="5" fill="#ffffff" stroke="#e4e4e7" />
    <rect x="65" y="18" width="44" height="5" rx="1.5" fill="#18181b" />
    <rect x="65" y="30" width="70" height="2.5" rx="1" fill="#e4e4e7" />
    <rect x="65" y="36" width="65" height="2.5" rx="1" fill="#e4e4e7" />
    <rect x="65" y="42" width="68" height="2.5" rx="1" fill="#e4e4e7" />
    <rect x="65" y="52" width="70" height="36" rx="3" fill="#f4f4f5" stroke="#e4e4e7" />
    <rect x="65" y="96" width="70" height="2.5" rx="1" fill="#e4e4e7" />
    <rect x="65" y="102" width="50" height="2.5" rx="1" fill="#e4e4e7" />
  </svg>
);

export const pdfDefinition: BlockDefinition = {
  type: 'pdf',
  label: 'PDF / Catalogo',
  description: 'Visualizza un PDF incorporato o con pulsante di download. Ideale per menu, cataloghi e listini.',
  thumbnail: Thumbnail,
  icon: BookOpen,
  visual: PdfBlock,
  unifiedEditor: Pdf,
  defaults: {
    content: {
      url: '',
      title: 'Il nostro menu',
      subtitle: 'Scopri la nostra selezione esclusiva. Sfoglia il catalogo completo o scarica il PDF.',
      ctaLabel: 'Apri PDF',
      displayMode: 'embed',
      thumbnail: ''
    },
    style: {
      padding: 0,
      align: 'center',
      backgroundColor: null,
      textColor: null,
      embedHeight: 800,
      containerWidth: null
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;

    return {
      ...vars,
      '--embed-height': toPx(val('embedHeight', 800)),
      '--container-width': toPx(val('containerWidth', '100%')),
    };
  }
};
