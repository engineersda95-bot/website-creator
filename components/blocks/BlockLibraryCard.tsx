'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { BlockDefinition, BlockVariant } from '@/types/block-definition';

interface BlockLibraryCardProps {
  blockDef: BlockDefinition;
  onAdd: (blockDef: BlockDefinition, variant?: BlockVariant) => void;
  onPreview: (blockDef: BlockDefinition) => void;
}

export const BlockLibraryCard: React.FC<BlockLibraryCardProps> = ({ blockDef, onAdd, onPreview }) => {
  return (
    <div
      onClick={() => onAdd(blockDef)}
      className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all group text-center relative w-full cursor-pointer"
    >
      <blockDef.icon size={18} className="text-zinc-400 group-hover:text-zinc-700 transition-colors" />
      <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-700 leading-tight">
        {blockDef.label}
      </span>

      {/* Tooltip on hover */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <div className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-md shadow-sm">
          Aggiungi in fondo
        </div>
      </div>

      {/* Eye top-right, always visible */}
      <button
        onClick={(e) => { e.stopPropagation(); onPreview(blockDef); }}
        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
        title="Anteprima"
      >
        <Eye size={11} className="text-zinc-500" />
      </button>
    </div>
  );
};
