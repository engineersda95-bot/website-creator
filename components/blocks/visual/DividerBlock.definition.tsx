import { Minus } from 'lucide-react';
import { DividerBlock } from './DividerBlock';
import { Divider } from '../sidebar/block-editors/Divider';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';
import React from 'react';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#fafafa" />
    <line x1="20" y1="60" x2="180" y2="60" stroke="#d4d4d8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const dividerDefinition: BlockDefinition = {
  type: 'divider',
  label: 'Separatore',
  description: 'Linea orizzontale per separare visivamente le sezioni della pagina.',
  thumbnail: Thumbnail,
  icon: Minus,
  visual: DividerBlock,
  unifiedEditor: Divider,
  defaults: {
    content: { type: 'line' },
    style: {
      padding: 40,
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;

    return {
      ...vars,
      '--divider-width': val('dividerWidth', 100) + '%',
      '--divider-stroke': toPx(val('dividerStroke', 1)),
      '--divider-color': val('dividerColor', val('textColor', 'currentColor')),
    };
  }
};
