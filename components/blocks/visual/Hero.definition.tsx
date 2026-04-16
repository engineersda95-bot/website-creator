import React from 'react';
import { Square } from 'lucide-react';
import { Hero } from './Hero';
import { Hero as HeroEditor } from '../sidebar/block-editors/Hero';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

// Wireframe style: light bg, dark zinc shapes only — no accent colors
const PreviewCentered: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 240 150" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* bg */}
    <rect width="240" height="150" fill="#f4f4f5" />
    {/* nav bar */}
    <rect x="0" y="0" width="240" height="16" fill="#e4e4e7" />
    <rect x="8" y="5" width="28" height="6" rx="1.5" fill="#a1a1aa" />
    <rect x="168" y="5" width="18" height="6" rx="1.5" fill="#d4d4d8" />
    <rect x="190" y="5" width="18" height="6" rx="1.5" fill="#d4d4d8" />
    <rect x="214" y="4" width="18" height="8" rx="2" fill="#3f3f46" />
    {/* hero area — full bleed image placeholder */}
    <rect x="0" y="16" width="240" height="134" fill="#e4e4e7" />
    {/* subtle grid overlay to suggest image */}
    <line x1="0" y1="50" x2="240" y2="50" stroke="#d4d4d8" strokeWidth="0.5" />
    <line x1="0" y1="100" x2="240" y2="100" stroke="#d4d4d8" strokeWidth="0.5" />
    <line x1="80" y1="16" x2="80" y2="150" stroke="#d4d4d8" strokeWidth="0.5" />
    <line x1="160" y1="16" x2="160" y2="150" stroke="#d4d4d8" strokeWidth="0.5" />
    {/* dark overlay */}
    <rect x="0" y="16" width="240" height="134" fill="#18181b" fillOpacity="0.45" />
    {/* centered content */}
    <rect x="60" y="46" width="120" height="11" rx="2.5" fill="#ffffff" />
    <rect x="70" y="63" width="100" height="4" rx="1" fill="#ffffff" fillOpacity="0.6" />
    <rect x="75" y="71" width="90" height="4" rx="1" fill="#ffffff" fillOpacity="0.6" />
    {/* CTA */}
    <rect x="88" y="86" width="64" height="16" rx="8" fill="#ffffff" />
    <rect x="96" y="90.5" width="48" height="7" rx="1.5" fill="#3f3f46" />
  </svg>
);

const PreviewSplit: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 240 150" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* bg left */}
    <rect width="240" height="150" fill="#fafafa" />
    {/* nav */}
    <rect x="0" y="0" width="240" height="14" fill="#f4f4f5" />
    <rect x="8" y="4" width="24" height="6" rx="1.5" fill="#a1a1aa" />
    <rect x="194" y="4" width="38" height="6" rx="1.5" fill="#d4d4d8" />
    {/* right image half */}
    <rect x="122" y="14" width="118" height="136" fill="#e4e4e7" />
    {/* image inner grid */}
    <line x1="122" y1="60" x2="240" y2="60" stroke="#d4d4d8" strokeWidth="0.5" />
    <line x1="122" y1="100" x2="240" y2="100" stroke="#d4d4d8" strokeWidth="0.5" />
    <line x1="181" y1="14" x2="181" y2="150" stroke="#d4d4d8" strokeWidth="0.5" />
    {/* left text content */}
    <rect x="16" y="38" width="88" height="10" rx="2" fill="#18181b" />
    <rect x="16" y="54" width="84" height="4" rx="1" fill="#a1a1aa" />
    <rect x="16" y="62" width="78" height="4" rx="1" fill="#a1a1aa" />
    <rect x="16" y="70" width="80" height="4" rx="1" fill="#a1a1aa" />
    <rect x="16" y="84" width="54" height="14" rx="7" fill="#18181b" />
    <rect x="22" y="88" width="42" height="6" rx="1.5" fill="#ffffff" />
  </svg>
);

const PreviewStacked: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 240 150" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* bg */}
    <rect width="240" height="150" fill="#fafafa" />
    {/* nav */}
    <rect x="0" y="0" width="240" height="14" fill="#f4f4f5" />
    <rect x="8" y="4" width="24" height="6" rx="1.5" fill="#a1a1aa" />
    <rect x="194" y="4" width="38" height="6" rx="1.5" fill="#d4d4d8" />
    {/* top image strip */}
    <rect x="0" y="14" width="240" height="72" fill="#e4e4e7" />
    <line x1="0" y1="50" x2="240" y2="50" stroke="#d4d4d8" strokeWidth="0.5" />
    <line x1="80" y1="14" x2="80" y2="86" stroke="#d4d4d8" strokeWidth="0.5" />
    <line x1="160" y1="14" x2="160" y2="86" stroke="#d4d4d8" strokeWidth="0.5" />
    {/* gradient fade */}
    <defs>
      <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e4e4e7" stopOpacity="0" />
        <stop offset="1" stopColor="#fafafa" />
      </linearGradient>
    </defs>
    <rect x="0" y="60" width="240" height="26" fill="url(#sg)" />
    {/* text below */}
    <rect x="60" y="94" width="120" height="10" rx="2" fill="#18181b" />
    <rect x="66" y="110" width="108" height="4" rx="1" fill="#a1a1aa" />
    <rect x="72" y="118" width="96" height="4" rx="1" fill="#a1a1aa" />
    <rect x="88" y="132" width="64" height="14" rx="7" fill="#18181b" />
    <rect x="96" y="136" width="48" height="6" rx="1.5" fill="#ffffff" />
  </svg>
);

export const heroDefinition: BlockDefinition = {
  type: 'hero',
  label: 'Hero',
  description: 'Sezione d\'apertura con titolo, sottotitolo e call to action. È il primo blocco che i visitatori vedono.',
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
      description: 'Testo e CTA centrati su immagine di sfondo a tutto schermo. Ideale per landing page ad alto impatto.',
      preview: PreviewCentered,
    },
    {
      id: 'split',
      label: 'Split',
      description: 'Testo a sinistra, immagine a destra su due colonne. Ottimo per presentare un prodotto o servizio.',
      preview: PreviewSplit,
    },
    {
      id: 'stacked',
      label: 'Immagine + Testo',
      description: 'Immagine panoramica in alto, titolo e CTA sotto. Funziona bene per ristoranti, hotel e portfolio.',
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
      '--text-v-align': (val('verticalAlign', 'center') === 'top' ? 'flex-start' : val('verticalAlign', 'center') === 'bottom' ? 'flex-end' : 'center'),
    };
  }
};
