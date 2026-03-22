'use client';

import { BlockType } from '@/types/editor';
import { BLOCK_DEFINITIONS } from '@/lib/block-definitions';
import React from 'react';

/**
 * Registry of visual components for each block type.
 * Centralized for easier maintenance and senior-engineer-style code.
 */
export const getBlockComponent = (type: BlockType) => {
  const definition = BLOCK_DEFINITIONS[type];
  if (definition && definition.visual) {
    return definition.visual;
  }
  
  return () => (
    <div className="p-20 text-center text-zinc-400 bg-zinc-50 uppercase text-[10px] font-black tracking-widest border-2 border-dashed m-10 rounded-3xl">
      Componente visivo "{type}" non ancora implementato
    </div>
  );
};
