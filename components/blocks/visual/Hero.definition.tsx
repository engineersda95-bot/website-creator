import React from 'react';
import { Square } from 'lucide-react';
import { Hero } from './Hero';
import { Hero as HeroEditor } from '../sidebar/block-editors/Hero';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

const PreviewCentered: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" rx="4" fill="#18181b" />
    <rect x="50" y="30" width="100" height="8" rx="2" fill="#ffffff" />
    <rect x="55" y="45" width="90" height="4" rx="1" fill="#a1a1aa" />
    <rect x="60" y="53" width="80" height="4" rx="1" fill="#a1a1aa" />
    <rect x="75" y="70" width="50" height="14" rx="7" fill="#3b82f6" />
    <rect x="80" y="74" width="40" height="6" rx="2" fill="#ffffff" />
  </svg>
);

const PreviewSplit: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" rx="4" fill="#fafafa" />
    <rect x="100" y="0" width="100" height="120" fill="#e4e4e7" />
    <rect x="12" y="35" width="75" height="7" rx="2" fill="#18181b" />
    <rect x="12" y="48" width="70" height="3" rx="1" fill="#a1a1aa" />
    <rect x="12" y="55" width="60" height="3" rx="1" fill="#a1a1aa" />
    <rect x="12" y="70" width="40" height="12" rx="6" fill="#18181b" />
    <rect x="18" y="73.5" width="28" height="5" rx="2" fill="#ffffff" />
  </svg>
);

const PreviewStacked: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" rx="4" fill="#fafafa" />
    <rect x="0" y="0" width="200" height="55" fill="#e4e4e7" />
    <rect x="0" y="40" width="200" height="20" fill="url(#stackGrad)" />
    <defs><linearGradient id="stackGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fafafa" stopOpacity="0" /><stop offset="1" stopColor="#fafafa" /></linearGradient></defs>
    <rect x="50" y="65" width="100" height="7" rx="2" fill="#18181b" />
    <rect x="55" y="78" width="90" height="3" rx="1" fill="#a1a1aa" />
    <rect x="60" y="85" width="80" height="3" rx="1" fill="#a1a1aa" />
    <rect x="75" y="98" width="50" height="12" rx="6" fill="#18181b" />
  </svg>
);

export const heroDefinition: BlockDefinition = {
  type: 'hero',
  label: 'Hero',
  icon: Square,
  visual: Hero,
  unifiedEditor: HeroEditor,
  defaults: {
    content: {
      variant: 'centered',
      title: 'La tua Visione, Reale',
      subtitle: 'Costruiamo esperienze digitali che lasciano il segno.',
      cta: 'Inizia Ora',
      ctaUrl: '#'
    },
    style: {
      padding: 120,
      titleBold: false,
      titleTag: 'h1',
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40,
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    }
  },
  variants: [
    {
      id: 'centered',
      label: 'Centrata',
      description: 'Testo e CTA al centro, immagine di sfondo',
      preview: PreviewCentered,
    },
    {
      id: 'split',
      label: 'Split',
      description: 'Testo a sinistra, immagine a destra',
      preview: PreviewSplit,
    },
    {
      id: 'stacked',
      label: 'Immagine + Testo',
      description: 'Immagine in alto, contenuto sotto',
      preview: PreviewStacked,
    },
  ],
  styleMapper: (style, block, project, viewport) => {
    const variant = block.content?.variant || 'centered';
    const effectiveStyle = { ...style };
    if (effectiveStyle.align === undefined || effectiveStyle.align === null) {
      effectiveStyle.align = variant === 'split' ? 'left' : 'center';
    }

    const { vars, style: s } = getBaseStyleVars(effectiveStyle, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;

    return {
      ...vars,
      '--hero-min-height': toPx(val('minHeight', '600px')),
      '--text-v-align': viewport === 'mobile' ? 'flex-start' : (val('verticalAlign', 'center') === 'top' ? 'flex-start' : val('verticalAlign', 'center') === 'bottom' ? 'flex-end' : 'center'),
    };
  }
};
