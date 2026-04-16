import React from 'react';
import { PenLine } from 'lucide-react';
import { BlogListBlock } from './BlogListBlock';
import { BlogListUnified } from '../sidebar/block-editors/BlogListUnified';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#fafafa" />
    <rect x="8" y="12" width="86" height="48" rx="6" fill="#e4e4e7" />
    <rect x="106" y="12" width="86" height="48" rx="6" fill="#e4e4e7" />
    <rect x="8" y="66" width="50" height="5" rx="1.5" fill="#18181b" />
    <rect x="106" y="66" width="50" height="5" rx="1.5" fill="#18181b" />
    <rect x="8" y="76" width="82" height="3" rx="1" fill="#a1a1aa" />
    <rect x="106" y="76" width="82" height="3" rx="1" fill="#a1a1aa" />
    <rect x="8" y="83" width="70" height="3" rx="1" fill="#a1a1aa" />
    <rect x="106" y="83" width="70" height="3" rx="1" fill="#a1a1aa" />
    <rect x="8" y="93" width="30" height="3" rx="1" fill="#d4d4d8" />
    <rect x="106" y="93" width="30" height="3" rx="1" fill="#d4d4d8" />
  </svg>
);

export const blogListDefinition: BlockDefinition = {
  type: 'blog-list',
  label: 'Blog',
  description: 'Lista degli ultimi articoli del blog con immagine, titolo e anteprima del testo.',
  thumbnail: Thumbnail,
  icon: PenLine,
  visual: BlogListBlock,
  contentEditor: null,
  styleEditor: null,
  unifiedEditor: BlogListUnified,
  defaults: {
    content: {
      title: 'Dal nostro Blog',
      subtitle: 'Scopri i nostri ultimi articoli e aggiornamenti.',
      filterMode: 'all',
      filterCategory: '',
      maxPosts: 6,
      showViewAll: true,
      showFilters: true,
    },
    style: {
      padding: 80,
      align: 'left',
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
      animationDelay: 0,
    },
    responsiveStyles: {
      tablet: { columns: 2 },
      mobile: { columns: 1 },
    },
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    return {
      ...vars,
      '--blog-columns': String(val('columns', 3)),
    };
  },
};
