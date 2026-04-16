import { Building2 } from 'lucide-react';
import { BlockDefinition } from '@/types/block-definition';
import { Logos } from './Logos';
import { Logos as LogosEditor } from '../sidebar/block-editors/Logos';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';
import React from 'react';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#fafafa" />
    <rect x="60" y="16" width="80" height="6" rx="2" fill="#d4d4d8" />
    <rect x="10" y="46" width="36" height="22" rx="4" fill="#e4e4e7" />
    <rect x="54" y="46" width="36" height="22" rx="4" fill="#e4e4e7" />
    <rect x="98" y="46" width="36" height="22" rx="4" fill="#e4e4e7" />
    <rect x="142" y="46" width="36" height="22" rx="4" fill="#e4e4e7" />
    <rect x="17" y="53" width="22" height="8" rx="2" fill="#a1a1aa" />
    <rect x="61" y="53" width="22" height="8" rx="2" fill="#a1a1aa" />
    <rect x="105" y="53" width="22" height="8" rx="2" fill="#a1a1aa" />
    <rect x="149" y="53" width="22" height="8" rx="2" fill="#a1a1aa" />
  </svg>
);

export const logosDefinition: BlockDefinition = {
  type: 'logos',
  label: 'Loghi Partner',
  description: 'Striscia di loghi di partner, clienti o certificazioni. Aumenta la credibilità del sito.',
  thumbnail: Thumbnail,
  icon: Building2,
  visual: Logos,
  unifiedEditor: LogosEditor,
  defaults: {
    content: {
      title: 'Partner & Collaborazioni',
      items: [
         { image: '' },
         { image: '' },
         { image: '' },
         { image: '' },
      ]
    },
    style: {
      padding: 60,
      gap: 40,
      align: 'center',
      grayscale: true,
      scrollSpeed: 40,
      aspectRatio: '1:1',
      logoWidth: 120,
      background: 'transparent',
      titleTag: 'h2',
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars } = getBaseStyleVars(style, block, project, viewport);
    return {
      ...vars,
      '--logo-width': toPx(style.logoWidth, '120px'),
      '--logo-gap': toPx(style.gap, '40px'),
      '--title-fs': style.titleSize ? toPx(style.titleSize) : 'var(--global-h2-fs)',
      '--scroll-speed': `${style.scrollSpeed || 40}s`,
      '--logo-filter': style.grayscale ? 'grayscale(100%) opacity(0.5)' : 'none',
      '--logo-hover-filter': style.grayscale ? 'grayscale(0%) opacity(1)' : 'none',
    };
  }
};
