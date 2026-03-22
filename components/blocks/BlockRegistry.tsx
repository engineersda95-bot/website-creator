'use client';

import React from 'react';
import { Hero } from './visual/Hero';
import { TextBlock } from './visual/TextBlock';
import { Navigation } from './visual/navigation/Navigation';
import { FooterBlock } from './visual/FooterBlock';
import { BlockType } from '@/types/editor';

const registries: Record<BlockType, React.FC<any>> = {
  'hero': Hero,
  'text': TextBlock,
  'navigation': Navigation,
  'footer': FooterBlock
} as any;

export const getBlockComponent = (type: BlockType) => {
  return registries[type] || (() => <div>Unknown Block Type: {type}</div>);
};
