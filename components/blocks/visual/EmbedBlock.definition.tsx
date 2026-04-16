import { Play } from 'lucide-react';
import { EmbedBlock } from './EmbedBlock';
import { Embed } from '../sidebar/block-editors/Embed';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import React from 'react';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#fafafa" />
    <rect x="16" y="14" width="168" height="92" rx="8" fill="#e4e4e7" />
    <circle cx="100" cy="60" r="20" fill="#d4d4d8" />
    <path d="M94 52 L94 68 L114 60 Z" fill="#fafafa" />
  </svg>
);

export const embedDefinition: BlockDefinition = {
  type: 'embed',
  label: 'Embed (Video/Post)',
  description: 'Incorpora video YouTube/Vimeo, post social o qualsiasi iframe nel tuo sito.',
  thumbnail: Thumbnail,
  icon: Play,
  visual: EmbedBlock,
  unifiedEditor: Embed,
  defaults: {
    content: {
      type: 'youtube',
      code: ''
    },
    style: {
      padding: 60,
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40,
      titleTag: 'h2'
    }
  },
  styleMapper: (style, block, project, viewport) => {
    return getBaseStyleVars(style, block, project, viewport).vars;
  }
};
