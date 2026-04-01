import React from 'react';
import { PenLine } from 'lucide-react';
import { BlogListBlock } from './BlogListBlock';
import { BlogListUnified } from '../sidebar/block-editors/BlogListUnified';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

export const blogListDefinition: BlockDefinition = {
  type: 'blog-list',
  label: 'Blog',
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
      manualPostIds: [],
      maxPosts: 6,
      showViewAll: true,
      showFilters: true,
    },
    style: {
      padding: 80,
      align: 'center',
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
